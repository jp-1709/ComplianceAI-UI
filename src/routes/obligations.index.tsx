import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Filter, ListChecks, Plus } from "lucide-react";
import { getObligations, type ObligationView } from "@/services/workspaces";
import { EnterpriseDataTable } from "@/components/grc/EnterpriseDataTable";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { DueDateIndicator, StatusBadge } from "@/components/grc/badges";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const searchSchema = (search: Record<string, unknown>) => ({
  filter: typeof search.filter === "string" ? search.filter : undefined,
});

export const Route = createFileRoute("/obligations/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Obligation Register — Quantbit Compliance AI" },
      {
        name: "description",
        content: "Enterprise obligation register with accountable ownership and evidence mapping.",
      },
    ],
  }),
  component: ObligationRegister,
});

function ObligationRegister() {
  const search = Route.useSearch();
  const query = useQuery({ queryKey: ["obligations"], queryFn: getObligations, staleTime: 60_000 });
  const [preview, setPreview] = useState<ObligationView | null>(null);
  const columns = useMemo<ColumnDef<ObligationView>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Obligation",
        cell: ({ row }) => (
          <div className="max-w-[330px]">
            <Link
              to="/obligations/$id"
              params={{ id: row.original.id }}
              onClick={(event) => event.stopPropagation()}
              className="font-mono text-xs font-semibold text-primary hover:underline"
            >
              {row.original.id}
            </Link>
            <div className="mt-1 truncate text-sm font-medium">{row.original.title}</div>
          </div>
        ),
      },
      {
        accessorKey: "module",
        header: "Module",
        cell: ({ getValue }) => <span className="text-xs uppercase">{String(getValue())}</span>,
      },
      {
        accessorKey: "entityName",
        header: "Entity",
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-xs">{String(getValue())}</span>
        ),
      },
      {
        accessorKey: "ownerName",
        header: "Owner",
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap text-xs">{String(getValue())}</span>
        ),
      },
      { accessorKey: "frequency", header: "Frequency" },
      {
        accessorKey: "dueDate",
        header: "Due date",
        cell: ({ row }) => (
          <DueDateIndicator date={row.original.dueDate} locked={row.original.statutoryLocked} />
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "evidence",
        header: "Evidence",
        accessorFn: (row) => row.evidenceIds.length,
        cell: ({ row }) => (
          <span className="num-tabular text-xs">{row.original.evidenceIds.length} linked</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs
        items={[{ label: "Home", to: "/command-center" }, { label: "Obligation Register" }]}
      />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Obligation Register</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A single versioned register of statutory, regulatory and internal requirements across
            every entity.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="size-4" /> Export register
          </Button>
          <Button>
            <Plus className="size-4" /> Create obligation
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total obligations", value: query.data?.length ?? 0 },
          {
            label: "Statutory locked",
            value: query.data?.filter((x) => x.statutoryLocked).length ?? 0,
          },
          {
            label: "Need attention",
            value: query.data?.filter((x) => x.status === "attention").length ?? 0,
          },
          {
            label: "Overdue / critical",
            value:
              query.data?.filter((x) => x.status === "overdue" || x.status === "critical").length ??
              0,
          },
        ].map((item) => (
          <div key={item.label} className="enterprise-panel p-4">
            <div className="text-xs text-muted-foreground">{item.label}</div>
            <div className="mt-1 text-2xl font-semibold num-tabular">{item.value}</div>
          </div>
        ))}
      </div>
      <EnterpriseDataTable
        data={query.data ?? []}
        columns={columns}
        loading={query.isPending}
        initialSearch={search.filter ?? ""}
        searchPlaceholder="Search obligation ID, title, entity or owner…"
        onRowClick={setPreview}
        toolbar={
          <Button variant="outline" size="sm">
            <Filter className="size-4" /> Saved view: All active
          </Button>
        }
        empty={
          <span className="inline-flex items-center gap-2">
            <ListChecks className="size-4" /> No obligations match this view.
          </span>
        }
      />
      <Sheet open={Boolean(preview)} onOpenChange={(open) => !open && setPreview(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{preview?.id}</SheetTitle>
            <SheetDescription>{preview?.title}</SheetDescription>
          </SheetHeader>
          {preview && (
            <div className="mt-6 space-y-4">
              <div className="flex gap-2">
                <StatusBadge status={preview.status} />
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase">
                  {preview.module}
                </span>
              </div>
              <Panel title="Requirement">
                <p className="text-sm leading-6">{preview.plainLanguage}</p>
              </Panel>
              <Panel title="Accountability">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Entity</dt>
                    <dd className="mt-1 font-medium">{preview.entityName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Owner</dt>
                    <dd className="mt-1 font-medium">{preview.ownerName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Frequency</dt>
                    <dd className="mt-1">{preview.frequency}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Evidence</dt>
                    <dd className="mt-1">{preview.evidenceIds.length} linked records</dd>
                  </div>
                </dl>
              </Panel>
              <Button asChild className="w-full">
                <Link to="/obligations/$id" params={{ id: preview.id }}>
                  Open complete obligation record
                </Link>
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
