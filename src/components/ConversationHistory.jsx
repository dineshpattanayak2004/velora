import { useState } from "react";
import { Plus, Trash2, MessageSquare, ChevronLeft } from "lucide-react";
import { useChat } from "../contexts/ChatContext";

export default function ConversationHistory({ isOpen, onToggle }) {
  const { conversations, currentConversationId, createNewConversation, loadConversation, deleteConversation } = useChat();
  const [hoveredId, setHoveredId] = useState(null);

  const handleNewChat = () => {
    createNewConversation();
  };

  const handleSelectConversation = (id) => {
    loadConversation(id);
  };

  const handleDeleteConversation = (e, id) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteConversation(id);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      fixed md:relative
      top-0 left-0
      h-screen
      glass
      p-4
      z-50
      transform transition-transform duration-300
      md:translate-x-0
      w-80
      flex flex-col
      border-r border-cyan-500/20
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-cyan-400">History</h2>
        <button
          onClick={onToggle}
          className="md:hidden text-slate-400 hover:text-white"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* New Chat Button */}
      <button
        onClick={handleNewChat}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition mb-4 font-medium"
      >
        <Plus size={20} />
        <span>New Chat</span>
      </button>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <MessageSquare size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              onMouseEnter={() => setHoveredId(conv.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`
                group relative
                p-3 rounded-lg cursor-pointer transition-all
                ${currentConversationId === conv.id
                  ? "bg-cyan-400/20 border border-cyan-400"
                  : "hover:bg-slate-800/50 border border-transparent"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <MessageSquare size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate text-sm">
                    {conv.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {formatDate(conv.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Delete Button */}
              {hoveredId === conv.id && (
                <button
                  onClick={(e) => handleDeleteConversation(e, conv.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition opacity-0 group-hover:opacity-100"
                  title="Delete conversation"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {conversations.length > 0 && (
        <div className="pt-4 border-t border-cyan-500/20 mt-4">
          <p className="text-xs text-slate-400 text-center">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}