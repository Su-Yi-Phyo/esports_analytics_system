import { createFileRoute } from "@tanstack/react-router";
import { GitBranch, Database, Shield, Layers, Trophy } from "lucide-react";
import { AdminHeader } from "@/components/AdminBits";

export const Route = createFileRoute("/admin/logic")({ component: SystemLogic });

function SystemLogic() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <AdminHeader title="System Logic" subtitle="Database architecture & algorithmic foundations" icon={GitBranch} />

      <div className="grid md:grid-cols-2 gap-5">
        <Card icon={Trophy} title="SQL DENSE_RANK Leaderboard" tag="POSTGRESQL" color="primary">
          <p className="text-xs text-muted-foreground mb-3">Players sharing the same KDA receive the same rank without skipping the next position — ideal for tournament leaderboards.</p>
          <pre className="text-[11px] font-mono bg-surface-2/60 p-3 rounded-lg border border-border/40 overflow-auto">
{`SELECT
  player_id,
  nickname,
  AVG(kda) AS avg_kda,
  DENSE_RANK() OVER (
    PARTITION BY role
    ORDER BY AVG(kda) DESC
  ) AS rank
FROM match_player_stats
JOIN players USING (player_id)
GROUP BY player_id, nickname, role;`}
          </pre>
          <Diagram items={[
            { label: "Kairi", v: "5.8", rank: 1 },
            { label: "Lemon", v: "5.2", rank: 2 },
            { label: "Sanji", v: "5.2", rank: 2 },
            { label: "Bren", v: "4.1", rank: 3 },
          ]} />
        </Card>

        <Card icon={Shield} title="SQL Trigger — Roster Validation" tag="CONSTRAINT" color="danger">
          <p className="text-xs text-muted-foreground mb-3">Server-enforced rule: a player cannot belong to two teams within the same season. Demonstrated live on the Roster page.</p>
          <pre className="text-[11px] font-mono bg-surface-2/60 p-3 rounded-lg border border-border/40 overflow-auto">
{`CREATE TRIGGER trg_roster_unique_player_per_season
BEFORE INSERT ON rosters
FOR EACH ROW
EXECUTE FUNCTION check_unique_player_season();

CREATE FUNCTION check_unique_player_season()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM rosters
    WHERE season_id = NEW.season_id
      AND player_id = NEW.player_id
  ) THEN
    RAISE EXCEPTION
      'Player already on another team this season';
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;`}
          </pre>
        </Card>

        <Card icon={Layers} title="MongoDB Nested Match Logs" tag="DOCUMENT DB" color="cyan">
          <p className="text-xs text-muted-foreground mb-3">Each match document embeds nested player statistics — perfect for write-once analytics blobs.</p>
          <pre className="text-[11px] font-mono bg-surface-2/60 p-3 rounded-lg border border-border/40 overflow-auto">
{`{
  _id: "match_2026_04_28",
  season: "MPL S14",
  teams: { a: "ONIC", b: "RRQ" },
  score: { a: 2, b: 1 },
  players: [
    {
      ign: "Kairi", role: "EXP",
      stats: { k: 7, d: 2, a: 9, gpm: 712 }
    },
    { ign: "Branz", role: "Jungle",
      stats: { k: 11, d: 3, a: 6, gpm: 798 } }
  ]
}`}
          </pre>
        </Card>

        <Card icon={Database} title="MongoDB Aggregation — Last 50 Games" tag="PIPELINE" color="success">
          <p className="text-xs text-muted-foreground mb-3">Aggregation pipeline computes rolling KDA for each player over their most recent 50 matches.</p>
          <pre className="text-[11px] font-mono bg-surface-2/60 p-3 rounded-lg border border-border/40 overflow-auto">
{`db.matches.aggregate([
  { $unwind: "$players" },
  { $sort: { date: -1 } },
  { $group: {
      _id: "$players.ign",
      last50: { $push: "$players.stats" }
  }},
  { $project: {
      last50: { $slice: ["$last50", 50] },
      kda: { $avg: "$last50.kda" }
  }}
]);`}
          </pre>
        </Card>
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, tag, color, children }: { icon: React.ComponentType<{ className?: string }>; title: string; tag: string; color: "primary" | "danger" | "cyan" | "success"; children: React.ReactNode }) {
  const map = { primary: "text-primary border-primary/30", danger: "text-danger border-danger/30", cyan: "text-accent border-accent/30", success: "text-success border-success/30" };
  return (
    <div className={`glass rounded-xl p-6 border ${map[color]} relative overflow-hidden`}>
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 blur-3xl" style={{ background: "currentColor" }} />
      <div className="flex items-start justify-between mb-4 relative">
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${map[color].split(" ")[0]}`} />
          <h3 className="font-display font-bold tracking-wider">{title}</h3>
        </div>
        <span className={`text-[9px] font-bold tracking-[0.3em] px-2 py-1 rounded border ${map[color]}`}>{tag}</span>
      </div>
      {children}
    </div>
  );
}

function Diagram({ items }: { items: { label: string; v: string; rank: number }[] }) {
  return (
    <div className="mt-4 space-y-1.5">
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded bg-surface-2/40 text-xs">
          <div className="w-8 text-center font-display font-black text-primary">#{it.rank}</div>
          <div className="flex-1 font-bold">{it.label}</div>
          <div className="font-mono text-muted-foreground">{it.v}</div>
        </div>
      ))}
    </div>
  );
}
