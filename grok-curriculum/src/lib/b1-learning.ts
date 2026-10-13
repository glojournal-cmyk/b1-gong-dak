/**
 * Independent, no-API B1 curriculum layer. All 'readiness' values are formative
 * practice observations, NEVER an official GESE mark or pass prediction.
 * The audio/transcription/model layer lives elsewhere and is not replaced here.
 */
export const TRAINING_STAGES = [
  { id: 'words', title: '01 敢開口', subtitle: '由單字變簡單句', objective: '用自己嘅字回答簡短問題，先肯開口。', task: '聽一句短問題，答幾個字，跟住試講完整一句。', sample: 'one daughter → I have one daughter.', gate: '5條短問題中，至少4條可以自己講完整句。' },
  { id: 'sentences', title: '02 完整回答', subtitle: '建立完整句子', objective: '學 Subject + Verb，講到人、事、時間與地點。', task: '用一句完整英文回答；逐漸由全句提示變成關鍵字。', sample: 'I go to the park with my daughter.', gate: '換唔同問法，至少4/5條仍能講完整句。' },
  { id: 'reasons', title: '03 解釋原因', subtitle: '加原因及經歷', objective: '用 because、過去經歷、喜好及將來計劃擴展到兩三句。', task: '先回答，再加一個原因／經歷／計劃。', sample: 'I enjoy cooking because it helps me relax.', gate: '可以用自己經歷獨立講出原因及至少一個過去／未來例子。' },
  { id: 'conversation', title: '04 自然對答', subtitle: '追問、反問及澄清', objective: '理解考官追問；聽唔明識要求重複；自己問一條相關問題。', task: '做冇固定劇本嘅追問，唔識答時主動要求解釋。', sample: 'Could you say that again, please?', gate: '至少連續5輪相關對答，並主動問問題。' },
  { id: 'exam', title: '05 模擬考試', subtitle: '減少提示、全英文', objective: '熟悉約10分鐘 GESE Grade 5：準備題討論，及六大指定範圍抽兩個。', task: '先分段模擬，自選題及考官指定範圍分開練；完整 10 分鐘 Mock 仍待開發。', sample: 'Practice separately: prepared topic and examiner-selected areas.', gate: '反覆做完整模擬，六個範圍都有覆蓋；仍須接受官方評估。' },
] as const;
export type StageId = typeof TRAINING_STAGES[number]['id'];
export const DEFAULT_STAGE: StageId = 'words';
export function isStage(value: unknown): value is StageId {
  return TRAINING_STAGES.some((stage) => stage.id === value);
}
export function stageOf(value: unknown) { return TRAINING_STAGES.find((s) => s.id === value) ?? TRAINING_STAGES[0]; }

export const CONVERSATION_AREAS = [
  'Festivals', 'Means of transport', 'Special occasions',
  'Entertainment', 'Music', 'Recent personal experiences',
] as const;

/** Official syllabus-oriented FUNCTION coverage, not a replacement for official assessment. */
export const B1_FUNCTIONS = [
  'Recent or indefinite past (present perfect)',
  'Reasons and giving explanations',
  'Preferences, comparisons and quantity',
  'Duration with for / since',
  'Future plans or predictions',
  'Clarification and asking the examiner a question',
] as const;

export type PracticeObservation = {
  at: string;
  stage: StageId;
  topic: string;
  answeredWithSentence: boolean;
  gaveReason: boolean;
  askedQuestion: boolean;
  understoodFollowup: boolean;
};
export type LearningProgress = { selectedStage: StageId; observations: PracticeObservation[]; }; 
export const EMPTY_PROGRESS: LearningProgress = { selectedStage: DEFAULT_STAGE, observations: [] };
/** Store skill observations only, not transcripts, voice recordings or personal identity. */
export function parseProgress(raw: unknown): LearningProgress {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_PROGRESS, observations: [] };
  const data = raw as Record<string, unknown>;
  const observations: PracticeObservation[] = Array.isArray(data.observations)
    ? data.observations.filter((o): o is PracticeObservation => {
        if (!o || typeof o !== 'object') return false;
        const p = o as Record<string, unknown>;
        return typeof p.at === 'string' && isStage(p.stage) && typeof p.topic === 'string' &&
          ['answeredWithSentence','gaveReason','askedQuestion','understoodFollowup'].every(k => typeof p[k] === 'boolean');
      }).slice(-90)
    : [];
  return { selectedStage: isStage(data.selectedStage) ? data.selectedStage : DEFAULT_STAGE, observations };
}
export function addObservation(progress: LearningProgress, observation: PracticeObservation): LearningProgress {
  return { ...progress, observations: [...progress.observations, observation].slice(-90) };
}
export function progressSummary(progress: LearningProgress) {
  const recent = progress.observations.slice(-10);
  const total = recent.length;
  return {
    total,
    completeSentence: recent.filter(x => x.answeredWithSentence).length,
    gaveReason: recent.filter(x => x.gaveReason).length,
    askedQuestion: recent.filter(x => x.askedQuestion).length,
    followup: recent.filter(x => x.understoodFollowup).length,
    // This is learning history, not a pass rating.
    label: total ? `已記錄 ${total} 次練習觀察（非官方評分）` : '未有足夠練習紀錄',
  };
}

export function stageCoachRules(stageId: StageId): string {
  switch (stageId) {
    case 'words': return 'First acknowledge the learner actual words. If they use fragments, offer ONE faithful short sentence and invite ONE repetition. If already a sentence, continue naturally. Do not invent details. No long grammar lectures.';
    case 'sentences': return 'Help the learner make a simple full sentence from their own facts (subject + verb + detail). Give at most one correction and one relevant follow-up. Reduce hints as they improve.';
    case 'reasons': return 'Ask for one personal reason using because, a preference, or a real past/future example. Stay with the learner actual experience; never fabricate facts. Ask only one question.';
    case 'conversation': return 'Respond meaningfully to follow-up questions or requests for clarification. Change wording if the learner is confused. Encourage the learner to ask the examiner one relevant question, but do not force scripts.';
    case 'exam': return 'Act as a simulated GESE Grade 5 examiner: English-only, no coaching or suggested sentences while speaking, natural follow-ups and reasonable prompts for a learner question. Give feedback only when the simulation ends. Never claim the learner officially passed.';
  }
}

export function practiceReminder(stage: StageId): string {
  return `${stageOf(stage).objective} 呢度嘅級別只係練習階段，唔係 Trinity 官方分數。`;
}