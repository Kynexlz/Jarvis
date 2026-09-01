# JARVIS v3 — Render + Ollama

Render hosts the JARVIS web server/UI. Ollama must be reachable by Render through `OLLAMA_URL`.

## Important
Do NOT set `OLLAMA_URL` to `http://127.0.0.1:11434` on Render. That points to Render itself, not your Windows PC.

For local development:
```powershell
npm install
$env:OLLAMA_URL="http://127.0.0.1:11434"
$env:OLLAMA_MODEL="llama3.2:3b"
npm start
```

For Render, set:
`OLLAMA_URL=https://YOUR-REACHABLE-OLLAMA-ENDPOINT`
`OLLAMA_MODEL=llama3.2:3b`

Do not expose Ollama port 11434 directly to the public internet. Use a secure authenticated tunnel/reverse proxy if the model remains on your PC.

## GitHub
```powershell
git init
git add .
git commit -m "JARVIS v3"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/jarvis-ollama-v3.git
git push -u origin main
```

## Render
Create New > Web Service, connect the repo, then:
Build Command: `npm install`
Start Command: `npm start`
Plan: Free

The included `render.yaml` configures the same service and `/health` health check.

Render requires a web service to listen on `0.0.0.0` and the `PORT` environment variable; this project does that.

## Voice
Voice wake-word recognition and speech output happen in the browser. Chrome/Edge are recommended.
