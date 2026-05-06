import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { roles, type Role } from "@/data/players";
import { Sparkles, Shuffle, RotateCcw, Zap, Shield, Swords as SwordsIcon } from "lucide-react";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/lineup")({
  head: () => ({
    meta: [
      { title: "Lineup Builder — MLBB Coach" },
      { name: "description", content: "Build optimal MLBB team lineups with synergy analysis." },
    ],
  }),
  component: LineupBuilder,
});

const COLORS = ["#a855f7", "#06b6d4", "#22d3ee", "#f472b6", "#facc15", "#34d399", "#60a5fa", "#fb923c"];

type Player = {
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

type Lineup = Record<Role, Player | null>;

const empty: Lineup = { EXP: null, Jungle: null, Mid: null, Gold: null, Roam: null };

function getByRole(players: Player[], role: Role) {
  return players
    .filter(p => p.role === role)
    .sort((a, b) => Number(b.kda) - Number(a.kda));
}

function bestFor(players: Player[], role: Role, exclude: Set<number> = new Set()): Player | null {
  return getByRole(players, role).filter(p => !exclude.has(p.id))[0] ?? null;
}

function autoBest(players: Player[]): Lineup {
  const used = new Set<number>();
  const out: Lineup = { ...empty };

  for (const r of roles) {
    const p = bestFor(players, r, used);
    out[r] = p;
    if (p) used.add(p.id);
  }

  return out;
}

function teamStats(l: Lineup) {
  const ps = roles.map(r => l[r]).filter(Boolean) as Player[];

  if (!ps.length) return { kda: 0, gpm: 0, win: 0, synergy: 0, count: 0 };

  const kda = ps.reduce((s, p) => s + Number(p.kda), 0) / ps.length;
  const gpm = Math.round(ps.reduce((s, p) => s + Number(p.gpm), 0) / ps.length);
  const win = Math.round(ps.reduce((s, p) => s + Number(p.winRate ?? p.win_rate ?? 0), 0) / ps.length);

  const teamCounts: Record<string, number> = {};
  ps.forEach(p => {
    const team = p.team ?? p.team_name ?? "Free Agent";
    teamCounts[team] = (teamCounts[team] || 0) + 1;
  });

  const sameTeamBonus = Math.max(...Object.values(teamCounts)) * 8;
  const highWinBonus = ps.filter(p => Number(p.winRate ?? p.win_rate ?? 0) >= 55).length * 5;
  const lowWinPenalty = ps.filter(p => Number(p.winRate ?? p.win_rate ?? 0) < 45).length * 6;

  const synergy = Math.min(100, Math.round(50 + (kda - 4) * 12 + sameTeamBonus + highWinBonus - lowWinPenalty));

  return { kda, gpm, win, synergy: Math.max(0, synergy), count: ps.length };
}

function pairSynergy(a: Player | null, b: Player | null): "strong" | "weak" | "neutral" {
  if (!a || !b) return "neutral";

  const aTeam = a.team ?? a.team_name ?? "Free Agent";
  const bTeam = b.team ?? b.team_name ?? "Free Agent";
  const aWin = Number(a.winRate ?? a.win_rate ?? 0);
  const bWin = Number(b.winRate ?? b.win_rate ?? 0);

  if (aTeam === bTeam) return "strong";
  if (aWin < 45 || bWin < 45) return "weak";
  if (aWin >= 55 && bWin >= 55) return "strong";

  return "neutral";
}

function LineupBuilder() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [lineup, setLineup] = useState<Lineup>(empty);
  const [picking, setPicking] = useState<Role | null>(null);
  const [original, setOriginal] = useState<Lineup | null>(null);

  useEffect(() => {
    apiGet<Player[]>("/api/players")
      .then(data => {
        const normalized = data.map((p, i) => ({
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
        setLineup(autoBest(normalized));
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => teamStats(lineup), [lineup]);
  const originalStats = useMemo(() => original ? teamStats(original) : null, [original]);

  const select = (role: Role, p: Player) => {
    if (!original) setOriginal(lineup);

    const next: Lineup = { ...lineup };

    for (const r of roles) {
      if (next[r]?.id === p.id) next[r] = null;
    }

    next[role] = p;
    setLineup(next);
    setPicking(null);
  };

  const auto = () => {
    setOriginal(null);
    setLineup(autoBest(players));
  };

  const reset = () => {
    setOriginal(null);
    setLineup(empty);
  };

  const shuffle = () => {
    const out: Lineup = { ...empty };
    const used = new Set<number>();

    for (const r of roles) {
      const candidates = getByRole(players, r).filter(p => !used.has(p.id));
      const pick = candidates[Math.floor(Math.random() * Math.min(3, candidates.length))];

      out[r] = pick ?? null;
      if (pick) used.add(pick.id);
    }

    if (!original) setOriginal(lineup);
    setLineup(out);
  };

  const connections: [Role, Role][] = [
    ["Jungle", "Mid"],
    ["Jungle", "EXP"],
    ["Jungle", "Gold"],
    ["Roam", "Gold"],
    ["Roam", "EXP"],
    ["Mid", "Gold"],
    ["Mid", "EXP"],
  ];

  if (loading) return <div className="p-10 text-muted-foreground">Loading lineup builder...</div>;

  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 animate-float-up">
        <div>
          <div className="text-xs tracking-[0.4em] text-muted-foreground mb-2">// LINEUP COMMAND</div>
          <h1 className="text-4xl md:text-5xl font-display font-black">
            LINEUP <span className="text-gradient">BUILDER</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Visual team composition with SQL-based player statistics
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={auto} className="gradient-primary glow-primary px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-widest inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Auto Best
          </button>
          <button onClick={shuffle} className="glass border-border px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-widest inline-flex items-center gap-2 hover:border-primary">
            <Shuffle className="w-4 h-4" /> Shuffle
          </button>
          <button onClick={reset} className="glass border-border px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-widest inline-flex items-center gap-2 hover:border-danger">
            <RotateCcw className="w-4 h-4" /> Clear
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-3xl p-6 md:p-10 relative overflow-hidden grid-bg min-h-[600px]">
          <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 50%, oklch(0.7 0.27 305 / 0.2), transparent 60%)" }} />
          <div className="relative h-full flex items-center justify-center">
            <MapLayout lineup={lineup} connections={connections} pairSynergy={pairSynergy} onPick={(r) => setPicking(r)} />
          </div>
          <div className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">// MLBB Battle Map</div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <div className="relative">
              <div className="text-xs uppercase tracking-[0.4em] text-primary mb-3">// Team Analytics</div>

              <div className="grid grid-cols-2 gap-3">
                <BigStat icon={SwordsIcon} label="Avg KDA" value={stats.kda.toFixed(2)} accent />
                <BigStat icon={Zap} label="Avg GPM" value={stats.gpm} />
                <BigStat icon={Shield} label="Win Rate" value={`${stats.win}%`} />
                <BigStat icon={Sparkles} label="Synergy" value={`${stats.synergy}`} accent />
              </div>

              <SynergyBar value={stats.synergy} />
            </div>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="text-xs uppercase tracking-[0.4em] text-cyan mb-2">// Recommendation</div>
            <p className="text-sm leading-relaxed">{recommendation(lineup, stats)}</p>
          </div>

          {original && originalStats && (
            <div className="glass rounded-2xl p-6 border border-cyan/30">
              <div className="text-xs uppercase tracking-[0.4em] text-cyan mb-3">// Substitution Impact</div>
              <div className="space-y-2">
                <Delta label="KDA" before={originalStats.kda.toFixed(2)} after={stats.kda.toFixed(2)} delta={stats.kda - originalStats.kda} />
                <Delta label="GPM" before={originalStats.gpm} after={stats.gpm} delta={stats.gpm - originalStats.gpm} />
                <Delta label="Synergy" before={originalStats.synergy} after={stats.synergy} delta={stats.synergy - originalStats.synergy} />
              </div>
            </div>
          )}
        </div>
      </div>

      {picking && (
        <PlayerPicker
          role={picking}
          current={lineup[picking]}
          players={players}
          onClose={() => setPicking(null)}
          onPick={(p) => select(picking, p)}
        />
      )}
    </div>
  );
}

const positions: Record<Role, { top: string; left: string }> = {
  EXP: { top: "8%", left: "18%" },
  Jungle: { top: "38%", left: "30%" },
  Mid: { top: "50%", left: "50%" },
  Gold: { top: "62%", left: "70%" },
  Roam: { top: "85%", left: "78%" },
};

function MapLayout({
  lineup,
  connections,
  pairSynergy,
  onPick,
}: {
  lineup: Lineup;
  connections: [Role, Role][];
  pairSynergy: (a: Player | null, b: Player | null) => "strong" | "weak" | "neutral";
  onPick: (r: Role) => void;
}) {
  return (
    <div className="relative w-full max-w-[640px] aspect-square">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {connections.map(([a, b], i) => {
          const pa = positions[a], pb = positions[b];
          const syn = pairSynergy(lineup[a], lineup[b]);
          const stroke = syn === "strong" ? "oklch(0.78 0.2 150)" : syn === "weak" ? "oklch(0.7 0.25 25)" : "oklch(0.55 0.04 280 / 0.5)";

          return (
            <line
              key={i}
              x1={parseFloat(pa.left)}
              y1={parseFloat(pa.top)}
              x2={parseFloat(pb.left)}
              y2={parseFloat(pb.top)}
              stroke={stroke}
              strokeWidth={syn === "strong" ? 0.5 : 0.3}
              strokeDasharray={syn === "neutral" ? "1 1" : ""}
              opacity={syn === "neutral" ? 0.4 : 0.9}
              style={syn === "strong" ? { filter: "drop-shadow(0 0 1px oklch(0.78 0.2 150))" } : undefined}
            />
          );
        })}
      </svg>

      {roles.map(r => {
        const p = lineup[r];
        const pos = positions[r];

        return (
          <button
            key={r}
            onClick={() => onPick(r)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group"
            style={{ top: pos.top, left: pos.left }}
          >
            {p ? (
              <div className="flex flex-col items-center gap-2 animate-float-up">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl gradient-primary opacity-50 blur-xl group-hover:opacity-80 transition-opacity" />
                  <div className="relative">
                    <PlayerAvatar player={p} size={80} />
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <RoleBadge role={r} />
                  </div>
                </div>

                <div className="glass rounded-lg px-3 py-1.5 text-center min-w-[120px]">
                  <div className="text-xs font-bold truncate">{p.nickname}</div>
                  <div className="text-[10px] text-gradient font-display font-black">
                    KDA {Number(p.kda).toFixed(1)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-primary/40 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/10 group-hover:glow-primary transition-all">
                  <span className="text-3xl text-primary/40 group-hover:text-primary">+</span>
                </div>
                <RoleBadge role={r} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PlayerPicker({
  role,
  current,
  players,
  onClose,
  onPick,
}: {
  role: Role;
  current: Player | null;
  players: Player[];
  onClose: () => void;
  onPick: (p: Player) => void;
}) {
  const list = getByRole(players, role);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-float-up" onClick={onClose}>
      <div className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-[0.4em] text-muted-foreground">// Select Player</div>
            <h3 className="text-2xl font-display font-black">{role} Lane</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl">×</button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {list.map(p => (
            <button
              key={p.id}
              onClick={() => onPick(p)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all hover:glow-primary ${
                current?.id === p.id ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/60"
              }`}
            >
              <PlayerAvatar player={p} size={48} />
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{p.nickname}</div>
                <div className="text-xs text-muted-foreground">
                  {p.team ?? p.team_name ?? "Free Agent"} · KDA {Number(p.kda).toFixed(2)}
                </div>
              </div>
              <TrendBadge winRate={Number(p.winRate ?? p.win_rate ?? 0)} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function recommendation(l: Lineup, s: ReturnType<typeof teamStats>) {
  if (s.count === 0) return "Pick players for each lane to see analysis.";
  if (s.count < 5) return `Lineup is ${s.count}/5 complete. Fill remaining lanes for full analysis.`;

  const ps = roles.map(r => l[r]).filter(Boolean) as Player[];

  const teams: Record<string, number> = {};
  ps.forEach(p => {
    const team = p.team ?? p.team_name ?? "Free Agent";
    teams[team] = (teams[team] || 0) + 1;
  });

  const dominant = Object.entries(teams).sort((a, b) => b[1] - a[1])[0];
  const lowWin = ps.filter(p => Number(p.winRate ?? p.win_rate ?? 0) < 45);

  let txt = `Team KDA of ${s.kda.toFixed(2)} with ${s.synergy}/100 synergy. `;

  if (dominant && dominant[1] >= 3) {
    txt += `${dominant[0]} core (${dominant[1]} players) builds strong team chemistry. `;
  }

  const jungle = l.Jungle;
  const mid = l.Mid;

  if (jungle && mid && (jungle.team ?? jungle.team_name) === (mid.team ?? mid.team_name)) {
    txt += `Jungle–Mid pairing from ${jungle.team ?? jungle.team_name} unlocks early-game synergy. `;
  }

  if (lowWin.length) {
    txt += `⚠ ${lowWin.map(p => p.nickname).join(", ")} have lower win rate — consider substitutes.`;
  } else {
    txt += `All selected players show stable SQL performance — green light to deploy.`;
  }

  return txt;
}

function PlayerAvatar({ player, size = 48 }: { player: Player; size?: number }) {
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
      {rising ? "HIGH WR" : "LOW WR"}
    </span>
  );
}

function BigStat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: any; accent?: boolean }) {
  return (
    <div className="bg-surface-2/50 rounded-lg p-3">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-widest text-muted-foreground">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className={`text-2xl font-display font-black mt-1 ${accent ? "text-gradient" : ""}`}>{value}</div>
    </div>
  );
}

function SynergyBar({ value }: { value: number }) {
  return (
    <div className="mt-4">
      <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
        <span>Synergy</span>
        <span>{value}/100</span>
      </div>
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
        <div
          className="h-full gradient-neon transition-all duration-500"
          style={{
            width: `${value}%`,
            boxShadow: value > 60 ? "0 0 12px oklch(0.78 0.18 200)" : undefined,
          }}
        />
      </div>
    </div>
  );
}

function Delta({ label, before, after, delta }: { label: string; before: any; after: any; delta: number }) {
  const positive = delta > 0;

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground uppercase tracking-widest text-xs">{label}</span>
      <div className="flex items-center gap-2 font-display font-bold">
        <span className="text-muted-foreground">{before}</span>
        <span>→</span>
        <span>{after}</span>
        <span className={`text-xs ${positive ? "text-success" : delta < 0 ? "text-danger" : "text-muted-foreground"}`}>
          ({positive ? "+" : ""}{typeof delta === "number" ? delta.toFixed(delta % 1 ? 2 : 0) : delta})
        </span>
      </div>
    </div>
  );
}