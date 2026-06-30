import { createContext, useContext, useState, useCallback } from "react";

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

const ChatContext = createContext();

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState(() => {
    const savedConversations = localStorage.getItem("velora-conversations");
    return savedConversations ? JSON.parse(savedConversations) : [];
  });
  const [currentConversationId, setCurrentConversationId] = useState(null);

  const saveConversations = useCallback((convs) => {
    localStorage.setItem("velora-conversations", JSON.stringify(convs));
  }, []);

  const updateConversations = useCallback((updated) => {
    setConversations(updated);
    saveConversations(updated);
  }, [saveConversations]);

  const createNewConversation = useCallback(() => {
    const newConversation = {
      id: generateId(),
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    updateConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversation.id);
    return newConversation;
  }, [conversations, updateConversations]);

  const loadConversation = useCallback((conversationId) => {
    setCurrentConversationId(conversationId);
  }, []);

  const deleteConversation = useCallback((conversationId) => {
    const updated = conversations.filter(c => c.id !== conversationId);
    updateConversations(updated);
    if (currentConversationId === conversationId) {
      setCurrentConversationId(updated.length > 0 ? updated[0].id : null);
    }
  }, [conversations, currentConversationId, updateConversations]);

  const addMessage = useCallback((conversationId, message) => {
    const updated = conversations.map(conv => {
      if (conv.id === conversationId) {
        const updatedMessages = [...conv.messages, message];
        const title = conv.messages.length === 0 && message.role === "user"
          ? message.text.slice(0, 30) + (message.text.length > 30 ? "..." : "")
          : conv.title;
        
        return {
          ...conv,
          title,
          messages: updatedMessages,
          updatedAt: new Date().toISOString()
        };
      }
      return conv;
    });
    
    updateConversations(updated);
  }, [conversations, updateConversations]);

  const updateMessage = useCallback((conversationId, messageIndex, updatedText) => {
    const updated = conversations.map(conv => {
      if (conv.id === conversationId) {
        const updatedMessages = [...conv.messages];
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          text: updatedText
        };
        return {
          ...conv,
          messages: updatedMessages,
          updatedAt: new Date().toISOString()
        };
      }
      return conv;
    });
    
    updateConversations(updated);
  }, [conversations, updateConversations]);

  const clearAllConversations = useCallback(() => {
    updateConversations([]);
    setCurrentConversationId(null);
  }, [updateConversations]);

  const getCurrentConversation = useCallback(() => {
    return conversations.find(c => c.id === currentConversationId);
  }, [conversations, currentConversationId]);

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversationId,
      createNewConversation,
      loadConversation,
      deleteConversation,
      addMessage,
      updateMessage,
      clearAllConversations,
      getCurrentConversation,
      setCurrentConversationId
    }}>
      {children}
    </ChatContext.Provider>
  );
};