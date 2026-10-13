import { createServerFn } from "@tanstack/react-start";
import { isWeirdParaphrase, looksLikeEcho } from "@/lib/echo";
import { practiceOf } from "@/lib/scenes";
import { isStage, stageCoachRules, type StageId } from "@/lib/b1-learning";

type ChatMessage = { role: "user" | "assistant"; content: string };

type ReplyInput = {
  stage: StageId;
  scene: string;
  task: number;
  learner: string;
  history: ChatMessage[];
};

const SYSTEM = `You are a Trinity GESE Grade 5 examiner. Talk like a person, not a form.
Return ONLY JSON: {"say":"...","better":null}

"say" is at most 25 words.
Stay on the Scene subject. Do not change it.
If they asked you a question, answer that question first, then ask one question about the same subject.
Ask only one question. Never repeat a question you already asked.
Do not ask about last weekend, this evening, work, or family unless the Scene is about that.
If they say you left the topic, say "Yes, true." and ask about the Scene subject.
Do not interview the family one by one.
Do not start with "You", "Your", or "It takes". Do not repeat their sentence.
"better" is null UNLESS the current coaching stage asks you to model a short learner sentence grounded in the learner exact words. Then "better" may be one short sentence (for example "I have one daughter."). Never invent a name, age, job, religion or family details.
Only in early coaching stages, you may invite the learner to repeat a sentence; in genuine conversation and exam stages do not interrupt to drill.
Never start with "You think", "You wanted", "You said", "So you", or "No need".
Never talk about the chat or being an AI.`;

function dropRestatement(say: string): string {
  return say
    .split(/(?<=[.!?])\s+/)
    .filter((part) => !/^(you|your|it takes|it usually)\b/i.test(part))
    .join(" ")
    .trim();
}

function leavesSubject(say: string, brief: string): boolean {
  if (/recent personal|my day|your day|routine/.test(brief.toLowerCase())) return false;
  return /last weekend|this evening|this morning|yesterday evening|after work|days off|your own day/i.test(say);
}

function asksAboutFamily(say: string): boolean {
  return /what does (your |her |his |the )?(husband|daughter|wife|son|other)|does (she|he) like|what do they like|who likes|which person|which friend|family like/i.test(
    say,
  );
}

function oneNewQuestion(say: string, prior: { content: string }[]): string {
  const parts = say.split(/(?<=[.!?])\s+/).filter(Boolean);
  let asked = false;
  const kept: string[] = [];
  for (const part of parts) {
    const again = prior.some((item) => looksLikeEcho(part, item.content));
    if (again) continue;
    if (part.includes("?")) {
      if (asked) continue;
      asked = true;
    }
    kept.push(part);
  }
  return kept.join(" ").trim();
}

function parseReply(raw: string): { say: string; better: string | null } {
  const trimmed = raw.trim().replace(/^```json\s*|\s*```$/g, "");
  try {
    const json = JSON.parse(trimmed) as { say?: unknown; better?: unknown };
    const say = typeof json.say === "string" ? json.say.trim() : "";
    const better =
      typeof json.better === "string" && json.better.trim() ? json.better.trim() : null;
    if (say) return { say, better };
  } catch {
    /* fall through */
  }
  const loose = trimmed.replace(/^\{|\}$/g, "").trim();
  return { say: loose.slice(0, 280), better: null };
}

export const tutorReply = createServerFn({ method: "POST" })
  .validator((input: unknown): ReplyInput => {
    const data = (input ?? {}) as Partial<ReplyInput>;
    const learner = typeof data.learner === "string" ? data.learner.trim().slice(0, 500) : "";
    if (!learner) throw new Error("empty");
    const history = Array.isArray(data.history) ? data.history : [];
    return {
      stage: isStage(data.stage) ? data.stage : "words",
      scene: typeof data.scene === "string" ? data.scene.slice(0, 40) : "topic",
      task: typeof data.task === "number" && Number.isFinite(data.task) ? data.task : 0,
      learner,
      history: history.slice(-16).map((m) => ({
        role: m?.role === "assistant" ? "assistant" : "user",
        content: String(m?.content ?? "").slice(0, 400),
      })),
    };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.B1_ALLOW_BILLED_XAI === "true" ? process.env.XAI_API_KEY : undefined;
    if (!apiKey) return { ok: false as const, error: "AI is not available" };

    const practice = practiceOf(data.scene, data.task);
    const messages = [
      { role: "system" as const, content: `${SYSTEM}\n\nLearning stage: ${data.stage}. ${stageCoachRules(data.stage)}\n\nScene: ${practice.brief}` },
      ...data.history,
      { role: "user" as const, content: data.learner },
    ];

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.20-0309-non-reasoning",
        temperature: 0.4,
        max_tokens: 140,
        messages,
      }),
    });

    if (!res.ok) return { ok: false as const, error: `暫時答唔到（${res.status}）` };

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    let { say, better } = parseReply(body.choices?.[0]?.message?.content ?? "");
    const words = data.learner.trim().split(/\s+/).filter(Boolean).length;
    say = oneNewQuestion(dropRestatement(say), data.history);
    if (data.stage === "conversation" || data.stage === "exam" || words > 9) better = null;
    if (data.stage !== "words" && data.stage !== "sentences") say = say.replace(/can you try\??/gi, "").trim();
    const prior = data.history.filter((item) => item.role === "assistant");
    const repeated = prior.some((item) => looksLikeEcho(say, item.content));
    const drifted =
      (asksAboutFamily(say) && prior.some((item) => asksAboutFamily(item.content))) ||
      leavesSubject(say, practice.brief);
    const corrected = /our topic|rather than|not about|wrong topic/i.test(data.learner);
    if (!say || isWeirdParaphrase(say) || repeated || drifted || (corrected && leavesSubject(say, practice.brief))) {
      const again = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.20-0309-non-reasoning",
          temperature: 0.3,
          max_tokens: 80,
          messages: [
            ...messages,
            {
              role: "user",
              content:
                "Stay on the Scene subject. One new question only. Do not ask about last weekend, this evening, work, or family unless the Scene is about that. Do not start with You or Your.",
            },
          ],
        }),
      });
      if (again.ok) {
        const retry = (await again.json()) as { choices?: { message?: { content?: string } }[] };
        say = oneNewQuestion(dropRestatement(parseReply(retry.choices?.[0]?.message?.content ?? "").say), data.history);
        better = null;
      }
    }
    if (!say || leavesSubject(say, practice.brief) || (asksAboutFamily(say) && prior.some((item) => asksAboutFamily(item.content)))) {
      say = practice.next;
    }
    if (corrected && !say.includes("?")) say = `Yes, true. ${practice.next}`;

    return { ok: true as const, say, better };
  });

export const hearLearner = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const audio = typeof (input as { audio?: unknown } | null)?.audio === "string"
      ? (input as { audio: string }).audio.trim()
      : "";
    if (audio.length < 2000 || audio.length > 2_100_000) throw new Error("bad audio");
    return { audio };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.B1_ALLOW_BILLED_XAI === "true" ? process.env.XAI_API_KEY : undefined;
    if (!apiKey) return { ok: false as const, error: "AI is not available" };

    const bytes = Buffer.from(data.audio, "base64");
    const form = new FormData();
    form.append("model", "grok-voice-transcribe-2.0");
    form.append("language", "en");
    form.append("format", "true");
    form.append("file", new Blob([new Uint8Array(bytes)], { type: "audio/wav" }), "speech.wav");

    const res = await fetch("https://api.x.ai/v1/stt", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (!res.ok) return { ok: false as const, error: `聽唔清（${res.status}）` };
    const body = (await res.json()) as { text?: string };
    const text = body.text?.trim() ?? "";
    if (!text) return { ok: false as const, error: "聽唔到字。靠近啲，再講一次。" };
    return { ok: true as const, text: text.slice(0, 500) };
  });

export const tutorVoice = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const text = typeof (input as { text?: unknown } | null)?.text === "string"
      ? (input as { text: string }).text.trim().slice(0, 400)
      : "";
    if (!text) throw new Error("empty");
    return { text };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.B1_ALLOW_BILLED_XAI === "true" ? process.env.XAI_API_KEY : undefined;
    if (!apiKey) return { ok: false as const, error: "AI is not available" };

    const res = await fetch("https://api.x.ai/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text: data.text,
        voice_id: "ara",
        language: "en",
        speed: 0.92,
        optimize_streaming_latency: 1,
      }),
    });
    if (!res.ok) return { ok: false as const, error: `把聲出唔到（${res.status}）` };
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength < 200) return { ok: false as const, error: "把聲出唔到" };
    return { ok: true as const, audio: Buffer.from(bytes).toString("base64") };
  });

export type TalkScore = {
  band: string;
  level: number;
  checks: { label: string; met: boolean }[];
  note: string;
  tip: string | null;
  revise: { yours: string; better: string }[];
  improve: string;
};

const MARK = `You provide NON-OFFICIAL formative coaching observations for a Trinity GESE Grade 5 practice. These text observations cannot determine pass/fail, pronunciation or listening skill.
Do not judge them as B2 or as a native speaker. Do not score pronunciation. You only have text.

A pass needs simple sentences, a reason or a past event, and staying on the topic. Hesitation is normal.
Asking the examiner one question is part of the exam. If they never ask, do not fail them for that alone, but mark asked false.

Return ONLY JSON:
{"level":3,"said":true,"reason":true,"asked":false,"note":"你講到自己嘅一日，又講到原因。","tip":"Can you ask me something?","revise":[{"yours":"I wake up around 6:30 and cook breakfast.","better":"I wake up at 6:30 and I cook breakfast for my daughter."}],"improve":"你未問考官。下次尾段加一句 What time do you get up?"}

revise: exactly 2 items, taken from their two longest Learner lines. yours is copied from that line. better is the SAME meaning in one clear B1 sentence. Never revise "I told you", "Watching TV", or a one-word answer when a longer line exists. Do not add facts they did not say.
improve: one Traditional Chinese sentence (繁體) saying the single next step, then one short English example. If a check is missing, teach that. If they already passed, teach one small extra, such as a past or a future. Never say they failed.

level: integer 1 to 5. Levels are INTERNAL COACHING STAGES, not official test grades.
5 means showing a strong performance IN THIS TEXT PRACTICE: several complete sentences that stay clear, reasons, past or future, and a question to the examiner. Small slips are allowed, but broken sentences are not level 5. Length alone is never 5.
4 means more developed practice: long enough, a reason, and a question, while some sentences are still unsteady.
3 means able to make a basic relevant answer in this transcript, NOT a pass prediction.
1 or 2 means a short or fragmentary learner response, NOT an official fail. Single words are 1 or 2, not a failure.
said: true if some answers are longer than a few words.
reason: true if they give a reason, a preference, a past event, or a future plan.
asked: true only if a learner line is a question to the examiner.
note: one encouraging Traditional Chinese sentence (繁體) about what they already did. Never Simplified. Never say they failed.
tip: null when level is 3 or more and asked is true. If they used only single words, tip is ONE English sentence. If they forgot to ask you a question, tip is "Can you ask me something?"`;

function parseScore(raw: string): TalkScore | null {
  const trimmed = raw.trim().replace(/^```json\s*|\s*```$/g, "");
  try {
    const json = JSON.parse(trimmed) as {
      level?: unknown;
      said?: unknown;
      reason?: unknown;
      asked?: unknown;
      note?: unknown;
      tip?: unknown;
      revise?: unknown;
      improve?: unknown;
    };
    let level = typeof json.level === "number" ? Math.max(1, Math.min(5, Math.round(json.level))) : 3;
    const said = json.said === true;
    const reason = json.reason === true;
    const asked = json.asked === true;
    if (said && reason) level = Math.max(level, 3);
    const band = level >= 5 ? "練習表現：流暢" : level === 4 ? "練習表現：較完整" : level === 3 ? "練習表現：基本對答" : "練習建議：先練完整句";
    const note =
      typeof json.note === "string" && json.note.trim()
        ? json.note.trim()
        : "你用日常英文完成咗呢個情境。";
    const tip = typeof json.tip === "string" && json.tip.trim() ? json.tip.trim() : null;
    const revise = Array.isArray(json.revise)
      ? json.revise
          .map((item) => {
            const row = item as { yours?: unknown; better?: unknown };
            const yours = typeof row?.yours === "string" ? row.yours.trim() : "";
            const better = typeof row?.better === "string" ? row.better.trim() : "";
            return yours && better ? { yours, better } : null;
          })
          .filter((item): item is { yours: string; better: string } => item !== null)
          .slice(0, 2)
      : [];
    const improve =
      typeof json.improve === "string" && json.improve.trim()
        ? json.improve.trim()
        : "下次揀你識講嘅一件事，講成一句，再加一個原因。";
    return {
      band,
      level,
      checks: [
        { label: "講到一句，唔係淨係一個字", met: said },
        { label: "有原因、過去或者將來", met: reason },
        { label: "有問過考官一條問題", met: asked },
      ],
      note,
      tip: level >= 3 && said && reason && asked ? null : tip,
      revise,
      improve,
    };
  } catch {
    return null;
  }
}

export const scoreTalk = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const data = (input ?? {}) as { scene?: unknown; task?: unknown; history?: unknown };
    const history = Array.isArray(data.history) ? data.history : [];
    return {
      scene: typeof data.scene === "string" ? data.scene.slice(0, 40) : "topic",
      task: typeof data.task === "number" && Number.isFinite(data.task) ? data.task : 0,
      history: history.slice(-16).map((item) => {
        const row = item as { role?: unknown; content?: unknown };
        return {
          role: row?.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: String(row?.content ?? "").slice(0, 400),
        };
      }),
    };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.B1_ALLOW_BILLED_XAI === "true" ? process.env.XAI_API_KEY : undefined;
    if (!apiKey) return { ok: false as const, error: "AI is not available" };
    const learnerTurns = data.history.filter((item) => item.role === "user").length;
    if (learnerTurns < 2) return { ok: false as const, error: "再講多兩句先計分。" };

    const practice = practiceOf(data.scene, data.task);
    const learnerLines = data.history
      .filter((item) => item.role === "user")
      .map((item) => item.content);
    const transcript = learnerLines.map((line, index) => `${index + 1}. ${line}`).join("\n");
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.20-0309-non-reasoning",
        temperature: 0.2,
        max_tokens: 460,
        messages: [
          { role: "system", content: `${MARK}\n\nTask: ${practice.brief}` },
          { role: "user", content: `Learner lines only:\n${transcript}` },
        ],
      }),
    });
    if (!res.ok) return { ok: false as const, error: `計唔到分（${res.status}）` };
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const score = parseScore(body.choices?.[0]?.message?.content ?? "");
    if (!score) return { ok: false as const, error: "計唔到分。再撳一次。" };
    const norm = (value: string) =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    score.revise = score.revise.filter((item) => {
      const yours = norm(item.yours);
      const longEnough = item.yours.trim().split(/\s+/).length >= 8;
      return (
        longEnough &&
        learnerLines.some((line) => {
          const said = norm(line);
          return yours.length > 12 && (said.includes(yours) || yours.includes(said.slice(0, 48)));
        })
      );
    });
    const words = (line: string) => line.trim().split(/\s+/).filter(Boolean).length;
    const total = learnerLines.reduce((sum, line) => sum + words(line), 0);
    const saidEnough = learnerLines.some((line) => words(line) >= 8);
    const gaveReason = learnerLines.some((line) =>
      /because|so |love|like|enjoy|prefer|important|popular/i.test(line),
    );
    const askedExaminer = learnerLines.some((line) =>
      /\?|have you|do you|did you|what do you|can you/i.test(line),
    );
    if (saidEnough) score.checks[0].met = true;
    if (gaveReason) score.checks[1].met = true;
    if (askedExaminer) score.checks[2].met = true;
    // No word-count threshold can establish a B1 pass. Preserve model's tentative coaching level only.
    score.band = score.level >= 5 ? "練習表現：流暢" : score.level === 4 ? "練習表現：較完整" : score.level === 3 ? "練習表現：基本對答" : "練習建議：先練完整句";
    if (saidEnough && gaveReason && askedExaminer) score.tip = null;

    return { ok: true as const, score };
  });

