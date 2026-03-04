import { useState } from "react";
import Icon from "@/components/ui/icon";

interface AppItem {
  name: string;
  icon: string;
  category: string;
  canControl: boolean;
}

const apps: AppItem[] = [
  { name: "YouTube", icon: "Play", category: "Видео", canControl: true },
  { name: "Telegram", icon: "Send", category: "Мессенджер", canControl: true },
  { name: "Spotify", icon: "Music", category: "Музыка", canControl: true },
  { name: "Chrome", icon: "Globe", category: "Браузер", canControl: true },
  { name: "Камера", icon: "Camera", category: "Система", canControl: true },
  { name: "Калькулятор", icon: "Calculator", category: "Утилиты", canControl: false },
  { name: "Файлы", icon: "FolderOpen", category: "Система", canControl: true },
  { name: "Настройки", icon: "Settings", category: "Система", canControl: true },
  { name: "Карты", icon: "Map", category: "Навигация", canControl: true },
  { name: "Заметки", icon: "StickyNote", category: "Утилиты", canControl: false },
];

const SearchPanel = () => {
  const [query, setQuery] = useState("");

  const filtered = apps.filter(
    (app) =>
      app.name.toLowerCase().includes(query.toLowerCase()) ||
      app.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
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
          placeholder="Поиск приложений и команд..."
          className="w-full pl-10 pr-4 py-2.5 bg-card/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-cyber-cyan/40 focus:box-glow-cyan transition-all font-body"
        />
      </div>

      <div className="space-y-1.5">
        {filtered.map((app, i) => (
          <div
            key={app.name}
            className="animate-fade-in-up opacity-0 flex items-center gap-3 p-2.5 rounded-lg hover:bg-card/50 transition-colors cursor-pointer group"
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: "forwards" }}
          >
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-cyber-cyan/10 transition-colors">
              <Icon name={app.icon} size={16} className="text-muted-foreground group-hover:text-cyber-cyan transition-colors" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{app.name}</p>
              <p className="text-[10px] text-muted-foreground">{app.category}</p>
            </div>
            {app.canControl && (
              <span className="text-[9px] font-display tracking-wider text-cyber-cyan/60 uppercase">
                Управляемо
              </span>
            )}
            <Icon name="ChevronRight" size={14} className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <Icon name="SearchX" size={32} className="text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Ничего не найдено</p>
        </div>
      )}
    </div>
  );
};

export default SearchPanel;
