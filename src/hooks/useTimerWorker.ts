import { useState, useEffect, useRef, useCallback } from "react";

export interface ActiveTimer {
  id: string;
  label: string;
  remaining: number;
}

interface UseTimerWorkerReturn {
  startTimer: (duration: number, label: string) => string;
  cancelTimer: (id: string) => void;
  activeTimers: ActiveTimer[];
  onTimerComplete: (callback: (id: string, label: string) => void) => void;
}

const WORKER_CODE = [
  "const activeTimers = new Map();",
  "self.onmessage = (e) => {",
  "  const { type, payload } = e.data;",
  "  switch (type) {",
  "    case 'START_TIMER': {",
  "      const { id, duration, label } = payload;",
  "      const startTime = Date.now();",
  "      const intervalId = setInterval(() => {",
  "        const elapsed = Date.now() - startTime;",
  "        const remaining = duration - elapsed;",
  "        if (remaining <= 0) {",
  "          clearInterval(intervalId);",
  "          activeTimers.delete(id);",
  "          self.postMessage({ type: 'TIMER_COMPLETE', payload: { id, label } });",
  "        } else {",
  "          self.postMessage({ type: 'TIMER_TICK', payload: { id, label, remaining } });",
  "        }",
  "      }, 1000);",
  "      activeTimers.set(id, { intervalId, data: { id, duration, label, startTime } });",
  "      self.postMessage({ type: 'TIMER_STARTED', payload: { id, label, duration } });",
  "      break;",
  "    }",
  "    case 'CANCEL_TIMER': {",
  "      const { id } = payload;",
  "      const timer = activeTimers.get(id);",
  "      if (timer) {",
  "        clearInterval(timer.intervalId);",
  "        activeTimers.delete(id);",
  "        self.postMessage({ type: 'TIMER_CANCELLED', payload: { id } });",
  "      }",
  "      break;",
  "    }",
  "  }",
  "};",
].join("\n");

function playTimerSound() {
  try {
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime + 0.2);
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime + 0.4);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.8);
  } catch {
    // fallback: без звука
  }
}

const useTimerWorker = (): UseTimerWorkerReturn => {
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const callbackRef = useRef<((id: string, label: string) => void) | null>(null);
  const counterRef = useRef(0);

  useEffect(() => {
    const blob = new Blob([WORKER_CODE], { type: "application/javascript" });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    worker.onmessage = (e: MessageEvent) => {
      const { type, payload } = e.data;

      switch (type) {
        case "TIMER_COMPLETE": {
          setActiveTimers((prev) => prev.filter((t) => t.id !== payload.id));

          // Отправляем уведомление
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Ордо — Таймер", {
              body: "Таймер на " + payload.label + " завершён!",
              icon: "/favicon.ico",
              tag: "timer-" + payload.id,
              requireInteraction: true,
            });
          }

          // Воспроизводим звук
          playTimerSound();

          // Вызываем callback
          if (callbackRef.current) {
            callbackRef.current(payload.id, payload.label);
          }
          break;
        }

        case "TIMER_TICK": {
          setActiveTimers((prev) => {
            const existing = prev.find((t) => t.id === payload.id);
            if (existing) {
              return prev.map((t) =>
                t.id === payload.id ? { ...t, remaining: payload.remaining } : t
              );
            }
            return [...prev, { id: payload.id, label: payload.label, remaining: payload.remaining }];
          });
          break;
        }

        case "TIMER_CANCELLED": {
          setActiveTimers((prev) => prev.filter((t) => t.id !== payload.id));
          break;
        }
      }
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };
  }, []);

  const startTimer = useCallback((duration: number, label: string): string => {
    const id = "timer-" + Date.now() + "-" + String(++counterRef.current);

    workerRef.current?.postMessage({
      type: "START_TIMER",
      payload: { id, duration, label },
    });

    return id;
  }, []);

  const cancelTimer = useCallback((id: string) => {
    workerRef.current?.postMessage({
      type: "CANCEL_TIMER",
      payload: { id },
    });
  }, []);

  const onTimerComplete = useCallback((callback: (id: string, label: string) => void) => {
    callbackRef.current = callback;
  }, []);

  return {
    startTimer,
    cancelTimer,
    activeTimers,
    onTimerComplete,
  };
};

export default useTimerWorker;
