import Icon from "@/components/ui/icon";
import { ActiveTimer } from "@/hooks/useTimerWorker";

interface ActiveTimersProps {
  timers: ActiveTimer[];
  onCancel: (id: string) => void;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return String(hours) + ":" + String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }
  return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

const ActiveTimers = ({ timers, onCancel }: ActiveTimersProps) => {
  if (timers.length === 0) return null;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent" />
        <span className="text-[10px] font-display tracking-[0.3em] text-cyber-cyan uppercase flex items-center gap-1.5">
          <Icon name="Timer" size={10} className="animate-pulse" />
          Активные таймеры
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent" />
      </div>

      {timers.map((timer) => (
        <div
          key={timer.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20 animate-fade-in-up"
        >
          <div className="w-9 h-9 rounded-lg bg-cyber-cyan/10 flex items-center justify-center shrink-0">
            <Icon name="Clock" size={18} className="text-cyber-cyan animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{timer.label}</p>
            <p className="text-xs text-muted-foreground">Работает в фоне</p>
          </div>

          <div className="text-right flex items-center gap-2">
            <span className="font-mono text-lg font-bold text-cyber-cyan tabular-nums">
              {formatRemaining(timer.remaining)}
            </span>
            <button
              onClick={() => onCancel(timer.id)}
              className="w-7 h-7 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center hover:bg-destructive/20 transition-colors"
              title="Отменить таймер"
            >
              <Icon name="X" size={12} className="text-destructive" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActiveTimers;
