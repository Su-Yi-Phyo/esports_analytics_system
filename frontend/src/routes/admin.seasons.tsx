import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Plus, Trash2, Edit3, Check } from "lucide-react";
import { AdminHeader } from "@/components/AdminBits";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/admin/seasons")({
  component: SeasonsPage,
});

type SeasonStatus = "Upcoming" | "Active" | "Completed";

type Season = {
  id: number;
  season_id?: number;
  name: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  status: SeasonStatus;
};

const empty = {
  name: "",
  startDate: "",
  endDate: "",
  status: "Upcoming" as SeasonStatus,
};

const API_BASE_URL = "http://localhost:8000";

function SeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<number | null>(null);

  const loadSeasons = () => {
    setLoading(true);
    apiGet<Season[]>("/api/seasons")
      .then(setSeasons)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  const submit = async () => {
    if (!form.name || !form.startDate || !form.endDate) return;

    const method = editing ? "PUT" : "POST";
    const url = editing
      ? `${API_BASE_URL}/api/seasons/${editing}`
      : `${API_BASE_URL}/api/seasons`;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        start_date: form.startDate,
        end_date: form.endDate,
        status: form.status,
      }),
    });

    setOpen(false);
    setForm(empty);
    setEditing(null);
    loadSeasons();
  };

  const startEdit = (s: Season) => {
    const id = s.id ?? s.season_id;
    setEditing(Number(id));
    setForm({
      name: s.name,
      startDate: s.startDate ?? s.start_date ?? "",
      endDate: s.endDate ?? s.end_date ?? "",
      status: s.status,
    });
    setOpen(true);
  };

  const deleteSeason = async (id: number) => {
    await fetch(`${API_BASE_URL}/api/seasons/${id}`, {
      method: "DELETE",
    });
    loadSeasons();
  };

  const activateSeason = async (id: number) => {
    await fetch(`${API_BASE_URL}/api/seasons/${id}/activate`, {
      method: "PUT",
    });
    loadSeasons();
  };

  const statusColor: Record<SeasonStatus, string> = {
    Active: "bg-success/20 text-success border-success/40",
    Upcoming: "bg-accent/20 text-accent border-accent/40",
    Completed: "bg-muted-foreground/20 text-muted-foreground border-muted/40",
  };

  if (loading) {
    return <div className="p-10 text-muted-foreground">Loading seasons...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <AdminHeader
        title="Season Management"
        subtitle="All seasons are listed here."
        icon={Calendar}
        action={
          <Dialog open={open} onOpenChange={(o) => {
            setOpen(o);
            if (!o) {
              setForm(empty);
              setEditing(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary glow-primary">
                <Plus className="w-4 h-4" /> New Season
              </Button>
            </DialogTrigger>

            <DialogContent className="glass border-primary/40">
              <DialogHeader>
                <DialogTitle className="font-display tracking-wider">
                  {editing ? "EDIT SEASON" : "NEW SEASON"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Season Name</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="MPL S15"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start</Label>
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End</Label>
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={e => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <div className="flex gap-2 mt-2">
                    {(["Upcoming", "Active", "Completed"] as SeasonStatus[]).map(s => (
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
                  SAVE SEASON
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {seasons.map(s => {
          const id = Number(s.id ?? s.season_id);
          const startDate = s.startDate ?? s.start_date;
          const endDate = s.endDate ?? s.end_date;

          return (
            <div key={id} className="glass rounded-xl p-6 relative overflow-hidden hover:border-primary/60 transition-all group">
              {s.status === "Active" && (
                <div className="absolute top-0 left-0 right-0 h-1 gradient-primary" />
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[10px] text-muted-foreground tracking-[0.3em]">
                    SEASON
                  </div>
                  <h3 className="font-display text-2xl font-black text-gradient">
                    {s.name}
                  </h3>
                </div>

                <span className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded border ${statusColor[s.status]}`}>
                  {s.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground mb-4">
                <div className="flex justify-between">
                  <span>Start</span>
                  <span className="text-foreground font-mono">{startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>End</span>
                  <span className="text-foreground font-mono">{endDate}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border/40">
                {s.status !== "Active" && (
                  <Button size="sm" variant="outline" onClick={() => activateSeason(id)} className="flex-1 text-xs">
                    <Check className="w-3 h-3" /> Activate
                  </Button>
                )}

                <Button size="sm" variant="outline" onClick={() => startEdit(s)}>
                  <Edit3 className="w-3 h-3" />
                </Button>

                <Button size="sm" variant="outline" onClick={() => deleteSeason(id)} className="text-danger hover:text-danger">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}