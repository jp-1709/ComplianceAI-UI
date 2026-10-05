import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClipboardCheck, FileText, Play, Smartphone, UserRound } from "lucide-react";
import { getAudit, qmsFlows } from "@/services/qms";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { SeverityBadge, StatusBadge } from "@/components/grc/badges";
import { KeyValue, RecordHeader, WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/qms/audits/$id")({
  head: () => ({ meta: [{ title: "Audit Detail — Quantbit Compliance AI" }] }),
  component: AuditDetailRoute,
});

function AuditDetailRoute() {
  const { id } = Route.useParams();
  const pathname = useLocation({ select: (location) => location.pathname });
  const detailPath = `/qms/audits/${encodeURIComponent(id)}`;
  return pathname === detailPath || pathname === `${detailPath}/` ? <AuditDetail /> : <Outlet />;
}

function AuditDetail() {
  const { id } = Route.useParams();
  const query = useQuery({
    queryKey: ["qms", "audit", id],
    queryFn: () => getAudit(id),
    staleTime: 60_000,
  });
  if (query.isPending)
    return (
      <div className="space-y-4">
        <Skeleton className="h-36" />
        <Skeleton className="h-96" />
      </div>
    );
  const audit = query.data;
  if (!audit)
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold">Audit not found</h1>
        <Button asChild className="mt-4">
          <Link to="/qms/audits">Return to audit programme</Link>
        </Button>
      </div>
    );
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/command-center" },
          { label: "Internal Audit", to: "/qms/audits" },
          { label: audit.id },
        ]}
      />
      <RecordHeader
        id={audit.id}
        title={audit.title}
        badges={
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
            {audit.status}
          </span>
        }
        meta={
          <>
            <span className="flex items-center gap-1">
              <UserRound className="size-3.5" /> {audit.lead}
            </span>
            <span>{audit.entity}</span>
            <span>Planned {audit.plannedOn}</span>
            <span>{audit.checklistTemplateId}</span>
          </>
        }
        primaryAction={
          <Button asChild>
            <Link to="/qms/audits/$id/execute" params={{ id: audit.id }}>
              <Play className="size-4" /> Continue Audit Execution
            </Link>
          </Button>
        }
      />
      <Panel title="Flow E · Internal audit assurance chain">
        <WorkflowStepper
          steps={qmsFlows.E.map((label, index) => ({
            label,
            state:
              index < (audit.progress > 90 ? 5 : 3)
                ? "complete"
                : index === (audit.progress > 90 ? 5 : 3)
                  ? "current"
                  : "upcoming",
          }))}
        />
      </Panel>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scope">Scope</TabsTrigger>
            <TabsTrigger value="findings">Findings</TabsTrigger>
            <TabsTrigger value="report">Audit report</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Panel title="Audit plan">
              <div className="grid gap-5 md:grid-cols-2">
                <KeyValue label="Objective">
                  Verify effective implementation and conformity against the approved criteria.
                </KeyValue>
                <KeyValue label="Scope">{audit.scope}</KeyValue>
                <KeyValue label="Lead auditor">{audit.lead}</KeyValue>
                <KeyValue label="Checklist">
                  {audit.checklistTemplateId} · {audit.totalItems} items
                </KeyValue>
              </div>
            </Panel>
          </TabsContent>
          <TabsContent value="scope">
            <Panel title="Scope and criteria">
              <p className="text-sm leading-6">
                {audit.scope}. Sampling covers current controlled documents, competence evidence,
                operational records, exception disposition and prior corrective-action
                effectiveness.
              </p>
            </Panel>
          </TabsContent>
          <TabsContent value="findings">
            <Panel title={`${audit.findings.length} findings`}>
              <div className="space-y-2">
                {audit.findings.length ? (
                  audit.findings.map((finding) => (
                    <Link
                      key={finding.id}
                      to="/qms/audits/findings/$id"
                      params={{ id: finding.id }}
                      className="flex items-center justify-between rounded-lg border p-4 hover:border-primary/40"
                    >
                      <div>
                        <div className="font-mono text-xs text-muted-foreground">{finding.id}</div>
                        <div className="mt-1 text-sm font-medium">{finding.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{finding.clause}</div>
                      </div>
                      <SeverityBadge severity={finding.severity} />
                    </Link>
                  ))
                ) : (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    No findings issued.
                  </div>
                )}
              </div>
            </Panel>
          </TabsContent>
          <TabsContent value="report">
            <Panel title="Issued audit report">
              {audit.reportIssued ? (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-primary" />
                    <div>
                      <div className="text-sm font-medium">{audit.id} issued report</div>
                      <div className="text-xs text-muted-foreground">
                        Digitally signed · evidence index included
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">Open report</Button>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  Report remains in preparation until fieldwork and lead review are complete.
                </div>
              )}
            </Panel>
          </TabsContent>
        </Tabs>
        <aside className="space-y-4">
          <Panel title="Execution progress">
            <div className="text-3xl font-semibold">{audit.progress}%</div>
            <Progress value={audit.progress} className="mt-3" />
            <div className="mt-2 text-xs text-muted-foreground">
              {audit.completedItems} of {audit.totalItems} checklist items
            </div>
          </Panel>
          <Panel title="Fieldwork">
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link to="/qms/audits/$id/execute" params={{ id: audit.id }}>
                  <ClipboardCheck className="size-4" /> Desktop workspace
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/qms/audits/$id/mobile" params={{ id: audit.id }}>
                  <Smartphone className="size-4" /> Mobile checklist
                </Link>
              </Button>
            </div>
          </Panel>
          <Panel title="Assurance status">
            <StatusBadge status={audit.reportIssued ? "verified" : "in-progress"} />
          </Panel>
        </aside>
      </div>
    </div>
  );
}
