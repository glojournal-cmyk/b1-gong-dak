# B1 講得掂 — genuine offline Android AI (experimental)

This is a **new native Android application**, not the old keyword-based PWA. The original PWA stays untouched at the repository root. This code lives only in `android/`.

## Implementation
- Kotlin Android Activity UI + Google's [LiteRT-LM 0.18.0](https://github.com/google-ai-edge/LiteRT-LM), on-device CPU backend.
- Local multi-turn inference with a compact `.litertlm` model, not a deterministic keyword response table.
- Tutor vs mock examiner prompt modes, nine topic selections, user-confirmed facts, chat history (stored only on-device).
- No `INTERNET` permission and **no paid AI API**. Model download happens separately in your browser; users select their model from Android's file picker.
- Text-first research milestone. **Microphone and spoken conversation are not implemented**. Device-generated speech comes later **only after** real multi-turn understanding works reliably.

## Model (first trial)
[Qwen3 0.6B LiteRT-LM INT4, approx. 329 MB](https://huggingface.co/litert-community/Qwen3-0.6B/blob/main/Qwen3-0.6B_dynamic_wi4b32_afp32.litertlm), Apache 2.0. The file is **not** included in GitHub or the APK. Manual download required. Android import validates file size and copies to private storage. Model quality, speed, CPU support and battery usage on **Galaxy S21 and S22 Ultra are unverified** until real-device QA. Consider a second, larger model if this one is too weak.

## Build and download APK
`android/` is a Gradle project. GitHub Actions runs `.github/workflows/android-debug-apk.yml` on pushes to `android/**`. After a **successful** build, open GitHub > Actions > latest *Build Android offline APK* > Artifacts > `b1-gong-dak-android-debug-apk`. The artifact is a test/debug APK signed with GitHub's temporary debug key, not a production release.

Local build if you have Android SDK:
```bash
cd android
gradle :app:assembleDebug
```

## Usage & safety
1. Install test APK on a Samsung Android phone after consenting to install from the source.
2. Tap *模型下載指引*, download free `.litertlm` once, then *匯入離線 AI 模型* and pick Downloads file.
3. Wait for the model to load before attempting chat (might be slow; do not interpret a crash as success).
4. Try five open-ended exchanges. Look for relevant follow-up, not rote replies:
   - `What would you like to ask?`
   - `Can you make it more specific?`
   - `I have one daughter.`
   - `She's thirteen.`
   - `I don't understand that question.`
5. Confirm personal facts in *✎ 個人資料*, then start another conversation. Check personalization is grounded in facts, not invented.
6. Report model load failures, latency and response quality separately for S21 and S22 Ultra.

Known limitations: `Qwen3-0.6B` is small; prompts do not guarantee exam-appropriate pedagogy, Cantonese fluency or reliable B1 scoring. Not affiliated with Trinity. Model download terms are the upstream model license; the app never silently downloads gigabytes. Chat logs in SharedPreferences may be lost on uninstall; there is no cross-phone syncing.

**Do not tell testers the app has passed Android real-device QA or guarantees their B1 result.**