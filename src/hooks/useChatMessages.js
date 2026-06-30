import { useState, useEffect, useRef } from "react";
import { useChat } from "../contexts/ChatContext";
import { sendMessage as sendMessageToGemini } from "../services/gemini";

// Extract text content from files on client-side
async function extractFileContent(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  // Text files
  const textExtensions = ["txt","md","csv","json","xml","html","css","js","jsx","ts","tsx","py","java","c","cpp","h","sql","yaml","yml","toml","ini","cfg","log","sh","bat","ps1"];
  if (textExtensions.includes(ext)) {
    return await file.text();
  }

  // PDF (basic extraction)
  if (ext === "pdf") {
    try {
      const text = await file.text();
      const match = text.match(/[\x20-\x7E\n\r\t]{10,}/g);
      if (match) return match.join("\n").substring(0, 50000);
    } catch {
      // PDF reading failed
    }
    return null;
  }

  // Images
  if (["png","jpg","jpeg","gif","bmp","webp","svg"].includes(ext)) {
    return `[Image: ${file.name}, Size: ${(file.size / 1024).toFixed(1)} KB]`;
  }

  // Word docs
  if (ext === "docx") {
    try {
      const text = await file.text();
      const match = text.match(/>([^<]{10,})</g);
      if (match) return match.map(m => m.replace(/^>/, "").replace(/<$/, "")).join("\n").substring(0, 50000);
    } catch {
      // DOCX failed
    }
    return `[Word Document: ${file.name}, Size: ${(file.size / 1024).toFixed(1)} KB]`;
  }

  // Binary formats
  if (["xlsx","xls","pptx","ppt"].includes(ext)) {
    return `[${file.type || "Document"}: ${file.name}, ${(file.size / 1024).toFixed(1)} KB]`;
  }

  return `[File: ${file.name}, Type: ${file.type || "Unknown"}, ${(file.size / 1024).toFixed(1)} KB]`;
}

function getFileTypeLabel(file) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const map = {
    pdf:"📄 PDF", txt:"📝 TXT", md:"📝 MD", csv:"📊 CSV", json:"📋 JSON",
    xml:"📋 XML", html:"🌐 HTML", css:"🎨 CSS", js:"⚡ JS", jsx:"⚡ JSX",
    ts:"⚡ TS", tsx:"⚡ TSX", py:"🐍 Python", java:"☕ Java",
    c:"⚙️ C", cpp:"⚙️ C++", sql:"🗄️ SQL", png:"🖼️ PNG",
    jpg:"🖼️ JPG", jpeg:"🖼️ JPEG", gif:"🖼️ GIF", webp:"🖼️ WebP",
    svg:"🖼️ SVG", docx:"📝 Word", yaml:"📋 YAML", yml:"📋 YAML",
    log:"📋 Log", sh:"💻 SH", bat:"💻 BAT"
  };
  return map[ext] || `📎 ${file.type || "File"}`;
}

export const useChatMessages = () => {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);
  const { currentConversationId, addMessage, getCurrentConversation, clearAllConversations, createNewConversation } = useChat();

  const messages = getCurrentConversation()?.messages || [];

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";
      recognitionRef.current.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) { alert("Speech recognition not supported."); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setUploadedFilePreview({
      name: file.name,
      size: file.size,
      type: getFileTypeLabel(file),
      ext: file.name.split(".").pop()?.toLowerCase() || ""
    });
    e.target.value = "";
  };

  const handleAnalyzeFile = async () => {
    if (!uploadedFile || !currentConversationId) return;
    setLoading(true);
    const fileName = uploadedFile.name;
    const fileTypeLabel = getFileTypeLabel(uploadedFile);
    addMessage(currentConversationId, {
      role: "user",
      text: `📎 ${fileTypeLabel}: ${fileName}`,
      timestamp: new Date().toISOString()
    });
    const fileData = uploadedFile;
    setUploadedFile(null);
    setUploadedFilePreview(null);
    try {
      const content = await extractFileContent(fileData);
      const q = content
        ? `Analyze this file "${fileName}" (${fileTypeLabel}). Content:\n---\n${content}\n---\nSummarize key info and insights.`
        : `File "${fileName}" (${fileTypeLabel}, ${(fileData.size/1024).toFixed(1)} KB). Could not extract text. What can you tell about this type?`;
      const reply = await sendMessageToGemini(q);
      addMessage(currentConversationId, { role:"assistant", text:reply, timestamp:new Date().toISOString() });
    } catch (e) {
      addMessage(currentConversationId, { role:"assistant", text:`❌ Could not analyze "${fileName}": ${e.message}`, timestamp:new Date().toISOString() });
    } finally { setLoading(false); }
  };

  const handleCancelFile = () => { setUploadedFile(null); setUploadedFilePreview(null); };

  const sendMessage = async (text) => {
    if (!text.trim() || !currentConversationId) return;
    setLoading(true);
    addMessage(currentConversationId, { role:"user", text:text.trim(), timestamp:new Date().toISOString() });
    setInput("");
    try {
      const reply = await sendMessageToGemini(text.trim());
      addMessage(currentConversationId, { role:"assistant", text:reply, timestamp:new Date().toISOString() });
    } catch (e) {
      addMessage(currentConversationId, { role:"assistant", text:`Error: ${e.message || "Please try again."}`, timestamp:new Date().toISOString() });
    } finally { setLoading(false); }
  };

  const handleSend = async () => {
    if (uploadedFile && !input.trim()) { await handleAnalyzeFile(); return; }
    if (uploadedFile && input.trim()) {
      setLoading(true);
      const fn = uploadedFile.name; const ft = getFileTypeLabel(uploadedFile);
      addMessage(currentConversationId, { role:"user", text:`📎 ${ft}: ${fn}\n\n${input.trim()}`, timestamp:new Date().toISOString() });
      const f = uploadedFile; const txt = input.trim();
      setUploadedFile(null); setUploadedFilePreview(null); setInput("");
      try {
        const c = await extractFileContent(f);
        const q = c ? `File "${fn}" (${ft}).\n${c}\n\nQuestion: ${txt}` : `File "${fn}" (${ft}). Question: ${txt}`;
        addMessage(currentConversationId, { role:"assistant", text:await sendMessageToGemini(q), timestamp:new Date().toISOString() });
      } catch (e) {
        addMessage(currentConversationId, { role:"assistant", text:`❌ Error: ${e.message}`, timestamp:new Date().toISOString() });
      } finally { setLoading(false); }
      return;
    }
    await sendMessage(input);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const exportChat = () => {
    const conv = getCurrentConversation();
    if (!conv) return;
    const text = conv.messages.map(m => `[${m.role === "user" ? "You" : "Velora"}]: ${m.text}`).join("\n\n");
    const blob = new Blob([text], { type:"text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `velora-${new Date().toISOString().split("T")[0]}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  const clearChat = () => {
    if (window.confirm("Clear chat history?")) { clearAllConversations(); createNewConversation(); }
  };

  const copyMessage = async (text, i) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(i); setTimeout(() => setCopiedIndex(null), 2000);
  };

  return {
    messages, input, setInput, isListening, loading, copiedIndex,
    uploadedFile, uploadedFilePreview,
    handleSend, handleKeyDown, toggleListening,
    exportChat, clearChat, copyMessage,
    setUploadedFile, handleFileUpload, handleAnalyzeFile, handleCancelFile
  };
};