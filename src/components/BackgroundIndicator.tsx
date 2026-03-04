import Icon from "@/components/ui/icon";

interface BackgroundIndicatorProps {
  isBackground: boolean;
  isWakeLockActive: boolean;
  activeTimersCount: number;
}

const BackgroundIndicator = ({ isBackground, isWakeLockActive, activeTimersCount }: BackgroundIndicatorProps) => {
  if (!isWakeLockActive && activeTimersCount === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/50 border border-cyber-cyan/20">
      {isWakeLockActive && (
        <div className="flex items-center gap-1">
          <Icon name="Shield" size={10} className="text-cyber-green" />
          <span className="text-[9px] font-display tracking-wider text-cyber-green">BG</span>
        </div>
      )}
      {activeTimersCount > 0 && (
        <div className="flex items-center gap-1">
          <Icon name="Timer" size={10} className="text-cyber-cyan animate-pulse" />
          <span className="text-[9px] font-display tracking-wider text-cyber-cyan">
            {activeTimersCount}
          </span>
        </div>
      )}
    </div>
  );
};

export default BackgroundIndicator;
