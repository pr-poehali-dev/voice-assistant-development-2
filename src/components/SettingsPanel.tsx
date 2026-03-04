import Icon from "@/components/ui/icon";
import useLocalStorage from "@/hooks/useLocalStorage";

interface OrdoSettings {
  voiceResponse: boolean;
  language: string;
  darkTheme: boolean;
  saveHistory: boolean;
  notifications: boolean;
  backgroundMode: boolean;
  wakeWordEnabled: boolean;
}

const defaultSettings: OrdoSettings = {
  voiceResponse: true,
  language: "ru-RU",
  darkTheme: true,
  saveHistory: true,
  notifications: false,
  backgroundMode: true,
  wakeWordEnabled: true,
};

const SettingsPanel = () => {
  const [settings, setSettings] = useLocalStorage<OrdoSettings>("ordo-settings", defaultSettings);

  const toggleSetting = (key: keyof OrdoSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const requestNotifications = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((perm) => {
        setSettings((prev) => ({ ...prev, notifications: perm === "granted" }));
      });
    }
  };

  const clearAllData = () => {
    if (confirm("Удалить всю историю команд и заметки?")) {
      localStorage.removeItem("ordo-history");
      localStorage.removeItem("ordo-notes");
      window.dispatchEvent(new CustomEvent("ordo-storage", { detail: { key: "ordo-history" } }));
    }
  };

  return (
    <div className="space-y-2">
      <div
        className="animate-fade-in-up opacity-0 flex items-center gap-4 p-3 rounded-lg bg-card/30 border border-border/50 hover:border-cyber-purple/30 transition-all cursor-pointer group"
        style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
        onClick={() => toggleSetting("voiceResponse")}
      >
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-cyber-purple/10 transition-colors shrink-0">
          <Icon name="Volume2" size={18} className="text-muted-foreground group-hover:text-cyber-purple transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Голосовой ответ</p>
          <p className="text-xs text-muted-foreground">Ордо озвучивает результат команды</p>
        </div>
        <div
          className={`w-10 h-5 rounded-full transition-colors relative ${
            settings.voiceResponse ? "bg-cyber-cyan/30" : "bg-secondary"
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
              settings.voiceResponse ? "left-[22px] bg-cyber-cyan" : "left-0.5 bg-muted-foreground"
            }`}
          />
        </div>
      </div>

      <div
        className="animate-fade-in-up opacity-0 flex items-center gap-4 p-3 rounded-lg bg-card/30 border border-border/50 hover:border-cyber-purple/30 transition-all cursor-pointer group"
        style={{ animationDelay: "80ms", animationFillMode: "forwards" }}
        onClick={() => toggleSetting("wakeWordEnabled")}
      >
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-cyber-purple/10 transition-colors shrink-0">
          <Icon name="Ear" size={18} className="text-muted-foreground group-hover:text-cyber-purple transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Голосовая активация</p>
          <p className="text-xs text-muted-foreground">Скажите «Ордо, внимание» для запуска</p>
        </div>
        <div
          className={`w-10 h-5 rounded-full transition-colors relative ${
            settings.wakeWordEnabled ? "bg-cyber-cyan/30" : "bg-secondary"
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
              settings.wakeWordEnabled ? "left-[22px] bg-cyber-cyan" : "left-0.5 bg-muted-foreground"
            }`}
          />
        </div>
      </div>

      <div
        className="animate-fade-in-up opacity-0 flex items-center gap-4 p-3 rounded-lg bg-card/30 border border-border/50 hover:border-cyber-purple/30 transition-all cursor-pointer group"
        style={{ animationDelay: "160ms", animationFillMode: "forwards" }}
        onClick={() => toggleSetting("saveHistory")}
      >
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-cyber-purple/10 transition-colors shrink-0">
          <Icon name="History" size={18} className="text-muted-foreground group-hover:text-cyber-purple transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Сохранять историю</p>
          <p className="text-xs text-muted-foreground">Запоминать выполненные команды</p>
        </div>
        <div
          className={`w-10 h-5 rounded-full transition-colors relative ${
            settings.saveHistory ? "bg-cyber-cyan/30" : "bg-secondary"
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
              settings.saveHistory ? "left-[22px] bg-cyber-cyan" : "left-0.5 bg-muted-foreground"
            }`}
          />
        </div>
      </div>

      <div
        className="animate-fade-in-up opacity-0 flex items-center gap-4 p-3 rounded-lg bg-card/30 border border-border/50 hover:border-cyber-purple/30 transition-all cursor-pointer group"
        style={{ animationDelay: "160ms", animationFillMode: "forwards" }}
        onClick={() => {
          requestNotifications();
          toggleSetting("notifications");
        }}
      >
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-cyber-purple/10 transition-colors shrink-0">
          <Icon name="Bell" size={18} className="text-muted-foreground group-hover:text-cyber-purple transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Уведомления</p>
          <p className="text-xs text-muted-foreground">Оповещения о таймерах и событиях</p>
        </div>
        <div
          className={`w-10 h-5 rounded-full transition-colors relative ${
            settings.notifications ? "bg-cyber-cyan/30" : "bg-secondary"
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
              settings.notifications ? "left-[22px] bg-cyber-cyan" : "left-0.5 bg-muted-foreground"
            }`}
          />
        </div>
      </div>

      <div
        className="animate-fade-in-up opacity-0 flex items-center gap-4 p-3 rounded-lg bg-card/30 border border-border/50 hover:border-cyber-purple/30 transition-all cursor-pointer group"
        style={{ animationDelay: "240ms", animationFillMode: "forwards" }}
        onClick={() => toggleSetting("backgroundMode")}
      >
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-cyber-purple/10 transition-colors shrink-0">
          <Icon name="Shield" size={18} className="text-muted-foreground group-hover:text-cyber-purple transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Фоновый режим</p>
          <p className="text-xs text-muted-foreground">Таймеры и задачи работают при свёрнутом браузере</p>
        </div>
        <div
          className={`w-10 h-5 rounded-full transition-colors relative ${
            settings.backgroundMode ? "bg-cyber-cyan/30" : "bg-secondary"
          }`}
        >
          <div
            className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
              settings.backgroundMode ? "left-[22px] bg-cyber-cyan" : "left-0.5 bg-muted-foreground"
            }`}
          />
        </div>
      </div>

      <div
        className="animate-fade-in-up opacity-0 flex items-center gap-4 p-3 rounded-lg bg-card/30 border border-border/50 hover:border-cyber-purple/30 transition-all cursor-pointer group"
        style={{ animationDelay: "320ms", animationFillMode: "forwards" }}
      >
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-cyber-purple/10 transition-colors shrink-0">
          <Icon name="Globe" size={18} className="text-muted-foreground group-hover:text-cyber-purple transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Язык</p>
          <p className="text-xs text-muted-foreground">Язык распознавания речи</p>
        </div>
        <span className="text-xs text-cyber-cyan font-display tracking-wider">RU</span>
      </div>

      <div
        className="animate-fade-in-up opacity-0 flex items-center gap-4 p-3 rounded-lg bg-card/30 border border-border/50 hover:border-destructive/30 transition-all cursor-pointer group"
        style={{ animationDelay: "400ms", animationFillMode: "forwards" }}
        onClick={clearAllData}
      >
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-destructive/10 transition-colors shrink-0">
          <Icon name="Trash2" size={18} className="text-muted-foreground group-hover:text-destructive transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Очистить данные</p>
          <p className="text-xs text-muted-foreground">Удалить историю команд и заметки</p>
        </div>
        <Icon name="ChevronRight" size={14} className="text-muted-foreground/30" />
      </div>

      <div
        className="animate-fade-in-up opacity-0 flex items-center gap-4 p-3 rounded-lg bg-card/30 border border-border/50 transition-all"
        style={{ animationDelay: "480ms", animationFillMode: "forwards" }}
      >
        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <Icon name="Info" size={18} className="text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">О приложении</p>
          <p className="text-xs text-muted-foreground">Ордо v2.0 — голосовой ассистент с ИИ. GPT-4o + Web Speech API + Wake Word</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;