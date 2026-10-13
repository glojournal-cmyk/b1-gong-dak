# B1 講得掂 — Official-aligned adaptive learning specification
Status: **content and pedagogy plan only**. Not yet implemented in the Grok prototype. 2026-10-13.
Target: adult Cantonese-speaking UK residents who know a little English but cannot easily speak in complete sentences.
Primary test: Trinity College London **GESE Grade 5 (B1)** — check the candidate's actual SELT route and latest syllabus before use.
Design: retain functional live two-way voice conversation from the Grok proof of concept **if its source code and usage rights can be obtained**. Do not replace this with canned keyword responses.

## Official exam map — required before any scoring
- 10 minutes. Topic discussion: candidate-chosen topic, about 5 minutes; completed Grade 5 topic form with **five discussion points**. Examiner can ask these in any order; candidate must meaningfully answer/ask at least one question and give explanations.
- Conversation: examiner chooses **two from SIX** areas, about 5 minutes total: Festivals; Means of transport; Special occasions; Entertainment; Music; Recent personal experiences. Prepare **all six**, not only two.
- Grade 5 language functions: talk about future / predictions; preferences; recent or indefinite past; reasons; duration; quantity.
- Grade 5 language examples: present perfect with for/since/ever/never/just; because; will; I prefer / I'd rather; many / a lot.
- Examiner grades authentic interaction, **not memorised scripts**; initial learning can include scaffolding, but exam mode must be spontaneous.
- Sources: https://www.trinitycollege.com/qualifications/SELT/B1-GESE-grade-5 and https://www.trinitycollege.com/resource?id=5649 ; check for updated test requirements.

## Four practice phases and advancement criteria (APP PRACTICE CRITERIA, not official grading)
1. **Speak first, no fear (A1-ish prerequisite)**: understand one short spoken question; learner may say fragments. Coach reconstructs only supported meaning, asks learner to repeat. If learner says "one daughter", suggest "I have one daughter." DO NOT invent child's age.
   Gate suggestion: learner independently produces 4 of 5 simple personal sentences and understands at least 4 of 5 paraphrased questions.
2. **Complete answer (A2 foundations)**: who + action + time/place; expand with frequency, past simple, going to future. Personalised answer suggestions derived from learner-confirmed facts. Coach provides full sentence > keywords > no hint.
   Gate: 4 of 5 independent full-sentence responses across ≥2 question phrasings.
3. **B1 interactive answer**: give reasons with because; preferences and comparisons; past experiences, present perfect (ever, never, since, for, just), duration, will predictions; 2–3 connected sentences; clarification requests; ask examiner a question.
   Gate: on ≥3 distinct topic areas, learner responds appropriately to unpredictable follow-ups, explains reasons and asks a related question without written prompts.
4. **Exam-ready simulated interaction**: 5-minute self-chosen topic (five points) + 5-minute conversation (random two out of six), English-only with no tutoring until the end. Explain the evidence behind coaching assessment (not a guaranteed official pass).
   Gate for readiness indicator: repeated satisfactory independent 10-minute simulations with no major comprehension breakdown and topic coverage across all six areas.

## Distinct app screens (keep existing voice UI)
- Today: one short task, **Start speaking** primary button; do not show too many settings.
- My Topic: Topic selection, five-point topic form, personal facts for learner confirmation, and discussion rehearsals.
- Six Conversation Areas: 6 cards with progress (not all six at once as mandatory marathon).
- My English Sentences: only confirmed/genuinely personalised sentences, listen/repeat, spaced recall.
- Mock Examiner: authentic timing, no Chinese hints or interruptions, feedback at end.
- Progress: skill-based competence, not just minutes or memorised question count; optional daily 10–15 minute routine.
- Accessibility: large text, slow playback, repeat last examiner question, Cantonese explanation in coach mode, no childish gamification.

## Core AI dialogue policy / algorithm
- **Keep actual free-form audio/dialogue**; a pedagogical coordinator chooses goal, scaffolding level, and official topic, but the model decides natural phrasing and the next relevant follow-up from current turn.
- After every learner turn, classify: understood question? answered relevantly? fragment or sentence? fact confirmed? confidence? cause/reason? tense appropriate? user asked clarifying question? If unclear, say so and ask one short clarification; never confidently substitute an unrelated memorised sentence.
- Offer 3 layers when coaching:
  A. **You said** (exact transcript, allow correction if STT wrong).
  B. **You can say** (simple, faithful sentence; not fabricated).
  C. **Try one more sentence** (optional relevant extension or one natural examiner follow-up).
- Do **not** interrupt constantly for minor grammar; correct only one priority issue per turn, especially when the message is understandable.
- Unconfirmed personally identifying details **cannot** be auto-saved as facts. Learner reviews or confirms before any permanent memory.
- Exam mode must never display suggested answers during questions, switch to Cantonese or predetermine the next reply from static keywords.
- Ensure question direction: examiner asks the learner `Can you tell me a little about your family?`, not `What would you like to ask about your family?`.
- Respond to `Can you make it more specific?` by rephrasing the **latest question**; `I don't understand` by simpler English; `Can you repeat that?` by repeating or paraphrasing.
- No unsupported certainty of being "ready" or "pass" from one mock.

## Sample conversation — language recovery
Examiner: "Can you tell me about your family?"
Learner: "One daughter."
Coach: "You can say, 'I have one daughter.' That's good. How old is she?"
Learner: "Thirteen."
Coach: "Try, 'She is thirteen years old.' What do you enjoy doing together?"
Learner: "Shopping."
Coach: "You can say, 'We enjoy going shopping together.' Why do you like it?" (Only if 'enjoy' was conveyed; otherwise ask if they enjoy it.)
Learner: "Can you make it more specific?"
Coach: "Of course. When you go shopping with your daughter, what do you usually buy?"
IMPORTANT: no assumptions about school, city, children's interests, jobs, religion, or family structure.

## Daily routine (suggested, not official)
2 minutes listen and respond to 3 familiar questions; 5 minutes guided natural speech; 3 minutes one weaker B1 language function; 2 minutes recall a sentence from previous day; 2–3 minutes free follow-ups. Spaced review after 1, 3, 7 days if genuinely useful.

## Independent QA matrix BEFORE Android
1. Genuine microphone → transcript → model voice response, including speaking slowly or pausing; browser compatibility and permission errors.
2. Unscripted 5+ turn conversation: "one daughter", age, corrections, "I don't understand", rephrasing, shifting question topic.
3. Personal facts must be verified before using them and removable.
4. Three different relevant model follow-up paths from different learner answers to the same examiner question.
5. Each six-area unit includes sample question bank *plus* unpredictable variations and B1 function coverage.
6. Mock runs full time and chooses random two of six without giving hints.
7. Current teacher/examiner scripts and feedback are reviewed against Grade 5 official syllabus, including candidates asking examiner questions.
8. No uncontrolled third-party AI API charges / service keys; clarify if Grok host's AI inference is subsidised, billed or time-limited.
9. Only after 1–8 pass on PC: test compatible Android solution and cross-device progress, verify performance on S21 and S22 Ultra.

## Dependency
The Grok sandbox URL alone does not give GitHub access to that app's code. Obtain an exported project/repository ZIP or a GitHub repository containing the functioning voice system **before merging** this curriculum. Do not overwrite the existing live voice app with the old scripted PWA or local Kotlin prototype.
