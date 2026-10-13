import {pipeline,env} from '@huggingface/transformers';import {setGlobalDispatcher,EnvHttpProxyAgent} from 'undici';import fs from 'node:fs';setGlobalDispatcher(new EnvHttpProxyAgent());env.allowLocalModels=false;
const gen=await pipeline('text-generation','onnx-community/Qwen2.5-1.5B-Instruct',{device:'cpu',dtype:'q4',session_options:{intraOpNumThreads:2}});
async function ask(instruction,text){const out=await gen([{role:'system',content:instruction},{role:'user',content:text}],{max_new_tokens:100,do_sample:false,return_full_text:false,repetition_penalty:1.08});let v=out[0].generated_text;return typeof v==='string'?v:v.at(-1).content}
let q='Can you tell me about your family?',history=[],results=[];
for(const answer of ['One daughter.','Can you make it more specific?','She is thirteen years old.','We usually cooking together.','I like it because we talk together.']){
 const start=Date.now();let row;
 if(/more specific/.test(answer)){
  const clarified=await ask('Rewrite the given question in simpler English for a beginner. Output ONE question only, ending with ?. Do not answer it. Do not add facts.',q);row={answer,clarified};q=clarified;history.push({role:'user',content:answer},{role:'assistant',content:q});
 }else{
  const fragment=answer.split(/\s+/).length<5&&!/^(?:i|we|he|she|they|it|you)\b/i.test(answer);
  const corrected=await ask(fragment?'Write a complete English sentence answering the question, using ONLY the supplied short answer. Do not invent any details. Output only the sentence. Example: Question: Tell me about your family? Answer: One son. Output: I have one son.':'Correct the English grammar. Output only the corrected English sentence. Keep the meaning. Do not translate, explain or add any new facts.',fragment?'Question: '+q+'\nAnswer: '+answer:answer);
  const explanation=corrected.toLowerCase().replace(/[.!]/g,'')===answer.toLowerCase().replace(/[.!]/g,'')?'Your sentence is correct.':await ask('Explain ONE grammar improvement from Original to Corrected in one short simple English sentence. Explain only; do not translate or add facts.','Original: '+answer+'\nCorrected: '+corrected);
  const context=history.map(x=>(x.role==='user'?'Learner: ':'Tutor: ')+x.content).join('\n');
  const follow=await ask('You are an English tutor. Ask ONE short easy related follow-up question about the learner last answer. Do not repeat an earlier question. Output only your question.',context+'\nTutor: '+q+'\nLearner: '+answer);row={answer,corrected,explanation,follow};q=follow;history.push({role:'user',content:answer},{role:'assistant',content:q});
 }
 row.seconds=(Date.now()-start)/1000;results.push(row);console.log(JSON.stringify(row));fs.writeFileSync('qa-model-flow-results.json',JSON.stringify(results,null,2));
}
