import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS online on port ${PORT}`);
});
const OLLAMA_URL = "http://127.0.0.1:11434";
const MODEL = "llama3.2:3b";

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

const SYSTEM = `You are JARVIS, a fictional Iron Man-inspired personal AI assistant.
Be calm, intelligent, concise and slightly witty. Address the user naturally.
Your responses are going to be spoken aloud, so avoid markdown, tables and long formatting.
Never claim you performed a computer action unless this application actually implemented it.
If asked who you are, say you are JARVIS, a local AI assistant running on the user's computer.`;

app.get("/api/status", async (_req, res) => {
  try {
    const r = await fetch(`${OLLAMA_URL}/api/tags`);
    if (!r.ok) throw new Error("Ollama is not responding");
    const data = await r.json();
    const models = (data.models || []).map(m => m.name);
    res.json({ online: true, model: MODEL, installed: models.includes(MODEL), models });
  } catch {
    res.status(503).json({ online: false, model: MODEL });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    const safe = messages
      .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-20);

    const r = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        stream: false,
        messages: [{ role: "system", content: SYSTEM }, ...safe],
        options: {
          temperature: 0.7
        }
      })
    });

    if (!r.ok) {
      const body = await r.text();
      throw new Error(`Ollama error ${r.status}: ${body}`);
    }

    const data = await r.json();
    res.json({ reply: data.message?.content || "I am online, but I have no response." });
  } catch (error) {
    console.error(error);
    res.status(503).json({
      error: "I cannot reach the local AI core. Make sure Ollama is running and llama3.2:3b is installed."
    });
  }
});

app.listen(PORT, () => {
  console.log(`JARVIS local interface: http://localhost:${PORT}`);
  console.log(`Ollama: ${OLLAMA_URL}`);
  console.log(`Model: ${MODEL}`);
});
