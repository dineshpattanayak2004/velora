import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import AIAgents from "./pages/AIAgents";
import Settings from "./pages/Settings";
import MemoryBank from "./pages/MemoryBank";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import { ChatProvider } from "./contexts/ChatContext";
import { AuthProvider } from "./contexts/AuthContext";

function AppInner() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/agents" element={<AIAgents />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/memory" element={<MemoryBank />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <SettingsProvider>
          <AppInner />
        </SettingsProvider>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;

