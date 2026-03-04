import Icon from "@/components/ui/icon";

interface Command {
  id: number;
  text: string;
  time: string;
  status: "success" | "error" | "pending";
  response: string;
}

const commands: Command[] = [
  { id: 1, text: "Открой YouTube", time: "12:34", status: "success", response: "Открываю YouTube в браузере" },
  { id: 2, text: "Включи музыку", time: "12:32", status: "success", response: "Запускаю плейлист «Избранное»" },
  { id: 3, text: "Громкость 50%", time: "12:30", status: "success", response: "Громкость установлена на 50%" },
  { id: 4, text: "Отправь сообщение Алексу", time: "12:28", status: "error", response: "Контакт не найден" },
  { id: 5, text: "Покажи погоду", time: "12:25", status: "success", response: "Москва: −3°C, облачно" },
];

const CommandHistory = () => {
  return (
    <div className="space-y-2">
      {commands.map((cmd, i) => (
        <div
          key={cmd.id}
          className="animate-fade-in-up opacity-0 flex items-start gap-3 p-3 rounded-lg bg-card/30 border border-border/50 hover:border-border transition-colors group"
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
        >
          <div className="mt-0.5">
            {cmd.status === "success" ? (
              <Icon name="CheckCircle" size={16} className="text-cyber-green" />
            ) : cmd.status === "error" ? (
              <Icon name="XCircle" size={16} className="text-destructive" />
            ) : (
              <Icon name="Loader2" size={16} className="text-cyber-cyan animate-spin" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-medium truncate">«{cmd.text}»</p>
            <p className="text-xs text-muted-foreground mt-0.5">{cmd.response}</p>
          </div>
          <span className="text-[10px] text-muted-foreground/50 font-display tracking-wider shrink-0">
            {cmd.time}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CommandHistory;
