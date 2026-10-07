# Eva AI Assistant

Eva is a web-first personal AI assistant for Alam, with separate authenticated owner and guest modes.

## Current build

- Real AI chat through the OpenAI Responses API.
- Hindi / Hinglish / English conversation.
- Secure server-side owner session using HMAC.
- Owner and guest roles are decided on the server, not by a frontend flag.
- Guest users cannot be treated as the owner.
- Local conversation persistence per role in the browser.
- Browser speech-to-text and optional text-to-speech.
- PWA manifest + offline shell.
- Android WebView app project.
- GitHub Actions workflow for a debug APK artifact.

OpenAI's Responses API is used for the AI backend.

## Required deployment environment variables

Set these in Vercel or the server hosting the API:

- `OPENAI_API_KEY` — required for real AI replies.
- `OPENAI_MODEL` — optional; defaults to `gpt-5-mini`.
- `EVA_OWNER_SECRET` — private owner login secret.
- `EVA_SESSION_SECRET` — strong random secret, at least 32 characters.

Never put `OPENAI_API_KEY`, `EVA_OWNER_SECRET`, or `EVA_SESSION_SECRET` in frontend files.

## Android APK

The Android project is under `android/`.

GitHub Actions workflow:
`.github/workflows/android-apk.yml`

It creates a debug APK artifact named `Eva-AI-debug-apk`. The workflow accepts the deployed Eva web URL as `eva_url`.

The default URL is a placeholder. Before distributing the APK, replace it with the actual deployed Eva URL.

## Important

This build does not yet perform real device-control actions. Eva must never claim that it opened an app, sent a message, changed a setting, or performed another external action unless a connected tool actually did it.

Persistent server-side long-term memory, reminders, and controlled agent tools should be added only with an actual database/tool integration; browser localStorage is used for the current chat history.
