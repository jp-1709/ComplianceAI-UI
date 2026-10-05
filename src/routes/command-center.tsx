import { lazy, Suspense, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileWarning,
  History,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TimerReset,
  Vault,
} from "lucide-react";
import { toast } from "sonner";
import { getCommandCenter, exportBoardPack, type DashboardIssue } from "@/services/compliance";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, SeverityBadge } from "@/components/grc/badges";
import {
  ActivityTimeline,
  Breadcrumbs,
  ComplianceHeatMap,
  Panel,
  PermissionGate,
  ReadinessRing,
} from "@/components/grc/widgets";
import { CommandCenterSkeleton } from "@/components/command-center/CommandCenterSkeleton";
import { ComplianceOfficerCenter } from "@/components/command-center/ComplianceOfficerCenter";

const PostureSparkline = lazy(() =>
  import("@/components/command-center/CommandCenterCharts").then((module) => ({
    default: module.PostureSparkline,
  })),
);
const EntityScoreChart = lazy(() =>
  import("@/components/command-center/CommandCenterCharts").then((module) => ({
    default: module.EntityScoreChart,
  })),
);
const TaskAgeingChart = lazy(() =>
  import("@/components/command-center/CommandCenterCharts").then((module) => ({
    default: module.TaskAgeingChart,
  })),
);

export const Route = createFileRoute("/command-center")({
  head: () => ({
    meta: [
      { title: "Executive Command Center — Quantbit Compliance AI" },
      { name: "description", content: "Group-wide compliance posture for KFC India." },
    ],
  }),
  component: CommandCenter,
});

const issueMeta: Record<DashboardIssue["kind"], { label: string; icon: typeof ShieldAlert }> = {
  work: { label: "Critical overdue", icon: TimerReset },
  risk: { label: "Above appetite", icon: ShieldAlert },
  finding: { label: "Major findings", icon: FileWarning },
  capa: { label: "High-severity CAPAs", icon: ClipboardCheck },
  evidence: { label: "Evidence expiring", icon: Vault },
  change: { label: "Changes to assess", icon: Sparkles },
};

function CommandCenter() {
  const roleId = useAppState((state) => state.roleId);
  return roleId === "compliance-officer" ? <ComplianceOfficerCenter /> : <ExecutiveCommandCenter />;
}

function ExecutiveCommandCenter() {
  const { entityId } = useAppState();
  const [issueFilter, setIssueFilter] = useState<DashboardIssue["kind"] | "all">("all");
  const query = useQuery({
    queryKey: ["command-center", entityId],
    queryFn: () => getCommandCenter(entityId),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });
  const exportMutation = useMutation({
    mutationFn: exportBoardPack,
    onMutate: () => toast.loading("Preparing board pack…", { id: "board-pack" }),
    onSuccess: () => toast.success("Board pack exported", { id: "board-pack" }),
    onError: () => toast.error("Board pack could not be exported", { id: "board-pack" }),
  });
  const issues = useMemo(
    () =>
      query.data?.priorityIssues
        .filter((item) => issueFilter === "all" || item.kind === issueFilter)
        .slice(0, 8) ?? [],
    [query.data, issueFilter],
  );

  if (query.isPending) return <CommandCenterSkeleton />;
  if (query.isError || !query.data)
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-critical-soft text-critical">
          <FileWarning className="size-6" />
        </div>
        <h1 className="mt-4 text-lg font-semibold">The Command Center did not load</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The data service returned an error. Your filters and role selection have been preserved.
        </p>
        <Button className="mt-5" onClick={() => query.refetch()}>
          <RefreshCw className="size-4" /> Try again
        </Button>
      </div>
    );

  const d = query.data;
  const deltaPositive = d.scoreDelta >= 0;

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs items={[{ label: "Home" }, { label: "Executive Command Center" }]} />
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Executive Command Center</h1>
            {query.isFetching && (
              <RefreshCw
                className="size-3.5 animate-spin text-muted-foreground"
                aria-label="Refreshing"
              />
            )}
          </div>
          <p className="mt-1 max-w-4xl text-sm text-muted-foreground">
            Know what applies, understand what changed, assign accountable work, collect defensible
            evidence, identify risk, correct failures, verify effectiveness, and give leadership a
            live compliance posture.
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-compliant" /> Live posture for{" "}
            {d.organisation.name} · reviewed {d.lastReviewedOn}
          </div>
        </div>
        <PermissionGate
          permission="export.board-pack"
          fallback={
            <Button variant="outline" disabled>
              <Download className="size-4" /> Export restricted
            </Button>
          }
        >
          <Button
            variant="outline"
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
          >
            {exportMutation.isPending ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}{" "}
            Export board PDF
          </Button>
        </PermissionGate>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(340px,.85fr)_minmax(560px,1.5fr)]">
        <Panel
          className="min-h-72"
          title="Overall compliance posture"
          action={
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                deltaPositive ? "text-compliant" : "text-critical",
              )}
            >
              {deltaPositive ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {Math.abs(d.scoreDelta)} pts vs prior period
            </span>
          }
        >
          <div className="flex items-center gap-5">
            <ReadinessRing value={d.overallScore} label="readiness" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-muted-foreground">7-month posture trend</div>
              <Suspense fallback={<Skeleton className="mt-2 h-[72px] w-full" />}>
                <PostureSparkline data={d.postureTrend} />
              </Suspense>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{d.postureTrend[0]?.period}</span>
                <span>{d.postureTrend.at(-1)?.period}</span>
              </div>
            </div>
          </div>
          <p className="mt-4 border-t pt-3 text-xs leading-5 text-muted-foreground">
            Posture combines timely obligations, control effectiveness, evidence completeness and
            unresolved risk across all selected entities.
          </p>
        </Panel>
        <Panel
          title="Compliance score by entity"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/entities">
                Compare entities <ChevronRight className="size-3.5" />
              </Link>
            </Button>
          }
        >
          <Suspense fallback={<Skeleton className="h-[238px] w-full" />}>
            <EntityScoreChart data={d.entityScores} />
          </Suspense>
        </Panel>
      </div>

      <section aria-labelledby="due-heading">
        <div className="mb-2 flex items-center justify-between">
          <h2 id="due-heading" className="text-sm font-semibold">
            Obligations coming due
          </h2>
          <span className="text-xs text-muted-foreground">Non-overlapping statutory windows</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Next 7 days",
              value: d.due.seven,
              tone: "text-critical",
              filter: "due-7-days",
            },
            {
              label: "8–30 days",
              value: d.due.thirty,
              tone: "text-attention-foreground dark:text-attention",
              filter: "due-30-days",
            },
            {
              label: "31–90 days",
              value: d.due.ninety,
              tone: "text-primary",
              filter: "due-90-days",
            },
          ].map((item) => (
            <Link
              key={item.label}
              to="/obligations"
              search={{ filter: item.filter }}
              className="group enterprise-panel flex items-center gap-4 p-4 transition hover:border-primary/40"
            >
              <div
                className={cn(
                  "grid size-11 place-items-center rounded-lg bg-muted text-xl font-semibold num-tabular",
                  item.tone,
                )}
              >
                {item.value}
              </div>
              <div>
                <div className="text-sm font-semibold">{item.label}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  View affected obligations
                </div>
              </div>
              <ChevronRight className="ml-auto size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {(Object.keys(issueMeta) as DashboardIssue["kind"][]).map((kind) => {
          const meta = issueMeta[kind];
          return (
            <button
              key={kind}
              onClick={() => setIssueFilter(kind === issueFilter ? "all" : kind)}
              aria-pressed={issueFilter === kind}
              className={cn(
                "enterprise-panel group p-3 text-left transition hover:border-primary/40",
                issueFilter === kind && "border-primary ring-1 ring-primary/20",
              )}
            >
              <div className="flex items-center justify-between">
                <meta.icon
                  className={cn(
                    "size-4",
                    kind === "work" || kind === "risk" ? "text-critical" : "text-muted-foreground",
                  )}
                />
                <span className="text-xl font-semibold num-tabular">{d.issueCounts[kind]}</span>
              </div>
              <div className="mt-2 text-xs font-medium">{meta.label}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">Click to filter queue</div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_.8fr]">
        <Panel
          title={
            <span className="flex items-center gap-2">
              Priority attention queue{" "}
              {issueFilter !== "all" && (
                <button
                  onClick={() => setIssueFilter("all")}
                  className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium text-accent-foreground"
                >
                  {issueMeta[issueFilter].label} ×
                </button>
              )}
            </span>
          }
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/my-work">
                Open work queue <ChevronRight className="size-3.5" />
              </Link>
            </Button>
          }
        >
          <div className="divide-y">
            {issues.map((item, index) => (
              <Link
                key={`${item.kind}-${item.id}`}
                to={item.to}
                search={{ filter: item.filter }}
                className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="grid size-8 place-items-center rounded-md bg-muted">
                  <span className="font-mono text-[9px] font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium group-hover:text-primary">
                    {item.title}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{item.id}</span>
                    <span>·</span>
                    <span className="truncate">{item.detail}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={item.severity} />
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </div>
              </Link>
            ))}
            {issues.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No items match this queue.
              </div>
            )}
          </div>
        </Panel>
        <Panel
          title="Risk exposure"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/qms/risks">
                Open register <ChevronRight className="size-3.5" />
              </Link>
            </Button>
          }
        >
          <ComplianceHeatMap risks={d.risks} />
          <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
            <span className="text-muted-foreground">
              {d.issueCounts.risk} risks currently above appetite
            </span>
            <StatusBadge status={d.issueCounts.risk > 0 ? "attention" : "compliant"} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="Task ageing"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/calendar">
                Open calendar <ChevronRight className="size-3.5" />
              </Link>
            </Button>
          }
        >
          <Suspense fallback={<Skeleton className="h-[190px] w-full" />}>
            <TaskAgeingChart data={d.taskAgeing} />
          </Suspense>
        </Panel>
        <Panel
          title={
            <span className="flex items-center gap-2">
              <History className="size-4 text-primary" /> What changed since last review?
            </span>
          }
        >
          <ActivityTimeline items={d.activity.slice(0, 5)} />
        </Panel>
        <Panel
          title={
            <span className="flex items-center gap-2">
              <CalendarClock className="size-4 text-primary" /> Recent management decisions
            </span>
          }
          action={<span className="text-[10px] text-muted-foreground">MR-2026-Q2</span>}
        >
          <div className="space-y-4">
            {d.decisions.map((decision, index) => (
              <div key={decision.id} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-[10px] font-semibold text-primary">
                  {index + 1}
                </span>
                <div>
                  <div className="text-xs font-semibold">{decision.label}</div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {decision.decision}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button asChild variant="outline" size="sm" className="mt-5 w-full">
            <Link to="/qms/management-reviews">View review and downstream tasks</Link>
          </Button>
        </Panel>
      </div>
    </div>
  );
}
