import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { auth, type Role } from "@/data/auth";
import { Shield, Target, LogIn } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — MLBB Coach" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("coach");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    auth.login(role);
    navigate({ to: role === "admin" ? "/admin" : "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 grid-bg relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 30%, oklch(0.7 0.27 305 / 0.25), transparent 60%)" }} />
      <div className="relative w-full max-w-md glass rounded-3xl p-8 space-y-6 animate-float-up">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-xl gradient-primary glow-primary flex items-center justify-center font-display font-black text-2xl">M</div>
          <div className="text-[10px] tracking-[0.4em] text-muted-foreground">// SECURE ACCESS</div>
          <h1 className="text-3xl font-display font-black text-gradient">MLBB COACH</h1>
          <p className="text-xs text-muted-foreground">Sign in to access the decision system</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {([
            { key: "coach", Icon: Target, label: "Coach", desc: "Analytics & lineup" },
            { key: "admin", Icon: Shield, label: "Admin", desc: "Database control" },
          ] as const).map(({ key, Icon, label, desc }) => {
            const active = role === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setRole(key)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  active
                    ? "border-primary bg-primary/10 glow-primary"
                    : "border-border/50 hover:border-primary/50 bg-surface-2/40"
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <div className="font-bold text-sm uppercase tracking-widest">{label}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{desc}</div>
              </button>
            );
          })}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Username</label>
            <input
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder={role === "admin" ? "admin" : "coach"}
              className="mt-1 w-full bg-surface-2/60 border border-border/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Password</label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full bg-surface-2/60 border border-border/50 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full gradient-primary glow-primary px-5 py-3 rounded-lg text-sm font-bold uppercase tracking-widest inline-flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" /> Sign in as {role}
          </button>
          <p className="text-[10px] text-center text-muted-foreground">Demo mode — any credentials accepted</p>
        </form>
      </div>
    </div>
  );
}
