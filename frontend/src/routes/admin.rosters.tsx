import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users2, Plus, AlertTriangle, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/AdminBits";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { roles, type Role } from "@/data/players";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/admin/rosters")({ component: RostersPage });

const API_BASE_URL = "http://localhost:8000";
const COLORS = ["#a855f7", "#06b6d4", "#f472b6", "#facc15", "#34d399", "#60a5fa", "#fb923c", "#f87171"];

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
  nationality?: string;
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
  joinDate?: string;
  join_date?: string;
};

function getId(x: { id: number; season_id?: number; team_id?: number; player_id?: number; roster_id?: number }) {
  return Number(x.id ?? x.season_id ?? x.team_id ?? x.player_id ?? x.roster_id);
}

function RostersPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [rosters, setRosters] = useState<Roster[]>([]);

  const [seasonId, setSeasonId] = useState<number | "">("");
  const [open, setOpen] = useState(false);
  const [violation, setViolation] = useState<{ playerName: string; existingTeam: string } | null>(null);
  const [form, setForm] = useState({
    teamId: "",
    playerId: "",
    role: "Mid" as Role,
    joinDate: new Date().toISOString().slice(0, 10),
  });

  const loadAll = async () => {
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
      nationality: p.nationality ?? "",
    }));

    const normalizedRosters = rosterData.map(r => ({
      ...r,
      id: Number(r.id ?? r.roster_id),
      seasonId: Number(r.seasonId ?? r.season_id),
      teamId: Number(r.teamId ?? r.team_id),
      playerId: Number(r.playerId ?? r.player_id),
      joinDate: r.joinDate ?? r.join_date,
    }));

    setSeasons(seasonData);
    setTeams(normalizedTeams);
    setPlayers(normalizedPlayers);
    setRosters(normalizedRosters);

    const active = seasonData.find(s => s.status === "Active") ?? seasonData[0];
    if (!seasonId && active) setSeasonId(Number(active.id ?? active.season_id));

    if (!form.teamId && normalizedTeams[0]) {
      setForm(prev => ({ ...prev, teamId: String(normalizedTeams[0].id) }));
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const submit = async () => {
    if (!form.playerId || !form.teamId || !seasonId) return;

    const response = await fetch(`${API_BASE_URL}/api/rosters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        season_id: Number(seasonId),
        team_id: Number(form.teamId),
        player_id: Number(form.playerId),
        role: form.role,
        join_date: form.joinDate,
      }),
    });

    if (!response.ok) {
      const data = await response.json();

      if (response.status === 409) {
        setViolation({
          playerName: data.detail?.playerName ?? "Player",
          existingTeam: data.detail?.existingTeam ?? "another team",
        });
        return;
      }

      throw new Error(data.detail ?? "Failed to create roster");
    }

    setOpen(false);
    setForm({
      teamId: teams[0] ? String(teams[0].id) : "",
      playerId: "",
      role: "Mid",
      joinDate: new Date().toISOString().slice(0, 10),
    });
    loadAll();
  };

  const removeRoster = async (id: number) => {
    await fetch(`${API_BASE_URL}/api/rosters/${id}`, { method: "DELETE" });
    loadAll();
  };

  const seasonRosters = rosters.filter(r => Number(r.seasonId ?? r.season_id) === Number(seasonId));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <AdminHeader
        title="Roster Management"
        subtitle="Assign players to teams per season"
        icon={Users2}
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary glow-primary">
                <Plus className="w-4 h-4" /> Assign Player
              </Button>
            </DialogTrigger>

            <DialogContent className="glass border-primary/40">
              <DialogHeader>
                <DialogTitle className="font-display tracking-wider">
                  ASSIGN TO ROSTER
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
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
                  <Label>Team</Label>
                  <select
                    value={form.teamId}
                    onChange={e => setForm({ ...form, teamId: e.target.value })}
                    className="w-full mt-1 h-9 rounded-md bg-surface-2 border border-border px-3 text-sm"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Player</Label>
                  <select
                    value={form.playerId}
                    onChange={e => {
                      const p = players.find(pp => pp.id === Number(e.target.value));
                      setForm({ ...form, playerId: e.target.value, role: p?.role ?? form.role });
                    }}
                    className="w-full mt-1 h-9 rounded-md bg-surface-2 border border-border px-3 text-sm"
                  >
                    <option value="">Select player...</option>
                    {players.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nickname} ({p.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Role</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {roles.map(r => (
                      <button
                        key={r}
                        onClick={() => setForm({ ...form, role: r })}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider border ${
                          form.role === r
                            ? "bg-primary/20 text-primary border-primary/40"
                            : "border-border/40 text-muted-foreground"
                        }`}
                      >
                        {r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Join Date</Label>
                  <Input
                    type="date"
                    value={form.joinDate}
                    onChange={e => setForm({ ...form, joinDate: e.target.value })}
                  />
                </div>

                <Button onClick={submit} className="w-full gradient-primary">
                  CONFIRM ASSIGNMENT
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="glass rounded-xl p-4 mb-6 flex items-center gap-3 flex-wrap">
        <span className="text-xs text-muted-foreground tracking-wider">SEASON:</span>
        {seasons.map(s => {
          const sid = Number(s.id ?? s.season_id);
          return (
            <button
              key={sid}
              onClick={() => setSeasonId(sid)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider ${
                Number(seasonId) === sid
                  ? "gradient-primary text-primary-foreground"
                  : "bg-surface-2 text-muted-foreground"
              }`}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map(t => {
          const teamRoster = seasonRosters.filter(r => Number(r.teamId ?? r.team_id) === t.id);
          const slots = roles.map(r => ({ role: r, entry: teamRoster.find(e => e.role === r) }));

          return (
            <div key={t.id} className="glass rounded-xl p-5 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-20 blur-2xl" style={{ background: t.color }} />

              <div className="flex items-center gap-3 mb-4 relative">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-display font-black"
                  style={{ background: `linear-gradient(135deg, ${t.color}, oklch(0.3 0.15 290))` }}
                >
                  {t.logo}
                </div>
                <div>
                  <div className="font-display font-bold">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground tracking-wider">
                    {teamRoster.length}/5 PLAYERS
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {slots.map(({ role, entry }) => {
                  const player = entry ? players.find(p => p.id === Number(entry.playerId ?? entry.player_id)) : null;

                  return (
                    <div
                      key={role}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border ${
                        entry
                          ? "bg-surface-2/50 border-border/40"
                          : "border-dashed border-border/30"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-black tracking-wider"
                        style={{
                          background: entry ? player?.avatar : "transparent",
                          border: !entry ? "1px dashed currentColor" : "none",
                          color: entry ? "white" : "var(--muted-foreground)",
                        }}
                      >
                        {role.slice(0, 3).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        {player ? (
                          <>
                            <div className="text-sm font-bold truncate">{player.nickname}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {player.nationality} {player.realName ?? player.real_name}
                            </div>
                          </>
                        ) : (
                          <div className="text-xs text-muted-foreground italic">Empty slot</div>
                        )}
                      </div>

                      {entry && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-danger"
                          onClick={() => removeRoster(Number(entry.id ?? entry.roster_id))}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!violation} onOpenChange={(o) => !o && setViolation(null)}>
        <DialogContent className="glass border-danger/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-danger font-display tracking-wider">
              <AlertTriangle className="w-6 h-6 animate-pulse-glow" /> ROSTER CONSTRAINT VIOLATION
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-danger/10 border border-danger/40 text-sm">
              <strong className="text-danger">{violation?.playerName}</strong> is already registered to{" "}
              <strong>{violation?.existingTeam}</strong> in this season.
            </div>

            <p className="text-xs text-muted-foreground">
              A player cannot be assigned to two different teams in the same season.
            </p>

            <Button onClick={() => setViolation(null)} className="w-full" variant="outline">
              UNDERSTOOD
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}