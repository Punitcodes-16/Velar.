import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
methods: ["GET", "POST", "DELETE"],
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

// =======================
// KNOWLEDGE VAULT ROUTES
// =======================

// Get all notes
app.get("/api/notes", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ notes: data });
  } catch (error) {
    console.error("Fetch notes error:", error);
    res.status(500).json({
      error: error.message || "Failed to fetch notes",
    });
  }
});

// Create note
app.post("/api/notes", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: "Title and content are required",
      });
    }

    const { data, error } = await supabase
      .from("notes")
      .insert([{ title, content }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ note: data });
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({
      error: error.message || "Failed to create note",
    });
  }
});

// Delete note
app.delete("/api/notes/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({
      error: error.message || "Failed to delete note",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Velar backend running on port ${PORT}`);
});