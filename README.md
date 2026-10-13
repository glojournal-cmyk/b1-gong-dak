# B1 講得掂 — 開發入口

> **Current development priority (October 2026): PC-first genuine local AI conversations, then Samsung Android.**
>
> - **[Windows PC test (Ollama, no paid API)](desktop/README.md)** — genuine AI chat; use this for conversation QA.
> - **[Native Samsung Android experimental source](android/README.md)** — APK compiles, but real-device model loading and AI quality are not yet validated.
> - **[Original root PWA](index.html)** — older scripted demo, NOT a genuine AI conversation. Do not use it to judge AI quality.
>
> The desktop test requires Ollama + a locally downloaded model on the user's PC. GitHub Pages/Vercel alone do not provide free ongoing AI inference. **Do not claim model quality has passed without a real 5+ turn session.**

## Legacy scripted PWA (archived reference)

A mobile-first, installable PWA prototype for Hong Kong Cantonese-speaking learners preparing for Trinity GESE Grade 5 (B1).

## What works

- Guided Q&A using a **curated rule-based** sentence builder (no OpenAI/paid API).
- Topic navigation (one prepared topic plus all six official conversation topic areas).
- Personalised recommendations when learners explicitly confirm facts, such as number and age of children.
- English browser text-to-speech, selected English voice where available; built-in browser speech-to-text when available.
- 10-minute **scripted** conversation rehearsal and topic selection, **not** a pass/fail predictor.
- Favourite sentences, confirmed memories, settings, local progress, JSON import/export.
- Responsive standalone PWA with cache for static assets.
- No analytics, ads, accounts or external JavaScript libraries.

## What is NOT included

- A general-purpose AI examiner, spontaneous understanding of unrestricted speech, automatic grading or pronunciation accuracy assessment.
- Guaranteed UK male/female voice availability. The browser/OS controls available voices.
- Guaranteed offline speech recognition. On-device speech recognition is not widely supported on Android browsers; Google/browser speech providers may process audio remotely.
- No actual speech audio is persisted by the app. Local text memory is accessible to others with the same browser profile/device; this version is suitable only for personal pilot usage.

## Run locally

Any static server works:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/` or deploy the folder to a new **independent repository** and enable GitHub Pages or deploy it to a separate Vercel project. **Never** copy it into the existing Study App repository.

Android Chrome: Open the HTTPS website, use **Add to Home screen / Install app**. Allow microphone permission for optional dictation. Use keyboard fallback if recognition isn't supported.

## Future real AI upgrade (optional; not required)

Model-adapter boundary: replace rule-based `build(question, input)` with an explicitly opt-in, privacy-reviewed model provider. Do not embed API secrets in this static app. For no paid API, explore on-device models after testing device compatibility and performance; that is not a current feature.

## Notes

Official exam specifications and UK immigration language requirements may change. This prototype is not affiliated with Trinity College London or the UK Government. Practise genuine interaction, not memorisation. Verify any later public course content against official requirements and licensing.

## Samsung Galaxy S21 / S22 Ultra (Android)

Use the latest **Chrome** as the preferred browser. Install from Chrome's menu (`Add to Home screen` / `Install app`). Open **設定 → Samsung 手機語音檢查** to see what the current browser supports. This diagnostic cannot verify microphone permissions by itself; attempt a recording in **練習** and grant microphone permission when prompted.

When browser speech recognition is unavailable or fails, focus the answer field and use the **Samsung Keyboard / Gboard microphone**, *if present and enabled*, then press **提交答案**. This fallback depends on the installed keyboard and its recognition settings; do not assume every Android browser and keyboard will behave alike. Spoken audio may use network services and is not equivalent to a free-form AI conversation. Switching devices does not synchronize progress: export/import the local JSON backup if desired.