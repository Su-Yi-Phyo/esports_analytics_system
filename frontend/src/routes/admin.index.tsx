import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  Users,
  Shield,
  Calendar,
  Trophy,
  AlertTriangle,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { AdminHeader, StatCard } from "@/components/AdminBits";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

const COLORS = ["#a855f7", "#06b6d4", "#22d3ee", "#f472b6", "#facc15", "#34d399", "#60a5fa", "#fb923c"];

type Player = {
  id: number;
  player_id?: number;
};

type Team = {
  id: number;
  team_id?: number;
  name: string;
  team_name?: string;
  logo?: string;
  color?: string;
};

type Season = {
  id: number;
  season_id?: number;
  name: string;
  status: "Upcoming" | "Active" | "Completed";
};

type Match = {
  id: number;
  match_id?: number;
  matchDate?: string;
  match_date?: string;
  durationMinutes?: number;
  duration_minutes?: number;
  teamAId?: number;
  team_a_id?: number;
  teamAName?: string;
  team_a_name?: string;
  teamBId?: number;
  team_b_id?: number;
  teamBName?: string;
  team_b_name?: string;
  teamAScore?: number;
  team_a_score?: number;
  teamBScore?: number;
  team_b_score?: number;
  winnerTeamId?: number;
  winner_team_id?: number;
};

function AdminOverview() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOverview = async () => {
    setLoading(true);

    const [playerData, teamData, seasonData, matchData] = await Promise.all([
      apiGet<Player[]>("/api/players"),
      apiGet<Team[]>("/api/teams"),
      apiGet<Season[]>("/api/seasons"),
      apiGet<Match[]>("/api/matches"),
    ]);

    const normalizedTeams = teamData.map((t, i) => ({
      ...t,
      id: Number(t.id ?? t.team_id),
      name: t.name ?? t.team_name ?? "",
      logo: t.logo ?? (t.name ?? t.team_name ?? "TM").slice(0, 2).toUpperCase(),
      color: t.color ?? COLORS[i % COLORS.length],
    }));

    const normalizedMatches = matchData.map(m => ({
      ...m,
      id: Number(m.id ?? m.match_id),
      matchDate: m.matchDate ?? m.match_date,
      durationMinutes: Number(m.durationMinutes ?? m.duration_minutes ?? 0),
      teamAId: Number(m.teamAId ?? m.team_a_id),
      teamBId: Number(m.teamBId ?? m.team_b_id),
      teamAScore: Number(m.teamAScore ?? m.team_a_score ?? 0),
      teamBScore: Number(m.teamBScore ?? m.team_b_score ?? 0),
      winnerTeamId: Number(m.winnerTeamId ?? m.winner_team_id),
    }));

    setPlayers(playerData);
    setTeams(normalizedTeams);
    setSeasons(seasonData);
    setMatches(normalizedMatches);
    setLoading(false);
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const activeSeason = seasons.find(s => s.status === "Active");

  const chartData = Array.from({ length: 12 }, (_, i) => ({
    name: `W${i + 1}`,
    matches: Math.max(0, Math.round((matches.length / 12) * (i + 1))),
    players: Math.max(0, Math.round((players.length / 12) * (i + 1))),
  }));

  const logs = [
    ...matches.slice(0, 5).map(m => ({
      id: `match-${m.id}`,
      type: "match",
      message: `Match recorded: ${m.teamAName ?? m.team_a_name} vs ${m.teamBName ?? m.team_b_name}`,
      time: m.matchDate ?? m.match_date ?? "",
    })),
    ...seasons.slice(0, 3).map(s => ({
      id: `season-${s.id ?? s.season_id}`,
      type: "season",
      message: `Season ${s.name} is ${s.status}`,
      time: "",
    })),
  ];

  if (loading) {
    return <div className="p-10 text-muted-foreground">Loading admin overview...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <AdminHeader title="Admin Overview" subtitle="System-wide monitoring & activity feed" icon={Activity} />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard icon={Users} label="Total Players" value={players.length} accent="primary" />
        <StatCard icon={Shield} label="Total Teams" value={teams.length} accent="cyan" />
        <StatCard icon={Calendar} label="Active Season" value={activeSeason?.name ?? "—"} accent="success" />
        <StatCard icon={Trophy} label="Total Matches" value={matches.length} accent="warning" />
        <StatCard icon={AlertTriangle} label="Violations Blocked" value="Trigger" accent="danger" />
        <StatCard icon={Sparkles} label="System Health" value="98%" accent="success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold tracking-wider">SEASON ACTIVITY</h2>
              <p className="text-xs text-muted-foreground">Matches recorded · player growth</p>
            </div>
            <div className="text-[10px] text-accent tracking-[0.3em]">LIVE</div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.06 280 / 0.3)" />
              <XAxis dataKey="name" stroke="oklch(0.72 0.04 280)" tick={{ fontSize: 11 }} />
              <YAxis stroke="oklch(0.72 0.04 280)" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "oklch(0.21 0.05 280)",
                  border: "1px solid oklch(0.32 0.06 280)",
                  borderRadius: 8,
                }}
              />
              <Line type="monotone" dataKey="matches" stroke="oklch(0.7 0.27 305)" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="players" stroke="oklch(0.78 0.18 200)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold tracking-wider">ACTIVITY FEED</h2>
            <ClipboardList className="w-4 h-4 text-accent" />
          </div>

          <div className="space-y-3 max-h-[260px] overflow-y-auto">
            {logs.map(l => (
              <div key={l.id} className="flex gap-3 p-3 rounded-lg bg-surface-2/50 border border-border/40">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  l.type === "match"
                    ? "bg-success"
                    : l.type === "season"
                    ? "bg-primary"
                    : "bg-accent"
                }`} />

                <div className="flex-1 min-w-0">
                  <div className="text-xs">{l.message}</div>
                  <div className="text-[10px] text-muted-foreground tracking-wider mt-0.5">
                    {l.type.toUpperCase()} {l.time ? `· ${l.time}` : ""}
                  </div>
                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                No recent activity yet.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 glass rounded-xl p-6">
        <h2 className="font-display font-bold tracking-wider mb-4">RECENT MATCH ENTRIES</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {matches.slice(0, 4).map(m => {
            const teamA = teams.find(t => t.id === Number(m.teamAId ?? m.team_a_id));
            const teamB = teams.find(t => t.id === Number(m.teamBId ?? m.team_b_id));
            const winnerIsA = Number(m.winnerTeamId ?? m.winner_team_id) === Number(m.teamAId ?? m.team_a_id);

            return (
              <div key={m.id} className="p-4 rounded-lg bg-surface-2/50 border border-border/40 hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] text-muted-foreground tracking-wider">
                    {m.matchDate ?? m.match_date} · {m.durationMinutes ?? m.duration_minutes}min
                  </div>
                  <div className="text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary tracking-wider">
                    FINAL
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className={`flex items-center gap-2 flex-1 ${winnerIsA ? "" : "opacity-50"}`}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-black text-sm" style={{ background: teamA?.color }}>
                      {teamA?.logo}
                    </div>
                    <div className="font-display font-bold">{teamA?.name}</div>
                  </div>

                  <div className="font-display font-black text-2xl">
                    {m.teamAScore ?? m.team_a_score} <span className="text-muted-foreground text-sm">vs</span> {m.teamBScore ?? m.team_b_score}
                  </div>

                  <div className={`flex items-center gap-2 flex-1 justify-end ${winnerIsA ? "opacity-50" : ""}`}>
                    <div className="font-display font-bold">{teamB?.name}</div>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-black text-sm" style={{ background: teamB?.color }}>
                      {teamB?.logo}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {matches.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No match entries yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}