import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Swords, Trophy } from "lucide-react";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
});

const COLORS = ["#a855f7", "#06b6d4", "#22d3ee", "#f472b6", "#facc15", "#34d399", "#60a5fa", "#fb923c"];

type Player = {
  id: number;
  player_id?: number;
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
  matchesPlayed?: number;
  matches_played?: number;
  avatar?: string;
};

function ComparePage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [leftId, setLeftId] = useState<number | "">("");
  const [rightId, setRightId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);

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
        setLeftId(normalized[0]?.id ?? "");
        setRightId(normalized[1]?.id ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  const left = players.find(p => p.id === Number(leftId));
  const right = players.find(p => p.id === Number(rightId));

  const winner = useMemo(() => {
    if (!left || !right) return null;

    const leftScore =
      Number(left.kda) * 0.5 +
      (Number(left.gpm) / 1000) * 0.2 +
      (Number(left.winRate) / 100) * 0.3;

    const rightScore =
      Number(right.kda) * 0.5 +
      (Number(right.gpm) / 1000) * 0.2 +
      (Number(right.winRate) / 100) * 0.3;

    if (leftScore > rightScore) return left;
    if (rightScore > leftScore) return right;
    return null;
  }, [left, right]);

  if (loading) return <div className="p-10 text-muted-foreground">Loading comparison...</div>;

  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="animate-float-up">
        <div className="text-xs tracking-[0.4em] text-muted-foreground mb-2">// PLAYER COMPARISON</div>
        <h1 className="text-4xl md:text-5xl font-display font-black">
          COMPARE <span className="text-gradient">PLAYERS</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Real SQL player statistics · KDA, GPM, win rate, and match count
        </p>
      </header>

      <div className="glass rounded-2xl p-5 grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Player A</label>
          <select
            value={leftId}
            onChange={e => setLeftId(Number(e.target.value))}
            className="mt-2 w-full bg-surface-2/60 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.nickname} — {p.role}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Player B</label>
          <select
            value={rightId}
            onChange={e => setRightId(Number(e.target.value))}
            className="mt-2 w-full bg-surface-2/60 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.nickname} — {p.role}</option>
            ))}
          </select>
        </div>
      </div>

      {left && right && (
        <>
          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            <PlayerCard player={left} winner={winner?.id === left.id} />

            <div className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <Swords className="w-10 h-10 text-primary mb-3" />
              <div className="text-xs text-muted-foreground uppercase tracking-[0.3em] mb-2">Comparison Result</div>
              {winner ? (
                <>
                  <div className="text-2xl font-display font-black text-gradient">{winner.nickname}</div>
                  <div className="text-sm text-muted-foreground mt-1">has the stronger overall SQL performance score.</div>
                </>
              ) : (
                <>
                  <div className="text-2xl font-display font-black text-cyan">TIE</div>
                  <div className="text-sm text-muted-foreground mt-1">Both players have similar performance.</div>
                </>
              )}
            </div>

            <PlayerCard player={right} winner={winner?.id === right.id} />
          </div>

          <div className="glass rounded-2xl p-6">
            <h2 className="font-display text-2xl font-bold mb-4">Metric Breakdown</h2>
            <div className="space-y-3">
              <CompareRow label="KDA" left={Number(left.kda)} right={Number(right.kda)} decimals={2} />
              <CompareRow label="GPM" left={Number(left.gpm)} right={Number(right.gpm)} decimals={0} />
              <CompareRow label="Win Rate" left={Number(left.winRate)} right={Number(right.winRate)} suffix="%" decimals={1} />
              <CompareRow label="Matches" left={Number(left.matchesPlayed)} right={Number(right.matchesPlayed)} decimals={0} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PlayerCard({ player, winner }: { player: Player; winner: boolean }) {
  return (
    <div className={`glass rounded-2xl p-6 relative overflow-hidden ${winner ? "border-success/50 glow-primary" : ""}`}>
      {winner && (
        <div className="absolute top-4 right-4 text-success">
          <Trophy className="w-5 h-5" />
        </div>
      )}

      <div className="flex items-center gap-4">
        <PlayerAvatar player={player} size={72} />

        <div className="min-w-0">
          <div className="font-display font-black text-2xl truncate">{player.nickname}</div>
          <div className="text-xs text-muted-foreground truncate">{player.team}</div>
          <div className="mt-2">
            <RoleBadge role={player.role} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <BigStat label="KDA" value={Number(player.kda).toFixed(2)} highlight />
        <BigStat label="GPM" value={Math.round(Number(player.gpm))} />
        <BigStat label="Win Rate" value={`${Number(player.winRate).toFixed(1)}%`} />
        <BigStat label="Matches" value={player.matchesPlayed ?? 0} />
      </div>

      <Link
        to="/players/$id"
        params={{ id: String(player.id) }}
        className="mt-5 inline-flex items-center gap-2 text-xs text-primary hover:text-cyan font-bold uppercase tracking-widest"
      >
        View Profile <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function CompareRow({
  label,
  left,
  right,
  suffix = "",
  decimals,
}: {
  label: string;
  left: number;
  right: number;
  suffix?: string;
  decimals: number;
}) {
  const max = Math.max(left, right, 1);
  const leftPct = (left / max) * 100;
  const rightPct = (right / max) * 100;

  return (
    <div className="grid md:grid-cols-[120px_1fr_1fr] gap-3 items-center">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>

      <MetricBar
        value={`${left.toFixed(decimals)}${suffix}`}
        pct={leftPct}
        winning={left >= right}
      />

      <MetricBar
        value={`${right.toFixed(decimals)}${suffix}`}
        pct={rightPct}
        winning={right >= left}
      />
    </div>
  );
}

function MetricBar({ value, pct, winning }: { value: string; pct: number; winning: boolean }) {
  return (
    <div>
      <div className={`text-xs font-display font-bold mb-1 ${winning ? "text-success" : "text-muted-foreground"}`}>
        {value}
      </div>
      <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
        <div
          className={winning ? "h-full bg-success" : "h-full bg-primary/50"}
          style={{ width: `${pct}%` }}
        />
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

function BigStat({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  return (
    <div className="bg-surface-2/50 rounded-lg p-3">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`text-2xl font-display font-black mt-1 ${highlight ? "text-gradient" : ""}`}>{value}</div>
    </div>
  );
}