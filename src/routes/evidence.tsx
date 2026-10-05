import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileUp,
  FolderLock,
  Grid3X3,
  History,
  Link2,
  ShieldCheck,
  Upload,
  Vault,
} from "lucide-react";
import { toast } from "sonner";
import { getEvidenceLibrary, uploadEvidence, type EvidenceView } from "@/services/workspaces";
import { entities } from "@/data/kfc";
import { daysUntil } from "@/lib/date";
import { EnterpriseDataTable } from "@/components/grc/EnterpriseDataTable";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const searchSchema = (search: Record<string, unknown>) => ({
  filter: typeof search.filter === "string" ? search.filter : undefined,
});
const uploadSchema = z.object({
  title: z.string().min(3, "Use a descriptive evidence title"),
  entityId: z.string().min(1),
  module: z.enum(["labour", "tax", "secretarial", "ehs", "qms", "fssai"]),
});
type UploadValues = z.infer<typeof uploadSchema>;

export const Route = createFileRoute("/evidence")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Evidence Vault — Quantbit Compliance AI" },
      {
        name: "description",
        content: "Hashed evidence with provenance, expiry and coverage controls.",
      },
    ],
  }),
  component: EvidenceVault,
});

function EvidenceVault() {
  const search = Route.useSearch();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["evidence-library"],
    queryFn: getEvidenceLibrary,
    staleTime: 60_000,
  });
  const [preview, setPreview] = useState<EvidenceView | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const columns = useMemo<ColumnDef<EvidenceView>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Evidence",
        cell: ({ row }) => (
          <div className="max-w-[360px]">
            <div className="flex items-center gap-2">
              <FileCheck2 className="size-4 text-primary" />
              <span className="font-mono text-xs text-primary">{row.original.id}</span>
            </div>
            <div className="mt-1 truncate font-medium">{row.original.title}</div>
          </div>
        ),
      },
      { accessorKey: "type", header: "Type" },
      { accessorKey: "entityName", header: "Entity" },
      { accessorKey: "ownerName", header: "Owner" },
      { accessorKey: "issuedOn", header: "Issued" },
      {
        accessorKey: "expiresOn",
        header: "Expiry",
        cell: ({ row }) =>
          row.original.expiresOn ? (
            <span className={daysUntil(row.original.expiresOn) <= 30 ? "text-critical" : ""}>
              {row.original.expiresOn}
            </span>
          ) : (
            <span className="text-muted-foreground">No expiry</span>
          ),
      },
      {
        accessorKey: "sensitivity",
        header: "Sensitivity",
        cell: ({ getValue }) => (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
            <FolderLock className="size-3" />
            {String(getValue())}
          </span>
        ),
      },
      {
        id: "links",
        header: "Linked",
        accessorFn: (row) => row.linkedRecordIds.length,
        cell: ({ row }) => (
          <span className="text-xs">{row.original.linkedRecordIds.length} records</span>
        ),
      },
    ],
    [],
  );
  const mutation = useMutation({
    mutationFn: uploadEvidence,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ["evidence-library"] });
      const previous = queryClient.getQueryData<EvidenceView[]>(["evidence-library"]);
      const optimistic: EvidenceView = {
        id: "EV-PENDING",
        title: input.title,
        type: "Report",
        entityId: input.entityId,
        entityName: entities.find((x) => x.id === input.entityId)?.shortName ?? input.entityId,
        ownerId: "p-01",
        ownerName: "Ananya Rao",
        module: input.module,
        sha256: "Hashing…",
        issuedOn: "03-Oct-2026",
        expiresOn: null,
        linkedRecordIds: [],
        accessHistory: [],
        sensitivity: "Internal",
        retention: "Pending classification",
      };
      queryClient.setQueryData<EvidenceView[]>(["evidence-library"], (items = []) => [
        optimistic,
        ...items,
      ]);
      setUploadOpen(false);
      toast.loading("Hashing and classifying evidence…", { id: "evidence-upload" });
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(["evidence-library"], context?.previous);
      toast.error("Upload failed and was rolled back", { id: "evidence-upload" });
    },
    onSuccess: (created) => {
      queryClient.setQueryData<EvidenceView[]>(["evidence-library"], (items = []) => [
        created,
        ...items.filter((x) => x.id !== "EV-PENDING"),
      ]);
      toast.success("Evidence uploaded with SHA-256 provenance", { id: "evidence-upload" });
    },
  });
  const evidence = query.data ?? [];
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs
        items={[{ label: "Home", to: "/command-center" }, { label: "Evidence Vault" }]}
      />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Evidence Vault</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Defensible records with ownership, cryptographic provenance, retention and control
            traceability.
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Upload className="size-4" /> Upload evidence
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Evidence records", value: evidence.length },
          {
            label: "Expiring in 45 days",
            value: evidence.filter(
              (x) => x.expiresOn && daysUntil(x.expiresOn) >= 0 && daysUntil(x.expiresOn) <= 45,
            ).length,
          },
          {
            label: "Linked to controls",
            value: evidence.filter((x) => x.linkedRecordIds.length > 0).length,
          },
          {
            label: "Restricted",
            value: evidence.filter((x) => x.sensitivity === "Restricted").length,
          },
        ].map((item) => (
          <div key={item.label} className="enterprise-panel p-4">
            <div className="text-xs text-muted-foreground">{item.label}</div>
            <div className="mt-1 text-2xl font-semibold">{item.value}</div>
          </div>
        ))}
      </div>
      <Tabs defaultValue="library">
        <TabsList>
          <TabsTrigger value="library">
            <Vault className="mr-1 size-4" /> Library
          </TabsTrigger>
          <TabsTrigger value="expiry">
            <Clock3 className="mr-1 size-4" /> Expiry dashboard
          </TabsTrigger>
          <TabsTrigger value="coverage">
            <Grid3X3 className="mr-1 size-4" /> Coverage matrix
          </TabsTrigger>
        </TabsList>
        <TabsContent value="library">
          <EnterpriseDataTable
            data={evidence}
            columns={columns}
            loading={query.isPending}
            initialSearch={search.filter ?? ""}
            onRowClick={setPreview}
            searchPlaceholder="Search evidence, hash, entity or owner…"
            toolbar={
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                <FileUp className="size-4" /> Add record
              </Button>
            }
          />
        </TabsContent>
        <TabsContent value="expiry">
          <ExpiryDashboard evidence={evidence} onSelect={setPreview} />
        </TabsContent>
        <TabsContent value="coverage">
          <CoverageMatrix evidence={evidence} />
        </TabsContent>
      </Tabs>
      <EvidenceDetail evidence={preview} onClose={() => setPreview(null)} />
      <UploadWizard
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        uploading={mutation.isPending}
        onUpload={(values) => mutation.mutate(values)}
      />
    </div>
  );
}

function EvidenceDetail({
  evidence,
  onClose,
}: {
  evidence: EvidenceView | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={Boolean(evidence)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {evidence?.id} · {evidence?.title}
          </SheetTitle>
          <SheetDescription>Evidence provenance and access record</SheetDescription>
        </SheetHeader>
        {evidence && (
          <div className="mt-6 space-y-4">
            <div className="rounded-md border border-compliant/30 bg-compliant-soft/40 p-3 text-sm">
              <ShieldCheck className="mr-2 inline size-4 text-compliant" />
              Integrity verified · SHA-256 matches the stored original
            </div>
            <Panel title="Provenance">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Owner</div>
                  <div className="mt-1 font-medium">{evidence.ownerName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Entity</div>
                  <div className="mt-1">{evidence.entityName}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Issue date</div>
                  <div className="mt-1">{evidence.issuedOn}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Expiry date</div>
                  <div className="mt-1">{evidence.expiresOn ?? "No expiry"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Sensitivity</div>
                  <div className="mt-1">{evidence.sensitivity}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Retention</div>
                  <div className="mt-1">{evidence.retention}</div>
                </div>
              </div>
              <div className="mt-4 break-all rounded-md bg-muted p-3 font-mono text-[11px]">
                <b>SHA-256</b>
                <br />
                {evidence.sha256}
              </div>
            </Panel>
            <Panel title="Linked records">
              <div className="flex flex-wrap gap-2">
                {evidence.linkedRecordIds.length ? (
                  evidence.linkedRecordIds.map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 rounded border px-2 py-1 font-mono text-xs"
                    >
                      <Link2 className="size-3" />
                      {id}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-attention-foreground">
                    Linking required before this record can satisfy a control.
                  </span>
                )}
              </div>
            </Panel>
            <Panel title="Access history">
              <div className="space-y-3">
                {evidence.accessHistory.map((event) => (
                  <div key={`${event.at}-${event.by}`} className="flex gap-3 text-sm">
                    <History className="mt-0.5 size-4 text-muted-foreground" />
                    <div>
                      <b>{event.by}</b> {event.action.toLowerCase()} this record
                      <div className="text-xs text-muted-foreground">{event.at}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function ExpiryDashboard({
  evidence,
  onSelect,
}: {
  evidence: EvidenceView[];
  onSelect: (item: EvidenceView) => void;
}) {
  const expiring = evidence
    .filter((x) => x.expiresOn)
    .toSorted((a, b) => daysUntil(a.expiresOn!) - daysUntil(b.expiresOn!));
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Panel title="Expiry pipeline">
        <div className="divide-y">
          {expiring.map((item) => {
            const days = daysUntil(item.expiresOn!);
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="flex w-full items-center gap-3 py-3 text-left"
              >
                <div className={days <= 30 ? "text-critical" : "text-attention-foreground"}>
                  {days <= 30 ? (
                    <AlertTriangle className="size-5" />
                  ) : (
                    <Clock3 className="size-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.entityName} · {item.id}
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm font-medium">{item.expiresOn}</div>
                  <div className="text-xs text-muted-foreground">{days} days</div>
                </div>
              </button>
            );
          })}
        </div>
      </Panel>
      <Panel title="Renewal readiness">
        <div className="space-y-4">
          {[
            {
              label: "0–30 days",
              count: expiring.filter((x) => daysUntil(x.expiresOn!) <= 30).length,
              tone: "bg-critical",
            },
            {
              label: "31–60 days",
              count: expiring.filter(
                (x) => daysUntil(x.expiresOn!) > 30 && daysUntil(x.expiresOn!) <= 60,
              ).length,
              tone: "bg-attention",
            },
            {
              label: "61–90 days",
              count: expiring.filter(
                (x) => daysUntil(x.expiresOn!) > 60 && daysUntil(x.expiresOn!) <= 90,
              ).length,
              tone: "bg-primary",
            },
          ].map((bucket) => (
            <div key={bucket.label}>
              <div className="flex justify-between text-xs">
                <span>{bucket.label}</span>
                <b>{bucket.count}</b>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${bucket.tone}`}
                  style={{ width: `${Math.min(100, bucket.count * 20)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function CoverageMatrix({ evidence }: { evidence: EvidenceView[] }) {
  const modules = ["labour", "tax", "secretarial", "ehs", "qms", "fssai"] as const;
  return (
    <Panel title="Entity × module evidence coverage">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left text-xs text-muted-foreground">Entity</th>
              {modules.map((module) => (
                <th
                  key={module}
                  className="p-3 text-center text-xs uppercase text-muted-foreground"
                >
                  {module}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entities.map((entity) => (
              <tr key={entity.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{entity.shortName}</td>
                {modules.map((module) => {
                  const count = evidence.filter(
                    (x) => x.entityId === entity.id && x.module === module,
                  ).length;
                  return (
                    <td key={module} className="p-2 text-center">
                      <div
                        className={`mx-auto grid size-9 place-items-center rounded-md text-xs font-semibold ${count >= 2 ? "bg-compliant-soft text-compliant" : count === 1 ? "bg-attention-soft text-attention-foreground" : "bg-critical-soft text-critical"}`}
                      >
                        {count || "—"}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-compliant" />
          2+ records
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-attention" />1 record
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2 rounded-full bg-critical" />
          Gap
        </span>
      </div>
    </Panel>
  );
}

function UploadWizard({
  open,
  onOpenChange,
  uploading,
  onUpload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  uploading: boolean;
  onUpload: (values: UploadValues) => void;
}) {
  const form = useForm<UploadValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { title: "", entityId: "ent-mumbai", module: "qms" },
  });
  const [fileName, setFileName] = useState("");
  const acceptFile = (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    if (!form.getValues("title")) form.setValue("title", file.name.replace(/\.[^.]+$/, ""));
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload evidence</DialogTitle>
          <DialogDescription>
            The file is hashed on capture; classification and links remain human-controlled.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onUpload)} className="space-y-4">
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              acceptFile(event.dataTransfer.files[0]);
            }}
            className="rounded-lg border-2 border-dashed p-8 text-center"
          >
            <FileUp className="mx-auto size-8 text-primary" />
            <div className="mt-2 text-sm font-medium">Drop evidence here</div>
            <p className="mt-1 text-xs text-muted-foreground">
              PDF, XLSX, DOCX, JPG or PNG · maximum 25 MB
            </p>
            <label className="mt-3 inline-flex cursor-pointer rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted">
              Browse files
              <input
                type="file"
                className="hidden"
                onChange={(event) => acceptFile(event.target.files?.[0])}
              />
            </label>
            {fileName && (
              <div className="mt-3 text-xs text-compliant">
                <CheckCircle2 className="mr-1 inline size-3.5" />
                {fileName}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-medium">Evidence title</label>
            <Input className="mt-1" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="mt-1 text-xs text-critical">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-medium">
              Entity
              <select
                className="mt-1 h-9 w-full rounded-md border bg-background px-2"
                {...form.register("entityId")}
              >
                {entities.map((entity) => (
                  <option key={entity.id} value={entity.id}>
                    {entity.shortName}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium">
              Module
              <select
                className="mt-1 h-9 w-full rounded-md border bg-background px-2"
                {...form.register("module")}
              >
                {["labour", "tax", "secretarial", "ehs", "qms", "fssai"].map((module) => (
                  <option key={module} value={module}>
                    {module.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mr-1 inline size-4" />
            SHA-256, uploader, entity, timestamp and original filename will be recorded
            automatically.
          </div>
          <Button type="submit" className="w-full" disabled={uploading || !fileName}>
            {uploading ? "Hashing evidence…" : "Upload and create evidence record"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
