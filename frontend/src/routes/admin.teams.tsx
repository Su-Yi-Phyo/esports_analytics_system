import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, Plus, Trash2, Edit3, Users2 } from "lucide-react";
import { AdminHeader } from "@/components/AdminBits";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/admin/teams")({ component: TeamsPage });

const API_BASE_URL = "http://localhost:8000";
const COLORS = ["#a855f7", "#06b6d4", "#f472b6", "#facc15", "#34d399", "#60a5fa", "#fb923c", "#f87171"];

type Team = {
  id: number;
  team_id?: number;
  name: string;
  team_name?: string;
  region: string;
  coach: string;
  logo: string;
  founded: number;
  color: string;
  rosterCount?: number;
  roster_count?: number;
  seasonCount?: number;
  season_count?: number;
};

type RosterPlayer = {
  id: number;
  player_id: number;
  nickname: string;
  realName?: string;
  real_name?: string;
  role: string;
  joinDate?: string;
  join_date?: string;
  avatar?: string;
};

const empty = {
  name: "",
  region: "",
  coach: "",
  logo: "",
  founded: 2024,
  color: COLORS[0],
};

function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [rostersByTeam, setRostersByTeam] = useState<Record<number, RosterPlayer[]>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [viewRoster, setViewRoster] = useState<Team | null>(null);

  const loadTeams = () => {
    apiGet<Team[]>("/api/teams").then(setTeams);
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const getId = (t: Team) => Number(t.id ?? t.team_id);

  const submit = async () => {
    if (!form.name) return;

    const payload = {
      name: form.name,
      team_name: form.name,
      region: form.region,
      coach: form.coach,
      logo: form.logo || form.name.slice(0, 2).toUpperCase(),
      founded: form.founded,
      color: form.color,
    };

    const url = editing
      ? `${API_BASE_URL}/api/teams/${editing}`
      : `${API_BASE_URL}/api/teams`;

    await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setOpen(false);
    setForm(empty);
    setEditing(null);
    loadTeams();
  };

  const startEdit = (t: Team) => {
    setEditing(getId(t));
    setForm({
      name: t.name ?? t.team_name ?? "",
      region: t.region ?? "",
      coach: t.coach ?? "",
      logo: t.logo ?? "",
      founded: t.founded ?? 2024,
      color: t.color ?? COLORS[0],
    });
    setOpen(true);
  };

  const deleteTeam = async (id: number) => {
    await fetch(`${API_BASE_URL}/api/teams/${id}`, { method: "DELETE" });
    loadTeams();
  };

  const loadRoster = async (team: Team) => {
    const id = getId(team);
    setViewRoster(team);

    if (!rostersByTeam[id]) {
      const roster = await apiGet<RosterPlayer[]>(`/api/teams/${id}/roster`);
      setRostersByTeam(prev => ({ ...prev, [id]: roster }));
    }
  };

  const teamRoster = (tid: number) => rostersByTeam[tid] ?? [];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <AdminHeader
        title="Team Management"
        subtitle="Manage MLBB esports organizations"
        icon={Shield}
        action={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setForm(empty); setEditing(null); } }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary glow-primary">
                <Plus className="w-4 h-4" /> New Team
              </Button>
            </DialogTrigger>

            <DialogContent className="glass border-primary/40">
              <DialogHeader>
                <DialogTitle className="font-display tracking-wider">
                  {editing ? "EDIT TEAM" : "NEW TEAM"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <Label>Team Name</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Region</Label>
                    <Input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} />
                  </div>
                  <div>
                    <Label>Coach</Label>
                    <Input value={form.coach} onChange={e => setForm({ ...form, coach: e.target.value })} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Logo (text)</Label>
                    <Input maxLength={3} value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} placeholder="ON" />
                  </div>
                  <div>
                    <Label>Founded</Label>
                    <Input type="number" value={form.founded} onChange={e => setForm({ ...form, founded: +e.target.value })} />
                  </div>
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setForm({ ...form, color: c })}
                        className={`w-8 h-8 rounded-md transition-all ${form.color === c ? "ring-2 ring-foreground scale-110" : ""}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>

                <Button onClick={submit} className="w-full gradient-primary">
                  SAVE TEAM
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {teams.map(t => {
          const id = getId(t);
          const name = t.name ?? t.team_name;
          const rosterCount = t.rosterCount ?? t.roster_count ?? 0;
          const seasonCount = t.seasonCount ?? t.season_count ?? 0;

          return (
            <div key={id} className="glass rounded-xl p-6 hover:border-primary/60 transition-all group relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl" style={{ background: t.color }} />

              <div className="flex items-start gap-4 mb-4 relative">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center font-display font-black text-xl shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${t.color}, oklch(0.3 0.15 290))`,
                    boxShadow: `0 0 20px ${t.color}60`,
                  }}
                >
                  {t.logo}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl font-black truncate">{name}</h3>
                  <div className="text-xs text-muted-foreground">{t.region} · Est. {t.founded}</div>
                  <div className="text-xs text-accent mt-0.5">👤 {t.coach}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs mb-4 p-3 rounded-lg bg-surface-2/50">
                <div>
                  <div className="text-muted-foreground text-[10px] tracking-wider">ROSTER</div>
                  <div className="font-display font-black text-lg">{rosterCount}/5</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-[10px] tracking-wider">SEASONS</div>
                  <div className="font-display font-black text-lg">{seasonCount}</div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => loadRoster(t)} className="flex-1 text-xs">
                  <Users2 className="w-3 h-3" /> Roster
                </Button>
                <Button size="sm" variant="outline" onClick={() => startEdit(t)}>
                  <Edit3 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteTeam(id)} className="text-danger">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!viewRoster} onOpenChange={(o) => !o && setViewRoster(null)}>
        <DialogContent className="glass border-primary/40 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider flex items-center gap-3">
              {viewRoster && (
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-black text-sm"
                  style={{ background: viewRoster.color }}
                >
                  {viewRoster.logo}
                </div>
              )}
              {viewRoster?.name ?? viewRoster?.team_name} ROSTER
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {viewRoster && teamRoster(getId(viewRoster)).map(r => (
              <div key={r.id ?? r.player_id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-2/50">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm gradient-primary">
                  {r.nickname.split(" ").map(s => s[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{r.nickname}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.realName ?? r.real_name ?? "Unknown"} · joined {r.joinDate ?? r.join_date ?? "N/A"}
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded bg-primary/20 text-primary font-bold tracking-wider">
                  {r.role.toUpperCase()}
                </span>
              </div>
            ))}

            {viewRoster && teamRoster(getId(viewRoster)).length === 0 && (
              <div className="text-center text-muted-foreground py-8 text-sm">
                No roster entries yet.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}