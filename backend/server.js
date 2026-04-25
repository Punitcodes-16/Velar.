import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const upload = multer({
 storage: multer.memoryStorage()
});

const app = express();

app.use(cors({
 origin: [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
],
methods: ["GET", "POST", "DELETE", "PATCH"],
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
app.get("/api/notes/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
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
   const { title, content, user_id } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: "Title and content are required",
      });
    }

    const { data, error } = await supabase
      .from("notes")
     .insert([{
 title,
 content,
 user_id
}])
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

// =======================
// TASK ROUTES
// =======================


app.get("/api/tasks/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ tasks: data });
  } catch (error) {
    console.error("Fetch tasks error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch tasks" });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const { title, priority, user_id } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([
       {
  title,
  priority: priority || "medium",
  status: "pending",
  user_id,
},
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ task: data });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ error: error.message || "Failed to create task" });
  }
});

app.patch("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, title } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (priority) updates.priority = priority;
    if (title) updates.title = title;

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.json({ task: data });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ error: error.message || "Failed to update task" });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw error;

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ error: error.message || "Failed to delete task" });
  }
});

// =======================
// UPLOAD ROUTES
// =======================

app.get("/api/uploads/:userId", async (req, res) => {
  
try{
const { userId } = req.params;
 const { data,error } =
 await supabase.storage
  .from("uploads")
 .list(userId, { limit: 100 });

 if(error) throw error;

 res.json({
   files:data
 });

}catch(error){
 console.error(error);

 res.status(500).json({
   error:error.message
 });
}
});


app.post(
"/api/uploads/:userId",
upload.single("file"),
async(req,res)=>{
try{
  const { userId } = req.params;

 if(!req.file){
   return res.status(400).json({
     error:"No file uploaded"
   });
 }

const fileName = `${userId}/${Date.now()}-${req.file.originalname}`;

 const { error } =
 await supabase.storage
  .from("uploads")
  .upload(
     fileName,
     req.file.buffer,
     {
      contentType:req.file.mimetype
     }
  );

 if(error) throw error;

 res.json({
   message:"Upload successful",
   fileName
 });

}catch(error){
 console.error(error);

 res.status(500).json({
   error:error.message
 });
}
});


app.delete("/api/uploads", async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      return res.status(400).json({ error: "File path is required" });
    }

    const { error } = await supabase.storage
      .from("uploads")
      .remove([filePath]);

    if (error) throw error;

    res.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Velar backend running on port ${PORT}`);
});