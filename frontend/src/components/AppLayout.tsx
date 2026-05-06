import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Trophy, Users, Swords, Target, Shield, Calendar, Users2, UserCog, ClipboardList, Database, GitBranch, Activity, LogOut, Repeat } from "lucide-react";
import { auth, useRole } from "@/data/auth";

const coachNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/players", label: "Players", icon: Users },
  { to: "/compare", label: "Compare", icon: Swords },
  { to: "/lineup", label: "Lineup Builder", icon: Target },
  { to: "/substitution", label: "Substitution", icon: Repeat },
] as const;

const adminNav: { to: string; label: string; icon: typeof Activity; exact?: boolean }[] = [
  { to: "/admin", label: "Overview", icon: Activity, exact: true },
  { to: "/admin/seasons", label: "Seasons", icon: Calendar },
  { to: "/admin/teams", label: "Teams", icon: Shield },
  { to: "/admin/players", label: "Players", icon: UserCog },
  { to: "/admin/rosters", label: "Rosters", icon: Users2 },
  { to: "/admin/matches", label: "Match Entry", icon: ClipboardList },
  { to: "/admin/records", label: "Records", icon: Database },
] as const;

export function AppLayout() {
  const path = useRouterState({ select: s => s.location.pathname });
  const role = useRole();
  const navigate = useNavigate();

  const isLogin = path === "/login";

  useEffect(() => {
    if (isLogin) return;
    if (!role) {
      navigate({ to: "/login" });
      return;
    }
    if (role === "coach" && path.startsWith("/admin")) {
      navigate({ to: "/" });
    }
    if (role === "admin" && !path.startsWith("/admin")) {
      navigate({ to: "/admin" });
    }
  }, [role, path, isLogin, navigate]);

  if (isLogin) return <Outlet />;
  if (!role) return null;

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : (to === "/" ? path === "/" : path.startsWith(to));

  const showCoach = role === "coach";
  const showAdmin = role === "admin";

  const handleLogout = () => {
    auth.logout();
    navigate({ to: "/login" });
  };

  const mobileNav = showCoach ? coachNav : adminNav;

  return (
    <div className="min-h-screen flex w-full">
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 glass sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 border-b border-border/50">
          <Link to={showAdmin ? "/admin" : "/"} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary glow-primary flex items-center justify-center font-display font-black text-lg">
              M
            </div>
            <div>
              <div className="font-display font-bold text-sm tracking-widest text-gradient">MLBB COACH</div>
              <div className="text-[10px] text-muted-foreground tracking-[0.3em]">DECISION SYSTEM</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-6">
          {showCoach && (
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-[0.3em] text-muted-foreground">COACH</div>
              <div className="space-y-1">
                {coachNav.map(({ to, label, icon: Icon }) => {
                  const active = isActive(to);
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        active ? "gradient-primary text-primary-foreground glow-primary" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="tracking-wider uppercase">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
          {showAdmin && (
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                <Shield className="w-3 h-3" /> ADMIN
              </div>
              <div className="space-y-1">
                {adminNav.map(({ to, label, icon: Icon, exact }) => {
                  const active = isActive(to, exact);
                  return (
                    <Link
                      key={to}
                      to={to}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        active ? "bg-accent/20 text-accent border border-accent/40 glow-cyan" : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="tracking-wider uppercase text-xs">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
        <div className="p-4 border-t border-border/50 space-y-3">
          <div className="glass rounded-lg p-4 text-xs">
            <div className="text-muted-foreground">Signed in as</div>
            <div className="font-display font-bold text-gradient uppercase tracking-widest">{role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest border border-border/50 hover:border-danger hover:text-danger transition-colors"
          >
            <LogOut className="w-3 h-3" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="md:hidden glass border-b border-border/50 p-4 flex gap-2 overflow-x-auto sticky top-0 z-50">
          {mobileNav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-2 px-3 py-2 rounded-md bg-surface-2 text-xs whitespace-nowrap">
              <Icon className="w-3 h-3" />
              {label}
            </Link>
          ))}
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-md bg-surface-2 text-xs whitespace-nowrap">
            <LogOut className="w-3 h-3" /> Logout
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
