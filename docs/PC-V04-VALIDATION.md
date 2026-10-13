# PC v0.4 validation

Implemented in preview/ and gh-pages: five practice lessons, 20 vocabulary items with translations/examples/read-aloud, 30 scored constrained exercises, first-attempt accuracy separated from eventual completion, correction explanations, mistake review, local persistence, exercise backup/restore, and experimental WebLLM local correction/follow-up.

These five lessons are a starting practice set, not a complete Trinity B1 curriculum. Six conversation topics remain sample questions. No pronunciation or exam pass score is inferred from speech transcripts. Free answers are not graded by keyword rules.

Validation completed 13 October 2026:
- JavaScript syntax checks passed.
- jsdom interaction tests passed for 30 exercises, correction and review, accepted grammatical alternatives, completion gating, persisted reload, old-preview progress migration, malformed AI output, and unsupported-GPU handling.
- Live GitHub Pages v0.4 was observed in Chrome at https://glojournal-cmyk.github.io/b1-gong-dak/.
- Live wrong sentence `I has one daughter.` produced the correction `I have one daughter.` with a Chinese explanation. Correcting it counted mastery and removed the mistake; first-attempt accuracy stayed unchanged.
- Browser AI initialization in the cloud Chrome environment failed with no available GPU. Actual model inference, five-turn teaching quality, microphone capture, pronunciation, and mobile visual layout have NOT passed acceptance.
- Standalone Playwright browser tests could not run because the browser download was unavailable. Do not describe DOM simulation as full end-to-end QA.

The real local model adapter is an experimental optional entry, not a substitute for validated speech-tutoring acceptance. It requires a compatible GPU and model download. No cloud paid AI service was enabled.

Deployment: gh-pages Pages build/deployment run 38420978265 succeeded. Separate existing desktop-qa and b1-learning-pages workflows fail before producing jobs; these failures remain unresolved. They must not be confused with the successful branch-based Pages deployment.
