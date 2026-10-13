// CPU llama.cpp inference stays off the UI thread. No paid AI endpoint.
let generator;
self.onmessage=async({data})=>{
 const {id,type,messages}=data;
 try{
  if(type==='load'){
   const root='https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.7/';
   const {Wllama}=await import(root+'esm/index.js');
   generator=new Wllama({'single-thread/wllama.wasm':root+'esm/single-thread/wllama.wasm','multi-thread/wllama.wasm':root+'esm/multi-thread/wllama.wasm'});
   await generator.loadModelFromUrl('https://huggingface.co/bartowski/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/Qwen2.5-1.5B-Instruct-Q4_K_M.gguf',{
    n_ctx:1536,n_batch:64,n_ubatch:64,n_threads:1,
    progressCallback:p=>self.postMessage({id,type:'progress',text:p.total?`下載 CPU AI：${Math.round(p.loaded/p.total*100)}%`:`下載 CPU AI：${Math.round(p.loaded/1048576)} MB`})
   });
   self.postMessage({id,type:'ready'});
  }else if(type==='generate'){
   if(!generator)throw Error('模型未載入');
   const prompt=messages.map(m=>`<|im_start|>${m.role}\n${m.content}<|im_end|>\n`).join('')+'<|im_start|>assistant\n';
   const text=await generator.createCompletion(prompt,{nPredict:100,useCache:false,sampling:{temp:0,top_k:1,repeat_penalty:1.08}});
   if(!text)throw Error('模型未有回覆');
   self.postMessage({id,type:'result',text});
  }
 }catch(e){self.postMessage({id,type:'error',text:e.message||String(e)})}
};
