import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useMemo } from "react";
import { players, getPlayer, rankedAll } from "@/data/players";
import { PlayerAvatar, TrendBadge, RoleBadge } from "@/components/PlayerBits";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from "recharts";

export const Route = createFileRoute("/compare")({
  validateSearch: z.object({ a: z.string().optional(), b: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Player Comparison — MLBB Coach" },
      { name: "description", content: "Side-by-side comparison of two players with charts and recommendation." },
    ],
  }),
  component: Compare,
});

function Compare() {
  const { a, b } = Route.useSearch();
  const navigate = Route.useNavigate();
  const pa = a ? getPlayer(a) : players[4]; // default
  const pb = b ? getPlayer(b) : players[5];

  const setSel = (key: "a" | "b", id: string) => navigate({ search: (prev: any) => ({ ...prev, [key]: id }) });

  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="animate-float-up">
        <div className="text-xs tracking-[0.4em] text-muted-foreground mb-2">// HEAD-TO-HEAD</div>
        <h1 className="text-4xl md:text-5xl font-display font-black">PLAYER <span className="text-gradient">COMPARISON</span></h1>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <Selector label="Player A" value={pa?.id || ""} onChange={(id) => setSel("a", id)} />
        <Selector label="Player B" value={pb?.id || ""} onChange={(id) => setSel("b", id)} />
      </div>

      {pa && pb && <CompareBody pa={pa} pb={pb} />}
    </div>
  );
}

function Selector({ label, value, onChange }: { label: string; value: string; onChange: (id: string) => void }) {
  return (
    <div className="glass rounded-xl p-3 flex items-center gap-3">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground px-2">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-surface-2 border border-border rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
      >
        {players.map(p => (
          <option key={p.id} value={p.id}>{p.ign} · {p.role}</option>
        ))}
      </select>
    </div>
  );
}

function CompareBody({ pa, pb }: { pa: any; pb: any }) {
  const lineData = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    match: i + 1,
    [pa.ign]: +pa.matches[i].toFixed(2),
    [pb.ign]: +pb.matches[i].toFixed(2),
  })), [pa, pb]);

  const barData = [
    { stat: "KDA", a: pa.kda, b: pb.kda },
    { stat: "GPM/100", a: pa.gpm / 100, b: pb.gpm / 100 },
    { stat: "Win%", a: pa.winRate / 10, b: pb.winRate / 10 },
  ];

  const rankA = rankedAll.findIndex(p => p.id === pa.id) + 1;
  const rankB = rankedAll.findIndex(p => p.id === pb.id) + 1;

  const recentA = pa.matches.slice(-10).reduce((s: number, x: number) => s + x, 0) / 10;
  const recentB = pb.matches.slice(-10).reduce((s: number, x: number) => s + x, 0) / 10;
  const winner = recentA > recentB ? pa : pb;
  const reasonGap = Math.abs(recentA - recentB).toFixed(2);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-4">
        {[pa, pb].map((p, i) => (
          <div key={p.id} className={`glass rounded-2xl p-6 relative overflow-hidden animate-float-up ${winner.id === p.id ? "glow-primary border-primary/50" : ""}`}>
            {winner.id === p.id && (
              <div className="absolute top-3 right-3 text-[10px] font-black tracking-widest gradient-primary px-2 py-1 rounded text-primary-foreground">RECOMMENDED</div>
            )}
            <div className="flex items-center gap-4">
              <PlayerAvatar player={p} size={72} />
              <div>
                <div className="text-xs text-muted-foreground">{i === 0 ? "PLAYER A" : "PLAYER B"} · #{i === 0 ? rankA : rankB} GLOBAL</div>
                <div className="font-display text-2xl font-black">{p.ign}</div>
                <div className="flex gap-2 mt-1"><RoleBadge role={p.role} /><TrendBadge trend={p.trend} /></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              <Mini label="KDA" value={p.kda.toFixed(1)} />
              <Mini label="GPM" value={p.gpm} />
              <Mini label="WIN" value={`${p.winRate}%`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-xl font-bold mb-4">Stat Comparison</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <XAxis dataKey="stat" stroke="oklch(0.6 0.04 280)" fontSize={11} />
              <YAxis stroke="oklch(0.6 0.04 280)" fontSize={10} />
              <Tooltip contentStyle={{ background: "oklch(0.21 0.05 280)", border: "1px solid oklch(0.7 0.27 305 / 0.4)", borderRadius: 8 }} />
              <Bar dataKey="a" name={pa.ign} radius={[6, 6, 0, 0]} fill="oklch(0.7 0.27 305)" />
              <Bar dataKey="b" name={pb.ign} radius={[6, 6, 0, 0]} fill="oklch(0.78 0.18 200)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-xl font-bold mb-4">Last 50 Match Form</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData}>
              <XAxis dataKey="match" stroke="oklch(0.6 0.04 280)" fontSize={10} />
              <YAxis stroke="oklch(0.6 0.04 280)" fontSize={10} />
              <Tooltip contentStyle={{ background: "oklch(0.21 0.05 280)", border: "1px solid oklch(0.7 0.27 305 / 0.4)", borderRadius: 8 }} />
              <Line type="monotone" dataKey={pa.ign} stroke="oklch(0.7 0.27 305)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={pb.ign} stroke="oklch(0.78 0.18 200)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="relative">
          <div className="text-xs uppercase tracking-[0.4em] text-primary mb-2">// COACH RECOMMENDATION</div>
          <h3 className="font-display text-3xl font-black">
            <span className="text-gradient">{winner.ign}</span> is the better pick
          </h3>
          <p className="text-muted-foreground mt-3 max-w-3xl leading-relaxed">
            Based on the last 10 matches, <strong className="text-foreground">{winner.ign}</strong> shows a recent KDA average of{" "}
            <strong className="text-foreground">{(winner.id === pa.id ? recentA : recentB).toFixed(2)}</strong>, outperforming the alternative by <strong className="text-foreground">{reasonGap}</strong>. With a <strong className="text-foreground">{winner.trend}</strong> trend and a global rank of{" "}
            <strong className="text-foreground">#{winner.id === pa.id ? rankA : rankB}</strong>, this player is the stronger fit for the current lineup at <RoleBadge role={winner.role} />.
          </p>
        </div>
      </div>
    </>
  );
}

function Mini({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-surface-2/50 rounded-lg p-3">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-lg font-display font-black">{value}</div>
    </div>
  );
}
