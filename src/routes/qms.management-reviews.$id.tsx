import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, FileCheck2, FileStack, Play, Scale, UserRound } from "lucide-react";
import { getManagementReview } from "@/services/governance";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { SeverityBadge } from "@/components/grc/badges";
import { RecordHeader, WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/qms/management-reviews/$id")({
  head: () => ({ meta: [{ title: "Review Cycle — Quantbit Compliance AI" }] }),
  component: ReviewCycleDetailRoute,
});

function ReviewCycleDetailRoute() {
  const { id } = Route.useParams();
  const pathname = useLocation({ select: (location) => location.pathname });
  const detailPath = `/qms/management-reviews/${encodeURIComponent(id)}`;
  return pathname === detailPath || pathname === `${detailPath}/` ? (
    <ReviewCycleDetail />
  ) : (
    <Outlet />
  );
}

function ReviewCycleDetail() {
  const { id } = Route.useParams();
  const query = useQuery({
    queryKey: ["management-review", id],
    queryFn: () => getManagementReview(id),
    staleTime: 60_000,
  });
  if (query.isPending)
    return (
      <div className="space-y-4">
        <Skeleton className="h-36" />
        <Skeleton className="h-96" />
      </div>
    );
  const review = query.data;
  if (!review) return <div className="py-20 text-center">Review cycle not found</div>;
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <Breadcrumbs
        items={[
          { label: "Management Review", to: "/qms/management-reviews" },
          { label: review.id },
        ]}
      />
      <RecordHeader
        id={review.id}
        title={review.title}
        badges={
          <span className="rounded-full bg-compliant-soft px-2 py-0.5 text-xs font-medium text-compliant">
            {review.status}
          </span>
        }
        meta={
          <>
            <span className="flex items-center gap-1">
              <UserRound className="size-3.5" /> {review.chair}
            </span>
            <span>{review.heldOn}</span>
            <span>16 inputs · 3 outputs · 3 tasks</span>
            <span>Quorum met</span>
          </>
        }
        primaryAction={
          <Button asChild>
            <Link to="/qms/management-reviews/$id/live" params={{ id: review.id }}>
              <Play className="size-4" /> Open Live Meeting Mode
            </Link>
          </Button>
        }
      />
      <Panel title="Review cycle workflow">
        <WorkflowStepper
          steps={[
            "Plan meeting",
            "Prepare 16 inputs",
            "Lock briefing pack",
            "Confirm quorum",
            "Capture decisions",
            "Assign outputs",
            "Sign minutes",
          ].map((label, index) => ({ label, state: index < 7 ? "complete" : "upcoming" }))}
        />
      </Panel>
      <Tabs defaultValue="coverage">
        <TabsList>
          <TabsTrigger value="coverage">Input coverage</TabsTrigger>
          <TabsTrigger value="outputs">Outputs</TabsTrigger>
          <TabsTrigger value="actions">Workspace</TabsTrigger>
        </TabsList>
        <TabsContent value="coverage">
          <Panel title="16-input coverage matrix">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="p-3">Input</th>
                    <th className="p-3">Standard</th>
                    <th className="p-3">Owner</th>
                    <th className="p-3">Evidence</th>
                    <th className="p-3">Readiness</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {review.coverage.map((input) => (
                    <tr key={input.id}>
                      <td className="p-3">
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {input.id}
                        </div>
                        <div className="font-medium">{input.label}</div>
                      </td>
                      <td className="p-3 text-xs">{input.standard}</td>
                      <td className="p-3 text-xs">{input.owner}</td>
                      <td className="p-3">{input.evidenceCount}</td>
                      <td className="p-3">
                        <div className="flex min-w-28 items-center gap-2">
                          <Progress value={input.readiness} />
                          <span className="text-xs">{input.readiness}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="outputs">
          <Panel title="Leadership outputs and downstream tasks">
            <div className="space-y-3">
              {review.enrichedOutputs.map((output) => (
                <div key={output.id} className="rounded-lg border p-4">
                  <div className="flex flex-col justify-between gap-3 md:flex-row">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{output.id}</span>
                        <span className="rounded bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {output.type}
                        </span>
                        <SeverityBadge severity={output.severity} />
                      </div>
                      <div className="mt-2 text-sm font-medium">{output.decision}</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Owner: {output.owner} · Due {output.dueDate} · {output.standards.join(", ")}
                      </div>
                    </div>
                    <Link
                      to="/my-work"
                      search={{ tab: "assigned" }}
                      className="text-sm font-medium text-primary"
                    >
                      {output.taskId}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="actions">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <WorkspaceCard
              icon={FileStack}
              title="Briefing Pack Builder"
              text="Assemble, sequence and lock 16 inputs."
              to="/qms/management-reviews/$id/briefing"
              id={review.id}
            />
            <WorkspaceCard
              icon={CalendarClock}
              title="Meeting Planner"
              text="Attendance, agenda and quorum planning."
              to="/qms/management-reviews/$id/planner"
              id={review.id}
            />
            <WorkspaceCard
              icon={Scale}
              title="Live Meeting Mode"
              text="Run agenda and capture decisions."
              to="/qms/management-reviews/$id/live"
              id={review.id}
            />
            <WorkspaceCard
              icon={FileCheck2}
              title="Signed Minutes"
              text="View signatures and tamper evidence."
              to="/qms/management-reviews/$id/minutes"
              id={review.id}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WorkspaceCard({
  icon: Icon,
  title,
  text,
  to,
  id,
}: {
  icon: typeof FileStack;
  title: string;
  text: string;
  to: string;
  id: string;
}) {
  return (
    <Link
      to={to}
      params={{ id }}
      className="enterprise-panel p-5 transition hover:border-primary/40"
    >
      <Icon className="size-5 text-primary" />
      <div className="mt-3 font-semibold">{title}</div>
      <p className="mt-1 text-xs text-muted-foreground">{text}</p>
    </Link>
  );
}
