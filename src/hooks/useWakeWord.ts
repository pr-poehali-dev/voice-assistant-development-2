import { useState, useEffect, useRef, useCallback } from "react";

interface UseWakeWordReturn {
  isWakeListening: boolean;
  startWakeWordListener: () => void;
  stopWakeWordListener: () => void;
  wakeWordDetected: boolean;
  resetWakeWord: () => void;
  isSupported: boolean;
}

const WAKE_PHRASES = [
  "ордо внимание",
  "ордо",
  "орда внимание",
  "орда",
  "ордо слушай",
  "ордо привет",
];

const useWakeWord = (lang: string = "ru-RU", enabled: boolean = true): UseWakeWordReturn => {
  const [isWakeListening, setIsWakeListening] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const stopWakeWordListener = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
    setIsWakeListening(false);
  }, []);

  const startWakeWordListener = useCallback(() => {
    if (!isSupported || !enabled) return;

    stopWakeWordListener();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      setIsWakeListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        for (let j = 0; j < result.length; j++) {
          const text = result[j].transcript.toLowerCase().trim();
          const detected = WAKE_PHRASES.some((phrase) => text.includes(phrase));
          if (detected) {
            setWakeWordDetected(true);
            // Останавливаем фоновое прослушивание — главное прослушивание возьмёт управление
            try { recognition.stop(); } catch { /* ignore */ }
            return;
          }
        }
      }
    };

    recognition.onerror = () => {
      // Перезапускаем при ошибке (кроме not-allowed)
    };

    recognition.onend = () => {
      setIsWakeListening(false);
      // Автоматически перезапускаем через 500мс если не было wake word
      if (enabled && !wakeWordDetected) {
        restartTimeoutRef.current = setTimeout(() => {
          if (enabled && recognitionRef.current === recognition) {
            startWakeWordListener();
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      // Может быть уже запущен
    }
  }, [isSupported, enabled, lang, stopWakeWordListener, wakeWordDetected]);

  const resetWakeWord = useCallback(() => {
    setWakeWordDetected(false);
  }, []);

  useEffect(() => {
    return () => {
      stopWakeWordListener();
    };
  }, [stopWakeWordListener]);

  return {
    isWakeListening,
    startWakeWordListener,
    stopWakeWordListener,
    wakeWordDetected,
    resetWakeWord,
    isSupported,
  };
};

export default useWakeWord;
