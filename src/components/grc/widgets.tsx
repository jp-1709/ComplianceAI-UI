import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Inbox, Lock, Sparkles, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-state";
import { Button } from "@/components/ui/button";
import type { AiSuggestion, Permission, Risk } from "@/data/types";

export function useCountUp(target: number, ms = 700) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setV(target);
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

export function Panel({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("enterprise-panel animate-in fade-in slide-in-from-bottom-1 duration-300", className)}>
      {title && (
        <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function MetricCard({ label, value, suffix, hint, tone = "default", to, icon: Icon }: {
  label: string; value: number; suffix?: string; hint?: string; tone?: "default" | "critical" | "attention" | "compliant"; to: string; icon?: LucideIcon;
}) {
  const n = useCountUp(value);
  const toneCls = { default: "text-foreground", critical: "text-critical", attention: "text-attention-foreground dark:text-attention", compliant: "text-compliant" }[tone];
  return (
    <Link to={to} className="group enterprise-panel block p-4 transition hover:border-primary/40 hover:shadow-overlay focus-visible:outline-2">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-1.5">{Icon && <Icon className="size-3.5" />}{label}</span>
        <ChevronRight className="size-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
      <div className={cn("mt-2 text-3xl font-semibold tracking-tight num-tabular", toneCls)}>{n}{suffix}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </Link>
  );
}

export function ReadinessRing({ value, size = 132, label = "Posture" }: { value: number; size?: number; label?: string }) {
  const [shown, setShown] = useState(0);
  useEffect(() => { const t = setTimeout(() => setShown(value), 50); return () => clearTimeout(t); }, [value]);
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const color = value >= 85 ? "var(--color-compliant)" : value >= 70 ? "var(--color-attention)" : "var(--color-critical)";
  const n = useCountUp(value);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-muted)" strokeWidth={10} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)} style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-3xl font-semibold num-tabular">{n}</div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  );
}

export function ComplianceHeatMap({ risks }: { risks: Risk[] }) {
  const cell = (l: number, i: number) => {
    const s = l * i;
    const tone = s >= 15 ? "bg-critical/80" : s >= 10 ? "bg-attention/70" : s >= 5 ? "bg-attention/30" : "bg-compliant/30";
    const here = risks.filter((r) => r.likelihood === l && r.impact === i);
    return (
      <Link key={`${l}-${i}`} to="/qms/risks" title={here.map((r) => `${r.id}: ${r.title}`).join("\n") || `L${l} × I${i}`}
        className={cn("grid aspect-square place-items-center rounded text-xs font-semibold text-foreground transition hover:scale-110 hover:shadow-overlay", tone)}>
        {here.length || ""}
      </Link>
    );
  };
  return (
    <div className="flex gap-2">
      <div className="flex flex-col justify-between py-1 text-[10px] text-muted-foreground [writing-mode:vertical-rl] rotate-180">Likelihood</div>
      <div className="flex-1">
        <div className="grid grid-cols-5 gap-1">
          {[5, 4, 3, 2, 1].map((l) => [1, 2, 3, 4, 5].map((i) => cell(l, i)))}
        </div>
        <div className="mt-1 text-center text-[10px] text-muted-foreground">Impact →</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: { icon?: LucideIcon; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary"><Icon className="size-6" /></div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PermissionGate({ permission, children, fallback }: { permission: Permission; children: ReactNode; fallback?: ReactNode }) {
  const { can } = useAppState();
  if (can(permission)) return <>{children}</>;
  return <>{fallback ?? (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed px-3 py-1.5 text-xs text-muted-foreground" title="Your role does not have this permission">
      <Lock className="size-3" /> Not available for your role
    </span>
  )}</>;
}

export function ActivityTimeline({ items }: { items: { id: string; at: string; actor: string; action: string; recordId: string }[] }) {
  return (
    <ol className="relative space-y-4 border-l pl-4">
      {items.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[21px] top-1 size-2.5 rounded-full border-2 border-surface bg-primary" />
          <div className="text-sm"><span className="font-medium">{e.actor}</span> <span className="text-muted-foreground">{e.action}</span></div>
          <div className="mt-0.5 text-xs text-muted-foreground num-tabular">{e.at} · <span className="font-mono">{e.recordId}</span></div>
        </li>
      ))}
    </ol>
  );
}

export function AIRecommendationPanel({ s }: { s: AiSuggestion }) {
  return (
    <div className="rounded-lg border border-ai/30 bg-ai-soft/50 p-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ai"><Sparkles className="size-3.5" /> AI suggestion · draft only</span>
        <span className="text-xs text-muted-foreground num-tabular">{Math.round(s.confidence * 100)}% confidence</span>
      </div>
      <p className="mt-2 text-sm font-medium">{s.suggestion}</p>
      <p className="mt-1 text-xs text-muted-foreground"><b>Why:</b> {s.why}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {s.sourceRecords.map((r) => <span key={r.id} className="rounded bg-surface px-1.5 py-0.5 font-mono text-[11px]">{r.id}</span>)}
      </div>
      <details className="mt-2 text-xs text-muted-foreground">
        <summary className="cursor-pointer">Excerpts, assumptions & missing info</summary>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {s.sourceExcerpts.map((x) => <li key={x}>{x}</li>)}
          {s.assumptions.map((x) => <li key={x}>Assumption: {x}</li>)}
          {s.missingInfo.map((x) => <li key={x}>Missing: {x}</li>)}
        </ul>
      </details>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Button size="sm" onClick={() => toast.success("Suggestion accepted as a draft — a human must still decide.")}>Accept</Button>
        <Button size="sm" variant="outline" onClick={() => toast("Opened for editing")}>Edit</Button>
        <Button size="sm" variant="ghost" onClick={() => toast("Suggestion rejected")}>Reject</Button>
        <Button size="sm" variant="ghost" onClick={() => toast("Requesting another suggestion…")}>Request another</Button>
      </div>
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3" />}
          {c.to ? <Link to={c.to} className="hover:text-foreground">{c.label}</Link> : <span className="text-foreground">{c.label}</span>}
        </span>
      ))}
    </nav>
  );
}
