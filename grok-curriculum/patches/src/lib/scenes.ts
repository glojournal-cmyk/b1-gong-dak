export type SceneId = "topic" | "convo";

export type Practice = {
  opener: string;
  brief: string;
  next: string;
  card: { title: string; lines: string[] };
};

export type Scene = {
  id: SceneId;
  label: string;
  hint: string;
  seconds: number;
  tasks: Practice[];
};

const word = "If they say only one or two words, give one simple sentence once, then go back to the conversation. If they already speak in a sentence, do not make them repeat.";

export const SCENES: Scene[] = [
  {
    id: "topic",
    label: "一、自己個題",
    hint: "最多 5 分鐘",
    seconds: 300,
    tasks: [
      {
        opener: "Your topic is your day. Tell me about it.",
        brief: `GESE Grade 5 topic phase. Subject: the candidate's own day. Follow what they just said and ask about the next part of their day. Do not ask what each family member or friend likes. ${word}`,
        next: "What do you like most about your day?",
        card: {
          title: "自己揀 · 我嘅一日",
          lines: ["正式考試你帶五點", "呢題唔可以係考官嗰六樣", "講做咩、同邊個、點解鍾意"],
        },
      },
      {
        opener: "Your topic is your family. Tell me about them.",
        brief: `GESE Grade 5 topic phase. The candidate prepared "my family". Ask who they live with and what you do together. ${word}`,
        next: "Who do you spend the most time with?",
        card: {
          title: "初級練習 · 屋企人",
          lines: ["適合初學口語練習", "Trinity 建議自選考試 Topic 避免揀家庭", "一齊做咩、點解鍾意"],
        },
      },
      {
        opener: "Your topic is cooking. What do you like to cook?",
        brief: `GESE Grade 5 topic phase. The candidate prepared "cooking". Ask what they cook, how often, and why they like it. ${word}`,
        next: "How often do you cook?",
        card: {
          title: "自己揀 · 煮食",
          lines: ["煮咩、幾常", "點解鍾意", "記住問考官一條問題"],
        },
      },
    ],
  },
  {
    id: "convo",
    label: "二、考官抽題",
    hint: "最多 5 分鐘",
    seconds: 300,
    tasks: [
      {
        opener: "Let's talk about festivals. Is there a festival you like?",
        brief: `GESE Grade 5 conversation. Subject: festivals. Talk about one festival, what happens, and why they like it. ${word} They should ask you one question.`,
        next: "What do people usually do at that festival?",
        card: {
          title: "指定 · 節日",
          lines: ["考官指定，唔係你揀", "講做咩、點解", "你要問考官一條問題"],
        },
      },
      {
        opener: "Let's talk about transport. How do you travel every day?",
        brief: `GESE Grade 5 conversation. Subject: means of transport. Ask how they travel and which they prefer. ${word} They should ask you one question.`,
        next: "Which way do you prefer, and why?",
        card: {
          title: "指定 · 交通",
          lines: ["每日點去", "比較鍾意邊種", "你要問考官一條問題"],
        },
      },
      {
        opener: "Let's talk about special days. What do you do on your birthday?",
        brief: `GESE Grade 5 conversation. Subject: special occasions, such as birthdays. ${word} They should ask you one question.`,
        next: "Who do you spend that day with?",
        card: {
          title: "指定 · 特別場合",
          lines: ["生日或者其他特別日子", "同邊個、做咩", "你要問考官一條問題"],
        },
      },
      {
        opener: "Let's talk about entertainment. Do you prefer films or television?",
        brief: `GESE Grade 5 conversation. Subject: entertainment, such as cinema, television, or clubs. ${word} They should ask you one question.`,
        next: "What did you watch recently?",
        card: {
          title: "指定 · 娛樂",
          lines: ["戲、電視或者出去玩", "最近睇過咩", "你要問考官一條問題"],
        },
      },
      {
        opener: "Let's talk about music. What music do you like?",
        brief: `GESE Grade 5 conversation. Subject: music. ${word} They should ask you one question.`,
        next: "When do you usually listen to music?",
        card: {
          title: "指定 · 音樂",
          lines: ["鍾意咩音樂", "幾時聽", "你要問考官一條問題"],
        },
      },
      {
        opener: "Let's talk about something you did recently. What did you do last weekend?",
        brief: `GESE Grade 5 conversation. Subject: recent personal experiences. Ask about the recent past. ${word} They should ask you one question.`,
        next: "Who were you with?",
        card: {
          title: "指定 · 最近做過嘅事",
          lines: ["講過去，唔係計劃", "上個週末做過咩", "你要問考官一條問題"],
        },
      },
    ],
  },
];

export function sceneById(id: string): Scene {
  return SCENES.find((item) => item.id === id) ?? SCENES[0];
}

export function practiceOf(id: string, task: number): Practice {
  const scene = sceneById(id);
  const index = ((task % scene.tasks.length) + scene.tasks.length) % scene.tasks.length;
  return scene.tasks[index] ?? scene.tasks[0];
}