import { useEffect } from "react";
import Icon from "@/components/ui/icon";
import useLocalStorage from "@/hooks/useLocalStorage";
import { CommandResult } from "@/lib/commandEngine";

interface CommandHistoryProps {
  limit?: number;
}

const CommandHistory = ({ limit }: CommandHistoryProps) => {
  const [history] = useLocalStorage<CommandResult[]>("ordo-history", []);

  const displayed = limit ? history.slice(-limit).reverse() : [...history].reverse();

  if (displayed.length === 0) {
    return (
      <div className="text-center py-8">
        <Icon name="History" size={32} className="text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Пока нет команд</p>
        <p className="text-xs text-muted-foreground/50 mt-1">
          Нажмите на орб и произнесите команду
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayed.map((cmd, i) => {
        const time = new Date(cmd.timestamp).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={cmd.timestamp + i}
            className="animate-fade-in-up opacity-0 flex items-start gap-3 p-3 rounded-lg bg-card/30 border border-border/50 hover:border-border transition-colors group"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
          >
            <div className="mt-0.5">
              {cmd.status === "success" ? (
                <Icon name="CheckCircle" size={16} className="text-cyber-green" />
              ) : cmd.status === "error" ? (
                <Icon name="XCircle" size={16} className="text-destructive" />
              ) : (
                <Icon name="Info" size={16} className="text-cyber-cyan" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground font-medium truncate">
                «{cmd.command}»
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{cmd.response}</p>
            </div>
            <span className="text-[10px] text-muted-foreground/50 font-display tracking-wider shrink-0">
              {time}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default CommandHistory;
