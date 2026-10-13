'use strict';
const steps=[
{title:'Speak a Sentence',cn:'敢開口講一句',subtitle:'英文只識幾個字都可以開始。先練完整句。',q:'Can you tell me about your family?',a:'I have one daughter.',zh:'我有一個女兒。',tip:'先理解考官問題，再用 I have ... 講一個完整句子。唔知道年齡，就唔好自行加落去。',kicker:'Level 1 · 一個完整句子'},
{title:'Build Longer Answers',cn:'講兩句，加原因',subtitle:'學識用 because、usually 等字令答案更清楚。',q:'What do you like doing in your free time?',a:'I enjoy cooking because it helps me relax.',zh:'我鍾意煮嘢食，因為可以放鬆。',tip:'學識用 because 解釋原因。例句只係示範，答題要用自己真實興趣。',kicker:'Level 2 · 理由及細節'},
{title:'B1 Language Skills',cn:'運用 B1 句型',subtitle:'練過去經歷、未來計劃、表達喜好同 present perfect。',q:'How long have you lived in the UK?',a:'I have lived in the UK for three years.',zh:'我喺英國住咗三年。（只係示範，年份按實際情況改）',tip:'How long ...? 可以用 present perfect + for / since 去講時間長度。呢級仲要練 will、just、ever、never 同主動發問。',kicker:'Level 3 · B1 語言功能'},
{title:'Guided Conversation',cn:'自然互動追問',subtitle:'學識回答 AI 追問，同考官真正有來有往。',q:'What do you enjoy doing with your family at weekends?',a:'We often go out together. I like it because we can spend time together.',zh:'我哋經常一齊出去，我鍾意因為可以相處。',tip:'到正式互動，考官應該根據你剛剛講嘅內容追問，而唔係死跟固定問題。呢個頁面目前只展示教學流程；真人式追問請用原本 Grok 語音版。',kicker:'Level 4 · 對話練習架構'},
{title:'Mock B1 Interview',cn:'10 分鐘模擬考試',subtitle:'自選 Topic 五個討論點，另加六大範圍中隨機兩個。',q:'Tell me about one memorable experience related to your chosen topic.',a:'Last year, I had an experience that I still remember. It was special because I learnt something new.',zh:'用自己真實經歷回答，呢句只係練習句型。',tip:'正式模擬考試：全英文，答題中途唔顯示答案，完成先回饋。現階段未有完整正式模擬考功能，唔會顯示虛構合格分數。',kicker:'Level 5 · 正式模擬架構'}];
const topics=[['Festivals','What festival do you enjoy celebrating, and why?'],['Means of Transport','How do you usually travel to work or go shopping?'],['Special Occasions','Tell me about a special occasion you remember.'],['Entertainment','What do you like watching in your free time?'],['Music','What kind of music do you enjoy?'],['Recent Personal Experiences','What is something interesting you have done recently?']];
const key='b1-gongdak-learning-preview-v1';let state={level:0,done:[],notes:{},topic:0};
try{const s=JSON.parse(localStorage.getItem(key)||'{}');if(Number.isInteger(s.level)&&s.level>=0&&s.level<5)state.level=s.level;if(Array.isArray(s.done))state.done=[...new Set(s.done.filter(x=>Number.isInteger(x)&&x>=0&&x<5))];if(s.notes&&typeof s.notes==='object')state.notes=s.notes;if(Number.isInteger(s.topic)&&s.topic>=0&&s.topic<6)state.topic=s.topic}catch{}
const el=id=>document.getElementById(id);function save(){try{localStorage.setItem(key,JSON.stringify(state))}catch{}}
function draw(){resetListeningView();const s=steps[state.level];el('step-title').textContent=s.title;el('step-subtitle').textContent=s.subtitle;el('step-count').textContent=`LEVEL ${String(state.level+1).padStart(2,'0')} / 05`;el('lesson-kicker').textContent=s.kicker;el('coach-q').textContent=s.q;el('example').textContent=s.a;el('translation').textContent=s.zh;el('tip').textContent=s.tip;el('memo').value=state.notes[state.level]||'';el('prev').disabled=state.level===0;el('complete').textContent=state.level===4?(state.done.includes(4)?'重新複習今級':'標記已完成'):'完成今課，下一課 →';el('done-count').textContent=`${state.done.length} / 5`;el('bar-fill').style.width=`${state.done.length*20}%`;el('steps').replaceChildren();steps.forEach((v,i)=>{let b=document.createElement('button');b.className='step'+(i===state.level?' active':'');b.type='button';b.innerHTML=`<span class="step-num">${i+1}</span><span><strong>${v.title}</strong><small>${v.cn}</small></span>${state.done.includes(i)?'<span class="check">✓</span>':''}`;b.addEventListener('click',()=>{state.level=i;save();draw()});el('steps').append(b)});el('topic-grid').replaceChildren();topics.forEach(([title],i)=>{let b=document.createElement('button');b.type='button';b.className='topic'+(state.topic===i?' selected':'');b.textContent=title;b.addEventListener('click',()=>{state.topic=i;save();drawTopics()});el('topic-grid').append(b)});drawTopics()}
function drawTopics(){[...el('topic-grid').children].forEach((x,i)=>x.classList.toggle('selected',i===state.topic));const [title,q]=topics[state.topic];el('topic-detail').replaceChildren();let h=document.createElement('strong');h.textContent=title;let p=document.createElement('span');p.textContent=`示範問題：${q}`;el('topic-detail').append(h,p)}
el('memo').addEventListener('input',()=>{state.notes[state.level]=el('memo').value.slice(0,1200);save()});el('prev').addEventListener('click',()=>{if(state.level>0){state.level--;save();draw()}});el('complete').addEventListener('click',()=>{if(typeof unitRecord==='function'&&new Set(unitRecord().passed).size<6)return;if(!state.done.includes(state.level))state.done.push(state.level);if(state.level<4)state.level++;save();draw()});el('reset').addEventListener('click',()=>{if(confirm('清除呢個瀏覽器入面嘅課程示範進度同自己寫嘅例句？')){state={level:0,done:[],notes:{},topic:0};save();draw()}});el('speak').addEventListener('click',()=>{if(!('speechSynthesis'in window)){alert('呢個瀏覽器未提供英文朗讀');return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(el('coach-q').textContent);u.lang='en-GB';u.rate=.83;const voices=speechSynthesis.getVoices().filter(x=>x.lang.toLowerCase().startsWith('en-gb'));if(voices.length)u.voice=voices[0];speechSynthesis.speak(u)});
/* Real browser speech-to-text for guided oral practice.
 * This DOES NOT invoke an AI chat model or claim to assess pronunciation.
 * SpeechRecognition may rely on the browser vendor's online service. */
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let activeRecognition = null;
let isListening = false;
function setRecordUi(listening){
  isListening = listening;
  const btn = el('record');
  btn.classList.toggle('listening', listening);
  btn.setAttribute('aria-pressed', String(listening));
  btn.textContent = listening ? '■ 停止收音' : '🎙️ 撳呢度講英文';
}
function resetListeningView(){
  if(activeRecognition){
    const prev=activeRecognition;activeRecognition=null;
    try{prev.abort()}catch(_e){}
  }
  setRecordUi(false);
  el('speech-status').textContent='準備就緒。撳咪高峰後，請容許瀏覽器使用咪高峰。';
  el('spoken').textContent='你講嘅英文會顯示喺呢度。';
  el('speech-feedback').textContent='呢個版本提供語音轉文字同示範句，暫時未能用 AI 判斷回答內容或自然追問。';
}
function readAloud(text){
  if(!('speechSynthesis' in window)){
    el('speech-status').textContent='呢個瀏覽器暫時冇英文朗讀。';
    return;
  }
  window.speechSynthesis.cancel();
  const say=new SpeechSynthesisUtterance(text);
  say.lang='en-GB';say.rate=.86;
  const british=window.speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('en-gb'));
  if(british)say.voice=british;
  window.speechSynthesis.speak(say);
}
el('hear-example').addEventListener('click',()=>{
  if(isListening&&activeRecognition){try{activeRecognition.stop()}catch(_e){}}
  readAloud(steps[state.level].a);
});
el('record').addEventListener('click',()=>{
  if(isListening&&activeRecognition){
    el('speech-status').textContent='停止收音，正在整理你講嘅英文…';
    try{activeRecognition.stop()}catch(_e){setRecordUi(false)}
    return;
  }
  if(!Recognition){
    el('speech-status').textContent='呢個瀏覽器未支援網頁咪高峰辨識。Windows 可以點選下方文字框，撳 Win + H 講英文；Samsung 可用鍵盤咪高峰。';
    return;
  }
  if('speechSynthesis' in window)window.speechSynthesis.cancel();
  const rec = new Recognition();
  activeRecognition=rec;
  rec.lang='en-GB';rec.continuous=false;rec.interimResults=true;rec.maxAlternatives=1;
  let heardFinal=false;
  let hadError=false;
  rec.onstart=()=>{
    if(activeRecognition!==rec)return;
    setRecordUi(true);
    el('speech-status').textContent='🎙️ 收音中…請用英文回答。講完可以停低，或者撳「停止收音」。';
  };
  rec.onresult=ev=>{
    if(activeRecognition!==rec)return;
    let transcript='';let finalReceived=false;
    for(let i=0;i<ev.results.length;i++){
      const item=ev.results[i];
      const words=item[0]?.transcript||'';
      transcript += (transcript?' ':'')+words;
      if(item.isFinal)finalReceived=true;
    }
    transcript=transcript.trim();
    if(transcript)el('spoken').textContent=transcript;
    if(finalReceived&&transcript){
      heardFinal=true;
      el('memo').value=transcript;
      el('memo').dispatchEvent(new Event('input',{bubbles:true}));
      el('speech-status').textContent='✓ 已收到你講嘅英文。下面文字框可以修改辨識錯嘅字。';
      el('speech-feedback').textContent='你可以同上面示範句比較，再按咪高峰練多次。呢個係語音轉文字，唔係 AI 改卷。';
    }
  };
  rec.onerror=ev=>{
    if(activeRecognition!==rec)return;
    hadError=true;
    const messages={
      'not-allowed':'咪高峰權限被拒絕。請喺網址旁邊嘅網站權限允許咪高峰，再試。',
      'audio-capture':'搵唔到咪高峰。請檢查電腦／手機嘅收音設定。',
      'no-speech':'今次冇聽到英文，請靠近咪高峰再試。',
      'network':'瀏覽器語音辨識服務暫時連唔到網絡；可以改用鍵盤語音輸入。',
      'service-not-allowed':'瀏覽器禁止語音辨識，請試 Chrome 或 Windows Win + H。',
      'language-not-supported':'瀏覽器暫時唔支援英文語音辨識。'
    };
    el('speech-status').textContent=messages[ev.error]||('語音辨識未成功（'+ev.error+'），請試 Chrome 或鍵盤語音輸入。');
  };
  rec.onend=()=>{
    if(activeRecognition!==rec)return;
    activeRecognition=null;
    setRecordUi(false);
    if(!heardFinal&&!hadError)el('speech-status').textContent='未收到完整英文。可以再按咪高峰，或者用 Windows Win + H。';
  };
  try{
    el('speech-status').textContent='正在啟動咪高峰…';
    rec.start();
  }catch(_err){
    activeRecognition=null;setRecordUi(false);
    el('speech-status').textContent='未能啟動咪高峰。請檢查權限，或用 Windows Win + H／手機鍵盤咪高峰。';
  }
});
draw();

