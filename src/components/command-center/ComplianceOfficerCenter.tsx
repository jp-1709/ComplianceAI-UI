import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  CalendarClock,
  CheckSquare2,
  ChevronRight,
  CircleAlert,
  FileQuestion,
  Plus,
  Radar,
  Sparkles,
  UserMinus,
  Vault,
} from "lucide-react";
import { getOfficerCommandCenter } from "@/services/work";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { DueDateIndicator, SeverityBadge, StatusBadge } from "@/components/grc/badges";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const queueCards = [
  {
    key: "alerts",
    label: "Regulatory alerts",
    icon: Radar,
    to: "/regulatory/alerts",
    filter: "awaiting-impact-assessment",
    tone: "text-ai",
  },
  {
    key: "unassignedObligations",
    label: "Assignment gaps",
    icon: UserMinus,
    to: "/obligations",
    filter: "unassigned",
    tone: "text-attention",
  },
  {
    key: "evidenceGaps",
    label: "Evidence gaps",
    icon: FileQuestion,
    to: "/my-work",
    filter: "evidence",
    tone: "text-critical",
  },
  {
    key: "awaitingReview",
    label: "Awaiting review",
    icon: CheckSquare2,
    to: "/my-work",
    filter: "approval",
    tone: "text-primary",
  },
  {
    key: "upcomingFilings",
    label: "Upcoming filings",
    icon: CalendarClock,
    to: "/calendar",
    filter: "due-30-days",
    tone: "text-attention",
  },
  {
    key: "escalations",
    label: "Active escalations",
    icon: BellRing,
    to: "/my-work",
    filter: "overdue",
    tone: "text-critical",
  },
] as const;

const quickActions = [
  { label: "Create obligation", to: "/obligations", icon: Plus },
  { label: "Upload evidence", to: "/evidence", icon: Vault },
  { label: "Assess regulatory change", to: "/regulatory/alerts", icon: Radar },
  { label: "Open overdue queue", to: "/my-work", icon: AlertTriangle },
] as const;

export function ComplianceOfficerCenter() {
  const query = useQuery({
    queryKey: ["officer-command-center"],
    queryFn: getOfficerCommandCenter,
    staleTime: 45_000,
  });
  if (query.isPending || !query.data)
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  const data = query.data;
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs items={[{ label: "Home" }, { label: "Compliance Officer Command Center" }]} />
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Good morning, Ananya</h1>
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
              Compliance Officer
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Your live operating view for Sunday, 04-Oct-2026 · focus on exceptions, decisions and
            evidence readiness.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/notifications">
            <BellRing className="size-4" /> Open notifications
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {queueCards.map((card) => {
          const count = data[card.key].length;
          return (
            <Link
              key={card.key}
              to={card.to}
              search={{ filter: card.filter }}
              className="group enterprise-panel p-4 transition hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <card.icon className={`size-4 ${card.tone}`} />
                <ChevronRight className="size-3.5 text-muted-foreground transition group-hover:translate-x-0.5" />
              </div>
              <div className="mt-3 text-2xl font-semibold num-tabular">{count}</div>
              <div className="mt-1 text-xs text-muted-foreground">{card.label}</div>
            </Link>
          );
        })}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <Panel
          title="Today’s work"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/my-work">
                Open My Work <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          }
        >
          <div className="divide-y">
            {data.today.map((item) => (
              <Link
                key={item.id}
                to="/my-work"
                search={{ filter: item.tabs.includes("overdue") ? "overdue" : "week" }}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0"
              >
                <div className="grid size-8 place-items-center rounded-md bg-muted">
                  <CheckSquare2 className="size-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{item.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <span className="font-mono">{item.id}</span> · {item.entityName} ·{" "}
                    {item.ownerName}
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={item.status} />
                  <div className="mt-1">
                    <DueDateIndicator date={item.dueDate} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel title="Quick create">
          <div className="grid gap-2">
            {quickActions.map((action) => (
              <Button key={action.label} asChild variant="outline" className="justify-start">
                <Link to={action.to}>
                  <action.icon className="size-4" />
                  {action.label}
                  <ChevronRight className="ml-auto size-3.5" />
                </Link>
              </Button>
            ))}
          </div>
          <div className="mt-4 rounded-md border border-ai/30 bg-ai-soft/40 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-ai">
              <Sparkles className="size-4" /> AI focus summary
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Prioritise Delhi cold-chain disposition, Pune BOCW evidence and the Bengaluru GST
              impact assessment. Human approval remains required.
            </p>
          </div>
        </Panel>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel title="Regulatory alerts">
          <div className="space-y-3">
            {data.alerts.map((alert) => (
              <Link
                key={alert.id}
                to="/regulatory/alerts"
                search={{ alert: alert.id }}
                className="block rounded-md border p-3 hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-primary">{alert.id}</span>
                  <SeverityBadge severity={alert.impact} />
                </div>
                <div className="mt-1 text-sm font-medium">{alert.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{alert.authority}</div>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel title="Evidence gaps">
          <div className="space-y-3">
            {data.evidenceGaps.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                to="/my-work"
                search={{ filter: "evidence" }}
                className="flex items-start gap-2 rounded-md border p-3 hover:border-primary/40"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-attention" />
                <div>
                  <div className="text-sm font-medium">{item.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {item.evidenceComplete}/{item.evidenceRequired} evidence items ·{" "}
                    {item.entityName}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
        <Panel title="Escalations">
          <div className="space-y-3">
            {data.escalations.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                to="/my-work"
                search={{ filter: "overdue" }}
                className="flex items-center gap-3 rounded-md border border-critical/20 bg-critical-soft/30 p-3"
              >
                <AlertTriangle className="size-4 shrink-0 text-critical" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{item.title}</div>
                  <div className="mt-1 text-xs text-critical">
                    {item.ageingDays} days overdue · {item.ownerName}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
