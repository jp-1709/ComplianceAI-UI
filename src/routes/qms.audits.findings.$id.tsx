import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileWarning, Link2, ShieldCheck, UserRound, Wrench } from "lucide-react";
import { getFinding } from "@/services/qms";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { SeverityBadge, StatusBadge } from "@/components/grc/badges";
import { KeyValue, RecordHeader, WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const lifecycle = [
  "Draft",
  "Lead Approval",
  "Issued",
  "Acknowledged",
  "Action In Progress",
  "Action Complete",
  "Independently Closed",
];

export const Route = createFileRoute("/qms/audits/findings/$id")({
  head: () => ({ meta: [{ title: "Finding Detail — Quantbit Compliance AI" }] }),
  component: FindingDetail,
});

function FindingDetail() {
  const { id } = Route.useParams();
  const query = useQuery({
    queryKey: ["qms", "finding", id],
    queryFn: () => getFinding(id),
    staleTime: 60_000,
  });
  if (query.isPending)
    return (
      <div className="space-y-4">
        <Skeleton className="h-36" />
        <Skeleton className="h-96" />
      </div>
    );
  const finding = query.data;
  if (!finding) return <div className="py-20 text-center">Finding not found</div>;
  const current = lifecycle.indexOf(finding.lifecycle);
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <Breadcrumbs
        items={[
          { label: "Internal Audit", to: "/qms/audits" },
          { label: "Findings", to: "/qms/audits" },
          { label: finding.id },
        ]}
      />
      <RecordHeader
        id={finding.id}
        title={finding.title}
        badges={
          <>
            <SeverityBadge severity={finding.severity} />
            <StatusBadge status={finding.status} />
          </>
        }
        meta={
          <>
            <span className="flex items-center gap-1">
              <UserRound className="size-3.5" /> {finding.owner}
            </span>
            <span>{finding.entity}</span>
            <span>{finding.auditId}</span>
            <span>{finding.clause}</span>
          </>
        }
        primaryAction={
          <Button>
            {finding.status === "closed" ? "View Closure Evidence" : "Accept Corrective Action"}
          </Button>
        }
      />
      <Panel title="Finding lifecycle">
        <WorkflowStepper
          steps={lifecycle.map((label, index) => ({
            label,
            state: index < current ? "complete" : index === current ? "current" : "upcoming",
          }))}
        />
      </Panel>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Tabs defaultValue="finding">
          <TabsList>
            <TabsTrigger value="finding">Finding</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="closure">Independent closure</TabsTrigger>
          </TabsList>
          <TabsContent value="finding">
            <Panel title="Non-conformity statement">
              <p className="text-sm leading-6">
                Objective evidence demonstrates that {finding.title.toLowerCase()}. This does not
                conform to {finding.clause} and requires systemic corrective action.
              </p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <KeyValue label="Audit">{finding.auditTitle}</KeyValue>
                <KeyValue label="Classification">{finding.severity} non-conformity</KeyValue>
                <KeyValue label="Requirement">{finding.clause}</KeyValue>
                <KeyValue label="Acknowledged by">{finding.owner}</KeyValue>
              </div>
            </Panel>
          </TabsContent>
          <TabsContent value="evidence">
            <Panel title="Objective evidence">
              <div className="space-y-2">
                {[
                  "Sampled operational record with missing approval",
                  "Auditor interview note",
                  "Current controlled procedure",
                ].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 rounded-lg border p-3">
                    <FileWarning className="size-4 text-primary" />
                    <div className="text-sm">
                      EV-AUD-{finding.id.slice(-1)}0{index + 1} · {item}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>
          <TabsContent value="actions">
            <Panel title="Corrective action traceability">
              <p className="text-sm">
                The linked CAPA owns root-cause analysis, action planning, implementation and
                effectiveness verification. Finding closure remains under the independent audit
                lead.
              </p>
            </Panel>
          </TabsContent>
          <TabsContent value="closure">
            <Panel title="Independent closure">
              <div className="flex gap-3 rounded-lg border bg-muted/30 p-4 text-sm">
                <ShieldCheck className="size-5 shrink-0 text-compliant" /> The Audit Lead must
                confirm action completion and effectiveness evidence. The finding owner and CAPA
                action owner cannot independently close this finding.
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
        <aside className="space-y-4">
          {finding.capa && (
            <Panel title="Auto-created CAPA">
              <Link
                to="/qms/capa/$id"
                params={{ id: finding.capa.id }}
                className="block rounded-lg border border-primary/30 bg-primary-soft/50 p-4 transition hover:border-primary"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-primary">
                    {finding.capa.id}
                  </span>
                  <Link2 className="size-4 text-primary" />
                </div>
                <div className="mt-2 text-sm font-semibold">{finding.capa.title}</div>
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge status={finding.capa.status} />
                  <span className="text-xs text-muted-foreground">Due {finding.capa.dueDate}</span>
                </div>
              </Link>
            </Panel>
          )}
          <Panel title="Source audit">
            <Link
              to="/qms/audits/$id"
              params={{ id: finding.auditId }}
              className="flex items-center gap-2 text-sm font-medium text-primary"
            >
              <Wrench className="size-4" /> {finding.auditId}
            </Link>
          </Panel>
          <Panel title="Closure authority">
            <div className="text-sm">
              Audit Lead · independent of finding and CAPA action owners
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
