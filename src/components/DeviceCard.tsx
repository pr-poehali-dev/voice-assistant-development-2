import { useState } from "react";
import Icon from "@/components/ui/icon";

interface DeviceCardProps {
  name: string;
  icon: string;
  status: "online" | "offline" | "active";
  type: string;
  delay?: number;
}

const DeviceCard = ({ name, icon, status: initialStatus, type, delay = 0 }: DeviceCardProps) => {
  const [status, setStatus] = useState(initialStatus);
  const [showMenu, setShowMenu] = useState(false);

  const statusColors = {
    online: "bg-cyber-green/20 text-cyber-green border-cyber-green/30",
    offline: "bg-muted text-muted-foreground border-border",
    active: "bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/30",
  };

  const statusLabels = {
    online: "В сети",
    offline: "Не в сети",
    active: "Активно",
  };

  const toggleStatus = () => {
    if (status === "offline") {
      setStatus("online");
    } else if (status === "online") {
      setStatus("active");
    } else {
      setStatus("offline");
    }
    setShowMenu(false);
  };

  return (
    <div
      className="animate-fade-in-up opacity-0 group relative p-4 rounded-xl bg-card/50 border border-border hover:border-cyber-cyan/30 transition-all duration-300 hover:box-glow-cyan cursor-pointer"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
      onClick={() => setShowMenu(!showMenu)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-cyber-cyan/10 transition-colors">
          <Icon name={icon} size={20} className="text-foreground group-hover:text-cyber-cyan transition-colors" />
        </div>
        <span
          className={`text-[10px] font-display tracking-wider uppercase px-2 py-0.5 rounded-full border ${statusColors[status]}`}
        >
          {statusLabels[status]}
        </span>
      </div>
      <h3 className="font-body font-medium text-sm text-foreground">{name}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{type}</p>

      {showMenu && (
        <div className="absolute inset-0 rounded-xl bg-card/95 backdrop-blur-sm border border-cyber-cyan/30 p-3 flex flex-col justify-center gap-2 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); toggleStatus(); }}
            className="text-xs text-foreground hover:text-cyber-cyan transition-colors flex items-center gap-2"
          >
            <Icon name="Power" size={14} />
            {status === "offline" ? "Подключить" : "Изменить статус"}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <Icon name="X" size={14} />
            Закрыть
          </button>
        </div>
      )}
    </div>
  );
};

export default DeviceCard;
