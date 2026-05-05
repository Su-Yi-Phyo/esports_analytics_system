import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Activity, TrendingUp, TrendingDown, Sparkles, ArrowRight } from "lucide-react";
import { roles, type Role } from "@/data/players";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coach Dashboard — MLBB Decision System" },
      { name: "description", content: "Overview of player performance, rising stars and best lineup." },
    ],
  }),
  component: Dashboard,
});

const COLORS = ["#a855f7", "#06b6d4", "#22d3ee", "#f472b6", "#facc15", "#34d399", "#60a5fa", "#fb923c"];

type ApiPlayer = {
  id: number;
  player_id?: number;
  nickname: string;
  realName?: string;
  real_name?: string;
  role: Role;
  team?: string;
  team_name?: string;
  kda: number;
  gpm: number;
  winRate?: number;
  win_rate?: number;
  matchesPlayed?: number;
  matches_played?: number;
  avatar?: string;
};

type Match = {
  id: number;
  match_id?: number;
  matchDate?: string;
  match_date?: string;
};

function Dashboard() {
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [playerData, matchData] = await Promise.all([
        apiGet<ApiPlayer[]>("/api/players"),
        apiGet<Match[]>("/api/matches"),
      ]);

      const normalized = playerData.map((p, i) => ({
        ...p,
        id: Number(p.id ?? p.player_id),
        realName: p.realName ?? p.real_name ?? "",
        team: p.team ?? p.team_name ?? "Free Agent",
        kda: Number(p.kda ?? 0),
        gpm: Number(p.gpm ?? 0),
        winRate: Number(p.winRate ?? p.win_rate ?? 0),
        matchesPlayed: Number(p.matchesPlayed ?? p.matches_played ?? 0),
        avatar: p.avatar ?? COLORS[i % COLORS.length],
      }));

      setPlayers(normalized);
      setMatches(matchData);
      setLoading(false);
    };

    load();
  }, []);

  const ranked = useMemo(
    () => [...players].sort((a, b) => Number(b.kda) - Number(a.kda)),
    [players]
  );

  const rising = ranked
    .filter(p => Number(p.winRate ?? 0) >= 55)
    .slice(0, 3);

  const declining = [...players]
    .sort((a, b) => Number(a.winRate ?? 0) - Number(b.winRate ?? 0))
    .slice(0, 3);

  const bestLineup = roles
    .map(r => ranked.find(p => p.role === r))
    .filter(Boolean) as ApiPlayer[];

  const teamKDA =
    bestLineup.length > 0
      ? bestLineup.reduce((s, p) => s + Number(p.kda), 0) / bestLineup.length
      : 0;

  const trendData = Array.from({ length: 12 }, (_, i) => ({
    match: i + 1,
    avg: ranked.length
      ? +(ranked.slice(0, 10).reduce((s, p) => s + Number(p.kda), 0) / Math.min(10, ranked.length)).toFixed(2)
      : 0,
    top: ranked[0] ? +Number(ranked[0].kda).toFixed(2) : 0,
  }));

  const roleStats = roles.map(r => {
    const ps = players.filter(p => p.role === r);
    return {
      role: r,
      kda: ps.length ? +(ps.reduce((s, p) => s + Number(p.kda), 0) / ps.length).toFixed(2) : 0,
    };
  });

  if (loading) {
    return <div className="p-10 text-muted-foreground">Loading coach dashboard...</div>;
  }

  return (
    <div className="p-6 md:p-10 space-y-8 grid-bg">
      <header className="flex flex-wrap items-end justify-between gap-4 animate-float-up">
        <div>
          <div className="text-xs tracking-[0.4em] text-muted-foreground mb-2">// COMMAND CENTER</div>
          <h1 className="text-4xl md:text-5xl font-display font-black">
            <span className="text-gradient">COACH</span> DASHBOARD
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time analytics across {players.length} pro players 
          </p>
        </div>
        <Link to="/lineup" className="group inline-flex items-center gap-2 gradient-primary glow-primary px-6 py-3 rounded-lg font-bold uppercase tracking-wider text-sm">
          <Sparkles className="w-4 h-4" /> Build Lineup <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Players Tracked", value: players.length, icon: Activity, color: "text-primary" },
          { label: "Avg Team KDA", value: teamKDA.toFixed(2), icon: Sparkles, color: "text-cyan" },
          { label: "High Win Rate", value: players.filter(p => Number(p.winRate ?? 0) >= 55).length, icon: TrendingUp, color: "text-success" },
          { label: "Low Win Rate", value: players.filter(p => Number(p.winRate ?? 0) < 55).length, icon: TrendingDown, color: "text-danger" },
        ].map((s, i) => (
          <div key={s.label} className="glass rounded-xl p-5 relative overflow-hidden animate-float-up" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
                <div className="text-3xl font-display font-black mt-2">{s.value}</div>
              </div>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold">Performance Trend</h2>
              <p className="text-xs text-muted-foreground">SQL aggregate · top player vs top 10 average</p>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-primary" /> Top Player</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-cyan" /> Top 10 Avg</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <defs>
                <linearGradient id="grTop" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.7 0.27 305)" stopOpacity={1} />
                  <stop offset="100%" stopColor="oklch(0.7 0.27 305)" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <XAxis dataKey="match" stroke="oklch(0.6 0.04 280)" fontSize={10} />
              <YAxis stroke="oklch(0.6 0.04 280)" fontSize={10} />
              <Tooltip contentStyle={{ background: "oklch(0.21 0.05 280)", border: "1px solid oklch(0.7 0.27 305 / 0.4)", borderRadius: 8 }} />
              <Line type="monotone" dataKey="top" stroke="url(#grTop)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="avg" stroke="oklch(0.78 0.18 200)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold">Role KDA Avg</h2>
          <p className="text-xs text-muted-foreground mb-4">By position</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={roleStats}>
              <XAxis dataKey="role" stroke="oklch(0.6 0.04 280)" fontSize={10} />
              <YAxis stroke="oklch(0.6 0.04 280)" fontSize={10} />
              <Tooltip contentStyle={{ background: "oklch(0.21 0.05 280)", border: "1px solid oklch(0.7 0.27 305 / 0.4)", borderRadius: 8 }} />
              <Bar dataKey="kda" radius={[8, 8, 0, 0]} fill="oklch(0.7 0.27 305)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <RisingPanel title="Top Performing Players" players={rising} variant="rising" />
        <RisingPanel title="Needs Attention" players={declining} variant="declining" />

        <div className="glass rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-5" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-bold">Best Current Lineup</h2>
                <p className="text-xs text-muted-foreground">Auto-selected by KDA</p>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Team KDA</div>
                <div className="text-2xl font-display font-black text-gradient">{teamKDA.toFixed(2)}</div>
              </div>
            </div>
            <div className="space-y-2">
              {bestLineup.map(p => (
                <Link key={p.id} to="/players/$id" params={{ id: String(p.id) }} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 transition-colors">
                  <PlayerAvatar player={p} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold truncate">{p.nickname}</div>
                    <div className="text-[10px] text-muted-foreground">KDA {Number(p.kda).toFixed(2)}</div>
                  </div>
                  <RoleBadge role={p.role} />
                </Link>
              ))}
            </div>
            <Link to="/lineup" className="mt-4 inline-flex items-center gap-2 text-xs text-primary hover:text-cyan font-bold uppercase tracking-widest">
              Open Lineup Builder <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function RisingPanel({ title, players, variant }: { title: string; players: ApiPlayer[]; variant: "rising" | "declining" }) {
  const isRising = variant === "rising";

  return (
    <div className={`glass rounded-2xl p-6 relative overflow-hidden ${isRising ? "scan-line" : ""}`}>
      <h2 className="font-display text-lg font-bold mb-1">{title}</h2>
      <p className="text-xs text-muted-foreground mb-4">{isRising ? "Strong SQL performance metrics" : "Lower win-rate players"}</p>
      <div className="space-y-3">
        {players.map(p => {
          const delta = Number(p.winRate ?? 0);

          return (
            <Link
              key={p.id}
              to="/players/$id"
              params={{ id: String(p.id) }}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isRising
                  ? "border-success/20 hover:border-success/60 hover:glow-cyan"
                  : "border-danger/20 hover:border-danger/60 hover:glow-danger"
              }`}
            >
              <PlayerAvatar player={p} size={44} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{p.nickname}</div>
                <div className="text-[10px] text-muted-foreground">
                  KDA {Number(p.kda).toFixed(2)} · WR {Number(p.winRate ?? 0).toFixed(1)}%
                </div>
              </div>
              <div className={`text-sm font-display font-black ${isRising ? "text-success" : "text-danger"}`}>
                {delta.toFixed(1)}%
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function PlayerAvatar({ player, size = 48 }: { player: ApiPlayer; size?: number }) {
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