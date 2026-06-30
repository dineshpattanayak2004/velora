// src/components/ChatWindow.jsx

import { Mic, MicOff, Download, Trash2, Copy, Check, Paperclip } from "lucide-react";
import { useChatMessages } from "../hooks/useChatMessages";
import MarkdownRenderer from "./MarkdownRenderer";

export default function ChatWindow() {
  const {
    messages,
    input,
    setInput,
    isListening,
    loading,
    copiedIndex,
    handleSend,
    handleKeyDown,
    toggleListening,
    handleFileUpload,
    uploadedFile,
    exportChat,
    clearChat,
    copyMessage
  } = useChatMessages();

  return (
    <div className="glass rounded-2xl p-3 md:p-5 lg:p-6 flex flex-col h-[85vh] md:h-[85vh] lg:h-[88vh] xl:h-[90vh]">

      {/* Header */}
      <div className="border-b border-cyan-500/20 pb-3 md:pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 lg:gap-4">

          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-cyan-400">
              VELORA CHAT
            </h1>

            <p className="text-slate-400 text-sm md:text-base">
              AI Assistant Online
            </p>
          </div>

          <div className="flex gap-2 lg:gap-3">
            <button
              onClick={exportChat}
              className="glass px-2 md:px-3 lg:px-4 py-2 rounded-xl border border-cyan-500/20 hover:border-cyan-400 transition-all"
              title="Export Chat"
            >
              <Download size={16} className="md:hidden" />
              <Download size={18} className="hidden md:block" />
            </button>

            <button
              onClick={clearChat}
              className="glass px-2 md:px-3 lg:px-4 py-2 rounded-xl border border-red-500/20 hover:border-red-400 transition-all"
              title="Clear Chat"
            >
              <Trash2 size={16} className="md:hidden" />
              <Trash2 size={18} className="hidden md:block" />
            </button>

            <div className="glass px-3 md:px-4 lg:px-5 py-2 rounded-xl border border-cyan-500/20 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs md:text-sm">Connected</span>
            </div>
          </div>

        </div>
      </div>

      {/* Messages - Simple scrollable container */}
      <div className="flex-1 overflow-y-auto py-4 md:py-6 lg:py-8 pr-2">
        <div className="space-y-4 md:space-y-5 lg:space-y-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] p-3 md:p-4 rounded-2xl group relative ${
                  msg.role === "user"
                    ? `
                      bg-cyan-500
                      text-black
                      shadow-[0_0_20px_rgba(34,211,238,0.5)]
                    `
                    : `
                      glass
                      border
                      border-cyan-500/20
                      shadow-[0_0_15px_rgba(34,211,238,0.15)]
                    `
                }`}
              >
                {msg.role === "assistant" ? (
                  <MarkdownRenderer content={msg.text} />
                ) : (
                  <div className="whitespace-pre-wrap break-words text-sm md:text-base">{msg.text}</div>
                )}

                {/* Copy button for AI messages */}
                {msg.role === "assistant" && (
                  <button
                    onClick={() => copyMessage(msg.text, index)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-slate-800/50 hover:bg-slate-700/50"
                    title="Copy"
                  >
                    {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-start mb-5">
            <div
              className="
                glass
                border
                border-cyan-500/20
                px-4
                py-3
                rounded-2xl
                shadow-[0_0_15px_rgba(34,211,238,0.15)]
                flex items-center gap-2
              "
            >
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
              <span>Velora is thinking...</span>
            </div>
          </div>
        )}

      </div>

      {/* Input Area */}
      <div className="border-t border-cyan-500/20 pt-3 md:pt-4">

        <div className="flex gap-2 md:gap-3">

          {/* File Upload */}
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            accept="image/*,.pdf,.txt,.docx"
          />
          <button
            onClick={() => document.getElementById("file-upload")?.click()}
            className="
              px-3 md:px-4
              rounded-xl
              border
              transition-all
              duration-300
              flex-shrink-0
              glass border-cyan-500/20 hover:border-cyan-400
            "
            title="Upload file (Image, PDF, TXT)"
          >
            <Paperclip size={18} className="md:hidden" />
            <Paperclip size={20} className="hidden md:block" />
          </button>

          {/* Voice Input Button */}
          <button
            onClick={toggleListening}
            className={`
              px-3 md:px-4
              rounded-xl
              border
              transition-all
              duration-300
              flex-shrink-0
              ${
                isListening
                  ? "bg-red-500 border-red-400 text-white animate-pulse"
                  : "glass border-cyan-500/20 hover:border-cyan-400"
              }
            `}
            title={isListening ? "Stop listening" : "Voice input"}
          >
            {isListening ? <MicOff size={18} className="md:hidden" /> : <Mic size={18} className="md:hidden" />}
            {isListening ? <MicOff size={20} className="hidden md:block" /> : <Mic size={20} className="hidden md:block" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Ask Velora anything..."}
            className="
              flex-1
              p-3 md:p-4
              rounded-xl
              bg-slate-900
              border
              border-cyan-500/20
              outline-none
              focus:border-cyan-400
              disabled:opacity-50
              text-sm md:text-base
            "
            disabled={isListening}
          />

          {uploadedFile && (
            <div className="text-xs text-cyan-300 px-2 py-1 glass rounded-lg border border-cyan-500/20">
              📎 {uploadedFile.name}
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="
              px-4 md:px-6
              rounded-xl
              bg-cyan-500
              text-black
              font-bold
              hover:bg-cyan-400
              hover:shadow-[0_0_20px_rgba(34,211,238,0.7)]
              transition-all
              duration-300
              disabled:opacity-50
              disabled:cursor-not-allowed
              flex-shrink-0
              text-sm md:text-base
            "
          >
            {loading ? "..." : "Send"}
          </button>

        </div>

        {/* Listening Indicator */}
        {isListening && (
          <div className="mt-2 text-center text-cyan-400 text-xs md:text-sm animate-pulse">
            🎤 Listening... Speak now
          </div>
        )}

      </div>

    </div>
  );
}