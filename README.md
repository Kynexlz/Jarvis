# JARVIS Local v2

100% local AI assistant. No OpenAI API key and no AI API credits.

## 1. Check the model

You already installed Ollama. Make sure the model exists:

```powershell
ollama pull llama3.2:3b
```

The official Ollama library lists Llama 3.2 3B as a roughly 2 GB local text model. It can be run with `ollama run llama3.2`. The application uses the local Ollama chat API at `http://127.0.0.1:11434/api/chat`.

## 2. Install Node packages

Open this folder in VS Code and run:

```powershell
npm install
```

## 3. Start JARVIS

```powershell
npm start
```

Open:

```text
http://localhost:3000
```

## 4. Voice

Click ACTIVATE VOICE and allow microphone access.

Say:

```text
Jarvis
```

Then:

```text
What's the weather like?
```

JARVIS will send the conversation to your local Ollama model and read the answer aloud using your browser.

## Important

The AI model is local, but the browser's speech recognition/voice layer depends on the browser implementation. For best results use current Chrome or Microsoft Edge.

This version does not use an external AI API or an OpenAI API key.
