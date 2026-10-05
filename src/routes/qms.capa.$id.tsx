import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, CheckCircle2, Plus, UserRound, Wrench } from "lucide-react";
import { toast } from "sonner";
import { capaStages, getCapa, qmsFlows } from "@/services/qms";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { DueDateIndicator, SeverityBadge, StatusBadge } from "@/components/grc/badges";
import { KeyValue, RecordHeader, WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/qms/capa/$id")({
  head: () => ({ meta: [{ title: "CAPA Detail — Quantbit Compliance AI" }] }),
  component: CapaDetail,
});

function CapaDetail() {
  const { id } = Route.useParams();
  const query = useQuery({
    queryKey: ["qms", "capa", id],
    queryFn: () => getCapa(id),
    staleTime: 60_000,
  });
  const [extraWhy, setExtraWhy] = useState("");
  if (query.isPending)
    return (
      <div className="space-y-4">
        <Skeleton className="h-36" />
        <Skeleton className="h-96" />
      </div>
    );
  const capa = query.data;
  if (!capa)
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold">CAPA not found</h1>
        <Button asChild className="mt-4">
          <Link to="/qms/capa">Return to CAPA register</Link>
        </Button>
      </div>
    );
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/command-center" },
          { label: "CAPA", to: "/qms/capa" },
          { label: capa.id },
        ]}
      />
      <RecordHeader
        id={capa.id}
        title={capa.title}
        badges={
          <>
            <SeverityBadge severity={capa.severity} />
            <StatusBadge status={capa.status} />
          </>
        }
        meta={
          <>
            <span className="flex items-center gap-1">
              <UserRound className="size-3.5" /> {capa.actionOwner}
            </span>
            <span>{capa.entity}</span>
            <DueDateIndicator date={capa.dueDate} />
            <span>{capa.source}</span>
          </>
        }
        primaryAction={
          <Button
            disabled={capa.independenceConflict}
            onClick={() => toast.success("CAPA plan sent to independent approver")}
          >
            {capa.workflowStage === "Pending Effectiveness"
              ? "Verify Effectiveness"
              : "Send CAPA Plan for Review"}
          </Button>
        }
      />
      <Panel title="CAPA state machine">
        <WorkflowStepper
          steps={capaStages.map((label, index) => ({
            label,
            state:
              index < capa.workflowIndex
                ? "complete"
                : index === capa.workflowIndex
                  ? "current"
                  : "upcoming",
          }))}
        />
      </Panel>
      {capa.independenceConflict && (
        <div className="flex items-start gap-3 rounded-lg border border-critical/30 bg-critical-soft p-4 text-critical">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div>
            <div className="font-semibold">Independence rule conflict — workflow blocked</div>
            <p className="mt-1 text-sm">
              {capa.actionOwner} is currently assigned as action owner, approver and effectiveness
              verifier. Reassign the approver and verifier before this CAPA can progress.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => toast("Opened independent assignee selection")}
            >
              Resolve assignments
            </Button>
          </div>
        </div>
      )}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <Tabs defaultValue="rca" className="min-w-0">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rca">Root cause analysis</TabsTrigger>
            <TabsTrigger value="actions">Action plan</TabsTrigger>
            <TabsTrigger value="effectiveness">Effectiveness</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Panel title="CAPA overview">
              <div className="grid gap-5 md:grid-cols-2">
                <KeyValue label="Source">{capa.source}</KeyValue>
                <KeyValue label="Stage">{capa.workflowStage}</KeyValue>
                <KeyValue label="Root cause">{capa.rootCause}</KeyValue>
                <KeyValue label="Linked risk">
                  {capa.linkedRiskId ? (
                    <Link
                      to="/qms/risks/$id"
                      params={{ id: capa.linkedRiskId }}
                      className="text-primary hover:underline"
                    >
                      {capa.linkedRiskId}
                    </Link>
                  ) : (
                    "None"
                  )}
                </KeyValue>
              </div>
            </Panel>
          </TabsContent>
          <TabsContent value="rca" className="space-y-4">
            <Panel
              title="Five Whys builder"
              action={
                <Button variant="outline" size="sm">
                  <Plus className="size-3.5" /> Add why
                </Button>
              }
            >
              <ol className="space-y-3">
                {capa.fiveWhys.map((why, index) => (
                  <li key={why} className="flex items-start gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <div className="flex-1 rounded-lg border p-3 text-sm">{why}</div>
                    {index < capa.fiveWhys.length - 1 && (
                      <ArrowRight className="mt-3 size-4 rotate-90 text-muted-foreground" />
                    )}
                  </li>
                ))}
              </ol>
              <div className="mt-4 flex gap-2">
                <Input
                  value={extraWhy}
                  onChange={(event) => setExtraWhy(event.target.value)}
                  placeholder="Add another causal question or answer…"
                />
                <Button
                  onClick={() => {
                    if (extraWhy) {
                      toast.success("Additional why saved as draft");
                      setExtraWhy("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </Panel>
            <Panel title="Fishbone cause canvas">
              <div className="relative grid gap-3 md:grid-cols-2">
                {Object.entries(capa.fishbone).map(([branch, items]) => (
                  <div key={branch} className="rounded-lg border bg-muted/25 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {branch}
                    </div>
                    <ul className="mt-2 space-y-1 text-sm">
                      {items.map((item) => (
                        <li key={item}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="md:col-span-2 rounded-lg border-2 border-primary/30 bg-primary-soft p-4 text-center text-sm font-semibold">
                  Root effect: {capa.title}
                </div>
              </div>
            </Panel>
          </TabsContent>
          <TabsContent value="actions">
            <Panel title="Corrective action plan">
              <div className="space-y-3">
                {[
                  "Contain immediate exposure",
                  "Implement systemic corrective action",
                  "Update controlled procedure",
                  "Train affected roles",
                ].map((action, index) => (
                  <div key={action} className="flex items-center gap-3 rounded-lg border p-3">
                    <CheckCircle2
                      className={
                        index < 2 ? "size-4 text-compliant" : "size-4 text-muted-foreground"
                      }
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{action}</div>
                      <div className="text-xs text-muted-foreground">Owner: {capa.actionOwner}</div>
                    </div>
                    <span className="text-xs">{index < 2 ? "Complete" : "Open"}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>
          <TabsContent value="effectiveness">
            <Panel title="Independent effectiveness verification">
              <div className="grid gap-5 md:grid-cols-3">
                <KeyValue label="Verifier">{capa.verifier}</KeyValue>
                <KeyValue label="Monitoring period">30 days</KeyValue>
                <KeyValue label="Success criterion">
                  Zero repeat exceptions in sampled records
                </KeyValue>
              </div>
              <div className="mt-5 rounded-lg border bg-muted/30 p-4 text-sm">
                The verifier must be independent of the action owner and approver. Closing the CAPA
                requires objective evidence from the monitoring period.
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
        <aside className="space-y-4">
          <Panel title="Progress">
            <div className="text-3xl font-semibold">{capa.completion}%</div>
            <Progress value={capa.completion} className="mt-3" />
          </Panel>
          <Panel title="Independent roles">
            <div className="space-y-3 text-sm">
              <Role label="Action owner" value={capa.actionOwner} />
              <Role label="Plan approver" value={capa.approver} />
              <Role label="Effectiveness verifier" value={capa.verifier} />
            </div>
          </Panel>
          {capa.linkedFindingId && (
            <Panel title="Source finding">
              <Link
                to="/qms/audits/findings/$id"
                params={{ id: capa.linkedFindingId }}
                className="flex items-center gap-2 text-sm font-medium text-primary"
              >
                <Wrench className="size-4" /> {capa.linkedFindingId}
              </Link>
            </Panel>
          )}
          <Panel title="Flow C">
            <div className="space-y-1 text-xs text-muted-foreground">
              {qmsFlows.C.map((step) => (
                <div key={step}>• {step}</div>
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Role({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
