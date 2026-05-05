// Shared admin UI building blocks
import { ReactNode } from "react";

export function AdminHeader({ title, subtitle, icon: Icon, action }: { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }>; action?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl glass flex items-center justify-center text-accent glow-cyan">
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <div className="text-[10px] text-accent tracking-[0.3em] font-bold">ADMIN PANEL</div>
          <h1 className="text-3xl font-display font-black text-gradient">{title}</h1>
          <p className="text-xs text-muted-foreground tracking-wider">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, accent = "primary" }: { icon: React.ComponentType<{ className?: string }>; label: string; value: ReactNode; accent?: "primary" | "cyan" | "warning" | "danger" | "success" }) {
  const colorMap: Record<string, string> = {
    primary: "text-primary border-primary/30",
    cyan: "text-accent border-accent/30",
    warning: "text-warning border-warning/30",
    danger: "text-danger border-danger/30",
    success: "text-success border-success/30",
  };
  return (
    <div className={`glass rounded-xl p-5 border ${colorMap[accent]} relative overflow-hidden scan-line`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
          <div className="font-display text-3xl font-black mt-2">{value}</div>
        </div>
        <Icon className={`w-6 h-6 ${colorMap[accent].split(" ")[0]}`} />
      </div>
    </div>
  );
}
