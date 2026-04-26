# 🚀 Velar AI

**Voice-First AI Workspace | Full-Stack Productivity OS**

Velar AI is a full-stack AI-powered workspace that combines **conversation, memory, tasks and documents** into one intelligent system.

Instead of switching between chat apps, note apps, task managers and file tools, Velar brings them together inside a single AI-first interface.

---

## ✨ Core Idea

Velar is designed as an **AI Operating Workspace** where users can:

- Talk to AI in natural language (voice + chat)
- Store notes and reusable knowledge
- Manage tasks and execution workflows
- Upload and organize documents
- Build toward intelligent agent-driven workflows

---
## live link : https://velar-rust.vercel.app/
## 🌌 Features

### 🤖 AI Chat
- Conversational AI assistant
- Voice-triggered navigation
- Expandable chat workspace
- Save AI responses directly into Knowledge Vault
- Multi-chat support (new chat / clear chat / delete chat)

---

### 🧠 Knowledge Vault
- Save notes and ideas
- Personal memory layer
- Persistent database storage
- Create / delete notes
- Store AI-generated insights

---

### ✅ Tasks
- Add tasks
- Set priorities
- Mark complete/incomplete
- Delete tasks
- Persistent task tracking

---

### 📂 Uploads
- Upload files to cloud storage
- Manage uploaded documents
- User-specific file storage
- Foundation for future document intelligence (RAG)

---

### 🔐 Authentication
- User signup/login
- Session persistence
- User-specific notes, tasks and uploads

---

## 🛠 Tech Stack

### Frontend
- React
- Vite
- JavaScript
- Tailwind CSS
- Framer Motion

### Backend
- Node.js
- Express

### Database / Storage
- Supabase PostgreSQL
- Supabase Storage
- Supabase Auth

### AI
- Google Gemini API

### Deployment
- Vercel (Frontend)
- Render (Backend)

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Punitcodes-16/Jarvis-os.git
cd Jarvis-os
```

### 2. Environment Setup

#### Backend Environment Variables
Copy the example file and fill in your values:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your actual values:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
FRONTEND_URL=https://your-frontend-domain.com
PORT=5000
```

#### Frontend Environment Variables
```bash
cd ../frontend/frontend
cp .env.example .env
```

Edit `frontend/frontend/.env` with your actual values:
```env
VITE_API_URL=https://your-backend-domain.com
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend/frontend
npm install
```

### 4. Run Development Servers

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd ../frontend/frontend
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---

## 🏗 Architecture

```text
Frontend (React + Vite)
        |
        v
Node/Express API (Render)
        |
        +------ Gemini API
        |
        +------ Supabase Database
        |
        +------ Supabase Storage
```

---

## 🎯 Problem It Solves

Traditional productivity is fragmented:

- Notes in one app  
- Tasks in another  
- Files somewhere else  
- AI chat disconnected from all of them  

Velar unifies:

**Thinking + Memory + Execution + Documents**

into one intelligent workspace.

---

## 🔮 Future Roadmap
- AI-generated tasks from chat
- Document Q&A / RAG
- Semantic search over knowledge vault
- Workflow automation agents
- Personal AI manager
- Multi-agent productivity system

---

## 💡 One-Line Pitch

**Velar is a voice-first AI operating workspace combining chat, memory, tasks and documents into one intelligent productivity system.**

---

## 👨‍💻 Built By
**Punit Bhargava**

If you like the project, feel free to star ⭐ the repo.
