# SahuTracker Groq Proxy

Small Express server that proxies SahuTracker Coach requests to Groq, keeping the API key server-side.

## Endpoints
- GET `/health` → `{ ok: true }`
- POST `/chat` body: `{ "prompt": "..." }` → `{ ok:true, text:"...", provider:"groq" }`

## Local run
```bash
cd groq-proxy
npm i
set GROQ_API_KEY=YOUR_KEY
npm start
```
Open: http://localhost:3000/health

## Deploy (Render)
- Build command: `npm install`
- Start command: `npm start`
- Env var: `GROQ_API_KEY`

Then set app AI endpoint to:
`https://<your-render-service>.onrender.com/chat`
