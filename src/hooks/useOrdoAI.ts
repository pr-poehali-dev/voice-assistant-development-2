import { useState, useCallback, useRef } from "react";

const AI_URL = "https://functions.poehali.dev/b225489e-3925-485c-b5b6-fed3610c013e";

interface ChatEntry {
  user: string;
  assistant: string;
}

interface UseOrdoAIReturn {
  askAI: (message: string) => Promise<string>;
  isThinking: boolean;
  chatHistory: ChatEntry[];
  clearChat: () => void;
}

const useOrdoAI = (): UseOrdoAIReturn => {
  const [isThinking, setIsThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const askAI = useCallback(async (message: string): Promise<string> => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsThinking(true);

    try {
      const response = await fetch(AI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: chatHistory.slice(-6),
        }),
        signal: controller.signal,
      });

      const data = await response.json();
      const aiResponse = data.response || "Не удалось получить ответ";

      setChatHistory((prev) => [
        ...prev,
        { user: message, assistant: aiResponse },
      ]);

      return aiResponse;
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return "Запрос отменён";
      }
      return "Не удалось связаться с ИИ. Проверьте интернет.";
    } finally {
      setIsThinking(false);
      abortRef.current = null;
    }
  }, [chatHistory]);

  const clearChat = useCallback(() => {
    setChatHistory([]);
  }, []);

  return {
    askAI,
    isThinking,
    chatHistory,
    clearChat,
  };
};

export default useOrdoAI;
