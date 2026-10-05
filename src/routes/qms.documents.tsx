import { useMemo } from "react";
import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { CalendarClock, CheckCircle2, FileClock, FileText, Plus, Users } from "lucide-react";
import { getDocuments, type DocumentProfile } from "@/services/governance";
import { EnterpriseDataTable } from "@/components/grc/EnterpriseDataTable";
import { Breadcrumbs, MetricCard, Panel } from "@/components/grc/widgets";
import { StatusBadge } from "@/components/grc/badges";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateQmsRecordDialog } from "@/components/qms/CreateQmsRecordDialog";

export const Route = createFileRoute("/qms/documents")({
  head: () => ({ meta: [{ title: "Document Control — Quantbit Compliance AI" }] }),
  component: DocumentRoute,
});

function DocumentRoute() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return pathname === "/qms/documents" || pathname === "/qms/documents/" ? (
    <DocumentWorkspace />
  ) : (
    <Outlet />
  );
}

function DocumentWorkspace() {
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: ["controlled-documents"],
    queryFn: getDocuments,
    staleTime: 60_000,
  });
  const documents = query.data ?? [];
  const columns = useMemo<ColumnDef<DocumentProfile>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Document",
        cell: ({ row }) => (
          <div>
            <Link
              to="/qms/documents/$id"
              params={{ id: row.original.id }}
              onClick={(event) => event.stopPropagation()}
              className="font-mono text-xs font-semibold text-primary hover:underline"
            >
              {row.original.code}
            </Link>
            <div className="max-w-md text-sm font-medium">{row.original.title}</div>
          </div>
        ),
      },
      {
        accessorKey: "version",
        header: "Version",
        cell: ({ row }) => <span className="font-mono">v{row.original.version}</span>,
      },
      { accessorKey: "category", header: "Type" },
      { accessorKey: "owner", header: "Owner" },
      { accessorKey: "entity", header: "Entity" },
      { accessorKey: "nextReview", header: "Next review" },
      {
        accessorKey: "acknowledgementsPending",
        header: "Acknowledgements",
        cell: ({ row }) => (
          <div className="w-32">
            <div className="mb-1 flex justify-between text-[10px]">
              <span>
                {row.original.acknowledgementsTotal - row.original.acknowledgementsPending}/
                {row.original.acknowledgementsTotal}
              </span>
              <span>{row.original.acknowledgementsPending} pending</span>
            </div>
            <Progress
              value={
                ((row.original.acknowledgementsTotal - row.original.acknowledgementsPending) /
                  row.original.acknowledgementsTotal) *
                100
              }
            />
          </div>
        ),
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
        items={[{ label: "Home", to: "/command-center" }, { label: "Document Control" }]}
      />
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <FileText className="size-4" /> Controlled information
          </div>
          <h1 className="mt-1 text-2xl font-semibold">Document Control Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Versioned documents, accountable approval, distribution and acknowledgement evidence.
          </p>
        </div>
        <CreateQmsRecordDialog
          kind="document"
          trigger={
            <Button>
              <Plus className="size-4" /> Create controlled document
            </Button>
          }
          onCreated={(id) => navigate({ to: "/qms/documents/$id", params: { id } })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Controlled documents"
          value={documents.length}
          hint="Authoritative library"
          to="/qms/documents"
          icon={FileText}
        />
        <MetricCard
          label="Awaiting approval"
          value={documents.filter((item) => item.status === "pending-approval").length}
          tone="attention"
          hint="Human approval required"
          to="/qms/documents"
          icon={FileClock}
        />
        <MetricCard
          label="Pending acknowledgements"
          value={documents.reduce((sum, item) => sum + item.acknowledgementsPending, 0)}
          tone="attention"
          hint="Across active versions"
          to="/qms/documents"
          icon={Users}
        />
        <MetricCard
          label="Current approved"
          value={documents.filter((item) => item.status === "approved").length}
          tone="compliant"
          hint="Effective versions"
          to="/qms/documents"
          icon={CheckCircle2}
        />
      </div>
      <Tabs defaultValue="library">
        <TabsList>
          <TabsTrigger value="library">Document library</TabsTrigger>
          <TabsTrigger value="acknowledgements">Acknowledgement tracker</TabsTrigger>
          <TabsTrigger value="reviews">Periodic review calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="library">
          <EnterpriseDataTable
            data={documents}
            columns={columns}
            loading={query.isPending}
            searchPlaceholder="Search code, title, owner or entity…"
            onRowClick={(item) => navigate({ to: "/qms/documents/$id", params: { id: item.id } })}
          />
        </TabsContent>
        <TabsContent value="acknowledgements">
          <Panel title="Acknowledgement tracker">
            <div className="space-y-3">
              {documents
                .filter((item) => item.acknowledgementsPending > 0)
                .map((item) => {
                  const complete = item.acknowledgementsTotal - item.acknowledgementsPending;
                  return (
                    <Link
                      key={item.id}
                      to="/qms/documents/$id"
                      params={{ id: item.id }}
                      className="block rounded-lg border p-4 hover:border-primary/40"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-xs text-muted-foreground">
                            {item.code} v{item.version}
                          </span>
                          <div className="text-sm font-medium">{item.title}</div>
                        </div>
                        <span className="text-xs font-semibold text-attention-foreground">
                          {item.acknowledgementsPending} pending
                        </span>
                      </div>
                      <Progress
                        value={(complete / item.acknowledgementsTotal) * 100}
                        className="mt-3"
                      />
                      <div className="mt-1 text-[10px] text-muted-foreground">
                        {complete} of {item.acknowledgementsTotal} acknowledged
                      </div>
                    </Link>
                  );
                })}
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="reviews">
          <Panel
            title="Periodic review calendar"
            action={<CalendarClock className="size-4 text-muted-foreground" />}
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[...documents]
                .sort((a, b) => a.nextReview.localeCompare(b.nextReview))
                .map((item) => (
                  <Link
                    key={item.id}
                    to="/qms/documents/$id"
                    params={{ id: item.id }}
                    className="rounded-lg border p-4 hover:border-primary/40"
                  >
                    <div className="text-xs font-semibold text-primary">{item.nextReview}</div>
                    <div className="mt-1 text-sm font-medium">
                      {item.code} · {item.title}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">Owner: {item.owner}</div>
                  </Link>
                ))}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
