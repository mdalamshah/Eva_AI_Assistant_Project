# Eva AI Assistant

Eva is a web-first personal AI assistant for Alam with authenticated owner/user modes, voice features, and a real Nano Banana image studio.

## Working features

- Real AI chat through the OpenAI Responses API.
- Hindi / Hinglish / English conversation.
- Server-side owner and normal-user sessions.
- Browser-local chat history per role.
- Browser speech-to-text and optional text-to-speech.
- **Nano Banana 2.1 image generation** through Google's Gemini API.
- Image Studio with aspect-ratio selection and browser download.
- **Maximum 10 generated images per user per rolling 24-hour window.**
- Server-side signed image-usage counter; the limit is not a frontend-only button.
- PWA manifest + offline shell.
- Android WebView project and GitHub Actions debug APK workflow.

## Environment variables

Set these in Vercel/server environment variables:

- `OPENAI_API_KEY` — required for chat.
- `OPENAI_MODEL` — optional, defaults to `gpt-5-mini`.
- `GEMINI_API_KEY` — required for Nano Banana image generation. This is an API key from Google's Gemini API; an email address alone cannot authenticate API calls.
- `GEMINI_IMAGE_MODEL` — optional, defaults to `gemini-nano-banana-2.1`.
- `EVA_OWNER_SECRET` — private owner login secret.
- `EVA_SESSION_SECRET` — strong random secret, at least 32 characters.

Never put API keys or owner/session secrets in frontend files.

## Image limits

The server allows at most 10 successful image generations per rolling 24-hour window for each browser session. Failed requests do not consume a generation. The UI displays remaining generations.

## Security and limitations

- The frontend never receives the Gemini or OpenAI API keys.
- Eva must not claim an image was generated unless the image API actually returned an image.
- Eva must not claim external device actions happened unless a connected tool performed them.
- Persistent cross-device memory, reminders, payments, social-follow verification, and real device-control tools are not yet implemented.
- The creator Instagram handle is `@alam__6786__`.

## Android

The Android project is under `android/`. GitHub Actions builds a debug APK artifact. The APK should be pointed at the real deployed Eva URL before distribution.
