import { useMemo } from "react";
import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Activity, Gauge, Plus, ShieldAlert, SlidersHorizontal, Target } from "lucide-react";
import { getRiskWorkspace, qmsFlows, type RiskProfile } from "@/services/qms";
import { EnterpriseDataTable } from "@/components/grc/EnterpriseDataTable";
import { Breadcrumbs, ComplianceHeatMap, MetricCard, Panel } from "@/components/grc/widgets";
import { StatusBadge } from "@/components/grc/badges";
import { WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateQmsRecordDialog } from "@/components/qms/CreateQmsRecordDialog";

export const Route = createFileRoute("/qms/risks")({
  head: () => ({ meta: [{ title: "Risk Management — Quantbit Compliance AI" }] }),
  component: RiskRoute,
});

function RiskRoute() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return pathname === "/qms/risks" || pathname === "/qms/risks/" ? <RiskWorkspace /> : <Outlet />;
}

function RiskWorkspace() {
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["qms", "risks"],
    queryFn: getRiskWorkspace,
    staleTime: 60_000,
  });
  const data = query.data?.risks ?? [];
  const above = data.filter((risk) => risk.residualScore > risk.appetiteThreshold);
  const columns = useMemo<ColumnDef<RiskProfile>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Risk ID",
        cell: ({ row }) => (
          <Link
            to="/qms/risks/$id"
            params={{ id: row.original.id }}
            onClick={(event) => event.stopPropagation()}
            className="font-mono text-xs font-semibold text-primary hover:underline"
          >
            {row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: "title",
        header: "Risk",
        cell: ({ row }) => (
          <div className="max-w-md">
            <div className="font-medium">{row.original.title}</div>
            <div className="text-xs text-muted-foreground">{row.original.entity}</div>
          </div>
        ),
      },
      {
        accessorKey: "inherentScore",
        header: "Inherent",
        cell: ({ row }) => <Score value={row.original.inherentScore} />,
      },
      {
        accessorKey: "residualScore",
        header: "Residual",
        cell: ({ row }) => <Score value={row.original.residualScore} />,
      },
      {
        accessorKey: "appetiteThreshold",
        header: "Appetite",
        cell: ({ row }) => <span className="num-tabular">≤ {row.original.appetiteThreshold}</span>,
      },
      {
        accessorKey: "controlEffectiveness",
        header: "Controls",
        cell: ({ row }) => (
          <div className="w-28">
            <div className="mb-1 flex justify-between text-xs">
              <span>Effective</span>
              <span>{row.original.controlEffectiveness}%</span>
            </div>
            <Progress value={row.original.controlEffectiveness} />
          </div>
        ),
      },
      { accessorKey: "treatment", header: "Treatment" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    [],
  );
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs
        items={[{ label: "Home", to: "/command-center" }, { label: "Risk Management" }]}
      />
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldAlert className="size-4" /> Enterprise assurance
          </div>
          <h1 className="mt-1 text-2xl font-semibold">Risk Command Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inherent exposure, control performance, residual risk and treatment across KFC India
            Demo.
          </p>
        </div>
        <CreateQmsRecordDialog
          kind="risk"
          trigger={
            <Button>
              <Plus className="size-4" /> Add risk
            </Button>
          }
          onCreated={(id) => navigate({ to: "/qms/risks/$id", params: { id } })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Enterprise risks"
          value={data.length}
          hint="Authoritative register"
          to="/qms/risks"
          icon={ShieldAlert}
        />
        <MetricCard
          label="Above appetite"
          value={above.length}
          hint="Residual score exceeds limit"
          tone="critical"
          to="/qms/risks"
          icon={Target}
        />
        <MetricCard
          label="Weak controls"
          value={data.filter((risk) => risk.controlEffectiveness < 70).length}
          hint="Effectiveness below 70%"
          tone="attention"
          to="/qms/risks"
          icon={SlidersHorizontal}
        />
        <MetricCard
          label="Treatments active"
          value={data.filter((risk) => risk.treatmentPlan.length).length}
          hint="Linked to CAPA"
          to="/qms/capa"
          icon={Activity}
        />
      </div>
      <Tabs defaultValue="command">
        <TabsList>
          <TabsTrigger value="command">Command center</TabsTrigger>
          <TabsTrigger value="register">Risk register</TabsTrigger>
          <TabsTrigger value="appetite">Appetite dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="command" className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
          <Panel
            title="Interactive 5×5 compliance heat map"
            action={
              <span className="text-xs text-muted-foreground">
                Click a residual marker to open risk
              </span>
            }
          >
            <ComplianceHeatMap risks={data} interactive />
          </Panel>
          <Panel title="Risks outside appetite">
            <div className="space-y-2">
              {above.map((risk) => (
                <Link
                  key={risk.id}
                  to="/qms/risks/$id"
                  params={{ id: risk.id }}
                  className="flex items-center justify-between rounded-lg border p-3 transition hover:border-primary/40"
                >
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">{risk.id}</div>
                    <div className="mt-0.5 text-sm font-medium">{risk.title}</div>
                  </div>
                  <div className="ml-4 text-right">
                    <Score value={risk.residualScore} />
                    <div className="text-[10px] text-muted-foreground">
                      limit {risk.appetiteThreshold}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
          <Panel title="Flow B · Risk to verified treatment" className="xl:col-span-2">
            <WorkflowStepper
              steps={qmsFlows.B.map((label, index) => ({
                label,
                state: index < 4 ? "complete" : index === 4 ? "current" : "upcoming",
              }))}
            />
          </Panel>
        </TabsContent>
        <TabsContent value="register">
          <EnterpriseDataTable
            data={data}
            columns={columns}
            loading={query.isPending}
            searchPlaceholder="Search risks, entities or owners…"
            onRowClick={(risk) => navigate({ to: "/qms/risks/$id", params: { id: risk.id } })}
          />
        </TabsContent>
        <TabsContent value="appetite" className="grid gap-4 lg:grid-cols-3">
          {data.map((risk) => (
            <Link
              key={risk.id}
              to="/qms/risks/$id"
              params={{ id: risk.id }}
              className="enterprise-panel p-4 transition hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-xs text-muted-foreground">{risk.id}</div>
                  <div className="mt-1 text-sm font-medium">{risk.title}</div>
                </div>
                <Gauge className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="text-2xl font-semibold">{risk.residualScore}</div>
                <div className="flex-1">
                  <Progress value={Math.min(100, (risk.residualScore / 25) * 100)} />
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    Appetite boundary {risk.appetiteThreshold}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Score({ value }: { value: number }) {
  return (
    <span
      className={
        value >= 15
          ? "font-semibold text-critical"
          : value >= 10
            ? "font-semibold text-attention-foreground dark:text-attention"
            : "font-semibold text-compliant"
      }
    >
      {value}
    </span>
  );
}
