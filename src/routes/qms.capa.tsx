import { useMemo } from "react";
import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, CheckCircle2, Clock3, Plus, ShieldCheck, Wrench } from "lucide-react";
import { capaStages, getCapaWorkspace, type CapaProfile } from "@/services/qms";
import { EnterpriseDataTable } from "@/components/grc/EnterpriseDataTable";
import { Breadcrumbs, MetricCard, Panel } from "@/components/grc/widgets";
import { DueDateIndicator, SeverityBadge, StatusBadge } from "@/components/grc/badges";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateQmsRecordDialog } from "@/components/qms/CreateQmsRecordDialog";

export const Route = createFileRoute("/qms/capa")({
  head: () => ({ meta: [{ title: "CAPA — Quantbit Compliance AI" }] }),
  component: CapaRoute,
});

function CapaRoute() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return pathname === "/qms/capa" || pathname === "/qms/capa/" ? <CapaWorkspace /> : <Outlet />;
}

function CapaWorkspace() {
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["qms", "capas"],
    queryFn: getCapaWorkspace,
    staleTime: 60_000,
  });
  const data = query.data?.capas ?? [];
  const columns = useMemo<ColumnDef<CapaProfile>[]>(
    () => [
      {
        accessorKey: "id",
        header: "CAPA ID",
        cell: ({ row }) => (
          <Link
            to="/qms/capa/$id"
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
        header: "Corrective / preventive action",
        cell: ({ row }) => (
          <div className="max-w-md">
            <div className="font-medium">{row.original.title}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.source} · {row.original.entity}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => <SeverityBadge severity={row.original.severity} />,
      },
      { accessorKey: "workflowStage", header: "Stage" },
      {
        accessorKey: "completion",
        header: "Progress",
        cell: ({ row }) => (
          <div className="w-24">
            <Progress value={row.original.completion} />
            <div className="mt-1 text-[10px] text-muted-foreground">{row.original.completion}%</div>
          </div>
        ),
      },
      {
        accessorKey: "dueDate",
        header: "Due",
        cell: ({ row }) => <DueDateIndicator date={row.original.dueDate} />,
      },
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
      <Breadcrumbs items={[{ label: "Home", to: "/command-center" }, { label: "CAPA" }]} />
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Wrench className="size-4" /> Corrective action system
          </div>
          <h1 className="mt-1 text-2xl font-semibold">CAPA Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Root cause, accountable action, independent approval and effectiveness verification.
          </p>
        </div>
        <CreateQmsRecordDialog
          kind="capa"
          trigger={
            <Button>
              <Plus className="size-4" /> Raise CAPA
            </Button>
          }
          onCreated={(id) => navigate({ to: "/qms/capa/$id", params: { id } })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Total CAPAs"
          value={data.length}
          hint="Consistent enterprise total"
          to="/qms/capa"
          icon={Wrench}
        />
        <MetricCard
          label="Overdue"
          value={data.filter((item) => item.status === "overdue").length}
          tone="critical"
          hint="Immediate escalation"
          to="/qms/capa"
          icon={Clock3}
        />
        <MetricCard
          label="Independence conflict"
          value={data.filter((item) => item.independenceConflict).length}
          tone="attention"
          hint="Workflow blocked"
          to="/qms/capa"
          icon={AlertTriangle}
        />
        <MetricCard
          label="Independently verified"
          value={data.filter((item) => item.status === "verified").length}
          tone="compliant"
          hint="Closed with evidence"
          to="/qms/capa"
          icon={ShieldCheck}
        />
      </div>
      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="register">CAPA register</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="space-y-4">
          <Panel title="Visual CAPA state machine">
            <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-8">
              {capaStages.map((stage, index) => (
                <div key={stage} className="relative rounded-lg border bg-muted/25 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Step {index + 1}
                  </div>
                  <div className="mt-1 text-xs font-medium">{stage}</div>
                  <div className="mt-3 text-2xl font-semibold">
                    {data.filter((item) => item.workflowStage === stage).length}
                  </div>
                  {index < capaStages.length - 1 && (
                    <span className="absolute -right-2 top-1/2 z-10 hidden size-3 rotate-45 border-r border-t bg-surface xl:block" />
                  )}
                </div>
              ))}
            </div>
          </Panel>
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="High-severity action queue">
              <div className="space-y-2">
                {data
                  .filter((item) => item.severity === "critical" || item.severity === "major")
                  .slice(0, 5)
                  .map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigate({ to: "/qms/capa/$id", params: { id: item.id } })}
                      className="flex w-full items-center justify-between rounded-lg border p-3 text-left hover:border-primary/40"
                    >
                      <div>
                        <div className="font-mono text-xs text-muted-foreground">{item.id}</div>
                        <div className="text-sm font-medium">{item.title}</div>
                      </div>
                      <SeverityBadge severity={item.severity} />
                    </button>
                  ))}
              </div>
            </Panel>
            <Panel title="Effectiveness pipeline">
              <div className="space-y-3">
                {data.slice(0, 5).map((item) => (
                  <div key={item.id}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>
                        {item.id} · {item.workflowStage}
                      </span>
                      <span>{item.completion}%</span>
                    </div>
                    <Progress value={item.completion} />
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </TabsContent>
        <TabsContent value="register">
          <EnterpriseDataTable
            data={data}
            columns={columns}
            loading={query.isPending}
            searchPlaceholder="Search CAPAs, sources or entities…"
            onRowClick={(item) => navigate({ to: "/qms/capa/$id", params: { id: item.id } })}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
