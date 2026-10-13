/** Original learning prompts. These are NOT leaked or official exam questions. */
export const TOPIC_FORMS = [
  { id:'daily-routine', name:'My typical day', suitableForExamPractice:true, points: [
    'How my day normally starts', 'My morning activities', 'What I enjoy doing during the day',
    'A recent change in my routine', 'My plans for the future',
  ]},
  { id:'cooking', name:'Cooking and food I enjoy making', suitableForExamPractice:true, points: [
    'Why I enjoy cooking', 'A dish I often prepare', 'How I learnt to cook',
    'A recent meal I made', 'A recipe I would like to learn',
  ]},
  { id:'family', name:'My family (beginner speaking only)', suitableForExamPractice:false, points: [
    'Who is in my family', 'Where we live', 'Our favourite activities',
    'Something we did recently', 'Something we plan to do',
  ]},
] as const;

export const CONVERSATION_UNITS = [
  { id:'festivals', name:'Festivals', aims:['Describe a festival','Explain why it matters','Ask a related question'], starters:['Which festival do you enjoy?', 'What do people usually do?', 'Why do you like it?'] },
  { id:'transport', name:'Means of transport', aims:['Describe a journey','Explain a preference','Compare transport'], starters:['How do you normally travel?', 'Which form of transport do you prefer?', 'Can you tell me about a recent journey?'] },
  { id:'special', name:'Special occasions', aims:['Describe a celebration','Speak about the past','Explain a preference'], starters:['What do you usually do on your birthday?', 'Tell me about a special occasion.', 'Why was it memorable?'] },
  { id:'entertainment', name:'Entertainment', aims:['Express preferences','Describe a recent experience','Give a reason'], starters:['What do you enjoy watching?', 'Have you been to the cinema recently?', 'Why do you prefer it?'] },
  { id:'music', name:'Music', aims:['Express tastes','Explain reasons','Talk about changes over time'], starters:['What kind of music do you like?', 'When do you listen to music?', 'Have your tastes changed?'] },
  { id:'recent', name:'Recent personal experiences', aims:['Describe events','Use past tense/present perfect','Answer follow-up questions'], starters:['What have you done recently?', 'Can you tell me more about that?', 'Why did you decide to do it?'] },
] as const;

export function validTopicForm(id:string): boolean {
 return TOPIC_FORMS.some(x => x.id === id && x.suitableForExamPractice);
}