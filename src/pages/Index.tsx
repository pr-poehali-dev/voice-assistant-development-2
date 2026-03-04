import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import VoiceOrb from "@/components/VoiceOrb";
import DeviceCard from "@/components/DeviceCard";
import CommandHistory from "@/components/CommandHistory";
import SettingsPanel from "@/components/SettingsPanel";
import SearchPanel from "@/components/SearchPanel";
import ActiveTimers from "@/components/ActiveTimers";
import BackgroundIndicator from "@/components/BackgroundIndicator";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";
import useSpeechSynthesis from "@/hooks/useSpeechSynthesis";
import useLocalStorage from "@/hooks/useLocalStorage";
import useTimerWorker from "@/hooks/useTimerWorker";
import useBackgroundMode from "@/hooks/useBackgroundMode";
import useOrdoAI from "@/hooks/useOrdoAI";
import useWakeWord from "@/hooks/useWakeWord";
import { processCommand, processAICommand, setTimerCallbacks, setAICallback, CommandResult } from "@/lib/commandEngine";

type Tab = "home" | "devices" | "search" | "settings" | "history";

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

const devices = [
  { name: "Это устройство", icon: "Monitor", status: "active" as const, type: navigator.userAgent.includes("Android") ? "Android" : navigator.userAgent.includes("Win") ? "Windows" : "Браузер" },
  { name: "Микрофон", icon: "Mic", status: "online" as const, type: "Web Speech API" },
  { name: "ИИ-модуль", icon: "Brain", status: "online" as const, type: "GPT-4o" },
  { name: "Динамик", icon: "Volume2", status: "online" as const, type: "Speech Synthesis" },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [lastResponse, setLastResponse] = useState("");
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [settings] = useLocalStorage<OrdoSettings>("ordo-settings", defaultSettings);
  const [history, setHistory] = useLocalStorage<CommandResult[]>("ordo-history", []);

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    isSupported,
    error,
  } = useSpeechRecognition(settings.language);

  const { speak } = useSpeechSynthesis(settings.language);
  const { askAI, isThinking } = useOrdoAI();

  // Web Worker таймеры
  const { startTimer, cancelTimer, activeTimers, onTimerComplete } = useTimerWorker();

  // Фоновый режим
  const {
    isBackground,
    isWakeLockActive,
    enableWakeLock,
    isWakeLockSupported,
  } = useBackgroundMode(settings.backgroundMode);

  // Wake word — «Ордо, внимание»
  const {
    isWakeListening,
    startWakeWordListener,
    stopWakeWordListener,
    wakeWordDetected,
    resetWakeWord,
  } = useWakeWord(settings.language, settings.wakeWordEnabled);

  // Регистрируем AI callback
  useEffect(() => {
    setAICallback(askAI);
  }, [askAI]);

  // Регистрируем timer callbacks
  useEffect(() => {
    setTimerCallbacks(
      (duration: number, label: string) => {
        startTimer(duration, label);
      },
      () => {
        activeTimers.forEach((t) => cancelTimer(t.id));
      }
    );
  }, [startTimer, cancelTimer, activeTimers]);

  // Timer complete callback
  useEffect(() => {
    onTimerComplete((_id: string, label: string) => {
      const response = "Таймер на " + label + " завершён!";
      setLastResponse(response);
      if (settings.voiceResponse) speak(response);
      if (settings.saveHistory) {
        setHistory((prev) => [...prev, {
          command: "Таймер " + label,
          response,
          action: "timer_complete",
          status: "success",
          timestamp: Date.now(),
        }]);
      }
      setTimeout(() => setLastResponse(""), 5000);
    });
  }, [onTimerComplete, settings.voiceResponse, settings.saveHistory, speak, setHistory]);

  // Wake Lock
  useEffect(() => {
    if (settings.backgroundMode && isWakeLockSupported) enableWakeLock();
  }, [settings.backgroundMode, isWakeLockSupported, enableWakeLock]);

  // Notifications
  useEffect(() => {
    if (settings.backgroundMode && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [settings.backgroundMode]);

  // Запуск wake word listener когда не слушаем основную команду
  useEffect(() => {
    if (settings.wakeWordEnabled && !isListening && !isAIProcessing) {
      startWakeWordListener();
    } else {
      stopWakeWordListener();
    }
  }, [settings.wakeWordEnabled, isListening, isAIProcessing, startWakeWordListener, stopWakeWordListener]);

  // Реагируем на wake word
  useEffect(() => {
    if (wakeWordDetected) {
      resetWakeWord();
      stopWakeWordListener();
      setLastResponse("Слушаю вас!");
      if (settings.voiceResponse) speak("Слушаю!");
      setTimeout(() => {
        startListening();
      }, 300);
    }
  }, [wakeWordDetected, resetWakeWord, stopWakeWordListener, startListening, settings.voiceResponse, speak]);

  const executeCommand = useCallback(
    async (text: string) => {
      const result = processCommand(text);

      // Если команда не распознана — отправляем в ИИ
      if (result.response === "__AI_QUERY__") {
        setIsAIProcessing(true);
        setLastResponse("Думаю...");

        const aiResult = await processAICommand(text);

        if (settings.saveHistory) {
          setHistory((prev) => [...prev, aiResult]);
        }
        setLastResponse(aiResult.response);
        if (settings.voiceResponse) speak(aiResult.response);
        setIsAIProcessing(false);
        setTimeout(() => setLastResponse(""), 8000);
        return;
      }

      if (settings.saveHistory) {
        setHistory((prev) => [...prev, result]);
      }
      setLastResponse(result.response);
      if (settings.voiceResponse) speak(result.response);
      setTimeout(() => setLastResponse(""), 5000);
    },
    [settings.voiceResponse, settings.saveHistory, speak, setHistory]
  );

  useEffect(() => {
    if (transcript && !isListening) {
      executeCommand(transcript);
    }
  }, [transcript, isListening, executeCommand]);

  const handleOrbToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      stopWakeWordListener();
      setLastResponse("");
      startListening();
    }
  };

  const handleQuickCommand = (cmd: string) => {
    executeCommand(cmd);
  };

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: "home", icon: "Mic", label: "Ордо" },
    { id: "devices", icon: "Cpu", label: "Модули" },
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
              {isThinking || isAIProcessing ? "ии думает..." : isWakeListening ? "жду «ордо, внимание»" : "голосовой ассистент"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BackgroundIndicator
            isBackground={isBackground}
            isWakeLockActive={isWakeLockActive}
            activeTimersCount={activeTimers.length}
          />
          {isWakeListening && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyber-purple/10 border border-cyber-purple/20">
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-purple animate-pulse" />
              <span className="text-[9px] font-display tracking-wider text-cyber-purple">WAKE</span>
            </div>
          )}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-border/50">
            <div className={`w-1.5 h-1.5 rounded-full ${isSupported ? "bg-cyber-green animate-pulse" : "bg-destructive"}`} />
            <span className="text-[10px] font-display tracking-wider text-muted-foreground">
              {isSupported ? (isListening ? "LISTENING" : isAIProcessing ? "AI" : "READY") : "NO MIC"}
            </span>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setActiveTab("history")}
              className="relative w-8 h-8 rounded-lg bg-card/50 border border-border/50 flex items-center justify-center hover:border-cyber-cyan/30 transition-colors"
            >
              <Icon name="Bell" size={16} className="text-muted-foreground" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-cyber-cyan text-[8px] text-background font-bold flex items-center justify-center">
                {history.length > 99 ? "99" : history.length}
              </div>
            </button>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 pb-24 pt-6">
        {activeTab === "home" && (
          <div className="flex flex-col items-center">
            {!isSupported && (
              <div className="w-full mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                Ваш браузер не поддерживает распознавание речи. Используйте Google Chrome
              </div>
            )}

            <div className="mt-4 md:mt-10 mb-10">
              <VoiceOrb
                isListening={isListening}
                onToggle={handleOrbToggle}
                transcript={transcript}
                interimTranscript={interimTranscript}
                error={error}
                lastResponse={isAIProcessing ? "Думаю..." : lastResponse}
              />
            </div>

            {activeTimers.length > 0 && (
              <div className="w-full mb-6">
                <ActiveTimers timers={activeTimers} onCancel={cancelTimer} />
              </div>
            )}

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
                  { icon: "Music", label: "VK Музыка", cmd: "Включи музыку" },
                  { icon: "Globe", label: "Браузер", cmd: "Открой браузер" },
                  { icon: "Play", label: "YouTube", cmd: "Запусти YouTube" },
                  { icon: "Send", label: "Telegram", cmd: "Читай чат" },
                  { icon: "Clock", label: "Время", cmd: "Который час" },
                  { icon: "Timer", label: "Таймер", cmd: "Таймер 5 минут" },
                  { icon: "Languages", label: "Перевод", cmd: "Переведи привет" },
                  { icon: "Brain", label: "Спроси ИИ", cmd: "Расскажи интересный факт" },
                ].map((item, i) => (
                  <button
                    key={item.label}
                    onClick={() => handleQuickCommand(item.cmd)}
                    className="animate-fade-in-up opacity-0 flex flex-col items-center gap-2 p-4 rounded-xl bg-card/30 border border-border/50 hover:border-cyber-cyan/30 hover:bg-card/50 transition-all group active:scale-95"
                    style={{ animationDelay: `${200 + i * 60}ms`, animationFillMode: "forwards" }}
                  >
                    <Icon
                      name={item.icon}
                      size={22}
                      className="text-muted-foreground group-hover:text-cyber-cyan transition-colors"
                    />
                    <span className="text-xs text-foreground font-medium">{item.label}</span>
                    <span className="text-[9px] text-muted-foreground/50 hidden md:block">{"\u00AB" + item.cmd + "\u00BB"}</span>
                  </button>
                ))}
              </div>
            </div>

            {history.length > 0 && (
              <div className="w-full mt-8 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  <span className="text-[10px] font-display tracking-[0.3em] text-muted-foreground uppercase">
                    Последние команды
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>
                <CommandHistory limit={3} />
              </div>
            )}
          </div>
        )}

        {activeTab === "devices" && (
          <div>
            <div className="mb-6">
              <h2 className="font-display text-lg font-bold tracking-wider text-foreground">
                Модули
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Компоненты ассистента Ордо
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {devices.map((device, i) => (
                <DeviceCard key={device.name} {...device} delay={i * 80} />
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-card/30 border border-border/50">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="Brain" size={18} className="text-cyber-cyan" />
                <h3 className="text-sm font-medium text-foreground">ИИ-модуль (GPT-4o)</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Если Ордо не знает стандартную команду, он автоматически спрашивает ИИ и отвечает умно на любой вопрос.
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Web Worker (таймеры)</span>
                  <span className="text-cyber-green font-display tracking-wider">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Wake Lock (экран)</span>
                  <span className={isWakeLockActive ? "text-cyber-green font-display tracking-wider" : "text-muted-foreground/50 font-display tracking-wider"}>
                    {isWakeLockActive ? "ACTIVE" : isWakeLockSupported ? "STANDBY" : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Wake Word</span>
                  <span className={isWakeListening ? "text-cyber-purple font-display tracking-wider" : "text-muted-foreground/50 font-display tracking-wider"}>
                    {isWakeListening ? "LISTENING" : settings.wakeWordEnabled ? "STANDBY" : "OFF"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Notifications</span>
                  <span className={"Notification" in window && Notification.permission === "granted" ? "text-cyber-green font-display tracking-wider" : "text-yellow-500 font-display tracking-wider"}>
                    {"Notification" in window ? Notification.permission.toUpperCase() : "N/A"}
                  </span>
                </div>
              </div>
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
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold tracking-wider text-foreground">
                  История
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {history.length > 0 ? history.length + " команд выполнено" : "Все голосовые команды"}
                </p>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    if (confirm("Очистить историю?")) {
                      setHistory([]);
                    }
                  }}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                >
                  <Icon name="Trash2" size={12} />
                  Очистить
                </button>
              )}
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
                <span className="text-[9px] font-display tracking-wider uppercase">
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
