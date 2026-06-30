# 🚀 Velora AI - Advanced AI Assistant

<div align="center">

![Velora AI](https://img.shields.io/badge/Velora-AI-blue)
![React](https://img.shields.io/badge/React-19.2-61dafb)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285f4)

**An intelligent AI assistant with memory, voice input, and context awareness**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [API](#-api-documentation)

</div>

---

## ✨ Features

### 🤖 Core AI Capabilities
- **Google Gemini 2.5 Flash** - Latest AI model for intelligent responses
- **Context-Aware Conversations** - Remembers last 5 conversations for better context
- **Memory System** - Stores user preferences, facts, and conversation history
- **Smart Fact Extraction** - Automatically extracts and remembers user information

### 🎤 Voice & Input Features
- **Voice Input** - Speech-to-text support (Chrome/Edge browsers)
- **Real-time Listening** - Visual feedback during voice input
- **Multi-language Support** - Configurable speech recognition language

### 💾 Data Management
- **Export Chats** - Download conversation history as .txt files
- **Copy Messages** - One-click copy for AI responses
- **Clear Chat** - Fresh start with confirmation
- **Persistent Memory** - All data saved locally in JSON format

### 🎨 User Interface
- **Modern Glassmorphism Design** - Beautiful cyan-themed UI
- **Responsive Layout** - Works on desktop and tablet
- **Smooth Animations** - Powered by Framer Motion
- **Status Indicators** - Real-time connection and system status
- **Quick Tips** - Helpful guidance for new users

### 🔧 Advanced Features
- **Retry Mechanism** - Automatic retry on connection issues (3 attempts)
- **Error Handling** - Clear error messages and troubleshooting
- **Settings Page** - Comprehensive configuration options
- **Memory Bank** - View and manage stored memories
- **Dashboard** - Overview of system status and features

---

## 📦 Installation

### Prerequisites
- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **Gemini API Key** - Already configured in the project

### Step 1: Clone or Download
```bash
# If using git
git clone <repository-url>
cd velora
```

### Step 2: Install Backend Dependencies
```bash
cd velora/src/backend
pip install -r requirements.txt
```

**Required Python packages:**
- fastapi==0.104.1
- uvicorn==0.24.0
- python-dotenv==1.0.0
- google-generativeai==0.3.2
- pydantic==2.5.0

### Step 3: Install Frontend Dependencies
```bash
cd velora
npm install
```

**Required npm packages:**
- react, react-dom (v19.2.7)
- react-router-dom (v7.18.0)
- axios (v1.18.1)
- framer-motion (v12.41.0)
- lucide-react (v1.21.0)
- tailwindcss (v4.3.1)

---

## 🚀 Quick Start

### Option A: Using Startup Script (Windows)
```bash
# Simply double-click this file:
START.bat
```

This will automatically:
1. Start the backend server on port 8000
2. Start the frontend dev server on port 5173
3. Open both in separate terminal windows

### Option B: Manual Startup

**Terminal 1 - Backend:**
```bash
cd velora/src/backend
python main.py
```
You should see:
```
🚀 Starting Velora AI Backend...
📍 Backend URL: http://localhost:8000
📚 API Docs: http://localhost:8000/docs
```

**Terminal 2 - Frontend:**
```bash
cd velora
npm run dev
```
You should see:
```
VITE v8.1.0  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Step 4: Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

---

## 🎯 Usage Guide

### Basic Chat
1. Open http://localhost:5173 in your browser
2. Type a message in the input box
3. Press Enter or click "Send"
4. Wait for Velora's response

### Voice Input (Chrome/Edge Only)
1. Click the 🎤 microphone button
2. Allow microphone permissions when prompted
3. Speak your message
4. Text will appear automatically
5. Click Send or press Enter

### Export Chat History
1. Click the 📥 Download button in the header
2. Chat will be saved as `velora-chat-YYYY-MM-DD.txt`
3. Open the file to view your conversation

### Copy AI Responses
1. Hover over any AI message
2. Click the 📋 Copy icon (appears on hover)
3. Message is copied to clipboard
4. Checkmark confirms successful copy

### Clear Chat
1. Click the 🗑️ Trash icon in the header
2. Confirm the action
3. Chat resets to initial greeting

### Make Velora Remember You
Say phrases like:
- "My name is [your name]"
- "I like [your interests]"
- "I work at [company]"
- "I live in [city]"
- "My hobby is [hobby]"

Velora will automatically store this information and reference it in future conversations!

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.104.1 | Web framework for API |
| **Uvicorn** | 0.24.0 | ASGI server |
| **Google Generative AI** | 0.3.2 | Gemini AI integration |
| **Pydantic** | 2.5.0 | Data validation |
| **Python-dotenv** | 1.0.0 | Environment variables |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.7 | UI framework |
| **Vite** | 8.1.0 | Build tool |
| **Tailwind CSS** | 4.3.1 | Styling |
| **Framer Motion** | 12.41.0 | Animations |
| **Lucide React** | 1.21.0 | Icons |
| **React Router** | 7.18.0 | Navigation |
| **Axios** | 1.18.1 | HTTP client |

---

## 📊 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### Chat
```http
POST /chat
Content-Type: application/json

{
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "reply": "I'm doing great! How can I help you today?",
  "status": "success"
}
```

#### Memory Statistics
```http
GET /memories/stats
```

**Response:**
```json
{
  "total_facts": 5,
  "total_conversations": 10,
  "total_preferences": 3,
  "total_relationships": 0,
  "categories": ["personal", "preferences", "work"]
}
```

#### Get All Memories
```http
GET /memories/all
```

#### Search Memories
```http
GET /memories/search?query=name
```

#### Add Fact
```http
POST /memories/fact
Content-Type: application/json

{
  "category": "personal",
  "fact": "User's name is John",
  "metadata": {"type": "name"}
}
```

#### Get Facts by Category
```http
GET /memories/facts/{category}
```

#### Store Conversation
```http
POST /memories/conversation
Content-Type: application/json

{
  "user_message": "Hello",
  "ai_response": "Hi there!",
  "context": {}
}
```

#### Set Preference
```http
POST /memories/preference
Content-Type: application/json

{
  "key": "theme",
  "value": "dark"
}
```

#### Get Preference
```http
GET /memories/preference/{key}
```

#### Add Relationship
```http
POST /memories/relationship
Content-Type: application/json

{
  "entity1": "John",
  "entity2": "Google",
  "relationship_type": "works_at"
}
```

#### Get Relationships
```http
GET /memories/relationships/{entity}
```

#### Clear Memories
```http
DELETE /memories/clear?category=personal
```

---

## 📁 Project Structure

```
velora/
├── START.bat                    # Windows startup script
├── SETUP.md                     # Detailed setup guide
├── package.json                 # Frontend dependencies
├── vite.config.js              # Vite configuration
│
├── velora/
│   ├── src/
│   │   ├── backend/            # Python FastAPI backend
│   │   │   ├── main.py         # Server entry point
│   │   │   ├── .env            # API keys (not in git)
│   │   │   ├── requirements.txt # Python dependencies
│   │   │   ├── test_backend.py # Backend tests
│   │   │   ├── routes/         # API routes
│   │   │   │   ├── chat.py     # Chat endpoints
│   │   │   │   └── memory.py    # Memory endpoints
│   │   │   └── memory/         # Memory system
│   │   │       └── memory.py   # Memory bank implementation
│   │   │
│   │   └── frontend/           # React frontend
│   │       └── src/
│   │           ├── components/ # Reusable components
│   │           │   ├── ChatWindow.jsx  # Main chat UI
│   │           │   └── Sidebar.jsx     # Navigation
│   │           │
│   │           ├── pages/      # Page components
│   │           │   ├── Chat.jsx        # Chat page
│   │           │   ├── Dashboard.jsx   # Dashboard
│   │           │   ├── Settings.jsx    # Settings
│   │           │   ├── MemoryBank.jsx  # Memory viewer
│   │           │   └── AIAgents.jsx    # AI agents page
│   │           │
│   │           ├── hooks/      # Custom React hooks
│   │           │   └── useChat.js      # Chat logic
│   │           │
│   │           ├── services/   # API services
│   │           │   ├── api.js          # Axios config
│   │           │   └── gemini.js       # Gemini service
│   │           │
│   │           ├── App.jsx     # Main app component
│   │           └── main.jsx    # React entry point
```

---

## 🧪 Testing

### Backend Tests
```bash
cd velora/src/backend
python test_backend.py
```

**Test Coverage:**
- ✓ Module imports
- ✓ Memory bank operations
- ✓ Fact storage and retrieval
- ✓ Conversation logging
- ✓ Statistics generation

### Manual API Testing
1. Start backend: `python main.py`
2. Visit: http://localhost:8000/docs
3. Use the interactive Swagger UI to test endpoints

### Frontend Testing
1. Start frontend: `npm run dev`
2. Open http://localhost:5173
3. Test all features:
   - Send messages
   - Voice input (Chrome/Edge)
   - Export chat
   - Copy messages
   - Clear chat

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Backend won't start
```bash
# Solution 1: Check Python version
python --version  # Should be 3.8+

# Solution 2: Reinstall dependencies
pip install -r requirements.txt

# Solution 3: Check if port 8000 is in use
netstat -ano | findstr :8000
```

**Problem:** Gemini API errors
```bash
# Solution: Verify API key in .env file
cat velora/src/backend/.env
# Should show: GEMINI_API_KEY=your_key_here
```

### Frontend Issues

**Problem:** Frontend won't start
```bash
# Solution 1: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Solution 2: Check Node version
node --version  # Should be 16+

# Solution 3: Check if port 5173 is in use
netstat -ano | findstr :5173
```

**Problem:** Voice input not working
- Use Chrome or Edge browser (required for Web Speech API)
- Allow microphone permissions in browser settings
- Check browser console for errors (F12)

**Problem:** Chat not connecting
- Verify backend is running at http://localhost:8000
- Check browser console for CORS errors
- Ensure both servers are on the same network
- Try refreshing the page

---

## 🔐 Security & Privacy

### Data Storage
- All data stored locally in `memory_store.json`
- No cloud storage or external databases
- API key stored in `.env` (not committed to git)

### CORS Configuration
```python
# Development: Allows all origins
allow_origins=["*"]

# Production: Restrict to your domain
# allow_origins=["https://yourdomain.com"]
```

### Best Practices
- Never commit `.env` file to version control
- Use environment variables for sensitive data
- Regularly backup `memory_store.json`
- Clear sensitive data when sharing screenshots

---

## 🎨 Customization

### Change AI Model
Edit `velora/src/backend/routes/chat.py`:
```python
model = genai.GenerativeModel("gemini-2.5-flash")  # Change to:
# model = genai.GenerativeModel("gemini-2.5-pro")
# model = genai.GenerativeModel("gemini-1.5-flash")
```

### Modify System Prompt
Edit the `prompt` variable in `velora/src/backend/routes/chat.py`:
```python
prompt = f"""You are Velora, a helpful AI assistant...
[Customize this prompt]"""
```

### Change Colors
Edit `velora/src/index.css`:
```css
:root {
  --cyan-400: #your-color;
  --cyan-500: #your-color;
}
```

### Adjust Memory Settings
Edit `velora/src/backend/memory/memory.py`:
```python
# Keep only last X conversations
if len(self.memories["conversation_history"]) > 100:
    self.memories["conversation_history"] = self.memories["conversation_history"][-100:]
```

---

## 📈 Performance Tips

1. **Limit Conversation History** - Keep only last 5-10 conversations for context
2. **Optimize Memory** - Regularly clear old memories
3. **Use Flash Model** - Faster responses with Gemini 2.5 Flash
4. **Enable Caching** - Cache frequent responses (future feature)
5. **Batch Operations** - Process multiple memories at once (future feature)

---

## 🚧 Known Limitations

1. **Voice Input** - Only works in Chrome/Edge (Web Speech API)
2. **Single User** - No multi-user support yet
3. **Local Storage** - Data not synced across devices
4. **No Authentication** - Single-user application
5. **Context Window** - Limited to last 5 conversations

---

## 🔮 Future Enhancements

- [ ] Multi-user support with authentication
- [ ] Multiple conversation threads
- [ ] Advanced memory search with NLP
- [ ] Custom AI personalities
- [ ] Plugin system for extensions
- [ ] Mobile app (React Native)
- [ ] Multi-language UI support
- [ ] Dark/Light theme toggle
- [ ] Voice output (text-to-speech)
- [ ] Image upload and analysis
- [ ] File attachment support
- [ ] Conversation branching
- [ ] Export to PDF/JSON
- [ ] Analytics dashboard
- [ ] API rate limiting
- [ ] WebSocket for real-time updates

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📝 License

This project is for educational purposes. Feel free to use and modify as needed.

---

## 👨‍💻 Developer Notes

### Architecture Decisions
- **FastAPI** - Chosen for speed, async support, and automatic API docs
- **React 19** - Latest version with improved performance
- **Tailwind CSS** - Rapid UI development with utility classes
- **Gemini 2.5 Flash** - Best balance of speed and intelligence
- **JSON Storage** - Simple, human-readable, no database needed

### Key Features Implemented
1. ✅ End-to-end chat functionality
2. ✅ Context-aware responses
3. ✅ Memory system with fact extraction
4. ✅ Voice input support
5. ✅ Chat export functionality
6. ✅ Copy message feature
7. ✅ Enhanced UI/UX
8. ✅ Error handling and retry logic
9. ✅ Comprehensive settings page
10. ✅ Status indicators and quick tips

---

## 📞 Support

If you encounter any issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [Setup Guide](SETUP.md)
3. Check browser console for errors
4. Verify backend is running
5. Ensure all dependencies are installed

---

## 🎉 Acknowledgments

- **Google Gemini AI** - For the amazing AI capabilities
- **FastAPI** - For the excellent Python web framework
- **React Team** - For the powerful UI library
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icons

---

<div align="center">

**Built with ❤️ using React, FastAPI, and Google Gemini AI**

[⬆ Back to top](#-velora-ai---advanced-ai-assistant)

</div>