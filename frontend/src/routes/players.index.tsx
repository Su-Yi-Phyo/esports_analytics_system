import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { apiGet } from "@/lib/api";

export const Route = createFileRoute("/players/")({
  component: PlayersIndex,
});

type ApiPlayer = {
  id: number;
  player_id?: number;
  nickname: string;
  role: string;
  team?: string;
  team_name?: string;
  kda: number;
};

function PlayersIndex() {
  const [players, setPlayers] = useState<ApiPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<ApiPlayer[]>("/api/players")
      .then(setPlayers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-muted-foreground">Loading players...</div>;

  return (
    <div className="p-6 md:p-10 space-y-8">
      <header className="animate-float-up">
        <div className="text-xs tracking-[0.4em] text-muted-foreground mb-2">// ROSTER</div>
        <h1 className="text-4xl md:text-5xl font-display font-black">
          ALL <span className="text-gradient">PLAYERS</span>
        </h1>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {players.map((p, i) => (
          <Link
            key={p.id}
            to="/players/$id"
            params={{ id: String(p.id) }}
            className="group glass rounded-2xl p-5 flex items-center gap-3 hover:glow-primary hover:-translate-y-0.5 transition-all animate-float-up"
            style={{ animationDelay: `${i * 25}ms` }}
          >
            <PlayerAvatar nickname={p.nickname} size={52} />
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold truncate">{p.nickname}</div>
              <div className="text-xs text-muted-foreground truncate">
                {(p.team ?? p.team_name ?? "Free Agent")} · KDA {Number(p.kda).toFixed(1)}
              </div>
              <div className="mt-1">
                <RoleBadge role={p.role} />
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function PlayerAvatar({ nickname, size = 52 }: { nickname: string; size?: number }) {
  const initials = nickname.split(" ").map(s => s[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div
      className="relative rounded-lg flex items-center justify-center font-display font-black shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, oklch(0.7 0.27 305), oklch(0.78 0.18 200))",
        fontSize: size * 0.35,
        boxShadow: `0 0 ${size / 3}px oklch(0.7 0.27 305 / 0.4)`,
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