import { useState } from "react";

interface VoiceOrbProps {
  isListening: boolean;
  onToggle: () => void;
}

const VoiceOrb = ({ isListening, onToggle }: VoiceOrbProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group cursor-pointer"
      >
        <div
          className={`absolute inset-0 rounded-full transition-all duration-700 ${
            isListening
              ? "bg-cyber-cyan/20 scale-150 animate-pulse-orb"
              : "bg-cyber-purple/10 scale-100"
          }`}
        />
        <div
          className={`absolute inset-[-20px] rounded-full transition-all duration-700 ${
            isListening
              ? "bg-cyber-cyan/5 scale-[2]"
              : "bg-transparent scale-100"
          }`}
        />

        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center">
          <div
            className={`absolute inset-0 rounded-full transition-all duration-500 ${
              isListening
                ? "bg-gradient-to-br from-cyber-cyan/30 via-cyber-blue/20 to-cyber-purple/30 box-glow-cyan"
                : "bg-gradient-to-br from-cyber-purple/20 via-cyber-blue/10 to-cyber-cyan/20 box-glow-purple"
            }`}
            style={{
              border: `1px solid ${
                isListening
                  ? "hsl(180 100% 50% / 0.4)"
                  : "hsl(270 100% 65% / 0.3)"
              }`,
            }}
          />

          <div
            className={`absolute inset-2 rounded-full transition-all duration-500 ${
              isListening
                ? "bg-gradient-to-br from-cyber-cyan/10 to-transparent"
                : "bg-gradient-to-br from-cyber-purple/10 to-transparent"
            }`}
          />

          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center gap-[3px]">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-cyber-cyan/80"
                  style={{
                    animation: `wave 0.8s ease-in-out ${i * 0.1}s infinite`,
                    height: "20%",
                  }}
                />
              ))}
            </div>
          )}

          {!isListening && (
            <div className="relative z-10 flex flex-col items-center gap-1">
              <div className="w-6 h-10 rounded-full border-2 border-cyber-purple/60 flex items-start justify-center pt-2">
                <div className="w-2 h-2 rounded-full bg-cyber-purple/80" />
              </div>
            </div>
          )}

          <div
            className={`absolute inset-0 rounded-full animate-rotate-slow ${
              isListening ? "opacity-60" : "opacity-30"
            }`}
            style={{
              background: `conic-gradient(from 0deg, transparent, ${
                isListening
                  ? "hsl(180 100% 50% / 0.3)"
                  : "hsl(270 100% 65% / 0.2)"
              }, transparent)`,
            }}
          />
        </div>
      </button>

      <div className="text-center">
        <p
          className={`font-display text-sm tracking-[0.3em] uppercase transition-all duration-500 ${
            isListening
              ? "text-cyber-cyan text-glow-cyan"
              : "text-muted-foreground"
          }`}
        >
          {isListening ? "Слушаю..." : "Нажмите для активации"}
        </p>
        {!isListening && (
          <p className="text-xs text-muted-foreground/50 mt-2 font-body">
            или скажите «Ордо — внимание»
          </p>
        )}
      </div>
    </div>
  );
};

export default VoiceOrb;
