import { useState } from "react";
import Icon from "@/components/ui/icon";
import { processCommand, getAvailableCommands, CommandResult } from "@/lib/commandEngine";
import useLocalStorage from "@/hooks/useLocalStorage";

interface AppItem {
  name: string;
  icon: string;
  category: string;
  command: string;
  url?: string;
}

const apps: AppItem[] = [
  { name: "VK Музыка", icon: "Music", category: "Музыка", command: "Включи музыку", url: "https://vk.com/audio" },
  { name: "YouTube", icon: "Play", category: "Видео", command: "Запусти YouTube", url: "https://www.youtube.com" },
  { name: "Telegram", icon: "Send", category: "Мессенджер", command: "Открой Телеграм", url: "https://web.telegram.org" },
  { name: "Google", icon: "Globe", category: "Браузер", command: "Открой браузер", url: "https://www.google.com" },
  { name: "Google Карты", icon: "Map", category: "Навигация", command: "Открой карты", url: "https://maps.google.com" },
  { name: "ВКонтакте", icon: "Users", category: "Соцсети", command: "Открой ВК", url: "https://vk.com" },
  { name: "Переводчик", icon: "Languages", category: "Утилиты", command: "Переведи привет", url: "https://translate.google.com" },
  { name: "Погода", icon: "CloudSun", category: "Информация", command: "Погода" },
];

const SearchPanel = () => {
  const [query, setQuery] = useState("");
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [history, setHistory] = useLocalStorage<CommandResult[]>("ordo-history", []);

  const availableCommands = getAvailableCommands();

  const filteredApps = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(query.toLowerCase()) ||
      app.category.toLowerCase().includes(query.toLowerCase()) ||
      app.command.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCommands = query
    ? availableCommands.filter((cmd) => cmd.toLowerCase().includes(query.toLowerCase()))
    : [];

  const executeCommand = (command: string) => {
    const result = processCommand(command);
    setHistory((prev) => [...prev, result]);
    setLastResult(result.response);
    setTimeout(() => setLastResult(null), 3000);
  };

  const openApp = (app: AppItem) => {
    if (app.url) {
      window.open(app.url, "_blank");
      const result: CommandResult = {
        command: `Открыть ${app.name}`,
        response: `Открываю ${app.name}`,
        action: "app_open",
        status: "success",
        timestamp: Date.now(),
      };
      setHistory((prev) => [...prev, result]);
      setLastResult(result.response);
      setTimeout(() => setLastResult(null), 3000);
    } else {
      executeCommand(app.command);
    }
  };

  return (
    <div className="space-y-4">
      {lastResult && (
        <div className="p-3 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30 text-sm text-cyber-cyan animate-fade-in-up">
          {lastResult}
        </div>
      )}

      <div className="relative">
        <Icon
          name="Search"
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              executeCommand(query.trim());
              setQuery("");
            }
          }}
          placeholder="Поиск или введите команду..."
          className="w-full pl-10 pr-4 py-2.5 bg-card/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-cyber-cyan/40 transition-all font-body"
        />
      </div>

      {query && filteredCommands.length > 0 && (
        <div className="space-y-1">
          <p className="text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase px-1">
            Команды
          </p>
          {filteredCommands.slice(0, 5).map((cmd, i) => (
            <button
              key={cmd}
              onClick={() => {
                executeCommand(cmd);
                setQuery("");
              }}
              className="animate-fade-in-up opacity-0 w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-card/50 transition-colors text-left group"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "forwards" }}
            >
              <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 flex items-center justify-center">
                <Icon name="Terminal" size={14} className="text-cyber-cyan" />
              </div>
              <span className="text-sm text-foreground">{cmd}</span>
              <Icon name="ArrowRight" size={14} className="text-muted-foreground/30 ml-auto group-hover:text-cyber-cyan transition-colors" />
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        <p className="text-[10px] font-display tracking-[0.2em] text-muted-foreground uppercase px-1">
          {query ? "Приложения" : "Быстрый доступ"}
        </p>
        {filteredApps.map((app, i) => (
          <button
            key={app.name}
            onClick={() => openApp(app)}
            className="animate-fade-in-up opacity-0 w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-card/50 transition-colors group text-left"
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: "forwards" }}
          >
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-cyber-cyan/10 transition-colors">
              <Icon name={app.icon} size={16} className="text-muted-foreground group-hover:text-cyber-cyan transition-colors" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{app.name}</p>
              <p className="text-[10px] text-muted-foreground">{app.category}</p>
            </div>
            <span className="text-[9px] font-display tracking-wider text-muted-foreground/40 uppercase hidden md:block">
              «{app.command}»
            </span>
            <Icon name="ExternalLink" size={14} className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
          </button>
        ))}
      </div>

      {query && filteredApps.length === 0 && filteredCommands.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-2">Нет результатов для «{query}»</p>
          <button
            onClick={() => {
              executeCommand(query);
              setQuery("");
            }}
            className="text-sm text-cyber-cyan hover:underline"
          >
            Выполнить как команду
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchPanel;