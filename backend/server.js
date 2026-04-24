import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5174",
    "X-Title": "Velar AI",
  },
});

app.get("/", (req, res) => {
  res.json({ message: "Velar backend is running" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message, messages } = req.body;

    const finalMessages = [
      {
        role: "system",
        content:
          "You are Velar, a voice-first intelligent workspace assistant. Be concise, useful, and clear.",
      },
      ...(messages?.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })) || [{ role: "user", content: message }]),
    ];

    const completion = await client.chat.completions.create({
      model: "openrouter/free",
      messages: finalMessages,
    });

    res.json({
      reply: completion.choices?.[0]?.message?.content || "No reply generated.",
    });
  } catch (error) {
    console.error("OpenRouter chat error:", error);
    res.status(500).json({
      error: error.message || "OpenRouter request failed",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Velar backend running on port ${PORT}`);
});