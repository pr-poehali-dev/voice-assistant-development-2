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

// Callbacks для интеграции с Web Worker таймерами
let timerStartCallback: ((duration: number, label: string) => void) | null = null;
let timerCancelAllCallback: (() => void) | null = null;

// Callback для ИИ-запросов
let aiCallback: ((message: string) => Promise<string>) | null = null;

export const setTimerCallbacks = (
  onStart: (duration: number, label: string) => void,
  onCancelAll: () => void
) => {
  timerStartCallback = onStart;
  timerCancelAllCallback = onCancelAll;
};

export const setAICallback = (callback: (message: string) => Promise<string>) => {
  aiCallback = callback;
};

const commands: CommandPattern[] = [
  {
    patterns: [/включи музыку/i, /играй музыку/i, /запусти музыку/i, /поставь музыку/i, /вк музык/i, /музыка вк/i],
    action: "music_play",
    handler: (cmd) => {
      window.open("https://vk.com/audio", "_blank");
      return makeResult(cmd, "Открываю VK Музыку", "music_play");
    },
  },
  {
    patterns: [/включи (.+) на вк/i, /поставь (.+) на вк/i, /послушать (.+)/i],
    action: "music_search",
    handler: (cmd) => {
      const match = cmd.match(/(?:включи|поставь|послушать)\s+(.+?)(?:\s+на вк)?$/i);
      const query = match ? match[1] : cmd;
      window.open("https://vk.com/audio?q=" + encodeURIComponent(query), "_blank");
      return makeResult(cmd, "Ищу в VK Музыке: " + query, "music_search");
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
      const match = cmd.match(/(\d+)\s*(минут|секунд|мин|сек|час)/i);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        const isHours = /час/i.test(unit);
        const isMinutes = /минут|мин/i.test(unit);
        let ms: number;
        let label: string;
        if (isHours) {
          ms = value * 3600000;
          label = value + " ч.";
        } else if (isMinutes) {
          ms = value * 60000;
          label = value + " мин.";
        } else {
          ms = value * 1000;
          label = value + " сек.";
        }

        // Используем внешний обработчик таймера (Web Worker) если доступен
        if (timerStartCallback) {
          timerStartCallback(ms, label);
        } else {
          // Fallback на обычный setTimeout
          setTimeout(() => {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Ордо — Таймер", { body: "Таймер на " + label + " завершён!" });
            }
          }, ms);
        }
        return makeResult(cmd, "Таймер установлен на " + label + ". Работает в фоновом режиме", "timer_set");
      }
      return makeResult(cmd, "Скажите, на сколько минут или секунд поставить таймер", "timer_set", "info");
    },
  },
  {
    patterns: [/отмени таймер/i, /стоп таймер/i, /останови таймер/i, /убери таймер/i],
    action: "timer_cancel",
    handler: (cmd) => {
      if (timerCancelAllCallback) {
        timerCancelAllCallback();
        return makeResult(cmd, "Все таймеры отменены", "timer_cancel");
      }
      return makeResult(cmd, "Нет активных таймеров", "timer_cancel", "info");
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
    patterns: [/переведи (.+)/i, /перевод (.+)/i, /как будет (.+) по-английски/i, /как (.+) на английском/i],
    action: "translate",
    handler: (cmd) => {
      const match = cmd.match(/(?:переведи|перевод|как будет|как)\s+(.+?)(?:\s+по-английски|\s+на английском)?$/i);
      const text = match ? match[1] : cmd;
      window.open("https://translate.google.com/?sl=auto&tl=en&text=" + encodeURIComponent(text), "_blank");
      return makeResult(cmd, "Открываю перевод: " + text, "translate");
    },
  },
  {
    patterns: [/яркость (.+)/i, /сделай ярче/i, /сделай темнее/i, /увеличь яркость/i, /уменьши яркость/i],
    action: "brightness",
    handler: (cmd) => {
      const match = cmd.match(/(\d+)/);
      let level = 100;
      if (/темнее/i.test(cmd)) level = 60;
      else if (/ярче/i.test(cmd)) level = 100;
      else if (match) level = Math.min(100, Math.max(20, parseInt(match[1])));

      document.documentElement.style.filter = "brightness(" + (level / 100) + ")";
      return makeResult(cmd, "Яркость экрана: " + level + "%", "brightness");
    },
  },
  {
    patterns: [/курс (.+)/i, /курс доллара/i, /курс евро/i, /сколько стоит доллар/i, /сколько стоит евро/i],
    action: "exchange_rate",
    handler: (cmd) => {
      const query = cmd.replace(/курс/i, "").trim() || "доллар евро рубль";
      window.open("https://www.google.com/search?q=курс+" + encodeURIComponent(query), "_blank");
      return makeResult(cmd, "Открываю курс валют", "exchange_rate");
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

  // Если команда не распознана — отправляем в ИИ
  return makeResult(
    input.trim(),
    "__AI_QUERY__",
    "ai_query",
    "info"
  );
};

export const processAICommand = async (input: string): Promise<CommandResult> => {
  if (!aiCallback) {
    return makeResult(input, "ИИ не подключён. Попробуйте стандартные команды.", "ai_error", "error");
  }
  const response = await aiCallback(input);
  return makeResult(input, response, "ai_response", "success");
};

export const getAvailableCommands = (): string[] => [
  "Включи музыку (VK)",
  "Включи [песня] на VK",
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
  "Переведи [текст]",
  "Яркость 70%",
  "Курс доллара",
  "Открой карты",
  "Открой ВК",
  "Очисти историю",
  "Любой вопрос — ответит ИИ",
];