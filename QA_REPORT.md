# MVP QA Report — 13 October 2026

## Verified through headless Chromium UI flow

- Home page loads; responsive 390x844 layout rendered.
- Practice UI accepts learner input `one daughter` and suggests `I have one daughter.`.
- Selecting next question asks child's age; answer `13` suggests `My daughter is 13 years old.`.
- Explicit memory-confirmation stores the child's age.
- Favourite sentence stored, progress statistics updated and sentence memory screen displays stored facts.
- Scripted mock interview starts with first prepared topic and advances to second question.
- No JavaScript runtime errors observed during above interaction checks.
- `node --check app.js` completed without syntax error.

## Still requires real device or HTTPS testing

- Android Chrome speech recognition permissions/accuracy (varies by browser and phone).
- Text-to-speech available installed voice quality, accent, gender options.
- PWA install, home screen icon, offline page cache and browser persistence after real reload/phone reboot.
- Different Android models, microphones and noisy settings.
- Accessibility, slow network and extended mock timer edge cases.
- Live website hosting not yet configured; separate GitHub repository cannot be created with the current connected GitHub actions.

This is a scripted roleplay MVP, not an AI language model or an official Trinity grade prediction.


## v0.2 regression — user-reported off-topic issue
- Reported: saying `can you hear me what I say` during a family question produced unrelated `I have one daughter.` suggestion.
- Fixed: recognise mic/understanding checks, acknowledge recognised text, and suggest `Can you hear what I'm saying?` without claiming generative comprehension.
- Unsupported answer now explicitly states lack of understanding, provides retry and optional sample, rather than falsely proposing a personal answer.
- Correct `one daughter` -> ask daughter's age -> `13` -> `My daughter is 13 years old.`
- Contextual family follow-up for `church with family` now asks why the learner enjoys going to church.
- Answer panel remains accessible at mobile width; mobile 390 × 844 simulated Chromium flow passed without JS errors or horizontal overflow.
- Service worker uses network-first update and offline cache fallback to reduce installed-PWA stale code.
- Real Samsung browser speech recognition + microphone/audio playback still require device testing; simulated Chromium does **not** verify these.

## v0.3 Samsung Galaxy S21 and Galaxy S22 Ultra compatibility pass (13 Oct 2026)
- Simulated Android Chrome viewports: **360 × 800 CSS px** (Galaxy S21 reference) and **412 × 915 CSS px** (S22 Ultra reference).
- Both passed: app initialization, device diagnostics, navigation into Practice, a **real submitted** `one daughter` turn (not just the pre-rendered sample), personalized suggested answer, no JavaScript exceptions, and no horizontal overflow.
- Fixed a first-submission issue: opening Practice from bottom navigation could previously discard the user's first answer when starting the dialogue.
- Added a **Settings → Samsung 手機語音檢查** panel with browser speech-recognition support, English text-to-speech, voice availability, network, and storage diagnostics.
- If browser speech recognition is unavailable, the microphone action now focuses the text box with instructions to use **Samsung Keyboard / Gboard dictation where supported**; this is a fallback, not a claim that the keyboard always provides voice input.
- Incoming speech recognition now cancels outgoing spoken audio to avoid having the microphone pick up the examiner; detailed error hints cover denied permissions, no speech, network, and hardware errors.
- Retained all learning storage under `b1_gongdak_mvp_v1` (no migration or destructive clearing).
- **Not yet tested on physical Samsung devices**: permission prompts, Korean/Hong Kong accent recognition, device-specific voice choice, real speech capture, install to home screen and interruption during long pauses. These require real-device QA.
- The app remains **rule-based**, not free-form generative AI, and uses **zero paid model API calls**.