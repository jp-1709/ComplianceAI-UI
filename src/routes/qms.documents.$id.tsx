import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GitCompareArrows, History, ShieldCheck, UserRound, Users } from "lucide-react";
import { getDocument, governanceActivity } from "@/services/governance";
import { ActivityTimeline, Breadcrumbs, Panel } from "@/components/grc/widgets";
import { StatusBadge } from "@/components/grc/badges";
import { KeyValue, RecordHeader, WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/qms/documents/$id")({
  head: () => ({ meta: [{ title: "Document Detail — Quantbit Compliance AI" }] }),
  component: DocumentDetailRoute,
});

function DocumentDetailRoute() {
  const { id } = Route.useParams();
  const pathname = useLocation({ select: (location) => location.pathname });
  const detailPath = `/qms/documents/${encodeURIComponent(id)}`;
  return pathname === detailPath || pathname === `${detailPath}/` ? <DocumentDetail /> : <Outlet />;
}

function DocumentDetail() {
  const { id } = Route.useParams();
  const query = useQuery({
    queryKey: ["controlled-document", id],
    queryFn: () => getDocument(id),
    staleTime: 60_000,
  });
  if (query.isPending)
    return (
      <div className="space-y-4">
        <Skeleton className="h-36" />
        <Skeleton className="h-96" />
      </div>
    );
  const document = query.data;
  if (!document) return <div className="py-20 text-center">Document not found</div>;
  const workflowIndex =
    document.status === "draft" ? 1 : document.status === "pending-approval" ? 3 : 5;
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <Breadcrumbs
        items={[{ label: "Document Control", to: "/qms/documents" }, { label: document.code }]}
      />
      <RecordHeader
        id={document.code}
        title={document.title}
        badges={<StatusBadge status={document.status} />}
        meta={
          <>
            <span>Version {document.version}</span>
            <span className="flex items-center gap-1">
              <UserRound className="size-3.5" /> {document.owner}
            </span>
            <span>{document.entity}</span>
            <span>Effective {document.effectiveFrom}</span>
            <span>Review {document.nextReview}</span>
          </>
        }
        primaryAction={
          document.status === "pending-approval" ? (
            <Button asChild>
              <Link to="/qms/documents/$id/approve" params={{ id: document.id }}>
                <ShieldCheck className="size-4" /> Open Approval Workspace
              </Link>
            </Button>
          ) : (
            <Button>Create new version</Button>
          )
        }
      />
      <Panel title="Document lifecycle">
        <WorkflowStepper
          steps={[
            "Author draft",
            "Content review",
            "Resolve comments",
            "Approval",
            "Issue & publish",
            "Acknowledgements",
            "Periodic review",
          ].map((label, index) => ({
            label,
            state:
              index < workflowIndex ? "complete" : index === workflowIndex ? "current" : "upcoming",
          }))}
        />
      </Panel>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Current version</TabsTrigger>
            <TabsTrigger value="versions">Version history</TabsTrigger>
            <TabsTrigger value="linked">Linked records</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="content">
            <Panel title={`${document.code} · Version ${document.version}`}>
              <div className="space-y-4 text-sm leading-7">
                {document.currentContent.map((line, index) => (
                  <div key={line}>
                    <div className="text-xs font-semibold text-muted-foreground">
                      {index + 1}.{" "}
                      {index === 0
                        ? "Purpose and scope"
                        : index === 1
                          ? "Mandatory controls"
                          : "Review and records"}
                    </div>
                    <p>{line}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>
          <TabsContent value="versions">
            <Panel title="Version history">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary-soft/40 p-4">
                  <div>
                    <div className="text-sm font-semibold">
                      Version {document.version} · Current
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Effective {document.effectiveFrom}
                    </div>
                  </div>
                  <StatusBadge status={document.status} />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="text-sm font-semibold">
                      Version {document.priorVersion} · Superseded
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Retained for audit traceability
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/qms/documents/$id/compare" params={{ id: document.id }}>
                      <GitCompareArrows className="size-4" /> Compare versions
                    </Link>
                  </Button>
                </div>
              </div>
            </Panel>
          </TabsContent>
          <TabsContent value="linked">
            <Panel title="Linked assurance records">
              <div className="grid gap-3 md:grid-cols-3">
                <KeyValue label="Evidence">
                  {document.linkedEvidence.map((item) => item.id).join(", ") || "—"}
                </KeyValue>
                <KeyValue label="Risks">
                  {document.linkedRisks.map((item) => item.id).join(", ") || "—"}
                </KeyValue>
                <KeyValue label="CAPAs">
                  {document.linkedCapas.map((item) => item.id).join(", ") || "—"}
                </KeyValue>
              </div>
            </Panel>
          </TabsContent>
          <TabsContent value="activity">
            <Panel title="Document activity">
              <ActivityTimeline items={governanceActivity} />
            </Panel>
          </TabsContent>
        </Tabs>
        <aside className="space-y-4">
          <Panel title="Acknowledgement status">
            <div className="text-3xl font-semibold">
              {document.acknowledgementsTotal - document.acknowledgementsPending}/
              {document.acknowledgementsTotal}
            </div>
            <Progress
              value={
                ((document.acknowledgementsTotal - document.acknowledgementsPending) /
                  document.acknowledgementsTotal) *
                100
              }
              className="mt-3"
            />
            <Button variant="outline" className="mt-4 w-full">
              <Users className="size-4" /> View pending people
            </Button>
          </Panel>
          <Panel title="Document controls">
            <div className="space-y-3 text-sm">
              <KeyValue label="Owner">{document.owner}</KeyValue>
              <KeyValue label="Approver">{document.approver}</KeyValue>
              <KeyValue label="Review state">{document.reviewState}</KeyValue>
              <KeyValue label="Classification">Internal controlled</KeyValue>
            </div>
          </Panel>
          <Button asChild variant="outline" className="w-full">
            <Link to="/qms/documents/$id/compare" params={{ id: document.id }}>
              <History className="size-4" /> Compare version changes
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
