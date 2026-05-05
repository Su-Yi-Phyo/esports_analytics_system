import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Save, ChevronDown, ChevronUp, Sword } from "lucide-react";
import { AdminHeader } from "@/components/AdminBits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { roles, type Role } from "@/data/players";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/admin/matches")({ component: MatchEntry });

const API_BASE_URL = "http://localhost:8000";
const COLORS = ["#a855f7", "#06b6d4", "#22d3ee", "#f472b6", "#facc15", "#34d399", "#60a5fa", "#fb923c"];

type Season = {
  id: number;
  season_id?: number;
  name: string;
  status: "Upcoming" | "Active" | "Completed";
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
  realName?: string;
  real_name?: string;
  role: Role;
  avatar?: string;
};

type Roster = {
  id: number;
  roster_id?: number;
  seasonId?: number;
  season_id?: number;
  teamId?: number;
  team_id?: number;
  playerId?: number;
  player_id?: number;
  role: Role;
};

type MatchPlayerStat = {
  playerId: number;
  teamId: number;
  team: "A" | "B";
  role: Role;
  kills: number;
  deaths: number;
  assists: number;
  gpm: number;
  damageDealt: number;
  damageTaken: number;
  objPart: number;
};

const blankStat = (
  playerId: number,
  teamId: number,
  team: "A" | "B",
  role: Role
): MatchPlayerStat => ({
  playerId,
  teamId,
  team,
  role,
  kills: 0,
  deaths: 0,
  assists: 0,
  gpm: 0,
  damageDealt: 0,
  damageTaken: 0,
  objPart: 0,
});

const calcKDA = (k: number, d: number, a: number) => (k + a) / Math.max(1, d);

function MatchEntry() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rosters, setRosters] = useState<Roster[]>([]);

  const [seasonId, setSeasonId] = useState<number | "">("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [teamAId, setTeamAId] = useState<number | "">("");
  const [teamBId, setTeamBId] = useState<number | "">("");
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [duration, setDuration] = useState(15);
  const [stats, setStats] = useState<Record<number, MatchPlayerStat>>({});
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const [seasonData, teamData, playerData, rosterData] = await Promise.all([
        apiGet<Season[]>("/api/seasons"),
        apiGet<Team[]>("/api/teams"),
        apiGet<Player[]>("/api/players"),
        apiGet<Roster[]>("/api/rosters"),
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
        realName: p.realName ?? p.real_name ?? "",
        avatar: p.avatar ?? COLORS[i % COLORS.length],
      }));

      const normalizedRosters = rosterData.map(r => ({
        ...r,
        id: Number(r.id ?? r.roster_id),
        seasonId: Number(r.seasonId ?? r.season_id),
        teamId: Number(r.teamId ?? r.team_id),
        playerId: Number(r.playerId ?? r.player_id),
      }));

      setSeasons(seasonData);
      setTeams(normalizedTeams);
      setPlayers(normalizedPlayers);
      setRosters(normalizedRosters);

      const active = seasonData.find(s => s.status === "Active") ?? seasonData[0];
      if (active) setSeasonId(Number(active.id ?? active.season_id));

      if (normalizedTeams[0]) setTeamAId(normalizedTeams[0].id);
      if (normalizedTeams[1]) setTeamBId(normalizedTeams[1].id);
    };

    load();
  }, []);

  const teamRoster = (tid: number | "") =>
    rosters
      .filter(r => Number(r.seasonId ?? r.season_id) === Number(seasonId) && Number(r.teamId ?? r.team_id) === Number(tid))
      .map(r => ({
        ...r,
        player: players.find(p => p.id === Number(r.playerId ?? r.player_id)),
      }))
      .filter(r => r.player);

  const aRoster = useMemo(() => teamRoster(teamAId), [teamAId, seasonId, rosters, players]);
  const bRoster = useMemo(() => teamRoster(teamBId), [teamBId, seasonId, rosters, players]);

  const getStat = (playerId: number, teamId: number, team: "A" | "B", role: Role) =>
    stats[playerId] ?? blankStat(playerId, teamId, team, role);

  const updateStat = (
    playerId: number,
    patch: Partial<MatchPlayerStat>,
    teamId: number,
    team: "A" | "B",
    role: Role
  ) => {
    setStats(s => ({
      ...s,
      [playerId]: { ...getStat(playerId, teamId, team, role), ...patch },
    }));
  };

  const save = async () => {
    if (!seasonId || !teamAId || !teamBId || teamAId === teamBId) return;

    const winnerId =
      scoreA > scoreB ? Number(teamAId) :
      scoreB > scoreA ? Number(teamBId) :
      null;

    const allRosterStats = [
      ...aRoster.map(r => getStat(r.player!.id, Number(teamAId), "A", r.role)),
      ...bRoster.map(r => getStat(r.player!.id, Number(teamBId), "B", r.role)),
    ];

    const payload = {
      season_id: Number(seasonId),
      match_date: date,
      team_a_id: Number(teamAId),
      team_b_id: Number(teamBId),
      team_a_score: scoreA,
      team_b_score: scoreB,
      winner_team_id: winnerId,
      match_duration_minutes: duration,
      stats: allRosterStats.map(s => ({
        player_id: s.playerId,
        team_id: s.teamId,
        role: s.role,
        kills: s.kills,
        deaths: s.deaths,
        assists: s.assists,
        gpm: s.gpm,
        damage_dealt: s.damageDealt,
        damage_taken: s.damageTaken,
        objective_participation: s.objPart,
        result: winnerId === s.teamId ? "WIN" : "LOSE",
      })),
    };

    await fetch(`${API_BASE_URL}/api/matches`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setStats({});
    setScoreA(0);
    setScoreB(0);
  };

  const teamA = teams.find(t => t.id === Number(teamAId));
  const teamB = teams.find(t => t.id === Number(teamBId));

  const renderRoster = (roster: ReturnType<typeof teamRoster>, team: "A" | "B", teamId: number | "", color?: string) => (
    <div className="space-y-2">
      {roster.map(r => {
        const player = r.player!;
        const stat = getStat(player.id, Number(teamId), team, r.role);
        const kda = calcKDA(stat.kills, stat.deaths, stat.assists);
        const isOpen = expanded === `${team}-${player.id}`;

        return (
          <div key={r.id} className="rounded-lg border border-border/40 bg-surface-2/50 overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : `${team}-${player.id}`)}
              className="w-full flex items-center gap-3 p-3 hover:bg-surface-2 transition-all"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs" style={{ background: player.avatar }}>
                {player.nickname.split(" ").map(s => s[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-bold truncate">{player.nickname}</div>
                <div className="text-[10px] text-muted-foreground tracking-wider">{r.role.toUpperCase()}</div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="font-mono">
                  <span className="text-success">{stat.kills}</span>/<span className="text-danger">{stat.deaths}</span>/<span className="text-accent">{stat.assists}</span>
                </div>
                <div className="font-display font-black text-primary">{kda.toFixed(2)}</div>
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {isOpen && (
              <div className="p-3 border-t border-border/40 grid grid-cols-3 gap-2">
                {[
                  { k: "kills", l: "Kills" },
                  { k: "deaths", l: "Deaths" },
                  { k: "assists", l: "Assists" },
                  { k: "gpm", l: "GPM" },
                  { k: "damageDealt", l: "DMG Dealt" },
                  { k: "damageTaken", l: "DMG Taken" },
                  { k: "objPart", l: "Obj %" },
                ].map(({ k, l }) => (
                  <div key={k}>
                    <Label className="text-[10px] tracking-wider">{l}</Label>
                    <Input
                      type="number"
                      value={(stat as any)[k]}
                      onChange={e =>
                        updateStat(
                          player.id,
                          { [k]: +e.target.value } as any,
                          Number(teamId),
                          team,
                          r.role
                        )
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {roster.length === 0 && (
        <div className="text-xs text-muted-foreground p-4 text-center italic">
          No roster for selected season.
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <AdminHeader
        title="Match Result Entry"
        subtitle="Record match outcomes and player statistics"
        icon={ClipboardList}
        action={
          <Button onClick={save} className="gradient-primary glow-primary">
            <Save className="w-4 h-4" /> Save Match Record
          </Button>
        }
      />

      <div className="glass rounded-xl p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <Label>Season</Label>
            <select
              value={seasonId}
              onChange={e => setSeasonId(Number(e.target.value))}
              className="w-full mt-1 h-9 rounded-md bg-surface-2 border border-border px-3 text-sm"
            >
              {seasons.map(s => (
                <option key={s.id} value={Number(s.id ?? s.season_id)}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Match Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>

          <div>
            <Label>Duration (min)</Label>
            <Input type="number" value={duration} onChange={e => setDuration(+e.target.value)} />
          </div>

          <div className="flex items-end">
            <div className="text-xs text-muted-foreground">
              Winner:{" "}
              <span className="font-bold text-primary">
                {scoreA > scoreB ? teamA?.name : scoreA < scoreB ? teamB?.name : "TIE"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-6">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {teamA && (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-black" style={{ background: teamA.color }}>
                  {teamA.logo}
                </div>
              )}
              <select
                value={teamAId}
                onChange={e => setTeamAId(Number(e.target.value))}
                className="bg-transparent font-display font-bold text-lg outline-none"
              >
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <Input type="number" value={scoreA} onChange={e => setScoreA(+e.target.value)} className="w-16 h-12 text-center font-display font-black text-2xl" />
          </div>

          {renderRoster(aRoster, "A", teamAId, teamA?.color)}
        </div>

        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {teamB && (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-black" style={{ background: teamB.color }}>
                  {teamB.logo}
                </div>
              )}
              <select
                value={teamBId}
                onChange={e => setTeamBId(Number(e.target.value))}
                className="bg-transparent font-display font-bold text-lg outline-none"
              >
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <Input type="number" value={scoreB} onChange={e => setScoreB(+e.target.value)} className="w-16 h-12 text-center font-display font-black text-2xl" />
          </div>

          {renderRoster(bRoster, "B", teamBId, teamB?.color)}
        </div>
      </div>

      <div className="glass rounded-xl p-4 flex items-center gap-3 text-xs text-muted-foreground">
        <Sword className="w-4 h-4 text-accent" />
        KDA auto-calculates as (Kills + Assists) / max(1, Deaths). Click any player to expand and enter detailed stats.
      </div>
    </div>
  );
}