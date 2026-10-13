// CPU inference runs off the UI thread. No learner text goes to an AI API.
let generator;
self.onmessage=async({data})=>{
 const {id,type,messages}=data;
 try{
  if(type==='load'){
   const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
   env.allowLocalModels=false;
   env.backends.onnx.wasm.numThreads=1; // GitHub Pages has no cross-origin isolation.
   generator=await pipeline('text-generation','onnx-community/Qwen2.5-1.5B-Instruct',{device:'wasm',dtype:'q4',progress_callback:p=>{
    if(p.status==='progress')self.postMessage({id,type:'progress',text:`下載 ${p.file}：${Math.round(p.progress||0)}%`});
   }});
   self.postMessage({id,type:'ready'});
  }else if(type==='generate'){
   if(!generator)throw Error('模型未載入');
   const out=await generator(messages,{max_new_tokens:100,do_sample:false,return_full_text:false,repetition_penalty:1.08});
   const value=out[0]?.generated_text;
   const text=typeof value==='string'?value:value?.at(-1)?.content;
   if(!text)throw Error('模型未有回覆');
   self.postMessage({id,type:'result',text});
  }
 }catch(e){self.postMessage({id,type:'error',text:e.message||String(e)})}
};
