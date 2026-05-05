import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserCog, Plus, Trash2, Edit3, Search } from "lucide-react";
import { AdminHeader } from "@/components/AdminBits";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { roles, type Role } from "@/data/players";
import { RoleBadge } from "@/components/PlayerBits";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/admin/players")({ component: PlayersPage });

const API_BASE_URL = "http://localhost:8000";

type PlayerStatus = "Active" | "Bench" | "Free Agent";

type AdminPlayer = {
  id: number;
  player_id?: number;
  nickname: string;
  realName?: string;
  real_name?: string;
  role: Role;
  nationality: string;
  avatar?: string;
  status: PlayerStatus;
};

const FLAGS = ["🇮🇩", "🇵🇭", "🇲🇾", "🇸🇬", "🇲🇲", "🇰🇭", "🇻🇳", "🇹🇭", "🇧🇷"];
const COLORS = ["#a855f7", "#06b6d4", "#22d3ee", "#f472b6", "#facc15", "#34d399", "#60a5fa", "#fb923c"];

const empty = {
  nickname: "",
  realName: "",
  role: "Mid" as Role,
  nationality: FLAGS[0],
  avatar: COLORS[0],
  status: "Active" as PlayerStatus,
};

function PlayersPage() {
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "All">("All");
  const [statusFilter, setStatusFilter] = useState<PlayerStatus | "All">("All");

  const loadPlayers = () => {
    apiGet<AdminPlayer[]>("/api/players").then((data) => {
      setPlayers(
        data.map((p) => ({
          ...p,
          id: Number(p.id ?? p.player_id),
          realName: p.realName ?? p.real_name ?? "",
          avatar: p.avatar ?? COLORS[Number(p.id ?? p.player_id ?? 0) % COLORS.length],
          nationality: p.nationality ?? FLAGS[0],
          status: p.status ?? "Active",
        }))
      );
    });
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  const submit = async () => {
    if (!form.nickname) return;

    const payload = {
      nickname: form.nickname,
      real_name: form.realName,
      role: form.role,
      nationality: form.nationality,
      status: form.status,
      avatar: form.avatar,
    };

    const url = editing
      ? `${API_BASE_URL}/api/players/${editing}`
      : `${API_BASE_URL}/api/players`;

    try {
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert("Could not save player. Please check the player information and try again.");
        return;
      }

      setOpen(false);
      setForm(empty);
      setEditing(null);
      loadPlayers();
    } catch (err) {
      alert("Cannot connect to the backend server. Please make sure FastAPI is running.");
    }
  };

  const startEdit = (p: AdminPlayer) => {
    setEditing(Number(p.id ?? p.player_id));
    setForm({
      nickname: p.nickname,
      realName: p.realName ?? p.real_name ?? "",
      role: p.role,
      nationality: p.nationality ?? FLAGS[0],
      avatar: p.avatar ?? COLORS[0],
      status: p.status ?? "Active",
    });
    setOpen(true);
  };

  const deletePlayer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this player?")) return;

    await fetch(`${API_BASE_URL}/api/players/${id}`, {
      method: "DELETE",
    });

    loadPlayers();
  };

  const filtered = players.filter(p =>
    (roleFilter === "All" || p.role === roleFilter) &&
    (statusFilter === "All" || p.status === statusFilter) &&
    (
      p.nickname.toLowerCase().includes(search.toLowerCase()) ||
      (p.realName ?? p.real_name ?? "").toLowerCase().includes(search.toLowerCase())
    )
  );

  const statusColor: Record<PlayerStatus, string> = {
    Active: "bg-success/20 text-success border-success/40",
    Bench: "bg-warning/20 text-warning border-warning/40",
    "Free Agent": "bg-muted/40 text-muted-foreground border-muted/40",
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <AdminHeader
        title="Player Management"
        subtitle="Pro player roster database"
        icon={UserCog}
        action={
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setForm(empty); setEditing(null); } }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary glow-primary">
                <Plus className="w-4 h-4" /> New Player
              </Button>
            </DialogTrigger>

            <DialogContent className="glass border-primary/40">
              <DialogHeader>
                <DialogTitle className="font-display tracking-wider">
                  {editing ? "EDIT PLAYER" : "NEW PLAYER"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nickname</Label>
                    <Input value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} />
                  </div>
                  <div>
                    <Label>Real Name</Label>
                    <Input value={form.realName} onChange={e => setForm({ ...form, realName: e.target.value })} />
                  </div>
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
                  <Label>Nationality</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {FLAGS.map(f => (
                      <button
                        key={f}
                        onClick={() => setForm({ ...form, nationality: f })}
                        className={`text-2xl p-1 rounded ${form.nationality === f ? "bg-primary/20" : ""}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Avatar Color</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setForm({ ...form, avatar: c })}
                        className={`w-7 h-7 rounded ${form.avatar === c ? "ring-2 ring-foreground" : ""}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <div className="flex gap-2 mt-2">
                    {(["Active", "Bench", "Free Agent"] as PlayerStatus[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setForm({ ...form, status: s })}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider border ${
                          form.status === s
                            ? statusColor[s]
                            : "border-border/40 text-muted-foreground"
                        }`}
                      >
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={submit} className="w-full gradient-primary">
                  SAVE PLAYER
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="glass rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search players..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border-0 bg-transparent"
          />
        </div>

        <div className="flex gap-1">
          {(["All", ...roles] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${
                roleFilter === r
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface-2 text-muted-foreground"
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          {(["All", "Active", "Bench", "Free Agent"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wider ${
                statusFilter === s
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface-2 text-muted-foreground"
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => (
          <div key={p.id} className="glass rounded-xl p-4 hover:border-primary/60 transition-all group">
            <div className="flex items-start gap-3 mb-3">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center font-display font-black shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${p.avatar}, oklch(0.3 0.15 290))`,
                  boxShadow: `0 0 15px ${p.avatar}60`,
                }}
              >
                {p.nickname.split(" ").map(s => s[0]).join("").slice(0, 2)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{p.nickname}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {p.realName ?? p.real_name} {p.nationality}
                </div>
                <div className="mt-1">
                  <RoleBadge role={p.role} />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/40">
              <span className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded border ${statusColor[p.status]}`}>
                {p.status.toUpperCase()}
              </span>

              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(p)}>
                  <Edit3 className="w-3 h-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-danger" onClick={() => deletePlayer(p.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}