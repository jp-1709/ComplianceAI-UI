import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, ShieldCheck, Target, UserRound } from "lucide-react";
import { toast } from "sonner";
import { getRisk, qmsFlows } from "@/services/qms";
import { Breadcrumbs, ComplianceHeatMap, Panel } from "@/components/grc/widgets";
import { StatusBadge } from "@/components/grc/badges";
import { KeyValue, RecordHeader, WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/qms/risks/$id")({
  head: () => ({ meta: [{ title: "Risk Detail — Quantbit Compliance AI" }] }),
  component: RiskDetail,
});

function RiskDetail() {
  const { id } = Route.useParams();
  const query = useQuery({
    queryKey: ["qms", "risk", id],
    queryFn: () => getRisk(id),
    staleTime: 60_000,
  });
  if (query.isPending)
    return (
      <div className="space-y-4">
        <Skeleton className="h-36" />
        <Skeleton className="h-96" />
      </div>
    );
  const risk = query.data;
  if (!risk)
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold">Risk not found</h1>
        <Button asChild className="mt-4">
          <Link to="/qms/risks">Return to risk register</Link>
        </Button>
      </div>
    );
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/command-center" },
          { label: "Risk Management", to: "/qms/risks" },
          { label: risk.id },
        ]}
      />
      <RecordHeader
        id={risk.id}
        title={risk.title}
        badges={<StatusBadge status={risk.status} />}
        meta={
          <>
            <span className="flex items-center gap-1">
              <UserRound className="size-3.5" /> {risk.owner}
            </span>
            <span>{risk.entity}</span>
            <span>{risk.module.toUpperCase()}</span>
            <span>Review {risk.reviewDate}</span>
          </>
        }
        primaryAction={
          <Button onClick={() => toast.success("Treatment review requested from the risk owner")}>
            Review treatment
          </Button>
        }
      />
      <Panel title="Flow B · Risk identification to verified treatment">
        <WorkflowStepper
          steps={qmsFlows.B.map((label, index) => ({
            label,
            state: index < 4 ? "complete" : index === 4 ? "current" : "upcoming",
          }))}
        />
      </Panel>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <Tabs defaultValue="assessment" className="min-w-0">
          <TabsList>
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="treatment">Treatment</TabsTrigger>
            <TabsTrigger value="acceptance">Acceptance</TabsTrigger>
          </TabsList>
          <TabsContent value="assessment" className="grid gap-4 lg:grid-cols-2">
            <Panel title="Risk assessment">
              <div className="grid grid-cols-2 gap-5">
                <KeyValue label="Inherent score">
                  <div className="text-3xl font-semibold text-critical">{risk.inherentScore}</div>
                  <span className="text-xs text-muted-foreground">
                    L{risk.inherentLikelihood} × I{risk.inherentImpact}
                  </span>
                </KeyValue>
                <KeyValue label="Residual score">
                  <div className="text-3xl font-semibold text-attention-foreground dark:text-attention">
                    {risk.residualScore}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    L{risk.residualLikelihood} × I{risk.residualImpact}
                  </span>
                </KeyValue>
                <KeyValue label="Prior period">{risk.priorScore}</KeyValue>
                <KeyValue label="Appetite boundary">≤ {risk.appetiteThreshold}</KeyValue>
              </div>
              {risk.residualScore > risk.appetiteThreshold && (
                <div className="mt-5 flex gap-2 rounded-lg border border-critical/30 bg-critical-soft p-3 text-sm text-critical">
                  <AlertTriangle className="size-4 shrink-0" /> Residual risk is outside approved
                  appetite. Acceptance cannot bypass treatment and requires Group CXO approval.
                </div>
              )}
            </Panel>
            <Panel title="Position on heat map">
              <ComplianceHeatMap risks={[risk]} interactive selectedId={risk.id} />
            </Panel>
          </TabsContent>
          <TabsContent value="controls">
            <Panel title="Control effectiveness">
              <div className="space-y-4">
                {risk.controls.map((control) => (
                  <div key={control.name} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <ShieldCheck className="size-4 text-primary" /> {control.name}
                      </div>
                      <span className="text-xs text-muted-foreground">{control.status}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={control.effectiveness} className="flex-1" />
                      <span className="text-sm font-semibold">{control.effectiveness}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>
          <TabsContent value="treatment">
            <Panel title="Linked treatment actions">
              <div className="space-y-2">
                {risk.treatmentPlan.map(
                  (capa) =>
                    capa && (
                      <Link
                        key={capa.id}
                        to="/qms/capa/$id"
                        params={{ id: capa.id }}
                        className="flex items-center justify-between rounded-lg border p-4 transition hover:border-primary/40"
                      >
                        <div>
                          <div className="font-mono text-xs text-muted-foreground">{capa.id}</div>
                          <div className="mt-1 text-sm font-medium">{capa.title}</div>
                        </div>
                        <StatusBadge status={capa.status} />
                      </Link>
                    ),
                )}
              </div>
            </Panel>
          </TabsContent>
          <TabsContent value="acceptance">
            <Panel title="Risk acceptance workflow">
              <div className="grid gap-4 md:grid-cols-3">
                <KeyValue label="Decision">{risk.acceptance.state}</KeyValue>
                <KeyValue label="Approver">{risk.acceptance.approver}</KeyValue>
                <KeyValue label="Current treatment">{risk.treatment}</KeyValue>
              </div>
              <div className="mt-5 rounded-lg border border-attention/30 bg-attention-soft p-4 text-sm">
                Human-controlled decision: AI may recommend an acceptance rationale, but only an
                authorised Group CXO can accept risk. Evidence and time-bound review remain
                mandatory.
              </div>
              <Button className="mt-4" disabled={risk.residualScore > risk.appetiteThreshold}>
                Request risk acceptance
              </Button>
            </Panel>
          </TabsContent>
        </Tabs>
        <aside className="space-y-4">
          <Panel title="Health summary">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Control effectiveness</span>
                <b>{risk.controlEffectiveness}%</b>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Treatment</span>
                <b>{risk.treatment}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Linked CAPAs</span>
                <b>{risk.treatmentPlan.length}</b>
              </div>
            </div>
          </Panel>
          <Panel title="Required next action">
            <div className="flex gap-2 text-sm">
              <Target className="mt-0.5 size-4 text-primary" />
              <span>
                Complete active CAPAs, re-test controls, then reassess residual likelihood and
                impact.
              </span>
            </div>
          </Panel>
          <Panel title="Decision guardrail">
            <div className="flex gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 text-compliant" />
              <span>
                Risk owner, acceptance approver and control tester are independently assigned.
              </span>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
