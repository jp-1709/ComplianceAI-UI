import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertTriangle,
  Building2,
  FileWarning,
  HardHat,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getModuleWorkspace } from "@/services/modules";
import { Breadcrumbs, MetricCard, Panel } from "@/components/grc/widgets";
import { StatusBadge } from "@/components/grc/badges";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/labour")({
  head: () => ({ meta: [{ title: "Labour Compliance — Quantbit Compliance AI" }] }),
  component: LabourRoute,
});

function LabourRoute() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return pathname === "/labour" || pathname === "/labour/" ? <LabourDashboard /> : <Outlet />;
}
function LabourDashboard() {
  const { data } = useQuery({
    queryKey: ["module", "labour"],
    queryFn: () => getModuleWorkspace("labour"),
    staleTime: 60_000,
  });
  const establishments = data && "establishments" in data ? data.establishments : [];
  const inspections = data && "inspections" in data ? data.inspections : [];
  const contractorList = data && "contractors" in data ? data.contractors : [];
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs
        items={[{ label: "Home", to: "/command-center" }, { label: "Labour Compliance" }]}
      />
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-module-labour">
            <Users className="size-4" /> Workforce compliance
          </div>
          <h1 className="mt-1 text-2xl font-semibold">Labour Compliance Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Establishments, wages, statutory registers, contractors, licences and inspections.
          </p>
        </div>
        <Button asChild>
          <Link to="/labour/evidence-pack">
            <ShieldCheck className="size-4" /> Open Evidence Pack
          </Link>
        </Button>
      </div>
      <div className="flex items-start gap-3 rounded-lg border border-ai/30 bg-ai-soft p-4">
        <LockKeyhole className="mt-0.5 size-5 shrink-0 text-ai" />
        <div>
          <div className="text-sm font-semibold text-ai">Restricted POSH workspace</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Complaint identities, testimony and committee deliberations are visible only to
            authorised Internal Committee members. Dashboard counts are anonymised.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto shrink-0"
          onClick={() => toast.success("POSH access request sent to the Internal Committee")}
        >
          Request access
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Establishments"
          value={establishments.length}
          hint="Across four states and Delhi"
          to="/labour"
          icon={Building2}
        />
        <MetricCard
          label="Wage exceptions"
          value={establishments.reduce((sum, item) => sum + item.wageExceptions, 0)}
          tone="attention"
          hint="Payroll validation queue"
          to="/labour"
          icon={AlertTriangle}
        />
        <MetricCard
          label="Missing registers"
          value={establishments.reduce((sum, item) => sum + item.missingRegisters, 0)}
          tone="critical"
          hint="Statutory evidence gaps"
          to="/labour"
          icon={FileWarning}
        />
        <MetricCard
          label="Open inspections"
          value={inspections.filter((item) => item.status !== "Closed").length}
          tone="attention"
          hint="Authority response required"
          to="/labour"
          icon={HardHat}
        />
      </div>
      <Tabs defaultValue="establishments">
        <TabsList>
          <TabsTrigger value="establishments">Establishments by state</TabsTrigger>
          <TabsTrigger value="contractors">Contractor scorecard</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
        </TabsList>
        <TabsContent value="establishments">
          <Panel title="Establishment compliance">
            <div className="grid gap-3 lg:grid-cols-2">
              {establishments.map((item) => (
                <Link
                  key={item.id}
                  to="/labour/establishments/$id"
                  params={{ id: item.id }}
                  className="rounded-lg border p-4 transition hover:border-primary/40"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {item.id} · {item.state}
                      </div>
                      <div className="mt-1 font-medium">{item.name}</div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-3 text-xs">
                    <div>
                      <b>{item.headcount}</b>
                      <div className="text-muted-foreground">People</div>
                    </div>
                    <div>
                      <b className="text-attention-foreground">{item.wageExceptions}</b>
                      <div className="text-muted-foreground">Wage gaps</div>
                    </div>
                    <div>
                      <b className="text-critical">{item.missingRegisters}</b>
                      <div className="text-muted-foreground">Registers</div>
                    </div>
                    <div>
                      <b>{item.licenceExpiry}</b>
                      <div className="text-muted-foreground">Expiry</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="contractors">
          <Panel title="Contractor compliance scorecard">
            <div className="space-y-3">
              {contractorList.map((item) => (
                <Link
                  key={item.id}
                  to="/labour/contractors/$id"
                  params={{ id: item.id }}
                  className="grid gap-3 rounded-lg border p-4 transition hover:border-primary/40 md:grid-cols-[1fr_100px_120px_120px]"
                >
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">{item.id}</div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.workers} workers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-semibold">{item.score}</div>
                    <Progress value={item.score} />
                  </div>
                  <div className="text-xs">
                    <b>BOCW</b>
                    <div className="mt-1 text-muted-foreground">{item.bocw}</div>
                  </div>
                  <div className="text-xs">
                    <b>Induction</b>
                    <div className="mt-1 text-muted-foreground">{item.induction}%</div>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="inspections">
          <Panel title="Inspection register">
            <div className="space-y-2">
              {inspections.map((item) => (
                <Link
                  key={item.id}
                  to="/labour/inspections/$id"
                  params={{ id: item.id }}
                  className="flex items-center justify-between rounded-lg border p-4 hover:border-primary/40"
                >
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">{item.id}</div>
                    <div className="text-sm font-medium">{item.authority}</div>
                    <div className="text-xs text-muted-foreground">{item.scope}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div>{item.status}</div>
                    <div className="text-muted-foreground">{item.findings} findings</div>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
