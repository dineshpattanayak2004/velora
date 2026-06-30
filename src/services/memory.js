import api from "./api";

export async function getMemoryStats() {
  const response = await api.get("/api/memories/stats");
  return response.data;
}

export async function getAllMemories() {
  const response = await api.get("/api/memories/all");
  return response.data;
}

export async function addFact(category, fact, metadata = null) {
  const response = await api.post("/api/memories/fact", {
    category,
    fact,
    metadata,
  });
  return response.data;
}

export async function getFactsByCategory(category) {
  const response = await api.get(`/api/memories/facts/${category}`);
  return response.data;
}

export async function searchMemories(query) {
  const response = await api.get(`/api/memories/search?query=${encodeURIComponent(query)}`);
  return response.data;
}

export async function addConversation(userMessage, aiResponse, context = null) {
  const response = await api.post("/api/memories/conversation", {
    user_message: userMessage,
    ai_response: aiResponse,
    context,
  });
  return response.data;
}

export async function setPreference(key, value) {
  const response = await api.post("/api/memories/preference", {
    key,
    value,
  });
  return response.data;
}

export async function getPreference(key) {
  const response = await api.get(`/api/memories/preference/${key}`);
  return response.data;
}

export async function addRelationship(entity1, entity2, relationshipType) {
  const response = await api.post("/api/memories/relationship", {
    entity1,
    entity2,
    relationship_type: relationshipType,
  });
  return response.data;
}

export async function getRelationships(entity) {
  const response = await api.get(`/api/memories/relationships/${entity}`);
  return response.data;
}

export async function clearMemories(category = null) {
  const response = await api.delete("/api/memories/clear", {
    params: category ? { category } : {},
  });
  return response.data;
}
