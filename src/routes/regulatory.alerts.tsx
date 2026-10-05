import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  FileSearch,
  Landmark,
  RotateCcw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getRegulatoryWorkspace,
  updateAlertDecision,
  type RegulatoryAlertView,
} from "@/services/workspaces";
import { entities, obligations } from "@/data/kfc";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { SeverityBadge } from "@/components/grc/badges";
import { WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const searchSchema = (search: Record<string, unknown>) => ({
  filter: typeof search.filter === "string" ? search.filter : undefined,
  alert: typeof search.alert === "string" ? search.alert : undefined,
});

export const Route = createFileRoute("/regulatory/alerts")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Regulatory Intelligence — Quantbit Compliance AI" },
      { name: "description", content: "Regulatory change inbox and impact assessments." },
    ],
  }),
  component: RegulatoryWorkspace,
});

const flowSteps = [
  "Regulatory Alert",
  "Impact Assessment",
  "Obligation Version",
  "Entities",
  "Tasks",
  "Evidence Requests",
  "Risk",
  "Document Change",
  "Management Review",
];

function RegulatoryWorkspace() {
  const search = Route.useSearch();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["regulatory-alerts"],
    queryFn: getRegulatoryWorkspace,
    staleTime: 60_000,
  });
  const [selectedId, setSelectedId] = useState(search.alert ?? "RA-2026-041");
  const [tab, setTab] = useState("overview");
  const mutation = useMutation({
    mutationFn: ({
      id,
      decision,
    }: {
      id: string;
      decision: "approved" | "rejected" | "analysis-requested";
    }) => updateAlertDecision(id, decision),
    onMutate: async ({ id, decision }) => {
      await queryClient.cancelQueries({ queryKey: ["regulatory-alerts"] });
      const previous = queryClient.getQueryData<RegulatoryAlertView[]>(["regulatory-alerts"]);
      queryClient.setQueryData<RegulatoryAlertView[]>(["regulatory-alerts"], (items = []) =>
        items.map((item) =>
          item.id === id
            ? { ...item, status: decision === "approved" ? "assessed" : item.status }
            : item,
        ),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(["regulatory-alerts"], context?.previous);
      toast.error("Decision could not be saved");
    },
    onSuccess: (_result, input) =>
      toast.success(
        input.decision === "approved"
          ? "Impact assessment approved"
          : input.decision === "rejected"
            ? "Assessment returned for correction"
            : "Additional AI analysis requested",
      ),
  });

  const alerts = query.data ?? [];
  const visible = alerts.filter(
    (item) =>
      !search.filter ||
      item.status.includes(search.filter) ||
      item.title.toLowerCase().includes(search.filter.toLowerCase()),
  );
  const selected = alerts.find((item) => item.id === selectedId) ?? alerts[0];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs
        items={[{ label: "Home", to: "/command-center" }, { label: "Regulatory Intelligence" }]}
      />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Regulatory Alert Inbox</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Triage regulatory changes, assess applicability and create a defensible downstream change
          trail.
        </p>
      </div>
      <div className="grid min-h-[720px] gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
        <section className="enterprise-panel overflow-hidden">
          <div className="border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Incoming changes</h2>
              <span className="rounded-full bg-critical-soft px-2 py-0.5 text-xs font-semibold text-critical">
                {alerts.filter((x) => x.status === "awaiting-impact-assessment").length} awaiting
              </span>
            </div>
            <div className="mt-2 flex gap-1">
              {["All", "Awaiting", "High impact"].map((item) => (
                <button
                  key={item}
                  className="rounded-full border px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y">
            {query.isPending
              ? Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className="space-y-2 p-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))
              : visible.map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => setSelectedId(alert.id)}
                    className={cn(
                      "w-full p-4 text-left transition hover:bg-muted/50",
                      selected?.id === alert.id &&
                        "bg-primary-soft/60 shadow-[inset_3px_0_0_var(--color-primary)]",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {alert.id}
                      </span>
                      <SeverityBadge severity={alert.impact} />
                    </div>
                    <div className="mt-2 text-sm font-medium leading-5">{alert.title}</div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {alert.authority} · {alert.publishedOn}
                      </span>
                      <ChevronRight className="size-3.5" />
                    </div>
                  </button>
                ))}
          </div>
        </section>
        {selected ? (
          <section className="min-w-0 space-y-4">
            <div className="enterprise-panel p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{selected.id}</span>
                    <SeverityBadge severity={selected.impact} />
                    <span className="rounded-full bg-attention-soft px-2 py-0.5 text-xs font-medium text-attention-foreground">
                      {selected.status.replaceAll("-", " ")}
                    </span>
                  </div>
                  <h2 className="mt-2 text-xl font-semibold">{selected.title}</h2>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Landmark className="size-3.5" /> {selected.authority}
                    </span>
                    <span>Published {selected.publishedOn}</span>
                    <span>Effective {selected.effectiveOn}</span>
                    <span>{selected.jurisdiction}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      mutation.mutate({ id: selected.id, decision: "analysis-requested" })
                    }
                  >
                    <RotateCcw className="size-4" /> Request analysis
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => mutation.mutate({ id: selected.id, decision: "rejected" })}
                  >
                    <XCircle className="size-4" /> Reject
                  </Button>
                  <Button
                    onClick={() => mutation.mutate({ id: selected.id, decision: "approved" })}
                  >
                    <CheckCircle2 className="size-4" /> Approve impact
                  </Button>
                </div>
              </div>
            </div>
            <Panel title="Flow A · regulatory change to assurance">
              <WorkflowStepper
                steps={flowSteps.map((label, index) => ({
                  label,
                  state:
                    index < 1
                      ? ("complete" as const)
                      : index === 1
                        ? ("current" as const)
                        : ("upcoming" as const),
                  detail: index === 0 ? selected.id : index === 1 ? "In review" : undefined,
                }))}
              />
            </Panel>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0">
                <TabsTrigger value="overview">Alert detail</TabsTrigger>
                <TabsTrigger value="impact">Impact assessment workspace</TabsTrigger>
                <TabsTrigger value="sources">Sources & audit trail</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
                <div className="space-y-4">
                  <Panel
                    title={
                      <span className="flex items-center gap-2">
                        <Sparkles className="size-4 text-ai" /> AI summary · human review required
                      </span>
                    }
                  >
                    <p className="text-sm leading-6">{selected.aiSummary}</p>
                    <div className="mt-3 rounded-md border border-ai/30 bg-ai-soft/40 p-3 text-xs text-muted-foreground">
                      <b className="text-ai">Why this matters:</b> {selected.summary}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selected.sources.map((source) => (
                        <span
                          key={source.label}
                          className="rounded border bg-surface px-2 py-1 text-xs"
                        >
                          {source.label} · {source.citation}
                        </span>
                      ))}
                    </div>
                  </Panel>
                  <Panel title="Potential compliance gaps">
                    <div className="space-y-2">
                      {selected.potentialGaps.map((gap) => (
                        <div
                          key={gap}
                          className="flex gap-2 rounded-md border border-attention/25 bg-attention-soft/35 p-3 text-sm"
                        >
                          <CircleAlert className="mt-0.5 size-4 shrink-0 text-attention" />
                          {gap}
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
                <div className="space-y-4">
                  <Panel title="Affected scope">
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                          Entities
                        </div>
                        {selected.affectedEntityIds.map((id) => (
                          <div key={id} className="mt-2 flex items-center gap-2 text-sm">
                            <Building2 className="size-4 text-muted-foreground" />
                            {entities.find((x) => x.id === id)?.name}
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-3">
                        <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                          Obligations
                        </div>
                        {selected.linkedObligationIds.map((id) => (
                          <div key={id} className="mt-2 rounded-md border p-2 text-xs">
                            <span className="font-mono">{id}</span>
                            <div className="mt-1 font-medium">
                              {obligations.find((x) => x.id === id)?.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Panel>
                </div>
              </TabsContent>
              <TabsContent value="impact">
                <ImpactWorkspace alert={selected} />
              </TabsContent>
              <TabsContent value="sources">
                <Panel title="Source records">
                  <div className="space-y-3">
                    {selected.sources.map((source) => (
                      <div
                        key={source.label}
                        className="flex items-center gap-3 rounded-md border p-3"
                      >
                        <FileSearch className="size-5 text-primary" />
                        <div>
                          <div className="text-sm font-medium">{source.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {source.citation} · captured with source hash
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </TabsContent>
            </Tabs>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function ImpactWorkspace({ alert }: { alert: RegulatoryAlertView }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Applicability decision">
        <div className="space-y-4">
          <label className="block text-xs font-medium">
            Assessment conclusion
            <textarea
              className="mt-1 min-h-24 w-full rounded-md border bg-background p-3 text-sm"
              defaultValue={`Applicable to ${alert.affectedEntityIds.length} entities. Existing controls require an obligation version update and evidence request.`}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-medium">
              Materiality
              <input
                className="mt-1 h-9 w-full rounded-md border bg-background px-3"
                value={alert.materiality}
                readOnly
              />
            </label>
            <label className="text-xs font-medium">
              Target completion
              <input
                className="mt-1 h-9 w-full rounded-md border bg-background px-3"
                defaultValue="10-Oct-2026"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked /> Legal interpretation validated
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" /> Entity applicability confirmed
          </label>
        </div>
      </Panel>
      <Panel
        title={
          <span className="flex items-center gap-2">
            <Bot className="size-4 text-ai" /> AI-assisted mapping
          </span>
        }
      >
        <div className="space-y-3 text-sm">
          <div className="rounded-md border border-ai/30 bg-ai-soft/40 p-3">
            <b>Suggested obligation change</b>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Add a time-bound reviewer checkpoint and require signed evidence before the calendar
              task can close.
            </p>
          </div>
          <div>
            <b className="text-xs">Confidence</b>
            <div className="mt-1 h-2 rounded-full bg-muted">
              <div className="h-full w-[84%] rounded-full bg-ai" />
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              84% · based on source notice, current obligation and linked SOP
            </div>
          </div>
          <Button variant="outline" className="w-full">
            <Sparkles className="size-4 text-ai" /> Accept as draft mapping
          </Button>
        </div>
      </Panel>
    </div>
  );
}
