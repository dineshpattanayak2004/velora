import { useState, useEffect, useRef } from "react";
import { useChat } from "../contexts/ChatContext";
import { sendMessage as sendMessageToGemini, sendFileMessageToAI } from "../services/gemini";

export const useChatMessages = () => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const { currentConversationId, addMessage, getCurrentConversation, clearAllConversations, createNewConversation } = useChat();

  const messages = getCurrentConversation()?.messages || [];

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setLoading(true);
    try {
      const result = await sendFileMessageToAI(file, input || "Please analyze this file");
      const aiResponse = {
        role: "assistant",
        text: result.reply,
        timestamp: new Date().toISOString()
      };
      if (currentConversationId) {
        addMessage(currentConversationId, { role: "user", text: `[Uploaded: ${file.name}]`, timestamp: new Date().toISOString() });
        addMessage(currentConversationId, aiResponse);
      }
      setInput("");
      setUploadedFile(null);
    } catch (error) {
      console.error("File upload error:", error);
      const errorMessage = {
        role: "assistant",
        text: `❌ Upload failed: ${error.message || "Could not reach the backend. Make sure the server is running on port 8001."}`,
        timestamp: new Date().toISOString()
      };
      if (currentConversationId) {
        addMessage(currentConversationId, errorMessage);
      }
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const sendMessage = async (text) => {
    if (!text.trim() || !currentConversationId) return;

    setLoading(true);

    // Add user message
    const userMessage = {
      role: "user",
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    addMessage(currentConversationId, userMessage);
    setInput("");

    try {
      // Call Gemini API through backend
      const reply = await sendMessageToGemini(text.trim());

      const aiResponse = {
        role: "assistant",
        text: reply,
        timestamp: new Date().toISOString()
      };

      addMessage(currentConversationId, aiResponse);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        role: "assistant",
        text: `Sorry, I encountered an error: ${error.message || "Please try again."}`,
        timestamp: new Date().toISOString()
      };
      addMessage(currentConversationId, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    await sendMessage(input);
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSend();
    }
  };

  const exportChat = () => {
    const currentConv = getCurrentConversation();
    if (!currentConv) return;

    const chatText = currentConv.messages
      .map((msg) => `[${msg.role === "user" ? "You" : "Velora"}]: ${msg.text}`)
      .join("\n\n");

    const blob = new Blob([chatText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `velora-chat-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearChat = () => {

    if (window.confirm("Are you sure you want to clear the chat history?")) {
      clearAllConversations();
      createNewConversation();
    }
  };

  const copyMessage = async (text, index) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return {
    messages,
    input,
    setInput,
    isListening,
    loading,
    copiedIndex,
    handleSend,
    handleKeyDown,
    toggleListening,
    exportChat,
    clearChat,
    copyMessage,
    uploadedFile,
    setUploadedFile,
    handleFileUpload
  };
};