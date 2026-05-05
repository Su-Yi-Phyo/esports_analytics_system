import type { Player } from "@/data/players";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function PlayerAvatar({ player, size = 48 }: { player: Player; size?: number }) {
  const initials = player.ign.split(" ").map(s => s[0]).join("").slice(0, 2);
  return (
    <div
      className="relative rounded-lg flex items-center justify-center font-display font-black shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${player.avatar}, oklch(0.3 0.15 290))`,
        fontSize: size * 0.35,
        boxShadow: `0 0 ${size / 3}px ${player.avatar}40`,
      }}
    >
      <span className="relative z-10 text-white drop-shadow">{initials}</span>
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
    </div>
  );
}

export function TrendBadge({ trend, size = "sm" }: { trend: Player["trend"]; size?: "sm" | "md" }) {
  const map = {
    Rising: { Icon: TrendingUp, cls: "text-success bg-success/10 border-success/30" },
    Stable: { Icon: Minus, cls: "text-cyan bg-cyan/10 border-cyan/30" },
    Declining: { Icon: TrendingDown, cls: "text-danger bg-danger/10 border-danger/30" },
  } as const;
  const { Icon, cls } = map[trend];
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls} ${size === "md" ? "text-xs px-3 py-1" : ""}`}>
      <Icon className="w-3 h-3" /> {trend}
    </span>
  );
}

export function RoleBadge({ role }: { role: Player["role"] }) {
  const colors: Record<string, string> = {
    EXP: "from-orange-500/30 to-red-500/30 text-orange-300",
    Jungle: "from-green-500/30 to-emerald-500/30 text-green-300",
    Mid: "from-purple-500/30 to-fuchsia-500/30 text-purple-300",
    Gold: "from-yellow-500/30 to-amber-500/30 text-yellow-300",
    Roam: "from-cyan-500/30 to-blue-500/30 text-cyan-300",
  };
  return (
    <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r border border-border/50 ${colors[role]}`}>
      {role}
    </span>
  );
}
