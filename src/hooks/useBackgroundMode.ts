import { useState, useEffect, useRef, useCallback } from "react";

interface BackgroundModeState {
  isBackground: boolean;
  isWakeLockActive: boolean;
  backgroundSince: number | null;
}

interface UseBackgroundModeReturn {
  isBackground: boolean;
  isWakeLockActive: boolean;
  backgroundSince: number | null;
  enableWakeLock: () => Promise<void>;
  disableWakeLock: () => void;
  isWakeLockSupported: boolean;
}

const useBackgroundMode = (enabled: boolean = true): UseBackgroundModeReturn => {
  const [state, setState] = useState<BackgroundModeState>({
    isBackground: false,
    isWakeLockActive: false,
    backgroundSince: null,
  });

  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const isWakeLockSupported = typeof navigator !== "undefined" && "wakeLock" in navigator;

  // Запрос Wake Lock для предотвращения засыпания экрана
  const enableWakeLock = useCallback(async () => {
    if (!isWakeLockSupported || !enabled) return;

    try {
      wakeLockRef.current = await navigator.wakeLock.request("screen");
      setState((prev) => ({ ...prev, isWakeLockActive: true }));

      wakeLockRef.current.addEventListener("release", () => {
        setState((prev) => ({ ...prev, isWakeLockActive: false }));
      });
    } catch (err) {
      console.log("Wake Lock не удалось активировать:", err);
    }
  }, [isWakeLockSupported, enabled]);

  // Освобождение Wake Lock
  const disableWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      setState((prev) => ({ ...prev, isWakeLockActive: false }));
    }
  }, []);

  // Отслеживание видимости страницы (Page Visibility API)
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      const isHidden = document.hidden;

      setState((prev) => ({
        ...prev,
        isBackground: isHidden,
        backgroundSince: isHidden ? Date.now() : null,
      }));

      // Переактивируем Wake Lock при возврате на вкладку
      if (!isHidden && isWakeLockSupported && wakeLockRef.current === null) {
        enableWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, isWakeLockSupported, enableWakeLock]);

  // Запускаем Keep-alive ping чтобы браузер не убивал вкладку
  useEffect(() => {
    if (!enabled || !state.isBackground) return;

    // Периодический "пинг" через BroadcastChannel для поддержания активности
    const keepAliveInterval = setInterval(() => {
      // Минимальная активность чтобы браузер не замораживал вкладку
      const timestamp = Date.now();
      try {
        localStorage.setItem("ordo-keepalive", String(timestamp));
      } catch {
        // ignore
      }
    }, 10000); // каждые 10 секунд

    return () => {
      clearInterval(keepAliveInterval);
    };
  }, [enabled, state.isBackground]);

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      disableWakeLock();
    };
  }, [disableWakeLock]);

  return {
    isBackground: state.isBackground,
    isWakeLockActive: state.isWakeLockActive,
    backgroundSince: state.backgroundSince,
    enableWakeLock,
    disableWakeLock,
    isWakeLockSupported,
  };
};

export default useBackgroundMode;
