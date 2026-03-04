// Web Worker для надёжных фоновых таймеров
// Работает даже когда вкладка в фоне или экран выключен

interface TimerData {
  id: string;
  duration: number; // ms
  label: string;
  startTime: number;
}

const activeTimers = new Map<string, { intervalId: ReturnType<typeof setInterval>; data: TimerData }>();

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data;

  switch (type) {
    case "START_TIMER": {
      const { id, duration, label } = payload as TimerData;
      const startTime = Date.now();

      // Проверяем каждую секунду, не истёк ли таймер
      const intervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = duration - elapsed;

        if (remaining <= 0) {
          clearInterval(intervalId);
          activeTimers.delete(id);

          self.postMessage({
            type: "TIMER_COMPLETE",
            payload: { id, label },
          });
        } else {
          // Отправляем обновление оставшегося времени
          self.postMessage({
            type: "TIMER_TICK",
            payload: { id, label, remaining },
          });
        }
      }, 1000);

      activeTimers.set(id, {
        intervalId,
        data: { id, duration, label, startTime },
      });

      self.postMessage({
        type: "TIMER_STARTED",
        payload: { id, label, duration },
      });
      break;
    }

    case "CANCEL_TIMER": {
      const { id } = payload;
      const timer = activeTimers.get(id);
      if (timer) {
        clearInterval(timer.intervalId);
        activeTimers.delete(id);
        self.postMessage({
          type: "TIMER_CANCELLED",
          payload: { id },
        });
      }
      break;
    }

    case "GET_ACTIVE_TIMERS": {
      const timers = Array.from(activeTimers.values()).map(({ data }) => ({
        id: data.id,
        label: data.label,
        remaining: data.duration - (Date.now() - data.startTime),
      }));
      self.postMessage({
        type: "ACTIVE_TIMERS",
        payload: timers,
      });
      break;
    }

    case "PING": {
      self.postMessage({ type: "PONG" });
      break;
    }
  }
};

export default null;
