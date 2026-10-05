import { useMemo } from "react";
import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CalendarRange,
  CheckCircle2,
  ClipboardCheck,
  FileWarning,
  Plus,
  Smartphone,
} from "lucide-react";
import { getAuditWorkspace, qmsFlows, type findingProfiles } from "@/services/qms";
import { EnterpriseDataTable } from "@/components/grc/EnterpriseDataTable";
import { Breadcrumbs, MetricCard, Panel } from "@/components/grc/widgets";
import { SeverityBadge, StatusBadge } from "@/components/grc/badges";
import { WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateQmsRecordDialog } from "@/components/qms/CreateQmsRecordDialog";

type FindingProfile = (typeof findingProfiles)[number];

export const Route = createFileRoute("/qms/audits")({
  head: () => ({ meta: [{ title: "Internal Audit — Quantbit Compliance AI" }] }),
  component: AuditRoute,
});

function AuditRoute() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return pathname === "/qms/audits" || pathname === "/qms/audits/" ? (
    <AuditWorkspace />
  ) : (
    <Outlet />
  );
}

function AuditWorkspace() {
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["qms", "audits"],
    queryFn: getAuditWorkspace,
    staleTime: 60_000,
  });
  const audits = query.data?.audits ?? [];
  const findings = query.data?.findings ?? [];
  const findingColumns = useMemo<ColumnDef<FindingProfile>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Finding",
        cell: ({ row }) => (
          <Link
            to="/qms/audits/findings/$id"
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
        header: "Non-conformity / observation",
        cell: ({ row }) => (
          <div className="max-w-lg">
            <div className="font-medium">{row.original.title}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.clause} · {row.original.entity}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => <SeverityBadge severity={row.original.severity} />,
      },
      { accessorKey: "lifecycle", header: "Lifecycle" },
      {
        accessorKey: "capaId",
        header: "Auto-created CAPA",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.capaId ?? "—"}</span>,
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
      <Breadcrumbs
        items={[{ label: "Home", to: "/command-center" }, { label: "Internal Audit" }]}
      />
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <ClipboardCheck className="size-4" /> Independent assurance
          </div>
          <h1 className="mt-1 text-2xl font-semibold">Internal Audit Programme</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Risk-based programme, mobile fieldwork, evidence-linked findings and independent
            closure.
          </p>
        </div>
        <CreateQmsRecordDialog
          kind="audit"
          trigger={
            <Button>
              <Plus className="size-4" /> Start audit
            </Button>
          }
          onCreated={(id) => navigate({ to: "/qms/audits/$id", params: { id } })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Internal audits"
          value={audits.length}
          hint="FY2026–27 programme"
          to="/qms/audits"
          icon={ClipboardCheck}
        />
        <MetricCard
          label="Issued reports"
          value={audits.filter((audit) => audit.reportIssued).length}
          tone="compliant"
          hint="Audit-ready packs"
          to="/qms/audits"
          icon={CheckCircle2}
        />
        <MetricCard
          label="Open findings"
          value={findings.filter((finding) => finding.status !== "closed").length}
          tone="attention"
          hint="Action required"
          to="/qms/audits"
          icon={FileWarning}
        />
        <MetricCard
          label="Fieldwork active"
          value={audits.filter((audit) => audit.status === "Fieldwork").length}
          hint="Mobile checklist enabled"
          to="/qms/audits"
          icon={Smartphone}
        />
      </div>
      <Panel title="Flow E · Programme to management review">
        <WorkflowStepper
          steps={qmsFlows.E.map((label, index) => ({
            label,
            state: index < 3 ? "complete" : index === 3 ? "current" : "upcoming",
          }))}
        />
      </Panel>
      <Tabs defaultValue="programme">
        <TabsList>
          <TabsTrigger value="programme">Programme timeline</TabsTrigger>
          <TabsTrigger value="findings">Finding register</TabsTrigger>
        </TabsList>
        <TabsContent value="programme">
          <Panel
            title="FY2026–27 assurance timeline"
            action={<CalendarRange className="size-4 text-muted-foreground" />}
          >
            <div className="relative space-y-0 before:absolute before:bottom-4 before:left-[75px] before:top-4 before:w-px before:bg-border-strong">
              {audits.map((audit) => (
                <div key={audit.id} className="relative grid grid-cols-[60px_1fr] gap-6 py-3">
                  <div className="text-right text-xs font-medium text-muted-foreground">
                    {audit.plannedOn.slice(0, 6)}
                  </div>
                  <span className="absolute left-[70px] top-5 size-3 rounded-full border-2 border-surface bg-primary" />
                  <Link
                    to="/qms/audits/$id"
                    params={{ id: audit.id }}
                    className="rounded-lg border p-4 transition hover:border-primary/40"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div>
                        <div className="font-mono text-xs text-muted-foreground">{audit.id}</div>
                        <div className="mt-1 font-medium">{audit.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Lead: {audit.lead} · {audit.entity}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs">{audit.status}</span>
                        <div className="w-28">
                          <Progress value={audit.progress} />
                          <div className="mt-1 text-[10px] text-muted-foreground">
                            {audit.completedItems}/{audit.totalItems} items
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="findings">
          <EnterpriseDataTable
            data={findings}
            columns={findingColumns}
            loading={query.isPending}
            searchPlaceholder="Search findings, clauses or CAPAs…"
            onRowClick={(finding) =>
              navigate({ to: "/qms/audits/findings/$id", params: { id: finding.id } })
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
