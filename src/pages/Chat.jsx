import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import ConversationHistory from "../components/ConversationHistory";
import { Brain, MessageSquare, Zap, Shield, Info, Menu } from "lucide-react";
import { useChat } from "../contexts/ChatContext";

export default function Chat() {
  const [showInfo, setShowInfo] = useState(true);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { createNewConversation, currentConversationId } = useChat();

  // Create a new conversation on mount if none exists
  useEffect(() => {
    if (!currentConversationId) {
      createNewConversation();
    }
  }, [currentConversationId, createNewConversation]);

  return (
    <div className="flex min-h-screen">

      <Sidebar />

      {/* Conversation History Sidebar */}
      <ConversationHistory 
        isOpen={showHistory} 
        onToggle={() => setShowHistory(!showHistory)} 
      />

      <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10">

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="glass px-3 py-2 rounded-lg border border-cyan-500/20 hover:border-cyan-400 transition-all flex items-center gap-2"
          >
            <Menu size={18} className="text-cyan-400" />
            <span className="hidden sm:inline text-sm">History</span>
          </button>

          <div className="lg:hidden">
            <button
              onClick={() => setShowMobilePanel(!showMobilePanel)}
              className="glass px-4 py-2 rounded-xl border border-cyan-500/20 hover:border-cyan-400 transition-all flex items-center gap-2"
            >
              <Info size={18} className="text-cyan-400" />
              <span className="font-medium text-sm">AI Status</span>
              <span className="text-cyan-400">{showMobilePanel ? "▲" : "▼"}</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-4 md:gap-6 lg:gap-8">

          {/* Chat Area */}
          <ChatWindow />

          {/* Right Panel - Hidden on mobile by default */}
          <div className={`
            ${showMobilePanel ? "block" : "hidden"}
            lg:block
            space-y-4
          `}>
            
            {/* AI Status Card */}
            <div className="glass rounded-2xl p-4 md:p-5 lg:p-6">
              <h2 className="text-cyan-400 text-xl md:text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">
                AI STATUS
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 text-sm md:text-base">Online & Ready</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <Brain className="text-cyan-400" size={18} />
                  <span className="text-slate-300 text-sm md:text-base">Memory Active</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <Zap className="text-yellow-400" size={18} />
                  <span className="text-slate-300 text-sm md:text-base">Gemini Connected</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
                  <MessageSquare className="text-purple-400" size={18} />
                  <span className="text-slate-300 text-sm md:text-base">Context Aware</span>
                </div>
              </div>
            </div>

            {/* Features Card */}
            <div className="glass rounded-2xl p-4 md:p-5 lg:p-6">
              <h3 className="text-white text-lg md:text-xl font-semibold mb-3 lg:mb-4">
                Features
              </h3>

              <div className="space-y-2 md:space-y-3 text-sm md:text-base text-slate-400">
                <div className="flex items-start gap-2">
                  <Shield className="text-cyan-400 mt-0.5 flex-shrink-0" size={16} />
                  <span>End-to-end encrypted conversations</span>
                </div>

                <div className="flex items-start gap-2">
                  <Brain className="text-cyan-400 mt-0.5 flex-shrink-0" size={16} />
                  <span>Remembers your preferences & context</span>
                </div>

                <div className="flex items-start gap-2">
                  <MessageSquare className="text-cyan-400 mt-0.5 flex-shrink-0" size={16} />
                  <span>Voice input support (Chrome/Edge)</span>
                </div>

                <div className="flex items-start gap-2">
                  <Zap className="text-cyan-400 mt-0.5 flex-shrink-0" size={16} />
                  <span>Export chat history anytime</span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            {showInfo && (
              <div className="glass rounded-2xl p-4 md:p-5 lg:p-6 border border-cyan-500/20">
                <h3 className="text-white text-lg md:text-xl font-semibold mb-3 lg:mb-4">
                  💡 Quick Tips
                </h3>

                <ul className="space-y-2 text-sm text-slate-400">
                  <li>• Say "My name is..." to help Velora remember you</li>
                  <li>• Use voice input by clicking the 🎤 button</li>
                  <li>• Export chats using the download button</li>
                  <li>• Copy AI responses with the copy button</li>
                </ul>

                <button
                  onClick={() => setShowInfo(false)}
                  className="mt-3 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  Dismiss
                </button>
              </div>
            )}

          </div>

        </div>

      </main>

    </div>
  );
}
