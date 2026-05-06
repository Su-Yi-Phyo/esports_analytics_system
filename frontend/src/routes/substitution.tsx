import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { roles, type Role } from "@/data/players";
import { ArrowRight, TrendingUp, TrendingDown, Minus, Repeat } from "lucide-react";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/substitution")({
  component: SubstitutionPage,
});

const COLORS = ["#a855f7", "#06b6d4", "#22d3ee", "#f472b6", "#facc15", "#34d399", "#60a5fa", "#fb923c"];

type Player = {
  id: number;
  player_id?: number;
  nickname: string;
  role: Role;
  team?: string;
  team_name?: string;
  kda: number;
  gpm: number;
  winRate?: number;
  win_rate?: number;
  avatar?: string;
};

type Lineup = Record<Role, Player | null>;

const emptyLineup: Lineup = {
  EXP: null,
  Jungle: null,
  Mid: null,
  Gold: null,
  Roam: null,
};

function getByRole(players: Player[], role: Role) {
  return players.filter(p => p.role === role).sort((a, b) => Number(b.kda) - Number(a.kda));
}

function baselineLineup(players: Player[]): Lineup {
  const used = new Set<number>();
  const out: Lineup = { ...emptyLineup };

  for (const r of roles) {
    const p = getByRole(players, r).find(x => !used.has(x.id)) ?? null;
    out[r] = p;
    if (p) used.add(p.id);
  }

  return out;
}

function teamWinRate(lineup: Lineup) {
  const ps = roles.map(r => lineup[r]).filter(Boolean) as Player[];
  if (!ps.length) return 0;

  const avg = ps.reduce((s, p) => s + Number(p.winRate ?? p.win_rate ?? 0), 0) / ps.length;

  const teamCounts: Record<string, number> = {};
  ps.forEach(p => {
    const team = p.team ?? p.team_name ?? "Free Agent";
    teamCounts[team] = (teamCounts[team] || 0) + 1;
  });

  const chemistry = (Math.max(...Object.values(teamCounts)) - 1) * 1.4;
  return Math.max(0, Math.min(100, avg + chemistry));
}

function teamKDA(lineup: Lineup) {
  const ps = roles.map(r => lineup[r]).filter(Boolean) as Player[];
  if (!ps.length) return 0;
  return ps.reduce((s, p) => s + Number(p.kda), 0) / ps.length;
}

function SubstitutionPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [outId, setOutId] = useState<number | null>(null);
  const [inId, setInId] = useState<number | null>(null);

  useEffect(() => {
    apiGet<Player[]>("/api/players")
      .then(data => {
        const normalized = data.map((p, i) => ({
          ...p,
          id: Number(p.id ?? p.player_id),
          kda: Number(p.kda ?? 0),
          gpm: Number(p.gpm ?? 0),
          winRate: Number(p.winRate ?? p.win_rate ?? 0),
          team: p.team ?? p.team_name ?? "Free Agent",
          avatar: p.avatar ?? COLORS[i % COLORS.length],
        }));

        setPlayers(normalized);

        const base = baselineLineup(normalized);
        const firstStarter = base.Jungle ?? roles.map(r => base[r]).find(Boolean) ?? null;
        setOutId(firstStarter?.id ?? null);

        if (firstStarter) {
          const firstCandidate = getByRole(normalized, firstStarter.role).find(p => p.id !== firstStarter.id);
          setInId(firstCandidate?.id ?? null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const baseline = useMemo(() => baselineLineup(players), [players]);

  const playerOut = players.find(p => p.id === outId) ?? null;
  const role = playerOut?.role ?? "Jungle";

  const outOptions = players
    .slice()
    .sort((a, b) => {
      if (a.role !== b.role) return roles.indexOf(a.role) - roles.indexOf(b.role);
      return Number(b.kda) - Number(a.kda);
    });

  const candidates = playerOut
    ? getByRole(players, role).filter(p => p.id !== playerOut.id)
    : [];

  const playerIn =
    candidates.find(p => p.id === inId) ??
    candidates[0] ??
    null;

  const simulated = useMemo(() => {
    const next = { ...baseline };
    if (playerIn && playerOut) next[role] = playerIn;
    return next;
  }, [baseline, playerIn, playerOut, role]);

  const beforeWin = teamWinRate(baseline);
  const afterWin = teamWinRate(simulated);
  const winDelta = afterWin - beforeWin;

  const beforeKDA = teamKDA(baseline);
  const afterKDA = teamKDA(simulated);
  const kdaDelta = afterKDA - beforeKDA;

  const verdict =
    winDelta > 1.5 ? { label: "RECOMMENDED", color: "text-success", Icon: TrendingUp, msg: "Substitution improves expected win rate." }
    : winDelta < -1.5 ? { label: "NOT RECOMMENDED", color: "text-danger", Icon: TrendingDown, msg: "Substitution lowers expected win rate." }
    : { label: "NEUTRAL", color: "text-cyan", Icon: Minus, msg: "Marginal impact — coach's call." };

  if (loading) return <div className="p-10 text-muted-foreground">Loading substitution simulator...</div>;
  if (!playerOut) return <div className="p-10 text-muted-foreground">No available players.</div>;

  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="animate-float-up">
        <div className="text-xs tracking-[0.4em] text-muted-foreground mb-2">// SUB SIMULATOR</div>
        <h1 className="text-4xl md:text-5xl font-display font-black">
          SUBSTITUTION <span className="text-gradient">IMPACT</span>
        </h1>
        <p className="text-muted-foreground mt-2">Swap a player and project the win-rate delta on your starting lineup.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.4em] text-danger">// Player OUT</div>
              <RoleBadge role={playerOut.role} />
            </div>

            <PlayerCard player={playerOut} />

            <div>
              <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Choose player to substitute</label>
              <select
                value={outId ?? ""}
                onChange={(e) => {
                  const selected = players.find(p => p.id === Number(e.target.value));
                  setOutId(Number(e.target.value));

                  const firstCandidate = selected
                    ? getByRole(players, selected.role).find(p => p.id !== selected.id)
                    : null;

                  setInId(firstCandidate?.id ?? null);
                }}
                className="mt-2 w-full bg-surface-2/60 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                {outOptions.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.role} — {p.nickname} · {p.team ?? p.team_name ?? "Free Agent"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-[0.4em] text-success">// Player IN</div>
              <RoleBadge role={role} />
            </div>

            {playerIn ? <PlayerCard player={playerIn} /> : <p className="text-sm text-muted-foreground">No alternates available.</p>}

            <div>
              <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Pick a {role} substitute</label>
              <select
                value={playerIn?.id ?? ""}
                onChange={(e) => setInId(Number(e.target.value))}
                className="mt-2 w-full bg-surface-2/60 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                {candidates.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nickname} — WR {Number(c.winRate ?? c.win_rate ?? 0).toFixed(1)}%
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <div className="relative space-y-4">
              <div className="text-xs uppercase tracking-[0.4em] text-primary">// Win Rate Projection</div>

              <div className="flex items-center justify-between text-3xl font-display font-black">
                <span className="text-muted-foreground">{beforeWin.toFixed(1)}%</span>
                <ArrowRight className="w-6 h-6 text-primary" />
                <span className="text-gradient">{afterWin.toFixed(1)}%</span>
              </div>

              <DeltaBar value={winDelta} />

              <div className={`flex items-center gap-2 text-sm font-bold uppercase tracking-widest ${verdict.color}`}>
                <verdict.Icon className="w-4 h-4" /> {verdict.label}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{verdict.msg}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 space-y-3">
            <div className="text-xs uppercase tracking-[0.4em] text-cyan">// Secondary Metrics</div>
            <Metric label="Win Rate" before={`${beforeWin.toFixed(1)}%`} after={`${afterWin.toFixed(1)}%`} delta={winDelta} unit="%" />
            <Metric label="Avg KDA" before={beforeKDA.toFixed(2)} after={afterKDA.toFixed(2)} delta={kdaDelta} />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">// Resulting Lineup</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {roles.map(r => {
            const p = simulated[r];
            const base = baseline[r];
            if (!p || !base) return null;

            const swapped = base.id !== p.id;

            return (
              <div key={r} className={`rounded-xl p-3 border transition-all ${swapped ? "border-success bg-success/5 glow-primary" : "border-border/50 bg-surface-2/30"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <PlayerAvatar player={p} size={36} />
                  <div className="min-w-0">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{r}</div>
                    <div className="text-xs font-bold truncate">{p.nickname}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">WR {Number(p.winRate ?? p.win_rate ?? 0).toFixed(1)}%</span>
                  {swapped && <span className="text-success font-bold inline-flex items-center gap-1"><Repeat className="w-3 h-3" /> SUB</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <div className="flex items-center gap-3">
      <PlayerAvatar player={player} size={56} />
      <div className="min-w-0 flex-1">
        <div className="font-display font-bold truncate">{player.nickname}</div>
        <div className="text-xs text-muted-foreground">
          {player.team ?? player.team_name ?? "Free Agent"} · KDA {Number(player.kda).toFixed(2)}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <TrendBadge winRate={Number(player.winRate ?? player.win_rate ?? 0)} />
          <span className="text-[10px] text-muted-foreground">
            WR <span className="text-foreground font-bold">{Number(player.winRate ?? player.win_rate ?? 0).toFixed(1)}%</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function PlayerAvatar({ player, size }: { player: Player; size: number }) {
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

function TrendBadge({ winRate }: { winRate: number }) {
  const rising = winRate >= 55;
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
      rising ? "text-success bg-success/10 border-success/30" : "text-danger bg-danger/10 border-danger/30"
    }`}>
      {rising ? "RISING" : "LOW WR"}
    </span>
  );
}

function DeltaBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.abs(value) * 8);
  const positive = value >= 0;

  return (
    <div>
      <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
        <span>Δ Win Rate</span>
        <span className={positive ? "text-success" : "text-danger"}>{positive ? "+" : ""}{value.toFixed(2)}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden relative">
        <div
          className={`h-full transition-all duration-500 ${positive ? "bg-success" : "bg-danger"}`}
          style={{ width: `${pct}%`, boxShadow: `0 0 10px ${positive ? "oklch(0.78 0.2 150)" : "oklch(0.7 0.25 25)"}` }}
        />
      </div>
    </div>
  );
}

function Metric({ label, before, after, delta, unit = "" }: { label: string; before: string; after: string; delta: number; unit?: string }) {
  const positive = delta >= 0;

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground uppercase tracking-widest text-xs">{label}</span>
      <div className="flex items-center gap-2 font-display font-bold">
        <span className="text-muted-foreground">{before}</span>
        <ArrowRight className="w-3 h-3" />
        <span>{after}</span>
        <span className={`text-xs ${positive ? "text-success" : "text-danger"}`}>
          ({positive ? "+" : ""}{delta.toFixed(2)}{unit})
        </span>
      </div>
    </div>
  );
}