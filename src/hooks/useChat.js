import { useState, useCallback } from "react";
import { sendMessage } from "../services/gemini";

export default function useChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello Dinesh 👋 I am Velora. How can I help you today?"
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const send = useCallback(async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      role: "user",
      text: text.trim()
    };

    // Add user message immediately
    setMessages(prev => {
      console.log('Adding user message, total messages:', prev.length + 1);
      return [...prev, userMessage];
    });
    setLoading(true);

    try {
      const reply = await sendMessage(text);
      setRetryCount(0);

      // Add AI response
      setMessages(prev => {
        console.log('Adding AI response, total messages:', prev.length + 1);
        return [
          ...prev,
          {
            role: "assistant",
            text: reply
          }
        ];
      });

    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage = retryCount < 2
        ? `⚠️ Connection issue (Attempt ${retryCount + 1}/3). Retrying...`
        : "⚠️ Unable to connect. Please check:\n1. Backend is running\n2. API key is configured\n3. Internet is active";

      setRetryCount(prev => prev + 1);

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: errorMessage
        }
      ]);

    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  const resetChat = useCallback(() => {
    setMessages([
      {
        role: "assistant",
        text: "Hello Dinesh 👋 I am Velora. How can I help you today?"
      }
    ]);
    setRetryCount(0);
  }, []);

return {
messages,
send,
loading,
resetChat
};
}
