import Icon from "@/components/ui/icon";

interface SettingItemProps {
  icon: string;
  label: string;
  description: string;
  value?: string;
  toggle?: boolean;
  enabled?: boolean;
  delay?: number;
}

const SettingItem = ({ icon, label, description, value, toggle, enabled = true, delay = 0 }: SettingItemProps) => (
  <div
    className="animate-fade-in-up opacity-0 flex items-center gap-4 p-3 rounded-lg bg-card/30 border border-border/50 hover:border-cyber-purple/30 transition-all cursor-pointer group"
    style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
  >
    <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-cyber-purple/10 transition-colors shrink-0">
      <Icon name={icon} size={18} className="text-muted-foreground group-hover:text-cyber-purple transition-colors" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    {toggle && (
      <div
        className={`w-10 h-5 rounded-full transition-colors relative ${
          enabled ? "bg-cyber-cyan/30" : "bg-secondary"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
            enabled ? "left-[22px] bg-cyber-cyan" : "left-0.5 bg-muted-foreground"
          }`}
        />
      </div>
    )}
    {value && (
      <span className="text-xs text-muted-foreground font-display tracking-wider">{value}</span>
    )}
  </div>
);

const SettingsPanel = () => {
  return (
    <div className="space-y-2">
      <SettingItem
        icon="Mic"
        label="Голосовая активация"
        description="Активация фразой «Ордо — внимание»"
        toggle
        enabled={true}
        delay={0}
      />
      <SettingItem
        icon="Volume2"
        label="Голос ответа"
        description="Выбор голоса ассистента"
        value="Алиса"
        delay={80}
      />
      <SettingItem
        icon="Globe"
        label="Язык"
        description="Язык распознавания речи"
        value="RU"
        delay={160}
      />
      <SettingItem
        icon="Moon"
        label="Тёмная тема"
        description="Кибер-интерфейс"
        toggle
        enabled={true}
        delay={240}
      />
      <SettingItem
        icon="Smartphone"
        label="Кроссплатформенность"
        description="Синхронизация Android и Windows"
        toggle
        enabled={true}
        delay={320}
      />
      <SettingItem
        icon="Shield"
        label="Приватность"
        description="Обработка данных на устройстве"
        toggle
        enabled={false}
        delay={400}
      />
    </div>
  );
};

export default SettingsPanel;
