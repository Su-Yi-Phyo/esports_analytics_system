import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { ArrowLeft, Swords } from "lucide-react";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/players/$id")({
  component: PlayerDetail,
});

type RecentMatch = {
  matchId?: number;
  match_id?: number;
  matchDate?: string;
  match_date?: string;
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;
  kda: number;
  result: string;
};

type ApiPlayer = {
  id: number;
  nickname: string;
  realName?: string;
  real_name?: string;
  role: string;
  team?: string;
  team_name?: string;
  kda: number;
  gpm: number;
  winRate?: number;
  win_rate?: number;
  recentMatches?: RecentMatch[];
};

function PlayerDetail() {
  const { id } = Route.useParams();
  const [p, setP] = useState<ApiPlayer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<ApiPlayer>(`/api/players/${id}`)
      .then(setP)
      .finally(() => setLoading(false));
  }, [id]);

  const matches = p?.recentMatches ?? [];

  const data = useMemo(
    () =>
      matches.map((m, i) => ({
        match: i + 1,
        kda: Number(m.kda),
      })),
    [matches]
  );

  const avg =
    data.length > 0
      ? data.reduce((s, x) => s + x.kda, 0) / data.length
      : Number(p?.kda ?? 0);

  const delta =
    data.length >= 2
      ? data[data.length - 1].kda - data[0].kda
      : 0;

  const trend = delta > 0 ? "Rising" : delta < 0 ? "Declining" : "Stable";

  if (loading) return <div className="p-10 text-muted-foreground">Loading player...</div>;
  if (!p) return <div className="p-10">Player not found</div>;

  return (
    <div className="p-6 md:p-10 space-y-8">
      <Link to="/players" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Back to players
      </Link>

      <div className="glass rounded-3xl p-8 relative overflow-hidden animate-float-up">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl bg-primary" />
        <div className="relative flex flex-col md:flex-row items-start gap-6">
          <PlayerAvatar nickname={p.nickname} size={120} />

          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 tracking-widest uppercase">
              <span>{p.team ?? p.team_name ?? "Free Agent"}</span> · <RoleBadge role={p.role} /> · <TrendBadge trend={trend} />
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-black">{p.nickname}</h1>

            <div className="text-muted-foreground">
              {p.realName ?? p.real_name ?? "Unknown Player"} · SQL Server Player Profile
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <BigStat label="KDA" value={Number(p.kda).toFixed(2)} highlight />
              <BigStat label="GPM" value={Math.round(Number(p.gpm))} />
              <BigStat label="Win Rate" value={`${Number(p.winRate ?? p.win_rate ?? 0).toFixed(1)}%`} />
              <BigStat
                label="Δ Form"
                value={`${delta > 0 ? "+" : ""}${delta.toFixed(2)}`}
                color={delta > 0 ? "text-success" : delta < 0 ? "text-danger" : ""}
              />
            </div>
          </div>

          <Link to="/compare" search={{ a: String(p.id) }} className="gradient-primary glow-primary px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-widest inline-flex items-center gap-2">
            <Swords className="w-4 h-4" /> Compare
          </Link>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold">
              Recent Matches
            </h2>
            <p className="text-xs text-muted-foreground">
              SQL match stats · avg {avg.toFixed(2)}
            </p>
          </div>
          <TrendBadge trend={trend} size="md" />
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <defs>
              <linearGradient id="kdaGr" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="oklch(0.78 0.18 200)" />
                <stop offset="100%" stopColor="oklch(0.7 0.27 305)" />
              </linearGradient>
            </defs>
            <XAxis dataKey="match" stroke="oklch(0.6 0.04 280)" fontSize={10} />
            <YAxis stroke="oklch(0.6 0.04 280)" fontSize={10} />
            <Tooltip contentStyle={{ background: "oklch(0.21 0.05 280)", border: "1px solid oklch(0.7 0.27 305 / 0.4)", borderRadius: 8 }} />
            <ReferenceLine y={avg} stroke="oklch(0.7 0.27 305 / 0.4)" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="kda" stroke="url(#kdaGr)" strokeWidth={2.5} dot={{ r: 2, fill: "oklch(0.78 0.18 200)" }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-2xl font-bold mb-4">Match Timeline</h2>
        <div className="grid grid-cols-10 md:grid-cols-25 gap-1.5">
          {data.map((m, i) => {
            const v = Math.min(1, m.kda / 8);
            return (
              <div
                key={i}
                title={`Match ${i + 1}: ${m.kda.toFixed(2)} KDA`}
                className="aspect-square rounded-sm hover:scale-150 transition-transform"
                style={{
                  background: m.kda > avg
                    ? `oklch(${0.5 + v * 0.3} 0.25 ${200 - v * 60})`
                    : `oklch(${0.3 + v * 0.2} 0.15 20)`,
                  boxShadow: m.kda > 7 ? `0 0 8px oklch(0.78 0.18 200)` : undefined,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PlayerAvatar({ nickname, size }: { nickname: string; size: number }) {
  const initials = nickname.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      className="relative rounded-lg flex items-center justify-center font-display font-black shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, oklch(0.7 0.27 305), oklch(0.78 0.18 200))",
        fontSize: size * 0.35,
        boxShadow: `0 0 ${size / 3}px oklch(0.7 0.27 305 / 0.4)`,
      }}
    >
      <span className="relative z-10 text-white drop-shadow">{initials}</span>
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  return <span className="inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/40">{role}</span>;
}

function TrendBadge({ trend, size = "sm" }: { trend: string; size?: "sm" | "md" }) {
  const cls = trend === "Rising" ? "text-success bg-success/10 border-success/30" : trend === "Declining" ? "text-danger bg-danger/10 border-danger/30" : "text-cyan bg-cyan/10 border-cyan/30";

  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cls} ${size === "md" ? "text-xs px-3 py-1" : ""}`}>
      {trend}
    </span>
  );
}

function BigStat({ label, value, highlight, color }: { label: string; value: any; highlight?: boolean; color?: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{label}</div>
      <div className={`text-3xl font-display font-black ${highlight ? "text-gradient" : color || ""}`}>{value}</div>
    </div>
  );
}