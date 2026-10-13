'use strict';
const STORE = 'b1-gong-dak-pc-ai-v1';
const el = id => document.getElementById(id);
function clean(o) {
  return {
    topic: typeof o?.topic === 'string' ? o.topic : 'My family',
    mode: o?.mode === 'exam' ? 'exam' : 'coach',
    facts: typeof o?.facts === 'string' ? o.facts.slice(0, 2000) : '',
    turns: Array.isArray(o?.turns) ? o.turns.filter(t => t && ['user', 'assistant'].includes(t.role) && typeof t.content === 'string').slice(-30) : [],
    readAloud: o?.readAloud !== false,
    speechRate: Number.isFinite(o?.speechRate) ? Math.max(.65, Math.min(1.1, o.speechRate)) : .9
  };
}
let data;
try { data = clean(JSON.parse(localStorage.getItem(STORE) || '{}')); }
catch { data = clean({}); }
let ready = false, busy = false, mic = null, micFinal = '', micError = '', listening = false, voices = [];
const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
const supportsTTS = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
function save() { try { localStorage.setItem(STORE, JSON.stringify(data)); } catch { setNote('本機儲存失敗，請匯出對話備份'); } }
function setNote(note) { el('typing-status').textContent = note; }
function updateControls() {
  el('send').disabled = !ready || busy || listening;
  el('start').disabled = !ready || busy || listening;
  el('message').disabled = !ready || busy || listening;
  el('new-chat').disabled = busy || listening;
  el('topic').disabled = busy || listening;
  el('mode').disabled = busy || listening;
  el('save-facts').disabled = busy || listening;
  el('mic').disabled = !SpeechRecognitionClass || !ready || busy;
  el('mic').textContent = listening ? '■ 停止收音' : '🎙️ 用咪講英文';
  el('mic').classList.toggle('recording', listening);
}
function englishVoice() {
  if (!supportsTTS) return null;
  voices = speechSynthesis.getVoices().filter(v => /^en([-_]|$)/i.test(v.lang));
  return voices.find(v => /^en[-_]GB$/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang)) || null;
}
function stopTalking() { if (supportsTTS) speechSynthesis.cancel(); }
function speak(text, force = false) {
  if (!supportsTTS || (!force && !data.readAloud) || !text) return;
  stopTalking();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-GB'; u.rate = data.speechRate;
  const v = englishVoice(); if (v) u.voice = v;
  u.onerror = () => setNote('英文朗讀未能播放，請按「🔊 重讀」重試；亦可使用鍵盤作答');
  speechSynthesis.speak(u);
}
function bubble(role, text) {
  const div = document.createElement('div'); div.className = 'turn ' + (role === 'user' ? 'user' : 'assistant');
  const head = document.createElement('div'); head.className = 'speaker'; head.textContent = role === 'user' ? 'YOU' : 'B1 ENGLISH COACH';
  const content = document.createElement('div'); content.className = 'bubble'; content.textContent = text;
  div.append(head, content);
  if (role === 'assistant') {
    const replay = document.createElement('button'); replay.type = 'button'; replay.className = 'speak-replay';
    replay.textContent = '🔊 重讀'; replay.setAttribute('aria-label', '重新聆聽這條英文問題或回答');
    replay.addEventListener('click', () => speak(text, true)); div.append(replay);
  }
  el('chat').append(div); el('chat').scrollTop = el('chat').scrollHeight;
}
function render() {
  el('chat').replaceChildren();
  if (!data.turns.length) { const n = document.createElement('div'); n.className = 'intro-card'; n.textContent = '按「開始對話」，考官會先問一條自然英文問題；之後你每次答話，會由電腦內的 Ollama AI 按上下文追問。按 🎙️ 可用咪講英文（視乎瀏覽器支援）。'; el('chat').append(n); }
  else data.turns.forEach(t => bubble(t.role, t.content));
  el('topic').value = data.topic; el('mode').value = data.mode; el('facts').value = data.facts;
  el('read-aloud').checked = data.readAloud; el('speech-rate').value = String(data.speechRate);
}
async function request(path, options) {
  const r = await fetch(path, options); let j;
  try { j = await r.json(); } catch { throw new Error('本機服務回應格式錯誤'); }
  if (!r.ok) throw new Error(j.error || '本機服務出錯'); return j;
}
async function health() {
  try {
    const x = await request('/api/health'); ready = !!x.ready;
    el('status').className = 'status ' + (ready ? 'ready' : 'error');
    el('status-text').textContent = ready ? 'AI 已就緒：' + x.model : (x.error || '尚未準備好') + '（模型：' + x.model + '）';
    setNote(ready ? '可以開始真正英文對話' : '請先啟動 Ollama，同埋下載免費模型');
  } catch (e) { ready = false; el('status').className = 'status error'; el('status-text').textContent = e.message || '無法連接本機服務'; }
  updateControls();
}
async function ask(start = false) {
  if (!ready || busy || listening) return;
  const msg = el('message').value.trim();
  if (!start && !msg) { setNote('請先講或者輸入一句英文'); return; }
  if (!start) { data.turns.push({role: 'user', content: msg}); bubble('user', msg); el('message').value = ''; save(); }
  busy = true; updateControls(); setNote(start ? '正在準備第一條考官問題…' : 'AI 正在根據你嘅回答思考…');
  try {
    const x = await request('/api/chat', {method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({topic: data.topic, mode: data.mode, facts: data.facts, messages: data.turns.slice(-30)})});
    data.turns.push({role: 'assistant', content: x.reply}); data.turns = data.turns.slice(-30);
    bubble('assistant', x.reply); save();
    setNote(x.source === 'starter' ? '第一條問題已準備好；請按咪高峰回答' : '真正回覆由本機 ' + x.model + ' 生成');
    speak(x.reply);
  } catch (e) {
    setNote('AI 暫時未能回答：' + e.message);
    const box = document.createElement('div'); box.className = 'intro-card';
    box.textContent = '本機 AI 暫時失敗：' + e.message + '。唔會用預設句型冒充對話。'; el('chat').append(box);
  } finally { busy = false; updateControls(); if (!listening) el('message').focus(); }
}
function finishRecognition() {
  listening = false; mic = null; updateControls();
  const text = micFinal.trim(); micFinal = '';
  if (micError) { setNote(micError); micError = ''; return; }
  if (text) { el('message').value = text; setNote('已辨識：「' + text.slice(0, 120) + '」；正在提交畀 AI…'); ask(false); }
  else { setNote('冇收到英文語音。可以重試，或者撳輸入框後用 Windows Win + H 語音輸入'); }
}
function toggleMic() {
  if (!SpeechRecognitionClass) { setNote('呢個瀏覽器冇提供網頁收音；請用 Chrome 或按 Win + H 進行 Windows 語音輸入'); return; }
  if (listening) { mic?.stop(); return; }
  if (!ready || busy) return;
  stopTalking(); micFinal = ''; micError = '';
  try {
    const rec = new SpeechRecognitionClass(); mic = rec;
    rec.lang = 'en-GB'; rec.continuous = false; rec.interimResults = true; rec.maxAlternatives = 1;
    rec.onstart = () => { listening = true; updateControls(); setNote('🎙️ 正在聽你講英文…講完停一停，App 會自動提交'); };
    rec.onresult = e => {
      let final = '', interim = '';
      for (let i = 0; i < e.results.length; i++) {
        const text = e.results[i]?.[0]?.transcript || '';
        if (e.results[i].isFinal) final += text + ' '; else interim += text + ' ';
      }
      if (final.trim()) micFinal = final.trim();
      el('message').value = (micFinal + ' ' + interim).trim();
      setNote('🎙️ ' + el('message').value.slice(0, 120));
    };
    rec.onerror = e => {
      micFinal = '';
      const name = e.error || 'unknown';
      micError = name === 'not-allowed' || name === 'service-not-allowed' ? '咪高峰權限被拒。請喺 Chrome 網址旁允許咪高峰，或用 Win + H。' :
        name === 'no-speech' ? '未聽到說話，請靠近咪高峰再試。' :
        '語音辨識出錯：' + name + '。可以按 Win + H 用 Windows 語音輸入。';
      setNote(micError);
      // Preserve typed/interim input if recognition failed; don't auto-submit it.
    };
    rec.onend = finishRecognition;
    rec.start();
  } catch (e) { mic = null; listening = false; updateControls(); setNote('無法啟動咪高峰，請檢查瀏覽器權限或用 Windows Win + H'); }
}
function clearConversation() { stopTalking(); data.turns = []; render(); save(); }
el('chat-form').addEventListener('submit', e => { e.preventDefault(); ask(false); });
el('message').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(false); } });
el('mic').addEventListener('click', toggleMic);
el('start').addEventListener('click', () => { if (data.turns.length && !confirm('開始新對話？舊紀錄會清除（可以先匯出）。')) return; clearConversation(); ask(true); });
el('new-chat').addEventListener('click', () => { if (confirm('確定清除目前對話並重新開始？')) { clearConversation(); setNote('新對話準備好；請按開始對話'); } });
for (const id of ['topic', 'mode']) el(id).addEventListener('change', () => {
  const val = el(id).value;
  if (data.turns.length && !confirm('轉換主題／模式會清空目前對話，確定嗎？')) { el(id).value = data[id]; return; }
  data[id] = val; clearConversation(); setNote('設定已更新；可以開始新對話');
});
el('save-facts').addEventListener('click', () => {
  if (data.turns.length && !confirm('儲存新個人資料會開始新對話，以避免沿用舊假設。確定？')) return;
  data.facts = el('facts').value.trim().slice(0, 2000); clearConversation(); setNote('個人資料已記住；可以開始新對話');
});
el('read-aloud').addEventListener('change', () => { data.readAloud = el('read-aloud').checked; save(); if (!data.readAloud) stopTalking(); });
el('speech-rate').addEventListener('change', () => { data.speechRate = Number(el('speech-rate').value); save(); });
el('export').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify({...data, exportedAt: new Date().toISOString()}, null, 2)], {type: 'application/json'}));
  const a = document.createElement('a'); a.href = url; a.download = 'b1-pc-dialogue.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 5000);
});
if (supportsTTS) { speechSynthesis.addEventListener?.('voiceschanged', englishVoice); englishVoice(); }
el('mic-info').textContent = SpeechRecognitionClass ? 'Chrome／Edge 提供網頁語音辨識：按咪講英文，辨識成功後自動發送。語音資料可能由瀏覽器供應商線上處理，唔一定離線。' :
  '呢個瀏覽器唔支援網頁咪高峰。可改用 Google Chrome；或者先點輸入框，按 Windows Win + H 口述英文，再按發送。';
if (!supportsTTS) { el('read-aloud').disabled = true; el('read-aloud').checked = false; }
render(); updateControls(); health();