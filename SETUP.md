# Velora AI - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- Gemini API key (already configured)

### Installation Steps

#### 1. Install Backend Dependencies
```bash
cd velora/src/backend
pip install -r requirements.txt
```

#### 2. Install Frontend Dependencies
```bash
cd velora
npm install
```

#### 3. Start the Application

**Option A: Using the startup script (Windows)**
```bash
Double-click START.bat
```

**Option B: Manual startup**

Terminal 1 - Backend:
```bash
cd velora/src/backend
python main.py
```

Terminal 2 - Frontend:
```bash
cd velora
npm run dev
```

#### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## ✨ Features

### Core Features
- 💬 **AI Chat**: Powered by Google Gemini 2.5 Flash
- 🧠 **Memory System**: Remembers conversations and user preferences
- 🎤 **Voice Input**: Speech-to-text support (Chrome/Edge)
- 📤 **Export Chats**: Download conversation history
- 📋 **Copy Messages**: One-click copy for AI responses
- 🔄 **Context Awareness**: Maintains conversation context

### New Features Added
1. **Voice Input**: Click the microphone button to speak
2. **Chat Export**: Download chats as .txt files
3. **Copy Messages**: Hover over AI messages to copy
4. **Enhanced UI**: Better status indicators and quick tips
5. **Improved Backend**: Context-aware responses with conversation history
6. **Better Error Handling**: Retry mechanism with clear error messages

## 🛠️ Tech Stack

### Backend
- FastAPI (Python)
- Google Generative AI (Gemini)
- Pydantic for validation
- CORS enabled for frontend integration

### Frontend
- React 19
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- Framer Motion for animations
- Axios for API calls

## 📁 Project Structure

```
velora/
├── src/
│   ├── backend/
│   │   ├── main.py              # FastAPI server entry point
│   │   ├── routes/
│   │   │   ├── chat.py          # Chat API endpoints
│   │   │   └── memory.py        # Memory management API
│   │   ├── memory/
│   │   │   └── memory.py        # Memory bank implementation
│   │   ├── .env                 # API keys and config
│   │   └── requirements.txt     # Python dependencies
│   │
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ChatWindow.jsx    # Main chat interface
│   │   │   │   └── Sidebar.jsx       # Navigation sidebar
│   │   │   ├── pages/
│   │   │   │   ├── Chat.jsx          # Chat page
│   │   │   │   ├── Dashboard.jsx     # Dashboard
│   │   │   │   ├── Settings.jsx      # Settings page
│   │   │   │   └── MemoryBank.jsx    # Memory viewer
│   │   │   ├── hooks/
│   │   │   │   └── useChat.js        # Chat logic hook
│   │   │   ├── services/
│   │   │   │   ├── api.js            # Axios configuration
│   │   │   │   └── gemini.js         # Gemini API service
│   │   │   ├── App.jsx               # Main app component
│   │   │   └── main.jsx              # React entry point
│   │   └── package.json
│   │
│   └── START.bat                # Windows startup script
│
├── package.json
├── vite.config.js
└── README.md
```

## 🔧 Configuration

### Backend Configuration (.env)
```
GEMINI_API_KEY=your_api_key_here
```

### Frontend Configuration
The frontend connects to `http://127.0.0.1:8000` by default (see `src/services/api.js`)

## 🎯 Usage Tips

1. **Getting Started**: Type "Hello" or ask any question to start chatting
2. **Voice Input**: Click the 🎤 microphone button (works in Chrome/Edge)
3. **Remember Info**: Say "My name is [name]" or "I like [thing]" - Velora will remember!
4. **Export Chats**: Click the download button to save your conversation
5. **Copy Responses**: Hover over AI messages and click the copy icon
6. **Clear Chat**: Click the trash icon to start fresh

## 🐛 Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check if port 8000 is available

### Frontend won't start
- Ensure Node.js 16+ is installed: `node --version`
- Install dependencies: `npm install`
- Check if port 5173 is available

### Chat not working
- Verify backend is running at http://localhost:8000
- Check browser console for errors
- Ensure Gemini API key is valid in `.env`
- Try refreshing the page

### Voice input not working
- Use Chrome or Edge browser (Web Speech API support)
- Allow microphone permissions when prompted
- Check browser console for speech recognition errors

## 📊 API Endpoints

### Chat
- `POST /chat` - Send message and get AI response

### Memory
- `GET /memories/stats` - Get memory statistics
- `GET /memories/all` - Get all stored memories
- `POST /memories/fact` - Add a fact to memory
- `GET /memories/facts/{category}` - Get facts by category
- `GET /memories/search?query=` - Search memories
- `POST /memories/conversation` - Store conversation
- `POST /memories/preference` - Set user preference
- `GET /memories/preference/{key}` - Get user preference

## 🔐 Security Notes

- CORS is configured to allow all origins (development only)
- API key is stored in `.env` file (not committed to git)
- Memory is stored locally in JSON files
- No user authentication implemented (single-user app)

## 🚧 Future Enhancements

- [ ] User authentication system
- [ ] Multiple conversation threads
- [ ] Advanced memory search
- [ ] Custom AI personalities
- [ ] Plugin system
- [ ] Mobile app version
- [ ] Multi-language support
- [ ] Dark/Light theme toggle

## 📝 License

This project is for educational purposes.

## 👨‍💻 Developer

Built with ❤️ using React, FastAPI, and Google Gemini AI