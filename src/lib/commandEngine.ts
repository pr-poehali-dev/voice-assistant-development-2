export interface CommandResult {
  command: string;
  response: string;
  action: string;
  status: "success" | "error" | "info";
  timestamp: number;
}

interface CommandPattern {
  patterns: RegExp[];
  action: string;
  handler: (match: string) => CommandResult;
}

const makeResult = (command: string, response: string, action: string, status: CommandResult["status"] = "success"): CommandResult => ({
  command,
  response,
  action,
  status,
  timestamp: Date.now(),
});

const commands: CommandPattern[] = [
  {
    patterns: [/включи музыку/i, /играй музыку/i, /запусти музыку/i, /поставь музыку/i],
    action: "music_play",
    handler: (cmd) => {
      window.open("https://music.youtube.com", "_blank");
      return makeResult(cmd, "Открываю YouTube Music", "music_play");
    },
  },
  {
    patterns: [/открой браузер/i, /запусти браузер/i, /открой гугл/i, /открой google/i],
    action: "browser_open",
    handler: (cmd) => {
      window.open("https://www.google.com", "_blank");
      return makeResult(cmd, "Открываю Google", "browser_open");
    },
  },
  {
    patterns: [/запусти youtube/i, /открой youtube/i, /включи youtube/i, /открой ютуб/i, /запусти ютуб/i, /включи ютуб/i],
    action: "youtube_open",
    handler: (cmd) => {
      window.open("https://www.youtube.com", "_blank");
      return makeResult(cmd, "Открываю YouTube", "youtube_open");
    },
  },
  {
    patterns: [/открой телеграм/i, /запусти телеграм/i, /открой telegram/i],
    action: "telegram_open",
    handler: (cmd) => {
      window.open("https://web.telegram.org", "_blank");
      return makeResult(cmd, "Открываю Telegram Web", "telegram_open");
    },
  },
  {
    patterns: [/который час/i, /сколько времени/i, /какое время/i, /текущее время/i],
    action: "time_check",
    handler: (cmd) => {
      const now = new Date();
      const time = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
      return makeResult(cmd, `Сейчас ${time}`, "time_check");
    },
  },
  {
    patterns: [/какой сегодня день/i, /какая сегодня дата/i, /сегодняшняя дата/i, /какое сегодня число/i],
    action: "date_check",
    handler: (cmd) => {
      const now = new Date();
      const date = now.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      return makeResult(cmd, `Сегодня ${date}`, "date_check");
    },
  },
  {
    patterns: [/открой камеру/i, /запусти камеру/i, /включи камеру/i],
    action: "camera_open",
    handler: (cmd) => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          stream.getTracks().forEach((t) => t.stop());
        })
        .catch(() => {});
      return makeResult(cmd, "Камера активирована. Доступ к камере запрошен", "camera_open");
    },
  },
  {
    patterns: [/открой карт/i, /покажи карт/i, /запусти карт/i, /навигац/i],
    action: "maps_open",
    handler: (cmd) => {
      window.open("https://maps.google.com", "_blank");
      return makeResult(cmd, "Открываю Google Карты", "maps_open");
    },
  },
  {
    patterns: [/поиск (.+)/i, /найди (.+)/i, /загугли (.+)/i, /ищи (.+)/i],
    action: "web_search",
    handler: (cmd) => {
      const match = cmd.match(/(?:поиск|найди|загугли|ищи)\s+(.+)/i);
      const query = match ? match[1] : cmd;
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
      return makeResult(cmd, `Ищу в Google: "${query}"`, "web_search");
    },
  },
  {
    patterns: [/погода/i],
    action: "weather_check",
    handler: (cmd) => {
      window.open("https://www.google.com/search?q=погода+сейчас", "_blank");
      return makeResult(cmd, "Открываю прогноз погоды", "weather_check");
    },
  },
  {
    patterns: [/калькулятор/i, /посчитай/i],
    action: "calculator",
    handler: (cmd) => {
      const match = cmd.match(/посчитай\s+(.+)/i);
      if (match) {
        try {
          const expr = match[1]
            .replace(/плюс/gi, "+")
            .replace(/минус/gi, "-")
            .replace(/умножить на/gi, "*")
            .replace(/разделить на/gi, "/")
            .replace(/на/gi, "*")
            .replace(/[^\d+\-*/().]/g, "");
          const result = Function(`"use strict"; return (${expr})`)();
          return makeResult(cmd, `Результат: ${result}`, "calculator");
        } catch {
          return makeResult(cmd, "Не удалось вычислить. Попробуйте сказать иначе", "calculator", "error");
        }
      }
      window.open("https://www.google.com/search?q=калькулятор", "_blank");
      return makeResult(cmd, "Открываю калькулятор", "calculator");
    },
  },
  {
    patterns: [/заметка (.+)/i, /запомни (.+)/i, /запиши (.+)/i],
    action: "note_save",
    handler: (cmd) => {
      const match = cmd.match(/(?:заметка|запомни|запиши)\s+(.+)/i);
      const note = match ? match[1] : cmd;
      const notes = JSON.parse(localStorage.getItem("ordo-notes") || "[]");
      notes.push({ text: note, date: new Date().toISOString() });
      localStorage.setItem("ordo-notes", JSON.stringify(notes));
      return makeResult(cmd, `Записал: "${note}"`, "note_save");
    },
  },
  {
    patterns: [/покажи заметки/i, /мои заметки/i, /прочитай заметки/i],
    action: "notes_show",
    handler: (cmd) => {
      const notes = JSON.parse(localStorage.getItem("ordo-notes") || "[]");
      if (notes.length === 0) {
        return makeResult(cmd, "Заметок пока нет. Скажите «Запиши» и текст заметки", "notes_show", "info");
      }
      const last3 = notes.slice(-3).map((n: { text: string }) => n.text).join(", ");
      return makeResult(cmd, `Последние заметки: ${last3}`, "notes_show");
    },
  },
  {
    patterns: [/таймер (.+)/i, /поставь таймер/i, /засеки (.+)/i],
    action: "timer_set",
    handler: (cmd) => {
      const match = cmd.match(/(\d+)\s*(минут|секунд|мин|сек)/i);
      if (match) {
        const value = parseInt(match[1]);
        const isMinutes = /минут|мин/i.test(match[2]);
        const ms = isMinutes ? value * 60000 : value * 1000;
        const label = isMinutes ? `${value} мин.` : `${value} сек.`;
        setTimeout(() => {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Ордо — Таймер", { body: `Таймер на ${label} завершён!` });
          }
          alert(`⏰ Таймер на ${label} завершён!`);
        }, ms);
        return makeResult(cmd, `Таймер установлен на ${label}`, "timer_set");
      }
      return makeResult(cmd, "Скажите, на сколько минут или секунд поставить таймер", "timer_set", "info");
    },
  },
  {
    patterns: [/привет/i, /здравствуй/i, /хай/i, /хэлло/i, /hello/i],
    action: "greeting",
    handler: (cmd) => {
      const greetings = ["Привет! Чем могу помочь?", "Здравствуйте! Слушаю вас", "Привет! Готов к работе"];
      return makeResult(cmd, greetings[Math.floor(Math.random() * greetings.length)], "greeting");
    },
  },
  {
    patterns: [/как тебя зовут/i, /кто ты/i, /что ты умеешь/i, /что ты можешь/i],
    action: "about",
    handler: (cmd) => {
      return makeResult(
        cmd,
        "Я Ордо — голосовой ассистент. Могу открывать сайты, искать в Google, ставить таймеры, сохранять заметки, говорить время и дату. Скажите команду!",
        "about"
      );
    },
  },
  {
    patterns: [/очисти историю/i, /удали историю/i, /сброс истории/i],
    action: "clear_history",
    handler: (cmd) => {
      localStorage.removeItem("ordo-history");
      window.dispatchEvent(new CustomEvent("ordo-storage", { detail: { key: "ordo-history" } }));
      return makeResult(cmd, "История команд очищена", "clear_history");
    },
  },
  {
    patterns: [/читай чат/i, /открой чат/i, /мои сообщения/i],
    action: "chat_open",
    handler: (cmd) => {
      window.open("https://web.telegram.org", "_blank");
      return makeResult(cmd, "Открываю Telegram для чтения сообщений", "chat_open");
    },
  },
  {
    patterns: [/открой вк/i, /открой вконтакте/i, /запусти вк/i],
    action: "vk_open",
    handler: (cmd) => {
      window.open("https://vk.com", "_blank");
      return makeResult(cmd, "Открываю ВКонтакте", "vk_open");
    },
  },
  {
    patterns: [/стоп/i, /хватит/i, /замолчи/i, /тихо/i],
    action: "stop",
    handler: (cmd) => {
      window.speechSynthesis.cancel();
      return makeResult(cmd, "Окей, молчу", "stop");
    },
  },
];

export const processCommand = (input: string): CommandResult => {
  const trimmed = input.trim().toLowerCase();

  for (const cmd of commands) {
    for (const pattern of cmd.patterns) {
      if (pattern.test(trimmed)) {
        return cmd.handler(input.trim());
      }
    }
  }

  return makeResult(
    input.trim(),
    `Не понял команду. Попробуйте: «Включи музыку», «Найди...», «Который час», «Заметка...»`,
    "unknown",
    "info"
  );
};

export const getAvailableCommands = (): string[] => [
  "Включи музыку",
  "Открой браузер",
  "Запусти YouTube",
  "Открой Телеграм",
  "Который час",
  "Какая сегодня дата",
  "Найди [запрос]",
  "Погода",
  "Калькулятор / Посчитай",
  "Заметка [текст]",
  "Покажи заметки",
  "Таймер 5 минут",
  "Открой камеру",
  "Открой карты",
  "Открой ВК",
  "Очисти историю",
  "Привет / Кто ты",
];
