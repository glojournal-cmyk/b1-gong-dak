import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { looksLikeEcho } from "@/lib/echo";
import { startMic, type MicSession } from "@/lib/mic";
import { practiceOf, SCENES, type SceneId } from "@/lib/scenes";
import { TRAINING_STAGES, stageOf, parseProgress, type StageId } from "@/lib/b1-learning";
import { hearLearner, scoreTalk, tutorReply, tutorVoice, type TalkScore } from "@/lib/tutor.functions";

type Line = {
  id: string;
  who: "tutor" | "learner";
  text: string;
  better?: string | null;
};

type Phase = "idle" | "recording" | "thinking" | "speaking";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function clock(total: number) {
  const safe = Math.max(0, total);
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

function readyLine(level: number) {
  if (level >= 5) return "今次練習表達幾流暢。";
  if (level === 4) return "你今次講到較多細節。";
  if (level === 3) return "今次做到基本對答。";
  return "下次由一個完整句子開始。";
}

export function Booth() {
  const [scene, setScene] = useState<SceneId>("topic");
  const [stage, setStage] = useState<StageId>("words");
  const [task, setTask] = useState(1); // family is an introductory speaking topic, not exam-prepared guidance
  const [phase, setPhase] = useState<Phase>("idle");
  const [lines, setLines] = useState<Line[]>([]);
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState("撳住下面個掣講。可以停一停諗，放手先送出。");
  const [typed, setTyped] = useState("");
  const [voiceOn, setVoiceOn] = useState(true);
  const [needTab, setNeedTab] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timing, setTiming] = useState(false);
  const [closed, setClosed] = useState(false);
  const [score, setScore] = useState<TalkScore | null>(null);
  const [scoring, setScoring] = useState(false);

  const phaseRef = useRef<Phase>("idle");
  const lastSpoken = useRef("");
  const recRef = useRef<MicSession | null>(null);
  const heardSpeech = useRef(false);
  const silenceRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const speakGen = useRef(0);
  const holding = useRef(false);
  const startedAt = useRef<number | null>(null);
  const warned = useRef(false);
  const closedRef = useRef(false);
  useEffect(() => {
    try {
      const stored = parseProgress(JSON.parse(localStorage.getItem("b1-guided-progress-v1") || "{}"));
      setStage(stored.selectedStage);
    } catch { /* private browser storage can be disabled */ }
  }, []);
  function chooseStage(next: StageId) {
    setStage(next);
    setTask(next === "words" ? 1 : 0);
    setScene("topic");
    // Stage choice saves only the level, never user transcripts or personal identity.
    try {
      const old = parseProgress(JSON.parse(localStorage.getItem("b1-guided-progress-v1") || "{}"));
      localStorage.setItem("b1-guided-progress-v1", JSON.stringify({ ...old, selectedStage: next }));
    } catch { /* localStorage optional */ }
  }

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [lines, draft, phase, score]);

  useEffect(() => {
    const opener = practiceOf(scene, task).opener;
    setLines([{ id: uid(), who: "tutor", text: opener }]);
    historyRef.current = [{ role: "assistant", content: opener }];
    lastSpoken.current = opener;
    setDraft("");
    setNote("撳住下面個掣講。可以停一停諗，放手先送出。");
    speakGen.current += 1;
    holding.current = false;
    phaseRef.current = "idle";
    stopAudio();
    stopRec();
    setPhase("idle");
    startedAt.current = null;
    warned.current = false;
    closedRef.current = false;
    setClosed(false);
    setTiming(false);
    setElapsed(0);
    setScore(null);
    setScoring(false);
    // scene change resets the booth; audio helpers are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, task, stage]);

  const limit = SCENES.find((item) => item.id === scene)?.seconds ?? 120;

  useEffect(() => {
    if (!timing) return;
    const id = window.setInterval(() => {
      if (!startedAt.current) return;
      setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
    }, 250);
    return () => window.clearInterval(id);
  }, [timing]);

  useEffect(() => {
    if (!timing || elapsed < limit || warned.current) return;
    warned.current = true;
    closedRef.current = true;
    setClosed(true);
    holding.current = false;
    speakGen.current += 1;
    stopAudio();
    stopRec();
    phaseRef.current = "idle";
    setPhase("idle");
    setDraft("");
    setTiming(false);
    setElapsed(limit);
    setNote("時間到。呢部分完咗。");
    void askScore(true);
  }, [elapsed, limit, timing]);

  function stopAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = "";
    audioRef.current = null;
  }

  function stopRec() {
    if (silenceRef.current) window.clearInterval(silenceRef.current);
    silenceRef.current = null;
    const rec = recRef.current;
    recRef.current = null;
    void rec?.stop();
  }

  function idle(message: string) {
    phaseRef.current = "idle";
    setPhase("idle");
    setDraft("");
    setNote(message);
  }

  async function playTutor(say: string) {
    const token = ++speakGen.current;
    stopRec();
    phaseRef.current = "speaking";
    setPhase("speaking");
    lastSpoken.current = say;
    if (!voiceOn) {
      idle("你講。撳住個掣再講。");
      return;
    }
    setNote("讀緊…");
    try {
      const voiced = await tutorVoice({ data: { text: say } });
      if (speakGen.current !== token || phaseRef.current !== "speaking") return;
      if (!voiced.ok) {
        idle("字出咗。把聲暫時出唔到，可以打字或者再講。");
        return;
      }
      const audio = new Audio(`data:audio/mpeg;base64,${voiced.audio}`);
      audioRef.current = audio;
      const done = () => {
        if (speakGen.current !== token || phaseRef.current !== "speaking") return;
        idle("你講。撳住個掣再講。");
      };
      audio.onended = done;
      audio.onerror = done;
      void audio.play().catch(done);
    } catch {
      if (speakGen.current === token) idle("字出咗，把聲出唔到。");
    }
  }

  async function sendLearner(text: string) {
    const clean = text.trim();
    if (!clean || closedRef.current) {
      phaseRef.current = "idle";
      setPhase("idle");
      if (closedRef.current) setNote("時間到。呢部分完咗。");
      else setNote("聽唔到。再撳一次，講完等一秒。");
      return;
    }
    if (looksLikeEcho(clean, lastSpoken.current)) {
      phaseRef.current = "idle";
      setPhase("idle");
      setDraft("");
      setNote("呢句似係聽返導師把聲，冇當你講。等導師講完，再撳掣。");
      return;
    }

    setDraft("");
    if (!startedAt.current) {
      startedAt.current = Date.now();
      setTiming(true);
    }
    setLines((prev) => [...prev, { id: uid(), who: "learner", text: clean }]);
    phaseRef.current = "thinking";
    setPhase("thinking");
    setNote("答緊…");

    try {
      const result = await tutorReply({
        data: { scene, task, stage, learner: clean, history: historyRef.current },
      });
      if (!result.ok || closedRef.current) {
        phaseRef.current = "idle";
        setPhase("idle");
        setNote(closedRef.current ? "時間到。呢部分完咗。" : result.ok ? "" : result.error);
        return;
      }
      const nextHistory: { role: "user" | "assistant"; content: string }[] = [
        ...historyRef.current,
        { role: "user", content: clean },
        { role: "assistant", content: result.say },
      ];
      historyRef.current = nextHistory.slice(-20);
      setLines((prev) => {
        const stamped = prev.map((line, i) =>
          i === prev.length - 1 && line.who === "learner" && result.better
            ? { ...line, better: result.better }
            : line,
        );
        return [...stamped, { id: uid(), who: "tutor", text: result.say }];
      });
      playTutor(result.say);
    } catch {
      setPhase("idle");
      phaseRef.current = "idle";
      setNote("連唔上。再試一次。");
    }
  }

  async function finishRecording() {
    if (phaseRef.current !== "recording") return;
    phaseRef.current = "thinking";
    setPhase("thinking");
    setNote("聽你講咩…");
    if (silenceRef.current) window.clearInterval(silenceRef.current);
    silenceRef.current = null;
    const rec = recRef.current;
    recRef.current = null;
    const audio = (await rec?.stop()) ?? null;
    if (!audio || !heardSpeech.current) {
      idle("聽唔到。靠近電話，再講一次。");
      return;
    }
    try {
      const heard = await hearLearner({ data: { audio } });
      if (!heard.ok) {
        idle(heard.error);
        return;
      }
      await sendLearner(heard.text);
    } catch {
      idle("聽唔清。再講一次。");
    }
  }

  async function startRecording() {
    if (phaseRef.current === "thinking" || phaseRef.current === "recording") return;
    stopAudio();
    stopRec();
    heardSpeech.current = false;
    setDraft("聽緊…");
    setNeedTab(false);
    phaseRef.current = "recording";
    setPhase("recording");
    setNote("開緊咪…");
    try {
      const session = await startMic();
      if (phaseRef.current !== "recording") {
        void session.stop();
        return;
      }
      recRef.current = session;
      if (!holding.current) {
        void finishRecording();
        return;
      }
      setNote("撳住。未講完唔好放手。");
      const started = performance.now();
      silenceRef.current = window.setInterval(() => {
        if (phaseRef.current !== "recording") return;
        if (session.level() > 0.015) heardSpeech.current = true;
        const gone = Math.floor((performance.now() - started) / 1000);
        setNote(`講緊 ${clock(gone)}。未講完就唔好放手。`);
        if (performance.now() - started > 180000) void finishRecording();
      }, 400);
    } catch {
      if (silenceRef.current) window.clearInterval(silenceRef.current);
      recRef.current = null;
      setDraft("");
      phaseRef.current = "idle";
      setPhase("idle");
      if (window.self !== window.top) {
        setNeedTab(true);
        setNote("呢個框用唔到咪。撳下面開新分頁，再允許咪高峰。");
      } else {
        setNote("請允許咪高峰，再撳橙色掣。");
      }
    }
  }

  function pressTalk(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || closedRef.current) return;
    if (phaseRef.current === "recording") {
      holding.current = false;
      void finishRecording();
      return;
    }
    if (phaseRef.current === "thinking") return;
    event.preventDefault();
    holding.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    speakGen.current += 1;
    stopAudio();
    void startRecording();
  }

  function releaseTalk() {
    if (!holding.current) return;
    holding.current = false;
    if (phaseRef.current === "recording") void finishRecording();
  }

  function sendTyped() {
    const text = typed.trim();
    if (!text || phase === "thinking" || phase === "speaking" || closed) return;
    stopAudio();
    stopRec();
    setTyped("");
    void sendLearner(text);
  }

  async function askScore(force = false) {
    if (scoring || (!force && (phase === "thinking" || phase === "recording"))) return;
    const turns = historyRef.current.filter((item) => item.role === "user").length;
    if (turns < 2) {
      setNote("再講多兩句，就可以睇分數。");
      return;
    }
    setScoring(true);
    setNote("計緊分…");
    try {
      const result = await scoreTalk({ data: { scene, task, history: historyRef.current } });
      if (!result.ok) {
        setNote(result.error);
        return;
      }
      setScore(result.score);
      setNote("分數喺對話下面。");
    } catch {
      setNote("計唔到分。再撳一次。");
    } finally {
      setScoring(false);
    }
  }

  const learnerTurns = lines.filter((line) => line.who === "learner").length;
  const current = SCENES.find((item) => item.id === scene) ?? SCENES[0];
  const practice = practiceOf(scene, task);
  const over = timing && elapsed >= current.seconds;

  const status = closed
    ? "時間到"
    : phase === "recording"
      ? "你講緊"
      : phase === "thinking"
        ? "諗緊"
        : phase === "speaking"
          ? "導師講緊"
          : "輪到你";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-paper text-ink">
      <header className="bg-booth px-5 pt-6 pb-5 text-sheet">
        <p className="font-display text-3xl text-balance">對講亭</p>
        <div className="mt-1 flex items-center justify-between gap-3 text-sm text-sage-soft">
          <p>Trinity GESE 5 · Speaking & Listening · 分段練習</p>
          <p className={over ? "text-coral" : ""}>
            {timing ? clock(elapsed) : "0:00"} / {clock(current.seconds)}
          </p>
        </div>
        <section className="mt-4 rounded-2xl bg-sheet/10 px-3 py-3">
          <label htmlFor="learning-stage" className="text-xs text-sage-soft">學習程度 · 由淺入深（可自行選擇）</label>
          <select id="learning-stage" value={stage} disabled={phase === "thinking" || phase === "recording"}
            onChange={(event) => chooseStage(event.target.value as StageId)}
            className="mt-2 w-full rounded-xl bg-sheet px-3 py-3 text-sm text-ink">
            {TRAINING_STAGES.map((item) => <option key={item.id} value={item.id}>{item.title} · {item.subtitle}</option>)}
          </select>
          <p className="mt-2 text-sm text-sheet">{stageOf(stage).objective}</p>
          <p className="mt-1 text-xs text-sage-soft">今次目標：{stageOf(stage).task}</p>
          <p className="mt-1 text-xs text-sage-soft">學習階段 ≠ 官方 B1 分數 · 呢版先驗證口語引導，未有自動升級。</p>
        </section>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {SCENES.map((item) => {
            const on = item.id === scene;
            return (
              <button
                key={item.id}
                type="button"
                disabled={phase === "thinking"}
                onClick={() => {
                  setScene(item.id);
                  setTask(0);
                }}
                className={
                  "shrink-0 rounded-full px-4 py-2 text-sm " +
                  (on ? "bg-coral text-sheet" : "bg-booth text-sheet ring-1 ring-line/40")
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="mt-4 rounded-2xl bg-sheet/10 px-4 py-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-sage-soft">{practice.card.title}</p>
            <button
              type="button"
              disabled={phase === "thinking" || phase === "recording"}
              onClick={() => setTask((n) => (scene === "topic" && stage === "exam" && (n + 1) % 3 === 1 ? n + 2 : n + 1))}
              className="shrink-0 rounded-full px-3 py-1 text-xs ring-1 ring-sheet/30 disabled:opacity-40"
            >
              下一題
            </button>
          </div>
          <ul className="mt-1 space-y-0.5">
            {practice.card.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </header>

      <div ref={scrollRef} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        {lines.map((line) =>
          line.who === "tutor" ? (
            <div key={line.id} className="max-w-[90%] rounded-card bg-sage-soft px-4 py-3 text-ink">
              <p className="text-xs font-medium text-sage">導師</p>
              <p className="mt-1 text-pretty leading-relaxed">{line.text}</p>
            </div>
          ) : (
            <div key={line.id} className="ml-auto max-w-[90%]">
              <div className="rounded-card bg-sheet px-4 py-3 ring-1 ring-line">
                <p className="text-xs font-medium text-muted">你</p>
                <p className="mt-1 text-pretty leading-relaxed">{line.text}</p>
              </div>
              {line.better ? (
                <p className="mt-2 px-1 text-sm text-pretty text-sage">試下成句：{line.better}</p>
              ) : null}
            </div>
          ),
        )}
        {draft ? (
          <div className="ml-auto max-w-[90%] rounded-card bg-sheet/70 px-4 py-3 text-muted ring-1 ring-line">
            {draft}
          </div>
        ) : null}
        {score ? (
          <section className="rounded-card bg-sheet px-4 py-4 ring-1 ring-line">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-display text-3xl text-balance leading-tight">{readyLine(score.level)}</p>
                <p className="mt-2 text-sm text-muted">只根據文字作練習回饋，不能判定 Trinity B1 合格或發音能力。</p>
              </div>
              <p className={"text-sm " + (over ? "text-coral" : "text-muted")}>
                {clock(elapsed)} / {clock(limit)}
                {over ? " 超時" : " 趕得切"}
              </p>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {score.checks.map((item) => (
                <li key={item.label} className="flex items-start justify-between gap-3">
                  <span>{item.label}</span>
                  <span className={item.met ? "shrink-0 text-sage" : "shrink-0 text-muted"}>
                    {item.met ? "做到" : "下次可以"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-pretty">{score.note}</p>
            {score.revise.length > 0 ? (
              <div className="mt-4">
                <p className="text-xs font-medium text-sage">可以咁講</p>
                <ul className="mt-2 space-y-3 text-sm">
                  {score.revise.map((item) => (
                    <li key={item.yours}>
                      <p className="text-muted">{item.yours}</p>
                      <p className="mt-1">{item.better}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="mt-4 text-xs font-medium text-tip">點樣進步</p>
            <p className="mt-1 text-sm text-pretty">{score.improve}</p>
            {score.tip ? <p className="mt-2 text-sm text-pretty text-muted">下次可以試：{score.tip}</p> : null}
            <p className="mt-3 text-xs text-muted">練習能力指標，非官方評分；發音、聽力及真正考試表現必須另外驗證。</p>
          </section>
        ) : null}
      </div>

      <div className="border-t border-line bg-sheet px-4 pt-3 pb-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-pretty text-muted">{note}</p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => {
                setVoiceOn((v) => !v);
                if (voiceOn) stopAudio();
              }}
              className="rounded-full px-3 py-2 text-xs ring-1 ring-line"
            >
              {voiceOn ? "有聲" : "靜音"}
            </button>
            <button
              type="button"
              onClick={() => void askScore()}
              disabled={scoring || learnerTurns < 2 || phase === "thinking" || phase === "recording"}
              className="rounded-full bg-sage px-3 py-2 text-xs text-sheet disabled:opacity-40"
            >
              {scoring ? "計分中" : "睇分數"}
            </button>
          </div>
        </div>

        {needTab ? (
          <button
            type="button"
            onClick={() => window.open(window.location.href, "_blank")}
            className="mb-3 w-full rounded-full bg-booth px-4 py-3 text-sm text-sheet"
          >
            用新分頁開，先可以講
          </button>
        ) : null}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onPointerDown={pressTalk}
            onPointerUp={releaseTalk}
            onContextMenu={(event) => event.preventDefault()}
            disabled={phase === "thinking" || closed}
            aria-label={status}
            className={
              "grid size-20 shrink-0 touch-none place-items-center rounded-full text-sheet select-none disabled:opacity-50 " +
              (phase === "recording" ? "talk-live bg-coral-deep" : "bg-coral")
            }
          >
            {phase === "recording" ? <Square className="size-7" /> : <Mic className="size-8" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-display text-2xl text-balance">{status}</p>
            <p className="text-sm text-muted">
              {closed
                ? "呢部分完咗。要再練就撳下一題。"
                : phase === "speaking"
                  ? "放手之後先會答。"
                  : "撳住講，停一停都得。放手先送出。"}
            </p>
          </div>
        </div>

        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendTyped();
          }}
        >
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={closed}
            placeholder="或者打英文"
            className="min-w-0 flex-1 rounded-full bg-paper px-4 py-3 text-sm ring-1 ring-line outline-none"
          />
          <button
            type="submit"
            disabled={!typed.trim() || phase === "thinking" || phase === "speaking" || closed}
            className="rounded-full bg-booth px-4 py-3 text-sm text-sheet disabled:opacity-40"
          >
            送出
          </button>
        </form>
      </div>
    </main>
  );
}