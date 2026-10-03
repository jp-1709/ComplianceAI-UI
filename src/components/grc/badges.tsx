import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { daysUntil } from "@/lib/date";
import { people } from "@/data/kfc";
import type { Severity, Status } from "@/data/types";

const statusStyles: Record<Status, string> = {
  compliant: "bg-compliant-soft text-compliant",
  approved: "bg-compliant-soft text-compliant",
  verified: "bg-compliant-soft text-compliant",
  closed: "bg-neutral-status-soft text-neutral-status",
  attention: "bg-attention-soft text-attention-foreground dark:text-attention",
  "pending-approval": "bg-attention-soft text-attention-foreground dark:text-attention",
  "in-progress": "bg-primary-soft text-accent-foreground",
  draft: "bg-neutral-status-soft text-neutral-status",
  overdue: "bg-critical-soft text-critical",
  critical: "bg-critical text-critical-foreground",
};

const label = (s: string) => s.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", statusStyles[status], className)}>
      <span className="size-1.5 rounded-full bg-current" />
      {label(status)}
    </span>
  );
}

const sevStyles: Record<Severity, string> = {
  critical: "border-critical/40 text-critical",
  major: "border-attention/50 text-attention-foreground dark:text-attention",
  moderate: "border-primary/30 text-accent-foreground",
  minor: "border-border-strong text-muted-foreground",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={cn("inline-flex rounded border px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide", sevStyles[severity])}>
      {severity}
    </span>
  );
}

export function DueDateIndicator({ date, locked }: { date: string; locked?: boolean }) {
  const d = daysUntil(date);
  const tone = d < 0 ? "text-critical" : d <= 7 ? "text-attention-foreground dark:text-attention" : "text-muted-foreground";
  return (
    <span className="inline-flex items-center gap-1 text-xs num-tabular whitespace-nowrap">
      {locked && <Lock className="size-3 text-muted-foreground" aria-label="Locked statutory date" />}
      <span className="text-foreground">{date}</span>
      <span className={tone}>{d < 0 ? `${-d}d overdue` : d === 0 ? "today" : `in ${d}d`}</span>
    </span>
  );
}

export function OwnerAvatarGroup({ ids, max = 3 }: { ids: string[]; max?: number }) {
  const list = ids.map((id) => people.find((p) => p.id === id)).filter(Boolean);
  return (
    <div className="flex -space-x-1.5">
      {list.slice(0, max).map((p) => (
        <span key={p!.id} title={p!.name} className="grid size-6 place-items-center rounded-full border-2 border-surface bg-primary-soft text-[10px] font-semibold text-accent-foreground">
          {p!.initials}
        </span>
      ))}
      {list.length > max && (
        <span className="grid size-6 place-items-center rounded-full border-2 border-surface bg-muted text-[10px] text-muted-foreground">+{list.length - max}</span>
      )}
    </div>
  );
}
