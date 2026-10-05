import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarPlus,
  CheckCircle2,
  FileStack,
  ListChecks,
  Plus,
  Scale,
  Users,
} from "lucide-react";
import { getManagementReviews } from "@/services/governance";
import { Breadcrumbs, MetricCard, Panel } from "@/components/grc/widgets";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreateQmsRecordDialog } from "@/components/qms/CreateQmsRecordDialog";

export const Route = createFileRoute("/qms/management-reviews")({
  head: () => ({ meta: [{ title: "Management Review — Quantbit Compliance AI" }] }),
  component: ManagementReviewRoute,
});

function ManagementReviewRoute() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return pathname === "/qms/management-reviews" || pathname === "/qms/management-reviews/" ? (
    <ManagementReviewDashboard />
  ) : (
    <Outlet />
  );
}

function ManagementReviewDashboard() {
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["management-reviews"],
    queryFn: getManagementReviews,
    staleTime: 60_000,
  });
  const reviews = query.data ?? [];
  const review = reviews[0];
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs
        items={[{ label: "Home", to: "/command-center" }, { label: "Management Review" }]}
      />
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Scale className="size-4" /> Leadership governance
          </div>
          <h1 className="mt-1 text-2xl font-semibold">Management Review Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete inputs, defensible decisions, accountable outputs and signed minutes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link
              to="/qms/management-reviews/$id/planner"
              params={{ id: review?.id ?? "MR-2026-Q2" }}
            >
              <CalendarPlus className="size-4" /> Meeting planner
            </Link>
          </Button>
          <CreateQmsRecordDialog
            kind="review"
            trigger={
              <Button>
                <Plus className="size-4" /> Schedule review
              </Button>
            }
            onCreated={(id) => navigate({ to: "/qms/management-reviews/$id", params: { id } })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Closed review cycles"
          value={reviews.filter((item) => item.status === "Closed").length}
          tone="compliant"
          hint="Quarterly review on record"
          to="/qms/management-reviews"
          icon={CheckCircle2}
        />
        <MetricCard
          label="Locked inputs"
          value={review?.inputs.filter((item) => item.locked).length ?? 0}
          hint="Complete briefing baseline"
          to="/qms/management-reviews"
          icon={ListChecks}
        />
        <MetricCard
          label="Review outputs"
          value={review?.outputs.length ?? 0}
          hint="Leadership decisions"
          to="/qms/management-reviews"
          icon={Scale}
        />
        <MetricCard
          label="Downstream tasks"
          value={review?.downstreamTaskIds.length ?? 0}
          hint="Tracked to closure"
          to="/my-work"
          icon={FileStack}
        />
      </div>
      {review && (
        <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
          <Panel title="Review cycle">
            <Link
              to="/qms/management-reviews/$id"
              params={{ id: review.id }}
              className="block rounded-xl border p-5 transition hover:border-primary/40"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <div className="font-mono text-xs text-muted-foreground">{review.id}</div>
                  <h2 className="mt-1 text-lg font-semibold">{review.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>Chair: {review.chair}</span>
                    <span>Held: {review.heldOn}</span>
                    <span>{review.status}</span>
                  </div>
                </div>
                <div className="min-w-44">
                  <div className="flex justify-between text-xs">
                    <span>Input coverage</span>
                    <b>16/16</b>
                  </div>
                  <Progress value={100} className="mt-2" />
                  <div className="mt-2 text-xs text-compliant">Quorum confirmed</div>
                </div>
              </div>
            </Link>
          </Panel>
          <Panel title="Governance controls">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-compliant" /> Attendance and voting quorum recorded
              </div>
              <div className="flex items-center gap-2">
                <ListChecks className="size-4 text-compliant" /> All 16 ISO and statutory inputs
                covered
              </div>
              <div className="flex items-center gap-2">
                <FileStack className="size-4 text-compliant" /> Three outputs linked to downstream
                tasks
              </div>
              <div className="rounded-lg border border-ai/30 bg-ai-soft p-3 text-xs text-ai">
                AI may build the briefing draft and extract decisions. Humans chair, decide, approve
                and sign.
              </div>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
