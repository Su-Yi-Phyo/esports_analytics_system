import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Database, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/AdminBits";
import { Button } from "@/components/ui/button";
import { roles, type Role } from "@/data/players";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/admin/records")({ component: Records });

const API_BASE_URL = "http://localhost:8000";
const COLORS = ["#a855f7", "#06b6d4", "#22d3ee", "#f472b6", "#facc15", "#34d399", "#60a5fa", "#fb923c"];

type Season = {
  id: number;
  season_id?: number;
  name: string;
};

type Team = {
  id: number;
  team_id?: number;
  name: string;
  team_name?: string;
  logo?: string;
  color?: string;
};

type Player = {
  id: number;
  player_id?: number;
  nickname: string;
  avatar?: string;
};

type MatchStat = {
  id: number;
  playerId?: number;
  player_id?: number;
  playerName?: string;
  player_name?: string;
  role: Role;
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;
  kda: number;
};

type Match = {
  id: number;
  match_id?: number;
  seasonId?: number;
  season_id?: number;
  matchDate?: string;
  match_date?: string;
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
  durationMinutes?: number;
  duration_minutes?: number;
  stats?: MatchStat[];
};

const calcKDA = (k: number, d: number, a: number) => (k + a) / Math.max(1, d);

function Records() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);

  const [seasonId, setSeasonId] = useState<string>("All");
  const [teamId, setTeamId] = useState<string>("All");
  const [playerId, setPlayerId] = useState<string>("All");
  const [role, setRole] = useState<Role | "All">("All");

  const loadRecords = async () => {
    const [matchData, teamData, playerData, seasonData] = await Promise.all([
      apiGet<Match[]>("/api/matches"),
      apiGet<Team[]>("/api/teams"),
      apiGet<Player[]>("/api/players"),
      apiGet<Season[]>("/api/seasons"),
    ]);

    const normalizedTeams = teamData.map((t, i) => ({
      ...t,
      id: Number(t.id ?? t.team_id),
      name: t.name ?? t.team_name ?? "",
      logo: t.logo ?? (t.name ?? t.team_name ?? "TM").slice(0, 2).toUpperCase(),
      color: t.color ?? COLORS[i % COLORS.length],
    }));

    const normalizedPlayers = playerData.map((p, i) => ({
      ...p,
      id: Number(p.id ?? p.player_id),
      avatar: p.avatar ?? COLORS[i % COLORS.length],
    }));

    const matchesWithStats = await Promise.all(
      matchData.map(async (m) => {
        const id = Number(m.id ?? m.match_id);
        const stats = await apiGet<MatchStat[]>(`/api/matches/${id}/stats`);
        return {
          ...m,
          id,
          seasonId: Number(m.seasonId ?? m.season_id),
          teamAId: Number(m.teamAId ?? m.team_a_id),
          teamBId: Number(m.teamBId ?? m.team_b_id),
          winnerTeamId: Number(m.winnerTeamId ?? m.winner_team_id),
          matchDate: m.matchDate ?? m.match_date,
          durationMinutes: Number(m.durationMinutes ?? m.duration_minutes ?? 0),
          teamAScore: Number(m.teamAScore ?? m.team_a_score ?? 0),
          teamBScore: Number(m.teamBScore ?? m.team_b_score ?? 0),
          stats,
        };
      })
    );

    setMatches(matchesWithStats);
    setTeams(normalizedTeams);
    setPlayers(normalizedPlayers);
    setSeasons(seasonData);
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const deleteMatch = async (id: number) => {
    await fetch(`${API_BASE_URL}/api/matches/${id}`, { method: "DELETE" });
    loadRecords();
  };

  const filtered = matches.filter(m =>
    (seasonId === "All" || String(m.seasonId ?? m.season_id) === seasonId) &&
    (teamId === "All" || String(m.teamAId ?? m.team_a_id) === teamId || String(m.teamBId ?? m.team_b_id) === teamId) &&
    (playerId === "All" || (m.stats ?? []).some(s => String(s.playerId ?? s.player_id) === playerId)) &&
    (role === "All" || (m.stats ?? []).some(s => s.role === role))
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <AdminHeader title="Data Records" subtitle="Match history and player statistics" icon={Database} />

      <div className="glass rounded-xl p-4 mb-6 grid md:grid-cols-4 gap-3">
        <select value={seasonId} onChange={e => setSeasonId(e.target.value)} className="h-9 rounded-md bg-surface-2 border border-border px-3 text-sm">
          <option value="All">All Seasons</option>
          {seasons.map(s => (
            <option key={s.id} value={String(s.id ?? s.season_id)}>
              {s.name}
            </option>
          ))}
        </select>

        <select value={teamId} onChange={e => setTeamId(e.target.value)} className="h-9 rounded-md bg-surface-2 border border-border px-3 text-sm">
          <option value="All">All Teams</option>
          {teams.map(t => (
            <option key={t.id} value={String(t.id)}>
              {t.name}
            </option>
          ))}
        </select>

        <select value={playerId} onChange={e => setPlayerId(e.target.value)} className="h-9 rounded-md bg-surface-2 border border-border px-3 text-sm">
          <option value="All">All Players</option>
          {players.map(p => (
            <option key={p.id} value={String(p.id)}>
              {p.nickname}
            </option>
          ))}
        </select>

        <select value={role} onChange={e => setRole(e.target.value as Role | "All")} className="h-9 rounded-md bg-surface-2 border border-border px-3 text-sm">
          <option value="All">All Roles</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map(m => {
          const a = teams.find(t => t.id === Number(m.teamAId ?? m.team_a_id));
          const b = teams.find(t => t.id === Number(m.teamBId ?? m.team_b_id));
          const winA = Number(m.winnerTeamId ?? m.winner_team_id) === Number(m.teamAId ?? m.team_a_id);

          return (
            <div key={m.id} className="glass rounded-xl p-5 hover:border-primary/40 transition-all">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <div className="text-[10px] text-muted-foreground tracking-[0.3em]">
                    {m.matchDate ?? m.match_date} · {m.durationMinutes ?? m.duration_minutes}min
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 ${winA ? "" : "opacity-50"}`}>
                      <div className="w-8 h-8 rounded flex items-center justify-center font-display font-black text-xs" style={{ background: a?.color }}>
                        {a?.logo}
                      </div>
                      <span className="font-bold text-sm">{a?.name}</span>
                    </div>

                    <span className="font-display font-black text-xl">
                      {m.teamAScore ?? m.team_a_score} - {m.teamBScore ?? m.team_b_score}
                    </span>

                    <div className={`flex items-center gap-2 ${winA ? "opacity-50" : ""}`}>
                      <span className="font-bold text-sm">{b?.name}</span>
                      <div className="w-8 h-8 rounded flex items-center justify-center font-display font-black text-xs" style={{ background: b?.color }}>
                        {b?.logo}
                      </div>
                    </div>
                  </div>
                </div>

                <Button size="sm" variant="outline" className="text-danger" onClick={() => deleteMatch(m.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>

              {(m.stats ?? []).length > 0 && (
                <div className="grid md:grid-cols-2 gap-2 pt-4 border-t border-border/40">
                  {(m.stats ?? []).map(st => {
                    const pid = Number(st.playerId ?? st.player_id);
                    const p = players.find(pp => pp.id === pid);
                    const name = st.playerName ?? st.player_name ?? p?.nickname ?? "Player";

                    return (
                      <div key={st.id ?? pid} className="flex items-center gap-3 p-2 rounded bg-surface-2/40 text-xs">
                        <div className="w-7 h-7 rounded flex items-center justify-center font-bold text-[10px]" style={{ background: p?.avatar }}>
                          {name.slice(0, 2)}
                        </div>
                        <div className="flex-1 truncate font-bold">{name}</div>
                        <span className="font-mono text-muted-foreground">{st.kills}/{st.deaths}/{st.assists}</span>
                        <span className="font-display font-black text-primary">
                          {Number(st.kda ?? calcKDA(st.kills, st.deaths, st.assists)).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="glass rounded-xl p-12 text-center text-muted-foreground">
            No records match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}