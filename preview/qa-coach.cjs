const {JSDOM}=require('jsdom'),fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://example.org/',runScripts:'outside-only'}),w=dom.window,c=dom.getInternalVMContext(),d=w.document;
w.confirm=()=>true;
for(const p of ['app.js','learning.js','coach.js'])vm.runInContext(fs.readFileSync(p,'utf8').replace('export function','function').replace('import.meta.url','"https://example.org/coach.js"'),c);
const $=id=>d.getElementById(id),run=s=>vm.runInContext(s,c),tick=()=>new Promise(r=>setTimeout(r,0));
const feedback={corrected_answer:'I have one daughter.',explanation:'I 配 have。',new_word:'daughter',meaning:'女兒',example:'I have one daughter.',follow_up:'How old is your daughter?'};
(async()=>{
 run('engine={kind:"cpu",generate:async messages=>{const prompt=messages[0].content;const d='+JSON.stringify(feedback)+';return /Explain/.test(prompt)?d.explanation:/follow-up/.test(prompt)?d.follow_up:d.corrected_answer}}');$('ask-ai').disabled=false;
 $('memo').value='One daughter.';$('ask-ai').click();await tick();
 assert.match($('ai-result').textContent,/I have one daughter/);assert.equal($('coach-q').textContent,'Can you tell me about your family?');
 $('memo').value='I has one daughter.';$('ask-ai').click();await tick();assert.match($('ai-status').textContent,/仲有分別/);assert.match($('oral-score').textContent,/成功 0 次/);
 $('memo').value='I HAVE ONE DAUGHTER!';$('ask-ai').click();await tick();assert.equal($('coach-q').textContent,'How old is your daughter?');assert.match($('oral-score').textContent,/成功 1 次/);
 d.querySelector('#ai-result button:nth-of-type(2)').click();assert.match($('saved-words').textContent,/daughter/);assert.equal(JSON.parse(w.localStorage.getItem('b1-gongdak-oral-v1')).retries,1);
 // Auto submission from final speech event only, then leave engine idle on lesson change.
 $('memo').value='She is thirteen.';w.dispatchEvent(new w.Event('b1-speech-final'));await tick();assert.match($('ai-result').textContent,/She is thirteen/);
 let resolve;w.resolveLater=value=>resolve(value);run('engine={kind:"cpu",generate:()=>new Promise(r=>{window.resolveLater=r})};pending=null');$('memo').value='One daughter.';$('ask-ai').click();d.querySelectorAll('#steps button')[1].click();w.resolveLater(feedback.corrected_answer);await tick();assert.equal($('ai-result').textContent,'');assert(!$('ask-ai').disabled);assert(!$('record').disabled);
 run('engine={kind:"cpu",generate:async()=>"not json"}');$('memo').value='Keep this answer.';$('ask-ai').click();await tick();assert.equal($('memo').value,'Keep this answer.');assert.match($('ai-status').textContent,/未能完成/);
 $('coach-q').textContent='How old is your daughter?';$('memo').value='Can you make it more specific?';$('ask-ai').click();await tick();
 assert.equal($('coach-q').textContent,'How old is your daughter now?');
 assert.equal(run("reviewedExplanation('We usually cooking together.','We usually cook together.',false)"),'usually 表示習慣，用一般現在式 cook；cooking 係 -ing 形式，唔係過去式。');
 $('memo').value='Keep this answer.';
 $('stop-ai').click();assert($('ask-ai').disabled);assert(!$('record').disabled);assert.equal($('memo').value,'Keep this answer.');
 console.log('PASS: oral correction → retry → follow-up; word saving; auto submit; stale lesson isolation; invalid output preserves answer; stop restores controls. Model responses mocked here.');
})().catch(e=>{console.error(e);process.exitCode=1});
