import axios from "axios";

const resolveApiUrl = () => {
  // 1. VITE_API_URL env var set hai toh use karo (PythonAnywhere/Render URL)
  const envUrl = import.meta.env?.VITE_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl.replace(/\/+$/, "");
  }

  // 2. Vercel production: API same domain pe hai (serverless functions)
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return ""; // Same origin - no prefix needed
  }

  // 3. Local development: backend chal raha hai port 8001 pe
  return "http://localhost:8001";
};

const API_URL = resolveApiUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

export default api;

export const sendMessage = async (message, agentId = 1) => {
  const response = await api.post("/api/chat", { message, agent_id: agentId });
  return response.data;
};

export const sendFileMessage = async (file, message) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("message", message);

  const response = await api.post("/api/analyze-file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getSystemStats = async () => {
  const response = await api.get("/api/system-stats");
  return response.data;
};

export const getMemoryStats = async () => {
  const response = await api.get("/api/memories/stats");
  return response.data;
};

export const getAllMemories = async () => {
  const response = await api.get("/api/memories/all");
  return response.data;
};

export const addFact = async (category, fact, metadata = null) => {
  const response = await api.post("/api/memories/fact", { category, fact, metadata });
  return response.data;
};

export const getFactsByCategory = async (category) => {
  const response = await api.get(`/api/memories/facts/${category}`);
  return response.data;
};

export const searchMemories = async (query) => {
  const response = await api.get(`/api/memories/search?query=${encodeURIComponent(query)}`);
  return response.data;
};

export const addConversation = async (userMessage, aiResponse, context = null) => {
  const response = await api.post("/api/memories/conversation", {
    user_message: userMessage,
    ai_response: aiResponse,
    context
  });
  return response.data;
};

export const setPreference = async (key, value) => {
  const response = await api.post("/api/memories/preference", { key, value });
  return response.data;
};

export const getPreference = async (key) => {
  const response = await api.get(`/api/memories/preference/${key}`);
  return response.data;
};

export const clearMemories = async (category = null) => {
  const response = await api.delete("/api/memories/clear", {
    params: category ? { category } : {}
  });
  return response.data;
};