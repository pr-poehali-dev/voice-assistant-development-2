import { useState } from "react";
import Icon from "@/components/ui/icon";
import VoiceOrb from "@/components/VoiceOrb";
import DeviceCard from "@/components/DeviceCard";
import CommandHistory from "@/components/CommandHistory";
import SettingsPanel from "@/components/SettingsPanel";
import SearchPanel from "@/components/SearchPanel";

type Tab = "home" | "devices" | "search" | "settings" | "history";

const devices = [
  { name: "Samsung Galaxy", icon: "Smartphone", status: "active" as const, type: "Android 14" },
  { name: "Desktop PC", icon: "Monitor", status: "online" as const, type: "Windows 11" },
  { name: "Наушники", icon: "Headphones", status: "online" as const, type: "Bluetooth" },
  { name: "Умная колонка", icon: "Speaker", status: "offline" as const, type: "Wi-Fi" },
  { name: "Планшет", icon: "Tablet", status: "online" as const, type: "Android 13" },
  { name: "ТВ Samsung", icon: "Tv", status: "offline" as const, type: "Smart TV" },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [isListening, setIsListening] = useState(false);

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: "home", icon: "Mic", label: "Ордо" },
    { id: "devices", icon: "Cpu", label: "Устройства" },
    { id: "search", icon: "Search", label: "Поиск" },
    { id: "settings", icon: "Settings", label: "Настройки" },
    { id: "history", icon: "Clock", label: "История" },
  ];

  return (
    <div className="min-h-screen bg-background grid-bg scanline relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyber-cyan/[0.02] blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-cyber-purple/[0.03] blur-[100px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-cyan/20 to-cyber-purple/20 border border-cyber-cyan/20 flex items-center justify-center">
            <Icon name="Zap" size={16} className="text-cyber-cyan" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-[0.2em] text-foreground">
              ОРДО
            </h1>
            <p className="text-[9px] font-display tracking-[0.3em] text-muted-foreground uppercase">
              голосовой ассистент
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border/50">
            <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
            <span className="text-[10px] font-display tracking-wider text-muted-foreground">ONLINE</span>
          </div>
          <button className="w-8 h-8 rounded-lg bg-card/50 border border-border/50 flex items-center justify-center hover:border-cyber-cyan/30 transition-colors">
            <Icon name="Bell" size={16} className="text-muted-foreground" />
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 pb-24 pt-6">
        {activeTab === "home" && (
          <div className="flex flex-col items-center">
            <div className="mt-8 md:mt-16 mb-10">
              <VoiceOrb
                isListening={isListening}
                onToggle={() => setIsListening(!isListening)}
              />
            </div>

            <div className="w-full space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-[10px] font-display tracking-[0.3em] text-muted-foreground uppercase">
                  Быстрые команды
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { icon: "Music", label: "Музыка", cmd: "Включи музыку" },
                  { icon: "Globe", label: "Браузер", cmd: "Открой браузер" },
                  { icon: "Video", label: "Видео", cmd: "Запусти YouTube" },
                  { icon: "MessageCircle", label: "Сообщения", cmd: "Читай чат" },
                ].map((item, i) => (
                  <button
                    key={item.label}
                    className="animate-fade-in-up opacity-0 flex flex-col items-center gap-2 p-4 rounded-xl bg-card/30 border border-border/50 hover:border-cyber-cyan/30 hover:bg-card/50 transition-all group"
                    style={{ animationDelay: `${400 + i * 100}ms`, animationFillMode: "forwards" }}
                  >
                    <Icon
                      name={item.icon}
                      size={22}
                      className="text-muted-foreground group-hover:text-cyber-cyan transition-colors"
                    />
                    <span className="text-xs text-foreground font-medium">{item.label}</span>
                    <span className="text-[9px] text-muted-foreground/50">«{item.cmd}»</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full mt-8 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-[10px] font-display tracking-[0.3em] text-muted-foreground uppercase">
                  Последние команды
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
              <CommandHistory />
            </div>
          </div>
        )}

        {activeTab === "devices" && (
          <div>
            <div className="mb-6">
              <h2 className="font-display text-lg font-bold tracking-wider text-foreground">
                Устройства
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Управление подключёнными устройствами
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {devices.map((device, i) => (
                <DeviceCard key={device.name} {...device} delay={i * 80} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "search" && (
          <div>
            <div className="mb-6">
              <h2 className="font-display text-lg font-bold tracking-wider text-foreground">
                Поиск
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Приложения и голосовые команды
              </p>
            </div>
            <SearchPanel />
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <div className="mb-6">
              <h2 className="font-display text-lg font-bold tracking-wider text-foreground">
                Настройки
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Параметры ассистента Ордо
              </p>
            </div>
            <SettingsPanel />
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <div className="mb-6">
              <h2 className="font-display text-lg font-bold tracking-wider text-foreground">
                История
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Все голосовые команды
              </p>
            </div>
            <CommandHistory />
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-background/80 backdrop-blur-xl border-t border-border/50">
          <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "text-cyber-cyan"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon name={tab.icon} size={20} />
                  {activeTab === tab.id && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyber-cyan" />
                  )}
                </div>
                <span
                  className={`text-[9px] tracking-wider ${
                    activeTab === tab.id ? "font-display" : ""
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Index;
