import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { roles, type Role } from "@/data/players";
import { Crown, Medal, Award } from "lucide-react";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Player Leaderboard — MLBB Coach" },
      { name: "description", content: "Pro player rankings" },
    ],
  }),
  component: Leaderboard,
});

const COLORS = ["#a855f7", "#06b6d4", "#22d3ee", "#f472b6", "#facc15", "#34d399", "#60a5fa", "#fb923c"];

type LeaderboardPlayer = {
  rank?: number;
  role_rank?: number;
  global_rank?: number;
  id: number;
  player_id?: number;
  nickname: string;
  role: Role;
  nationality?: string;
  team?: string;
  kda: number;
  gpm: number;
  winRate?: number;
  win_rate?: number;
  matchesPlayed?: number;
  matches_played?: number;
  score: number;
  avatar?: string;
};

function Leaderboard() {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [filter, setFilter] = useState<Role | "ALL">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint =
      filter === "ALL"
        ? "/api/leaderboard"
        : `/api/leaderboard/role?role=${encodeURIComponent(filter)}`;

    setLoading(true);
    apiGet<LeaderboardPlayer[]>(endpoint)
    .then(data => {
      const filteredData =
        filter === "ALL"
          ? data
          : data.filter(p => String(p.role).trim().toLowerCase() === filter.toLowerCase());

      setPlayers(
        filteredData.map((p, i) => ({
          ...p,
          id: Number(p.id ?? p.player_id),
          rank: filter === "ALL" ? Number(p.rank) : Number(p.role_rank),
          kda: Number(p.kda ?? 0),
          gpm: Number(p.gpm ?? 0),
          winRate: Number(p.winRate ?? p.win_rate ?? 0),
          score: Number(p.score ?? 0),
          avatar: p.avatar ?? COLORS[i % COLORS.length],
        }))
      );
    })
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) {
    return <div className="p-10 text-muted-foreground">Loading leaderboard...</div>;
  }

  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="animate-float-up">
        <div className="text-xs tracking-[0.4em] text-muted-foreground mb-2">// RANKINGS</div>
        <h1 className="text-4xl md:text-5xl font-display font-black">
          PLAYER <span className="text-gradient">LEADERBOARD</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          {filter === "ALL"
            ? `Global SQL DENSE_RANK by performance score · ${players.length} players`
            : `${filter} role-based SQL DENSE_RANK · ${players.length} players`}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["ALL", ...roles] as const).map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${
              filter === r
                ? "gradient-primary text-primary-foreground border-transparent glow-primary"
                : "glass border-border/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {players.map((p, i) => (
          <Link
            key={p.id}
            to="/players/$id"
            params={{ id: String(p.id) }}
            className="group glass rounded-2xl p-5 relative overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:glow-primary animate-float-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            {Number(p.rank) <= 3 && (
              <div
                className="absolute top-0 right-0 w-32 h-32 -translate-y-12 translate-x-12 rounded-full opacity-30 blur-2xl"
                style={{
                  background:
                    Number(p.rank) === 1 ? "gold" :
                    Number(p.rank) === 2 ? "silver" :
                    "#cd7f32",
                }}
              />
            )}

            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <RankBadge rank={Number(p.rank)} />
                <TrendBadge score={p.score} />
              </div>

              <div className="flex items-center gap-3">
                <PlayerAvatar player={p} size={56} />

                <div className="min-w-0 flex-1">
                  <div className="font-display font-bold text-lg truncate">{p.nickname}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {p.team ?? "Free Agent"} · Score {Number(p.score).toFixed(3)}
                  </div>
                  <div className="mt-1">
                    <RoleBadge role={p.role} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/50">
                <Stat label="KDA" value={Number(p.kda).toFixed(1)} highlight />
                <Stat label="GPM" value={Math.round(Number(p.gpm))} />
                <Stat label="WIN" value={`${Number(p.winRate ?? p.win_rate ?? 0).toFixed(1)}%`} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Badge color="from-yellow-400 to-amber-600 text-black" Icon={Crown} text="TOP 1" />;
  if (rank === 2) return <Badge color="from-gray-300 to-gray-500 text-black" Icon={Medal} text="TOP 2" />;
  if (rank === 3) return <Badge color="from-amber-700 to-orange-900 text-white" Icon={Award} text="TOP 3" />;

  return <span className="text-xs font-display font-black text-muted-foreground">#{rank}</span>;
}

function Badge({ color, Icon, text }: { color: string; Icon: any; text: string }) {
  return (
    <span className={`inline-flex items-center gap-1 bg-gradient-to-r ${color} px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-lg`}>
      <Icon className="w-3 h-3" /> {text}
    </span>
  );
}

function PlayerAvatar({ player, size = 48 }: { player: LeaderboardPlayer; size?: number }) {
  const initials = player.nickname.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();
  const avatar = player.avatar ?? COLORS[0];

  return (
    <div
      className="relative rounded-lg flex items-center justify-center font-display font-black shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${avatar}, oklch(0.3 0.15 290))`,
        fontSize: size * 0.35,
        boxShadow: `0 0 ${size / 3}px ${avatar}40`,
      }}
    >
      <span className="relative z-10 text-white drop-shadow">{initials}</span>
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/40">
      {role}
    </span>
  );
}

function TrendBadge({ score }: { score: number }) {
  return (
    <span className="inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan bg-cyan/10 border-cyan/30">
      SCORE {Number(score).toFixed(2)}
    </span>
  );
}

function Stat({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[9px] text-muted-foreground uppercase tracking-widest">{label}</div>
      <div className={`text-sm font-display font-bold ${highlight ? "text-gradient" : ""}`}>
        {value}
      </div>
    </div>
  );
}