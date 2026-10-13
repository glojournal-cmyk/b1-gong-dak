# B1 browser oral learning QA — 13 October 2026

## Implemented
Speaking section first; local GPU/CPU inference; microphone final-result auto submission with opt-out; correction → repetition → follow-up; reviewed Chinese hints for common mistakes; reviewed course vocabulary collection; local practice and oral repetition counts. No paid AI API or APK work.

## Verified
30 objective exercises, persistence, wrong-answer review and lesson completion gating passed jsdom regression. Mocked oral tests passed retry → follow-up, word saving, automatic submission, stale lesson responses, malformed output retention, stop controls, pronoun-preserving clarification and common grammar explanations. Run preview/qa-dom.cjs and preview/qa-coach.cjs with jsdom installed.

Real native Qwen 1.5B separate English tasks corrected I has two sons and We usually cooking together and retained valid answers. Five-turn raw native ONNX output is preserved in preview/qa-model-flow-results.json; that log includes failures and is NOT a full acceptance pass. Generic explanations and clarification initially failed; reviewed common patterns now avoid those demonstrated mistakes. Other generated explanations remain provisional.

Real public-site browser test: v0.8 loaded Qwen2.5-1.5B-Instruct Q4_K_M via Wllama 2.3.7, without WebGPU. It generated I have one daughter from One daughter, displayed the reviewed Chinese explanation and lesson vocabulary. This was actual model inference, not a mocked screenshot. CPU latency was too long for natural dialogue. Stopping AI restored microphone controls and retained feedback. The final v0.9 adds a two-minute inference limit and GPU-only selection; its timeout path is code-reviewed but not yet exercised live.

## Not accepted yet
Five consecutive browser conversation turns; GPU execution/latency/quality; real microphone recognition and playback on the user's PC; broader free-answer teaching accuracy; complete B1 syllabus coverage. Do not label this a completed B1 oral tutor. The public preview is explicitly a test version.

## Rejected approaches
0.5B multi-task prompts produced missing fields, translations, changed subjects and invented facts. Simplified 0.5B tasks corrected some grammar but follow-ups still drifted to parents: not chosen. 1.5B ONNX failed browser initialization. Wllama must be instantiated in the browser document and owns its own inference worker; the obsolete outer worker is removed.
