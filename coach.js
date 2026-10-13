// Real local inference. Practice scores never use a model's guessed exam grade.
const $=id=>document.getElementById(id);
let engine=null,worker=null,loading=false,busy=false,history=[],session=0,pending=null,requestId=0;
const jobs=new Map();
let lifecycle=0,operation=0;
const model='Qwen2.5-1.5B-Instruct-q4f32_1-MLC';
const oralKey='b1-gongdak-oral-v1';
let oral={retries:0,words:[],turns:[]};
try{const v=JSON.parse(localStorage.getItem(oralKey)||'null');if(v&&Array.isArray(v.words)&&Array.isArray(v.turns))oral={retries:Math.max(0,Number(v.retries)||0),words:v.words.slice(-60),turns:v.turns.slice(-30)}}catch{}
function status(s){$('ai-status').textContent=s}
function persistOral(){try{localStorage.setItem(oralKey,JSON.stringify(oral));return true}catch{status('今次紀錄未能儲存，請先複製需要保留嘅句子。');return false}}
function renderOral(){
 $('oral-score').textContent=`句型重試成功 ${oral.retries} 次 · 已收藏生字 ${oral.words.length} 個（唔係考試／發音評分）`;
 const box=$('saved-words');box.replaceChildren();
 if(!oral.words.length){box.textContent='今課已核對嘅生字可以加入呢度，方便之後複習。';return}
 for(const item of oral.words){const p=document.createElement('p');p.textContent=`${item.word} — ${item.meaning}`;const b=document.createElement('button');b.type='button';b.className='outline';b.textContent='🔊 聽例句';b.onclick=()=>readAloud(item.example);p.append(' ',b);box.append(p)}
}
function reset(){session++;history=[];pending=null;$('ai-result').replaceChildren();$('coach-q').textContent=steps[state.level].q;resetListeningView();$('memo').value='';status(engine?'AI 已就緒；由今課問題開始。':'AI 未啟動。')}
$('restart-ai').addEventListener('click',reset);
const drawWithLearning=draw;draw=function(){session++;history=[];pending=null;drawWithLearning();$('ai-result').replaceChildren();renderOral()};
function workerRequest(type,messages){
 const id=++requestId;
 return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{jobs.delete(id);reject(Error('運行時間太長；可以停止 AI 再重試。'))},type==='load'?600000:180000);jobs.set(id,{resolve,reject,timer});worker.postMessage({id,type,messages})});
}
function closeWorker(){if(worker)worker.terminate();worker=null;for(const job of jobs.values()){clearTimeout(job.timer);job.reject(Error('已停止 AI'))}jobs.clear()}
async function loadCpu(){
 worker=new Worker(new URL('./coach-worker.js?v=0.6',import.meta.url),{type:'module'});
 worker.onmessage=({data})=>{const job=jobs.get(data.id);if(!job)return;if(data.type==='progress'){status(data.text);return}clearTimeout(job.timer);jobs.delete(data.id);if(data.type==='error')job.reject(Error(data.text));else job.resolve(data.text)};
 worker.onerror=()=>{for(const job of jobs.values()){clearTimeout(job.timer);job.reject(Error('CPU AI 未能載入，請檢查網絡再重試。'))}jobs.clear()};
 await workerRequest('load');
 return {kind:'cpu',generate:messages=>workerRequest('generate',messages)};
}
$('stop-ai').addEventListener('click',()=>{session++;lifecycle++;operation++;closeWorker();if(engine?.kind==='gpu')engine.raw.interruptGenerate();engine=null;loading=false;busy=false;pending=null;$('load-ai').disabled=false;$('load-ai').textContent='啟動 AI 口語導師';$('ask-ai').disabled=true;$('record').disabled=false;status('已停止 AI；你嘅回答同練習紀錄仍然保留。')});
$('load-ai').addEventListener('click',async()=>{
 if(engine||loading)return;
 const token=lifecycle;loading=true;$('load-ai').disabled=true;
 try{
  let adapter=null;
  if($('ai-device').value==='auto'&&navigator.gpu){try{adapter=await navigator.gpu.requestAdapter()}catch{}}
  if(adapter){
   try{
    status('載入電腦 GPU AI，首次需要下載模型…');
    const webllm=await import('https://esm.run/@mlc-ai/web-llm@0.2.79');
    const raw=await webllm.CreateMLCEngine(model,{initProgressCallback:p=>{if(token===lifecycle)status(p.text)}});
    if(token!==lifecycle){await raw.unload();return}
    engine={kind:'gpu',raw,generate:async (messages,plain=false)=>{const r=await raw.chat.completions.create({messages,temperature:0.2,max_tokens:400,...(plain?{}:{response_format:{type:'json_object'}})});return r.choices[0]?.message?.content||''}};
   }catch(e){if(token!==lifecycle)return;status('GPU 未能啟動，改用 CPU AI…');engine=await loadCpu()}
  }else{status('載入 CPU AI，唔需要 GPU。首次下載模型，請保持頁面開啟…');engine=await loadCpu()}
  if(token!==lifecycle){engine=null;return}
  status(`AI 已就緒（${engine.kind==='cpu'?'CPU：回覆會較慢':'GPU'}）。先聽問題，再用咪回答。小模型建議仍需要核對。`);
  $('ask-ai').disabled=false;$('load-ai').textContent='AI 已就緒';
 }catch(e){if(token===lifecycle){engine=null;closeWorker();status('AI 未能啟動：'+e.message);$('load-ai').disabled=false;$('load-ai').textContent='重試啟動 AI'}}
 finally{if(token===lifecycle)loading=false}
});
export function validateFeedback(text){
 const clean=text.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');
 const d=JSON.parse(clean);
 for(const key of ['corrected_answer','explanation','follow_up'])if(typeof d[key]!=='string'||d[key].length>1500)throw Error('AI 回覆格式唔完整');
 if(!d.corrected_answer.trim()||!d.follow_up.trim()||!d.explanation.trim())throw Error('AI 未提供完整糾正或追問');
 if(/[\u3400-\u9fff]/.test(d.corrected_answer+d.follow_up))throw Error('AI 未用英文提供糾正同追問');
 if(!/\?$/.test(d.follow_up.trim())||d.follow_up.split('?').length>2)throw Error('AI 追問格式未通過檢查');
 const words=courses[state.level].words;
 const related=words.find(([word])=>new RegExp('\\b'+word+'\\b','i').test(d.corrected_answer+' '+d.follow_up))||words[0];
 [d.new_word,d.meaning,d.example]=related;

 return d;
}
function normalSentence(s){return s.toLowerCase().replace(/i['’]m\b/g,'i am').replace(/i['’]ve\b/g,'i have').replace(/\bwe['’]re\b/g,'we are').replace(/\bcan['’]t\b/g,'cannot').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim()}
function continueConversation(){if(!pending)return;const p=pending;pending=null;$('coach-q').textContent=p.feedback.follow_up;$('memo').value='';$('memo').dispatchEvent(new Event('input',{bubbles:true}));status('請回答下一條問題。');readAloud(p.feedback.follow_up);$('ask-ai').textContent='糾正我嘅回答'}
function showFeedback(answer,d){
 const box=$('ai-result');box.replaceChildren();
 for(const [label,value] of [['你嘅回答',answer],['AI 完整句／糾正建議',d.corrected_answer],['解釋',d.explanation],['今課生字（已核對）',d.new_word+' — '+d.meaning],['例句',d.example]]){const h=document.createElement('strong');h.textContent=label;const p=document.createElement('p');p.textContent=value;box.append(h,p)}
 const replay=document.createElement('button');replay.type='button';replay.className='outline';replay.textContent='🔊 聽改正句';replay.onclick=()=>readAloud(d.corrected_answer);box.append(replay);
 const word=document.createElement('button');word.type='button';word.className='outline';word.textContent='＋ 收藏呢個生字';word.onclick=()=>{if(!d.new_word.trim())return;if(!oral.words.some(x=>x.word.toLowerCase()===d.new_word.toLowerCase())){oral.words.push({word:d.new_word,meaning:d.meaning,example:d.example});oral.words=oral.words.slice(-60);persistOral();renderOral()}word.textContent='✓ 已收藏'};box.append(' ',word);
 const hint=document.createElement('p');hint.textContent='撳咪講返上面嘅改正句，練一次先繼續。呢度只比較辨識到嘅字句，唔評發音。';box.append(hint);
 const next=document.createElement('button');next.type='button';next.className='outline';next.textContent='暫時跳過重試，繼續對話';next.onclick=continueConversation;box.append(next);
 pending={feedback:d};$('memo').value='';$('ask-ai').textContent='檢查我嘅重試句';status('先用咪講返改正句，或者喺文字框輸入。');readAloud(d.corrected_answer);
}
async function submitAnswer(){
 if(!engine||busy)return;
 const answer=$('memo').value.trim();if(!answer){status('請先用咪講英文，或輸入回答。');return}
 if(pending){
  if(normalSentence(answer)!==normalSentence(pending.feedback.corrected_answer)){status('今次字句同示範仲有分別。先檢查語音辨識，再聽改正句重試；亦可以跳過繼續。');return}
  oral.retries++;const saved=persistOral();renderOral();continueConversation();if(!saved)status('重試成功，但紀錄未能儲存。');return;
 }
 const token=session,op=++operation,level=state.level,q=$('coach-q').textContent;
 busy=true;$('ask-ai').disabled=true;$('record').disabled=true;status('AI 正在糾正你嘅回答…');
 const clarification=/\b(?:more specific|clarify|what do you mean|don[’']t understand|do not understand|repeat|say (?:it )?again)\b/i.test(answer);
 const clarifySystem='Rewrite the given question in simpler English for a beginner. Output ONE question only, ending with ?. Do not answer it. Do not add facts.';
 try{
  const running=engine;
  const ask=(instruction,text)=>running.generate([{role:'system',content:instruction},{role:'user',content:text}],true);
  if(clarification){
   const raw=await ask(clarifySystem,q);
   if(token!==session)return;
   const question=raw.trim().replace(/^["“]|["”]$/g,'');
   if(question.length>240||!question.endsWith('?'))throw Error('AI 未有提供清楚問題');
   $('coach-q').textContent=question;$('memo').value='';
   const box=$('ai-result');box.replaceChildren();const p=document.createElement('p');p.textContent='問題講清楚啲：'+question;box.append(p);
   history.push({role:'user',content:answer},{role:'assistant',content:question});history=history.slice(-6);
   status('已簡化問題，請再回答。');readAloud(question);return;
  }
  const fragment=answer.split(/\s+/).length<5&&!/^(?:i|we|he|she|they|it|you)\b/i.test(answer);
  const corrected=await ask(fragment
   ? 'Write a complete English sentence answering the question, using ONLY the supplied short answer. Do not invent any details. Output only the sentence. Example: Question: Tell me about your family? Answer: One son. Output: I have one son.'
   : 'Correct the English grammar. Output only the corrected English sentence. Keep the meaning. Do not translate, explain or add any new facts.',fragment?'Question: '+q+'\nAnswer: '+answer:answer);
  if(token!==session)return;
  const explanation=normalSentence(corrected)===normalSentence(answer)?'Your sentence is correct.':await ask('Explain ONE grammar improvement from Original to Corrected in one short simple English sentence. Explain only; do not translate or add facts.','Original: '+answer+'\nCorrected: '+corrected);
  if(token!==session)return;
  const conversation=history.map(x=>(x.role==='user'?'Learner: ':'Tutor: ')+x.content).join('\n');
  const follow=await ask('You are an English tutor. Ask ONE short easy related follow-up question about the learner last answer. Do not repeat an earlier question. Output only your question.',conversation+'\nTutor: '+q+'\nLearner: '+answer);
  if(token!==session)return;
  const d=validateFeedback(JSON.stringify({corrected_answer:corrected.trim(),explanation:explanation.trim(),follow_up:follow.trim()}));
  // Never accept added numeric facts in a correction, even if the JSON is valid.
  const allowed=history.filter(x=>x.role==='user').map(x=>x.content).join(' ')+' '+answer;
  for(const number of d.corrected_answer.match(/\b\d+\b/g)||[])if(!new RegExp('\\b'+number+'\\b').test(allowed))throw Error('AI 加咗你未講過嘅數字，已拒絕呢個建議');
  history.push({role:'user',content:answer},{role:'assistant',content:d.follow_up});history=history.slice(-6);
  oral.turns.push({question:q,answer,feedback:d,at:new Date().toISOString()});oral.turns=oral.turns.slice(-30);
  const saved=persistOral();showFeedback(answer,d);if(!saved)status('AI 已回覆，但今次紀錄未能儲存。');
 }catch(e){if(token===session)status('未能完成 AI 糾正：'+e.message+'。答案仍保留，請重試。')}
 finally{if(op===operation){busy=false;$('ask-ai').disabled=!engine;$('record').disabled=false}}
}
$('ask-ai').addEventListener('click',submitAnswer);
window.addEventListener('b1-speech-final',()=>{if($('auto-ai').checked&&engine&&!busy)submitAnswer()});
renderOral();
