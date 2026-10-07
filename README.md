# Eva AI Assistant

A clean web-first foundation for Eva, a personal AI assistant.

## Included now
- Responsive Eva chat UI
- Hindi / Hinglish / English conversation support
- Server-side AI endpoint at `/api/chat`
- Browser voice input where supported
- API key kept server-side, never in frontend code
- Vercel-ready, no build step required

## Connect the real AI brain
Add these environment variables in your deployment:

- `OPENAI_API_KEY` — your API key
- `OPENAI_MODEL` — optional model override; default is `gpt-5-mini`

Do **not** put the API key in `index.html` or `app.js`.

## Next Eva stages
1. Persistent memory and user preferences
2. Natural voice conversation
3. Safe agent/tool actions
4. Owner mode and permissions
5. Android integration
6. Reminders and automation

Eva should never claim an external action happened unless a connected tool actually performed it.
