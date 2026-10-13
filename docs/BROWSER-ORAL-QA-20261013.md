# B1 browser oral learning — 13 October 2026

Implemented: speaking section first; local GPU or CPU model loading; speech-final auto submission with manual opt-out; correction → learner repetition → follow-up; reviewed lesson vocabulary collection; local oral retry counts. Objective drill scores remain separate from AI suggestions and pronunciation.

Regression checks: 30 objective drills, lesson completion gating, persistence, wrong-answer review, oral retry flow, vocabulary saving, automatic submission, stale lesson responses, invalid output retention, stop controls and reviewed clarification/grammar hints passed in jsdom. Run from preview with jsdom installed: node qa-dom.cjs; node qa-coach.cjs. Model output in these tests is mocked.

Real inference findings: Qwen 0.5B was unsuitable (missing fields, translations and invented facts). Qwen 1.5B with a single multi-task JSON prompt was also unreliable. Separate English correction tasks produced I have two sons and We usually cook together correctly, and retained already-correct answers. Native ONNX five-turn raw results are retained in qa-model-flow-results.json; they include failures, NOT an acceptance pass. Incorrect generic explanations and changed-person clarification were replaced for reviewed common patterns. Other generated feedback remains provisional.

Browser findings: 0.5B ONNX actually loaded but failed answer validation. 1.5B ONNX downloaded but failed initialization in the cloud browser. CPU runtime now uses Wllama 2.3.7 + Qwen2.5-1.5B-Instruct Q4_K_M GGUF with a bounded context. Full browser startup/inference of this replacement, GPU quality, the user's real microphone, five consecutive browser turns and pedagogical acceptance remain to be verified. Do not claim this is a completed B1 oral tutor.

No paid AI API was enabled. Browser speech recognition may use a browser vendor's online service. Local model downloads use public model/CDN services; learner answers are used locally. No APK work was resumed.
