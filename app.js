/* B1 講得掂 — zero-paid-API practice prototype. Not a generative AI examiner. */
'use strict';
const KEY='b1_gongdak_mvp_v1';
const TOPICS=[
 {id:'family',name:'My Prepared Topic — Family',zh:'我的家庭（自選 Topic 示範）',emoji:'🏡',desc:'用你自己嘅生活經歷準備自選主題',questions:[
  {id:'family_intro',en:'Can you tell me about your family?',zh:'可以介紹一下你的家庭嗎？',keywords:'daughter, son, husband, wife, family',sample:'I have one daughter.'},
  {id:'family_age',en:'How old is your daughter or child?',zh:'你的女兒／孩子幾多歲？',keywords:'years old',sample:'My daughter is 13 years old.'},
  {id:'family_weekend',en:'What do you usually do with your family at weekends?',zh:'週末通常和家人做甚麼？',keywords:'go, visit, cook, play',sample:'At weekends, I usually spend time with my family.'},
  {id:'family_why',en:'Why do you enjoy spending time with your family?',zh:'點解鍾意同家人相處？',keywords:'because, happy, relaxing',sample:'I enjoy it because it makes me happy.'}
 ]},
 {id:'festivals',name:'Festivals',zh:'節日',emoji:'🎊',desc:'Christmas、Chinese New Year 等節日',questions:[
  {id:'festival_fav',en:'What is your favourite festival?',zh:'你最鍾意邊個節日？',keywords:'Christmas, Easter, Chinese New Year',sample:'My favourite festival is Christmas.'},
  {id:'festival_do',en:'How do you usually celebrate it?',zh:'你通常點慶祝？',keywords:'family, dinner, friends, celebrate',sample:'I usually have dinner with my family.'},
  {id:'festival_why',en:'Why is this festival important to you?',zh:'節日對你有咩重要？',keywords:'because, family, tradition, happy',sample:'It is important because I can spend time with my family.'}
 ]},
 {id:'transport',name:'Means of Transport',zh:'交通工具',emoji:'🚌',desc:'搭車、駕車及出行經驗',questions:[
  {id:'transport_how',en:'How do you usually travel around your town?',zh:'你通常用咩交通工具出行？',keywords:'bus, train, car, walk',sample:'I usually travel by bus.'},
  {id:'transport_why',en:'Why do you prefer that kind of transport?',zh:'點解你比較喜歡嗰種交通工具？',keywords:'because, cheap, easy, convenient',sample:'I prefer it because it is convenient.'},
  {id:'transport_past',en:'Tell me about a journey you made recently.',zh:'講下最近一次出行經歷。',keywords:'last week, went, travelled, visited',sample:'Last week, I travelled to London by train.'}
 ]},
 {id:'occasions',name:'Special Occasions',zh:'特別場合',emoji:'🎂',desc:'生日、婚禮、慶祝活動',questions:[
  {id:'occasion_fav',en:'Which special occasions do you enjoy celebrating?',zh:'你鍾意慶祝咩特別日子？',keywords:'birthday, wedding, anniversary',sample:'I enjoy celebrating birthdays.'},
  {id:'occasion_past',en:'Tell me about a special day you enjoyed.',zh:'講下你曾經開心度過嘅特別日子。',keywords:'last year, my birthday, family',sample:'Last year, I celebrated my birthday with my family.'},
  {id:'occasion_why',en:'Why do people celebrate special occasions?',zh:'點解人會慶祝特別日子？',keywords:'family, friends, important',sample:'People celebrate because they want to share happy moments.'}
 ]},
 {id:'entertainment',name:'Entertainment',zh:'娛樂',emoji:'🎬',desc:'電影、電視、興趣和休閒',questions:[
  {id:'entertainment_what',en:'What do you like doing in your free time?',zh:'你空閒時鍾意做咩？',keywords:'watch, read, cook, sport',sample:'I enjoy watching films in my free time.'},
  {id:'entertainment_with',en:'Who do you usually enjoy these activities with?',zh:'你通常同邊個一齊做？',keywords:'family, friends, alone',sample:'I usually enjoy these activities with my friends.'},
  {id:'entertainment_why',en:'Why do you enjoy this activity?',zh:'點解鍾意呢個活動？',keywords:'because, relaxing, fun',sample:'I enjoy it because it helps me relax.'}
 ]},
 {id:'music',name:'Music',zh:'音樂',emoji:'🎵',desc:'喜愛音樂、歌手及經驗',questions:[
  {id:'music_like',en:'What kind of music do you like?',zh:'你喜歡咩類型音樂？',keywords:'pop, classical, jazz, rock',sample:'I like listening to pop music.'},
  {id:'music_when',en:'When do you usually listen to music?',zh:'你通常幾時聽音樂？',keywords:'morning, evening, cooking, walking',sample:'I usually listen to music in the evening.'},
  {id:'music_why',en:'Why do you like that kind of music?',zh:'點解鍾意呢類音樂？',keywords:'relaxing, happy, calm',sample:'I like it because it is relaxing.'}
 ]},
 {id:'experiences',name:'Recent Personal Experiences',zh:'最近個人經歷',emoji:'🧳',desc:'最近去過哪裡、做過甚麼',questions:[
  {id:'experience_where',en:'Tell me about somewhere you visited recently.',zh:'講下你最近去過邊度。',keywords:'went, visited, London, park',sample:'Recently, I visited a beautiful park.'},
  {id:'experience_with',en:'Who did you go with?',zh:'你同邊個一齊去？',keywords:'family, friends, alone',sample:'I went with my family.'},
  {id:'experience_feel',en:'How did you feel about your visit?',zh:'你覺得嗰次經歷點？',keywords:'happy, excited, relaxed',sample:'I really enjoyed it because it was relaxing.'}
 ]},
 {id:'work',name:'My Prepared Topic — Work',zh:'我的工作（自選 Topic 示範）',emoji:'💼',desc:'工作及日常職責',questions:[
  {id:'work_what',en:'Can you tell me about your work?',zh:'可以講下你嘅工作嗎？',keywords:'work, care worker, teacher',sample:'I work as a care worker.'},
  {id:'work_like',en:'What do you enjoy about your job?',zh:'你鍾意工作邊方面？',keywords:'help people, colleagues, learn',sample:'I enjoy helping people.'},
  {id:'work_future',en:'What would you like to do in the future?',zh:'未來想做咩？',keywords:'would like, learn, work',sample:'I would like to improve my English.'}
 ]},
 {id:'life',name:'My Prepared Topic — Life in the UK',zh:'我在英國生活（自選 Topic 示範）',emoji:'🇬🇧',desc:'生活環境、喜好與計劃',questions:[
  {id:'life_where',en:'Where do you live in the UK?',zh:'你住英國邊度？',keywords:'live in, London, Manchester',sample:'I live in London.'},
  {id:'life_like',en:'What do you like about living here?',zh:'你鍾意呢度生活啲乜？',keywords:'parks, people, schools',sample:'I like the parks near my home.'},
  {id:'life_future',en:'What would you like to do next year?',zh:'你下一年想做咩？',keywords:'would like to, study, travel',sample:'I would like to travel more.'}
 ]}
];
const OFFICIAL=['festivals','transport','occasions','entertainment','music','experiences'];
const FACT_FIELDS=[['daughterCount','女兒數目'],['daughterAge','女兒年齡'],['favouriteFestival','最喜歡的節日'],['transport','日常交通工具'],['music','喜歡的音樂']];
const byId=id=>document.getElementById(id);
const topic=id=>TOPICS.find(t=>t.id===id)||TOPICS[0];
const defaultState=()=>({version:1,facts:{},saved:[],sessions:0,touched:[],voiceGender:'female',voiceName:'',rate:0.9});
function cleanState(raw){if(!raw||typeof raw!=='object'||raw.version!==1)return defaultState();const o=defaultState();o.sessions=Math.min(100000,Math.max(0,Number(raw.sessions)||0));o.touched=Array.isArray(raw.touched)?[...new Set(raw.touched.filter(x=>TOPICS.some(t=>t.id===x)))]:[];o.saved=Array.isArray(raw.saved)?raw.saved.filter(x=>x&&typeof x.en==='string'&&typeof x.zh==='string').slice(0,500).map(x=>({en:x.en.slice(0,350),zh:x.zh.slice(0,200)})):[];o.facts={};for(const [key] of FACT_FIELDS){if(raw.facts&&typeof raw.facts[key]==='string')o.facts[key]=raw.facts[key].slice(0,70)}o.voiceGender=raw.voiceGender==='male'?'male':'female';o.voiceName=typeof raw.voiceName==='string'?raw.voiceName.slice(0,150):'';o.rate=Math.min(1.1,Math.max(0.65,Number(raw.rate)||0.9));return o}
function load(){try{return cleanState(JSON.parse(localStorage.getItem(KEY)))}catch{return defaultState()}}
let state=load(),dialog=null,mock=null,mockTicker=null,mic=null,toastTimer=null,voices=[];
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch{notify('儲存失敗，可能已超出瀏覽器儲存空間');return false}}
function notify(message){const el=byId('toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3500)}
function go(name){const v=byId(`view-${name}`);if(!v)return;document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x===v));document.querySelectorAll('.bottom-nav button').forEach(x=>x.classList.toggle('current',x.dataset.go===name));window.scrollTo({top:0,behavior:'instant'});if(name==='home')renderHome();if(name==='memory')renderMemory();if(name==='settings')renderSettings();if(name==='mock')renderMock();}
function el(tag,classes,txt){const n=document.createElement(tag);if(classes)n.className=classes;if(txt!==undefined)n.textContent=txt;return n}
function btn(label,fn,cls=''){const b=el('button',cls,label);b.type='button';b.addEventListener('click',fn);return b}
function renderHome(){byId('stat-sessions').textContent=state.sessions;byId('stat-sentences').textContent=state.saved.length;byId('stat-topics').textContent=(OFFICIAL.filter(id=>state.touched.includes(id)).length+(state.touched.some(id=>['family','work','life'].includes(id))?1:0))+'/7'}
function renderTopics(){const parent=byId('topic-list');parent.replaceChildren();const intro=el('div','eyebrow','我的自選主題（示範）');parent.append(intro);for(const t of TOPICS.filter(t=>['family','work','life'].includes(t.id)))parent.append(topicCard(t));parent.append(el('div','eyebrow','TRINITY CONVERSATION · 6 TOPICS'));for(const t of TOPICS.filter(t=>OFFICIAL.includes(t.id)))parent.append(topicCard(t))}
function topicCard(t){const b=el('button','topic-card');b.type='button';const icon=el('span','emoji',t.emoji);const d=el('div','detail');d.append(el('strong','',t.name),el('small','',t.zh+' · '+t.desc));b.append(icon,d,el('span','arrow','→'));b.addEventListener('click',()=>{byId('topic-choice').value=t.id;go('practice');startDialogue(t.id)});return b}
function initTopics(){const sel=byId('topic-choice');for(const t of TOPICS){const o=new Option(t.zh,t.id);sel.append(o)}sel.value='family';renderTopics()}
function clearChat(){byId('chat-window').replaceChildren()}
function scrollChat(){const box=byId('chat-window');box.scrollTop=box.scrollHeight}
function appendMessage(who,text,sub){const wrap=el('div','chat-item '+(who==='student'?'student':''));wrap.append(el('div','avatar',who==='student'?'🙂':'👩🏻‍🏫'));const bubble=el('div','chat-bubble');bubble.append(el('small','speaker-label',who==='student'?'YOU':'EXAMINER'),document.createTextNode(text));if(sub)bubble.append(el('span','tip',sub));wrap.append(bubble);byId('chat-window').append(wrap);scrollChat()}
function startDialogue(id){const t=topic(id||byId('topic-choice').value);dialog={topicId:t.id,index:0,awaiting:false,turns:0,answers:{}};clearChat();byId('user-answer').value='';byId('user-answer').disabled=false;byId('send-answer').disabled=false;byId('mic-button').disabled=false;askQuestion();}
function currentQuestion(){if(!dialog)return null;const t=topic(dialog.topicId);return dialog.lastQuestion||t.questions[dialog.index % t.questions.length]}
function askQuestion(){if(!dialog)return;const q=currentQuestion();dialog.awaiting=true;const mode=byId('help-level').value;let question=q.en,zh=q.zh;
 // Previous answers customise later questions without inventing any family facts.
 if(q.id==='family_age' && dialog.answers.family_intro?.child==='son'){question='How old is your son?';zh='你個仔幾多歲？'}
 if(q.id==='family_why' && dialog.answers.family_weekend?.activity==='church'){question='Why do you enjoy going to church?';zh='你點解鍾意返教會？'}
 dialog.lastQuestion={...q,en:question,zh};
 appendMessage('coach',question,zh);if(mode!=='none'){const n=el('div','coach-block quick-tip');n.append(el('strong','',mode==='full'?'參考句型（非你嘅個人資料）':'可用關鍵字'));n.append(el('p','',mode==='full'?q.sample:q.keywords));byId('chat-window').append(n)}scrollChat();
 // A question is read aloud after a real button click; fallback to text if TTS is unsupported.
 speak(question);
}
function norm(s){return String(s||'').toLowerCase().replace(/[.,!?]/g,' ').replace(/\s+/g,' ').trim()}
function firstMatch(s,rx){const m=s.match(rx);return m&&m[1]?m[1]:null}

// A zero-API dialogue must never pretend to understand free-form English.
function conversationalIntent(input){const s=norm(input);
 if(/\b(?:can you|do you|are you able to) (?:hear|understand|listen to|see) (?:me|what i say|my voice|my words)/.test(s)||/\b(?:can you hear me|do you understand me|are you listening)\b/.test(s))return 'audio-check';
 if(/\b(?:pardon|say that again|repeat (?:the|your|that)? ?question|one more time|didn.t (?:hear|understand)|can't (?:hear|understand)|dont understand|don't understand)\b/.test(s))return 'repeat';
 if(/\b(?:what (?:should|can|do) i (?:say|answer)|help me|give me (?:a|an) (?:example|hint))\b/.test(s))return 'help';
 if(/^(?:hello|hi|good morning|good afternoon|good evening|thank you|thanks|ok|okay)[ .!?]*$/.test(input.trim().toLowerCase()))return 'greeting';
 return null;
}
function ageValue(s){const digit=firstMatch(s,/\b(\d{1,2})\s*(?:years?\s*old|year[- ]old)?\b/);if(digit && Number(digit)>0 && Number(digit)<100)return digit;const words={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20};const m=s.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)(?:[ -](one|two|three|four|five|six|seven|eight|nine))?\b/);return m?String(words[m[1]]+(m[2]?words[m[2]]:0)):null}
function familyIntroResult(s,f){
 if(/\b(?:no (?:children|kids|sons|daughters)|don't have (?:any )?(?:children|kids)|do not have (?:any )?(?:children|kids))\b/.test(s))return {en:'I do not have any children.',zh:'我冇小朋友。',pending:{daughterCount:'0'},child:'none'};
 if(/\b(?:daughter|daughters|girl|girls)\b/.test(s)||/女兒/.test(s)){
  const num=/\b(?:two|2)\b/.test(s)?'two':/\b(?:three|3)\b/.test(s)?'three': 'one';
  const a= /\b(?:daughter (?:is |aged |who is )?|she (?:is |is aged )?|she's )(\d{1,2})\b/.exec(s)?.[1] || (/(?:years?[- ]old|aged|she is|she's)/.test(s)?ageValue(s.replace(/\b(?:one|two|three) daughter[s]?\b/g,'')):null) || f.daughterAge;
  const pending={daughterCount:num};if(a&&Number(a)>0&&Number(a)<100&&/(?:year|old|aged|she)/.test(s))pending.daughterAge=a;
  const en=a&&num==='one'?`I have a ${a}-year-old daughter.`:`I have ${num} ${num==='one'?'daughter':'daughters'}.`;
  return {en,zh:a&&num==='one'?`我有一個 ${a} 歲嘅女兒。`:'你可以用 I have... 講你有幾多個女兒。',pending,child:'daughter',knownAge:!!a};
 }
 if(/\b(?:son|sons|boy|boys)\b/.test(s)){const num=/\b(?:two|2)\b/.test(s)?'two':/\b(?:three|3)\b/.test(s)?'three':'one';return {en:`I have ${num} ${num==='one'?'son':'sons'}.`,zh:'你可以用 I have... 講你有幾多個仔。',child:'son'}}
 if(/\b(?:husband|wife|married)\b/.test(s)){const en=/husband/.test(s)?'I live with my husband.':/wife/.test(s)?'I live with my wife.':'I am married.';return {en,zh:'可以用簡單句介紹家人。',child:'none-mentioned'}}
 return null;
}
function understandingFeedback(input){const s=norm(input);if(/\b(?:my name is|i am called)\b/.test(s))return '呢句係介紹你個名，但目前問題係另一個主題。';return '我已收到你嘅輸入，但免費句型引擎暫時唔明白呢個答案，唔會假裝明白。你可以重答、睇句型例子，或者跳過。'}
function build(q,input){const s=norm(input);const f=state.facts;let en='',zh='',pending=null,child=null,knownAge=false,activity=null;
 switch(q.id){
 case 'family_intro':{
  const r=familyIntroResult(s,f);if(r){({en,zh,pending,child,knownAge}=r)}break}
 case 'family_age':{
  const a=ageValue(s);if(a){const isSon=dialog?.answers.family_intro?.child==='son';en=`My ${isSon?'son':'daughter'} is ${a} years old.`;zh=`我個${isSon?'仔':'女'}今年 ${a} 歲。`;if(!isSon)pending={daughterAge:a}}break}
 case 'family_weekend':{let act='';if(/church/.test(s))act='go to church';else if(/shop/.test(s))act='go shopping';else if(/park/.test(s))act='go to the park';else if(/cook/.test(s))act='cook';else if(/walk/.test(s))act='go for a walk';if(act){en=`At weekends, I usually ${act}${/family/.test(s)?' with my family':''}.`;zh='用 At weekends, I usually... 講習慣。';activity=/church/.test(s)?'church':act}break}
 case 'family_why': case 'entertainment_why':case 'music_why':case 'occasion_why':case 'transport_why':{
   let reason='';if(/relax|calm|peaceful/.test(s))reason='it is relaxing';else if(/friend/.test(s))reason='I can meet my friends';else if(/family/.test(s))reason='I can spend time with my family';else if(/happy|fun/.test(s))reason='it makes me happy';else if(/convenient|easy/.test(s))reason='it is convenient';else if(/cheap|save money/.test(s))reason='it is affordable';if(reason){en=`I like it because ${reason}.`;zh='because 後面加原因，就可以將答案講完整。'}break}
 case 'transport_how':{
  const choices=[['bus','bus'],['train','train'],['car','car'],['bike','bike'],['bicycle','bicycle']];const choice=choices.find(([word])=>s.includes(word));if(choice){en=`I usually travel by ${choice[1]}.`;zh=`我通常搭／用 ${choice[1]} 出行。`;pending={transport:choice[1]}}else if(/walk|foot/.test(s)){en='I usually walk around my town.';zh='我通常步行。';pending={transport:'walking'}}break}
 case 'music_like':{const kind=firstMatch(s,/\b(pop|rock|classical|jazz|rap|country)\b/);if(kind){en=`I like listening to ${kind} music.`;zh=`我鍾意聽 ${kind} 音樂。`;pending={music:kind}}break}
 case 'music_when':{const when=/morning/.test(s)?'in the morning':/evening|night/.test(s)?'in the evening':/cook/.test(s)?'when I am cooking':/walk/.test(s)?'when I go for a walk':null;if(when){en=`I usually listen to music ${when}.`;zh='通常時間可以用 I usually... 表達。'}break}
 case 'festival_fav':{const name=/chinese new year|lunar/.test(s)?'Chinese New Year':/christmas/.test(s)?'Christmas':/easter/.test(s)?'Easter':/diwali/.test(s)?'Diwali':null;if(name){en=`My favourite festival is ${name}.`;zh=`我最喜歡的節日是 ${name}。`;pending={favouriteFestival:name}}break}
 case 'festival_do':{const act=/dinner|eat|meal/.test(s)?'have dinner':/visit/.test(s)?'visit relatives':/party/.test(s)?'have a party':null;if(act){en=`I usually ${act}${/family/.test(s)?' with my family':''}.`;zh='描述節日期間通常做嘅活動。'}break}
 case 'entertainment_what':{const v=/movie|film/.test(s)?'watching films':/read|book/.test(s)?'reading books':/cook/.test(s)?'cooking':/swim/.test(s)?'swimming':/television|\btv\b/.test(s)?'watching TV':null;if(v){en=`I enjoy ${v} in my free time.`;zh='I enjoy + 動詞 ing，係表達興趣嘅常用句型。'}break}
 case 'entertainment_with':case 'experience_with':{const who=/family/.test(s)?'my family':/friend/.test(s)?'my friends':/husband/.test(s)?'my husband':/wife/.test(s)?'my wife':/alone|myself/.test(s)?'myself':null;if(who){en=q.id==='experience_with'?`I went with ${who}.`:`I usually do it with ${who}.`;zh='留意過去經歷用 went，習慣用 usually。'}break}
 case 'occasion_fav':{const thing=/birthday/.test(s)?'birthdays':/wedding/.test(s)?'weddings':/anniversary/.test(s)?'anniversaries':null;if(thing){en=`I enjoy celebrating ${thing}.`;zh='用 enjoy celebrating 講喜歡慶祝嘅場合。'}break}
 case 'experience_where':case 'transport_past':case 'occasion_past':{const dest=firstMatch(s,/(?:went to|visited|travelled to)\s+(london|manchester|birmingham|a park|the park|school|the beach)/)||firstMatch(s,/\b(london|manchester|birmingham)\b/);if(dest){en=q.id==='transport_past'?`Recently, I travelled to ${capPlace(dest)}.`:`Recently, I visited ${capPlace(dest)}.`;zh='講最近經歷可以用 Recently + 過去式。'}else if(q.id==='occasion_past'&&/birthday/.test(s)){en='I celebrated my birthday recently.';zh='用 celebrated 表達已經發生嘅事。'}break}
 case 'work_what':{const job=firstMatch(s,/(care worker|teacher|driver|nurse|shop assistant|cleaner|chef)/);if(job){en=`I work as a ${job}.`;zh='I work as a... 可以講職業。'}break}
 case 'work_like':{if(/help/.test(s)){en='I enjoy helping people.';zh='enjoy 後面可以用動詞 ing。'}break}
 case 'life_where':{const place=firstMatch(s,/(london|manchester|birmingham|leeds|liverpool|kingston|bristol)/);if(place){en=`I live in ${capPlace(place)}.`;zh='I live in... 可以講居住地方。'}break}
 case 'life_like':{if(/park/.test(s)){en='I like the parks near my home.';zh='用 I like... 講你真實喜歡的地方。'}break}
 }
 // Do not treat arbitrary sentences starting with 'I' as an answer to an unrelated question.
 if(!en){return {ok:false,zh:understandingFeedback(input)}}
 return {ok:true,en,zh,pending,child,knownAge,activity};
}
function capPlace(x){return x.replace(/\b\w/g,c=>c.toUpperCase()).replace(/^A Park$/,'a park').replace(/^The Park$/,'the park')}
function repeatCurrentQuestion(){if(!dialog)return;const q=currentQuestion();appendMessage('coach',q.en,q.zh);speak(q.en)}
function showExample(q){const box=el('div','coach-block');box.append(el('strong','','參考例子（唔代表你嘅真實資料）'),el('div','answer-en',q.sample));box.append(btn('🔊 聆聽',()=>speak(q.sample)));byId('chat-window').append(box);scrollChat()}
function nextQuestion(){if(!dialog)return;dialog.index++;const q=topic(dialog.topicId).questions;const intro=dialog.answers.family_intro;
 // Don't ask a child-age question when the learner said they have no children,
 // or already told us the daughter's age in the previous answer.
 if(dialog.topicId==='family'&&dialog.index===1&&(intro?.child==='none'||intro?.child==='none-mentioned'||intro?.knownAge))dialog.index++;
 if(dialog.index>=q.length){appendMessage('coach','Well done! You have finished this practice topic. You can choose another topic or start again.','完成呢個話題！可以轉主題，或者重新練習。');dialog.awaiting=false;byId('user-answer').disabled=true;byId('send-answer').disabled=true;byId('mic-button').disabled=true;return}
 dialog.lastQuestion=null;askQuestion();}
function renderCoach(result,q){const box=el('div','coach-block');
 if(result.ok){box.append(el('strong','','✨ 我用你嘅關鍵字砌咗一句建議'),el('div','answer-en',result.en),el('p','',result.zh));const actions=el('div','coach-actions');actions.append(btn('🔊 聆聽再講',()=>{speak(result.en);byId('user-answer').focus()}));actions.append(btn('♡ 收藏',()=>saveSentence(result.en,q.zh)));
 if(result.pending)actions.append(btn('✓ 確認並記住資料',()=>{Object.assign(state.facts,result.pending);persist();notify('已記住你確認嘅個人資料');renderMemory()},'confirm-memory'));
 actions.append(btn('下一個問題 →',nextQuestion,'next-question'));box.append(actions);
 }else{box.classList.add('not-understood');box.append(el('strong','','未能理解（唔會亂答）'),el('p','',result.zh));const actions=el('div','coach-actions');actions.append(btn('↻ 再答一次',()=>{dialog.awaiting=true;byId('user-answer').focus();notify('請試下簡單英文關鍵字')}));actions.append(btn('睇例句',()=>showExample(q)));actions.append(btn('略過 →',nextQuestion));box.append(actions)}
 byId('chat-window').append(box);scrollChat();}
function respondToIntent(intent,input){const q=currentQuestion();appendMessage('student',input);byId('user-answer').value='';const box=el('div','coach-block intent-reply');
 if(intent==='audio-check'){box.append(el('strong','','我收到你嘅說話內容'),el('p','',`畫面收到：「${input}」。如果你係用咪高峰，代表手機已轉成文字；但唔等於句型引擎真正明白所有說話。`),el('div','answer-en',`Can you hear what I'm saying?`),el('p','','如果你想問「你聽唔聽到我講嘢？」，可以咁講。'));box.append(btn('🔊 聽正確講法',()=>speak(`Can you hear what I'm saying?`)));}
 if(intent==='repeat'){box.append(el('strong','','可以，我再講一次。'),el('p','',q.en));speak(q.en)}
 if(intent==='help'){box.append(el('strong','','你可以試試咁答'),el('div','answer-en',q.sample),el('p','','呢個只係例句，唔係你嘅真實資料。'))}
 if(intent==='greeting'){box.append(el('strong','','Hello!'),el('p','',`Let’s practise. ${q.en}`));}
 box.append(btn('繼續回答原本問題',()=>{byId('user-answer').focus()},'next-question'));
 byId('chat-window').append(box);scrollChat();}
function submitPractice(){if(!dialog)startDialogue(byId('topic-choice').value);if(!dialog.awaiting){notify('請按「下一個問題」或「再答一次」');return}const input=byId('user-answer').value.trim();if(!input){notify('請先講或者輸入一句英文');return}const intent=conversationalIntent(input);if(intent){respondToIntent(intent,input);return}const q=currentQuestion();appendMessage('student',input);byId('user-answer').value='';const result=build(q,input);if(result.ok)dialog.turns++;dialog.awaiting=!result.ok;
 if(result.ok)dialog.answers[q.id]=result;
 renderCoach(result,q);if(result.ok){if(dialog.turns===1)state.sessions++;if(!state.touched.includes(dialog.topicId))state.touched.push(dialog.topicId);persist()}}
function saveSentence(en,zh){if(state.saved.some(x=>x.en===en)){notify('呢句已經喺收藏');return}state.saved.push({en,zh});if(persist())notify('句子已經收藏 ♡')}
function renderMemory(){byId('saved-count').textContent=state.saved.length+' 句';const list=byId('sentence-list');list.replaceChildren();if(!state.saved.length)list.append(el('div','empty-state','未有收藏句子。去「句子教練」試講一句啦！'));state.saved.forEach((s,i)=>{const row=el('div','sentence-row'),box=el('div');box.append(el('strong','',s.en),el('small','',s.zh));row.append(box,btn('🔊',()=>speak(s.en)),btn('刪除',()=>{state.saved.splice(i,1);persist();renderMemory()}));list.append(row)});const facts=byId('facts-list');facts.replaceChildren();for(const [key,label] of FACT_FIELDS){const row=el('div','fact-row');row.append(el('label','',label));const inp=el('input');inp.value=state.facts[key]||'';inp.setAttribute('aria-label',label);inp.placeholder='尚未記錄';inp.addEventListener('change',()=>{const v=inp.value.trim().slice(0,70);if(v)state.facts[key]=v;else delete state.facts[key];persist();notify('已更新個人資料')});row.append(inp);facts.append(row)}}
function getVoices(){if(!('speechSynthesis' in window))return[];return speechSynthesis.getVoices().filter(v=>v.lang&&v.lang.toLowerCase().startsWith('en'))}
function renderVoiceOptions(){voices=getVoices();const sel=byId('voice-specific');sel.replaceChildren(new Option('裝置自動選擇', ''));voices.forEach(v=>sel.append(new Option(v.name+' ('+v.lang+')',v.name)));sel.value=voices.some(v=>v.name===state.voiceName)?state.voiceName:''}
function renderSettings(){byId('voice-gender').value=state.voiceGender;byId('speech-rate').value=state.rate;byId('rate-value').textContent=Number(state.rate).toFixed(2)+'×';renderVoiceOptions()}
function pickVoice(){let v=voices.find(x=>x.name===state.voiceName);if(v)return v;const brit=voices.filter(v=>/en[-_]GB/i.test(v.lang));const pool=brit.length?brit:voices;const male=/male|daniel|george|ryan|oliver|arthur|james|brian|thomas/i;const female=/female|serena|kate|susan|samantha|emma|libby|hazel|sonia|sophie/i;return pool.find(x=>(state.voiceGender==='male'?male:female).test(x.name))||pool[0]||null}
function speak(text){if(!('speechSynthesis' in window)){notify('呢個瀏覽器唔支援英文語音朗讀');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-GB';u.rate=state.rate;const v=pickVoice();if(v)u.voice=v;speechSynthesis.speak(u)}
function startMic(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){notify('此瀏覽器唔支援語音辨識，仍然可以輸入英文練習');return}if(mic){try{mic.stop()}catch{};mic=null;return}try{const rec=new SR();rec.lang='en-GB';rec.interimResults=false;rec.continuous=false;rec.maxAlternatives=1;mic=rec;byId('mic-status').textContent='正在聽你講英文…';byId('mic-button').textContent='■ 停止收音';rec.onresult=e=>{const txt=e.results?.[0]?.[0]?.transcript||'';byId('user-answer').value=txt;byId('mic-status').textContent='已轉文字，請按提交（未必理解）'};rec.onerror=e=>{notify('語音辨識失敗：'+(e.error||'請重試')+'。亦可以改用打字')};rec.onend=()=>{mic=null;byId('mic-button').textContent='🎙️ 語音輸入';if(byId('mic-status').textContent.startsWith('正在'))byId('mic-status').textContent='已停止收音'};rec.start()}catch{mic=null;notify('無法啟動咪高峰，請檢查權限')}}
function shuffledTwo(){const a=[...OFFICIAL];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a.slice(0,2)}
function createMock(){const prepared=byId('mock-prepared').value;const topics=[prepared,...shuffledTwo()];const questions=topics.flatMap(id=>topic(id).questions.slice(0,id===prepared?4:3).map(q=>({...q,topicId:id})));mock={questions,at:0,answers:[],started:Date.now(),finished:false};renderMock();speak(questions[0].en);mockTicker=setInterval(()=>{if(mock&&!mock.finished){if(Date.now()-mock.started>=600000){finishMock();return}const time=byId('mock-clock');if(time)time.textContent=clock(600000-(Date.now()-mock.started))}},1000)}
function clock(ms){let sec=Math.max(0,Math.floor(ms/1000));return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`}
function nextMock(){if(!mock||mock.finished)return;const t=byId('mock-answer').value.trim();if(!t){notify('請先回答，或者按「略過」');return}recordMock(t)}
function recordMock(t){if(!mock||mock.finished)return;mock.answers.push(t);mock.at++;if(mock.at>=mock.questions.length)finishMock();else {renderMock();speak(mock.questions[mock.at].en)}}
function finishMock(){if(!mock)return;mock.finished=true;clearInterval(mockTicker);state.sessions++;for(const q of mock.questions){if(!state.touched.includes(q.topicId))state.touched.push(q.topicId)}persist();renderMock()}
function renderMock(){const p=byId('mock-panel');p.replaceChildren();if(!mock){const intro=el('div','mock-intro');intro.append(el('div','icon-circle','🎓'),el('h2','','準備好試下未？'),el('p','','計時 10 分鐘，先討論自選 Topic，再從六個指定話題中抽兩個。這是練習示範，並非正式評分。'));const label=el('label','','我的自選 Topic');label.htmlFor='mock-prepared';intro.append(label);const sel=el('select');sel.id='mock-prepared';[['family','My family'],['work','My work'],['life','My life in the UK']].forEach(([v,n])=>sel.append(new Option(n,v)));intro.append(sel,btn('開始模擬面試 →',createMock,'primary'));p.append(intro);return}
 if(mock.finished){const result=el('div','mock-result');result.append(el('h2','','練習完成 🎉'),el('p','',`你回答咗 ${mock.answers.filter(Boolean).length} / ${mock.questions.length} 條問題。呢個並非正式 B1 分數。`));result.append(el('p','',`用咗 ${clock(Date.now()-mock.started)}。建議重聽你嘅句子，學習補充原因同經歷。`));const ul=el('ol');mock.questions.forEach((q,i)=>{const li=el('li');li.append(el('strong','',q.en),el('div','',mock.answers[i]||'（未回答）'));ul.append(li)});result.append(ul,btn('再次練習',()=>{mock=null;renderMock()},'primary'));p.append(result);return}
 const q=mock.questions[mock.at];const run=el('div','mock-running');run.append(el('div','timer','倒數時間：'));const time=el('div','timer',clock(600000-(Date.now()-mock.started)));time.id='mock-clock';run.append(time,el('p','mock-section',`PART ${mock.at<4?'1 · PREPARED TOPIC':'2 · CONVERSATION'}　•　${topic(q.topicId).name}`),el('p','mock-section',`QUESTION ${mock.at+1} / ${mock.questions.length}`),el('div','mock-question',q.en));const answer=el('textarea');answer.id='mock-answer';answer.placeholder='用英文回答（可打字；本試驗版 Mock 暫未接錄音評分）';run.append(answer);const actions=el('div','answer-actions');actions.append(btn('🔊 重讀問題',()=>speak(q.en),'button-outline'),btn('提交 →',nextMock,'primary'));run.append(actions,btn('略過此題',()=>recordMock(''),'button-quiet'),btn('結束練習',finishMock,'button-quiet'));p.append(run)}
function downloadExport(){const text=JSON.stringify({...state,exportedAt:new Date().toISOString()},null,2);const a=document.createElement('a');const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.href=url;a.download='b1-gongdak-backup.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function importJson(file){if(!file||file.size>2000000){notify('備份檔案過大或無效');return}const r=new FileReader();r.onload=()=>{try{const obj=JSON.parse(r.result);if(obj.version!==1||!Array.isArray(obj.saved)||!obj.facts||typeof obj.facts!=='object')throw Error('invalid');const next=cleanState(obj);if(!confirm('確定以備份覆蓋這部手機目前嘅進度？'))return;state=next;if(persist()){renderHome();renderMemory();renderSettings();notify('已還原備份')}}catch{notify('備份格式不正確')}};r.readAsText(file)}
function attach(){document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));byId('start-practice').addEventListener('click',()=>{go('practice');startDialogue()});byId('send-answer').addEventListener('click',submitPractice);byId('user-answer').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();submitPractice()}});byId('new-dialogue').addEventListener('click',()=>startDialogue());byId('repeat-question').addEventListener('click',()=>{const q=currentQuestion();if(q)speak(q.en);else notify('請先開始對話')});byId('mic-button').addEventListener('click',startMic);byId('topic-choice').addEventListener('change',()=>startDialogue());byId('help-level').addEventListener('change',()=>{if(dialog)startDialogue(dialog.topicId)});byId('voice-gender').addEventListener('change',e=>{state.voiceGender=e.target.value;state.voiceName='';persist();renderVoiceOptions()});byId('voice-specific').addEventListener('change',e=>{state.voiceName=e.target.value;persist()});byId('speech-rate').addEventListener('input',e=>{state.rate=Number(e.target.value);byId('rate-value').textContent=state.rate.toFixed(2)+'×';persist()});byId('test-voice').addEventListener('click',()=>speak('Hello! Welcome to your B1 speaking practice.'));byId('export-data').addEventListener('click',downloadExport);byId('import-data').addEventListener('click',()=>byId('import-file').click());byId('import-file').addEventListener('change',e=>{importJson(e.target.files[0]);e.target.value=''});byId('delete-data').addEventListener('click',()=>{if(!confirm('確定永久清除本機進度、收藏句子同個人資料？請先備份。'))return;state=defaultState();persist();dialog=null;mock=null;clearInterval(mockTicker);renderHome();renderMemory();renderSettings();notify('本機資料已清除')});window.addEventListener('hashchange',()=>{const name=location.hash.replace('#','');if(byId('view-'+name))go(name)});if('speechSynthesis' in window){speechSynthesis.addEventListener?.('voiceschanged',renderVoiceOptions)}if('serviceWorker' in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});}
function init(){initTopics();attach();renderHome();renderMemory();renderSettings();renderMock();const name=location.hash.replace('#','');go(byId('view-'+name)?name:'home')}
document.addEventListener('DOMContentLoaded',init);