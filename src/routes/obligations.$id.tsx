import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Link2,
  Lock,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { getObligation } from "@/services/workspaces";
import { calendarTasks, evidenceRecords, risks } from "@/data/kfc";
import { ActivityTimeline, Breadcrumbs, Panel } from "@/components/grc/widgets";
import { DueDateIndicator, StatusBadge } from "@/components/grc/badges";
import { KeyValue, RecordHeader } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/obligations/$id")({
  head: () => ({
    meta: [
      { title: "Obligation — Quantbit Compliance AI" },
      {
        name: "description",
        content: "Versioned obligation record with evidence and risk traceability.",
      },
    ],
  }),
  component: ObligationDetail,
});

function ObligationDetail() {
  const { id } = Route.useParams();
  const query = useQuery({
    queryKey: ["obligation", id],
    queryFn: () => getObligation(id),
    staleTime: 60_000,
  });
  if (query.isPending)
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  const item = query.data;
  if (!item)
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold">Obligation not found</h1>
        <Button asChild className="mt-4">
          <Link to="/obligations">Return to register</Link>
        </Button>
      </div>
    );
  const tasks = calendarTasks.filter((x) => x.obligationId === item.id);
  const linkedEvidence = evidenceRecords.filter((x) => item.evidenceIds.includes(x.id));
  const linkedRisks = risks.filter((x) => item.riskIds.includes(x.id));
  const activity = [
    {
      id: "1",
      at: "02-Oct-2026 10:14",
      actor: item.ownerName,
      action: "updated the compliance working notes",
      recordId: item.id,
    },
    {
      id: "2",
      at: "26-Sep-2026 16:40",
      actor: "Ananya Rao",
      action: "confirmed applicability",
      recordId: item.id,
    },
    {
      id: "3",
      at: "01-Sep-2026 09:00",
      actor: "System",
      action: "activated obligation version v2.1",
      recordId: item.id,
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/command-center" },
          { label: "Obligations", to: "/obligations" },
          { label: item.id },
        ]}
      />
      <RecordHeader
        id={item.id}
        title={item.title}
        badges={<StatusBadge status={item.status} />}
        meta={
          <>
            <span className="flex items-center gap-1">
              <UserRound className="size-3.5" /> {item.ownerName}
            </span>
            <span>{item.entityName}</span>
            <DueDateIndicator date={item.dueDate} locked={item.statutoryLocked} />
            <span>Modified 02-Oct-2026</span>
          </>
        }
        primaryAction={
          <Button>
            <FileCheck2 className="size-4" /> Request evidence update
          </Button>
        }
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Tabs defaultValue="overview" className="min-w-0">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requirements">Requirements & scope</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="linked">Linked records</TabsTrigger>
            <TabsTrigger value="tasks">Tasks & actions</TabsTrigger>
            <TabsTrigger value="activity">Activity timeline</TabsTrigger>
            <TabsTrigger value="audit">Audit trail</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <Panel title="Plain-language requirement">
              <p className="text-sm leading-6">{item.plainLanguage}</p>
              <div className="mt-4 grid gap-4 border-t pt-4 md:grid-cols-2">
                <KeyValue label="Legal citation">{item.legalCitation}</KeyValue>
                <KeyValue label="Applicability">{item.applicability}</KeyValue>
                <KeyValue label="Frequency">{item.frequency}</KeyValue>
                <KeyValue label="Due-date rule">{item.dueDateRule}</KeyValue>
              </div>
            </Panel>
            <div className="grid gap-4 md:grid-cols-2">
              <Panel title="Evidence requirements">
                <ul className="space-y-2">
                  {item.evidenceRequirements.map((x) => (
                    <li key={x} className="flex gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 text-compliant" />
                      {x}
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel title="ISO and control mapping">
                <div className="flex flex-wrap gap-2">
                  {item.isoMappings.map((x) => (
                    <span key={x} className="rounded-md border bg-muted/40 px-2 py-1 text-xs">
                      {x}
                    </span>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {item.controls.map((x) => (
                    <div key={x} className="text-sm">
                      • {x}
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </TabsContent>
          <TabsContent value="requirements">
            <Panel title="Applicability and due-date logic">
              <div className="space-y-5">
                <KeyValue label="Regulation">{item.regulationTitle}</KeyValue>
                <KeyValue label="Legal citation">{item.legalCitation}</KeyValue>
                <KeyValue label="Applicability rationale">{item.applicability}</KeyValue>
                <div className="rounded-md border border-attention/30 bg-attention-soft/40 p-3 text-sm">
                  <Lock className="mr-2 inline size-4" />
                  {item.dueDateRule}
                </div>
                <KeyValue label="Required evidence">
                  {item.evidenceRequirements.join(" · ")}
                </KeyValue>
              </div>
            </Panel>
          </TabsContent>
          <TabsContent value="evidence">
            <div className="grid gap-3">
              {linkedEvidence.map((evidence) => (
                <div key={evidence.id} className="enterprise-panel flex items-center gap-3 p-4">
                  <FileCheck2 className="size-5 text-primary" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{evidence.title}</div>
                    <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                      {evidence.id} · SHA-256 {evidence.sha256.slice(0, 16)}…
                    </div>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Issued {evidence.issuedOn}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="linked">
            <div className="grid gap-4 md:grid-cols-2">
              <Panel title="Risks">
                {linkedRisks.length ? (
                  linkedRisks.map((risk) => (
                    <div key={risk.id} className="rounded-md border p-3">
                      <div className="font-mono text-xs text-primary">{risk.id}</div>
                      <div className="mt-1 text-sm font-medium">{risk.title}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No linked risks.</p>
                )}
              </Panel>
              <Panel title="Relationship chain">
                <div className="space-y-2 text-sm">
                  {[
                    item.regulationTitle,
                    item.id,
                    ...tasks.map((x) => x.id),
                    ...item.evidenceIds,
                    ...item.riskIds,
                  ].map((x, index) => (
                    <div key={x} className="flex items-center gap-2">
                      <span className="grid size-6 place-items-center rounded-full bg-primary-soft text-[10px] text-primary">
                        {index + 1}
                      </span>
                      {x}
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </TabsContent>
          <TabsContent value="tasks">
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="enterprise-panel flex items-center gap-3 p-4">
                  <CalendarDays className="size-5 text-primary" />
                  <div>
                    <div className="text-sm font-medium">{task.title}</div>
                    <div className="mt-1 font-mono text-xs text-muted-foreground">{task.id}</div>
                  </div>
                  <div className="ml-auto">
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="activity">
            <Panel title="Record activity">
              <ActivityTimeline items={activity} />
            </Panel>
          </TabsContent>
          <TabsContent value="audit">
            <Panel title="Version history">
              <div className="divide-y">
                {item.versions.map((version) => (
                  <div
                    key={version.version}
                    className="grid grid-cols-[80px_120px_1fr] gap-3 py-3 text-sm"
                  >
                    <b>{version.version}</b>
                    <span className="text-muted-foreground">{version.effectiveFrom}</span>
                    <span>
                      {version.note}
                      <small className="ml-2 text-muted-foreground">by {version.changedBy}</small>
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
        <aside className="space-y-4">
          <Panel title="Record health">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Evidence completeness</span>
                <b>{Math.min(100, item.evidenceIds.length * 40)}%</b>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-compliant"
                  style={{ width: `${Math.min(100, item.evidenceIds.length * 40)}%` }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Open tasks</span>
                <b>{tasks.filter((x) => x.status !== "closed").length}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Linked risks</span>
                <b>{linkedRisks.length}</b>
              </div>
            </div>
          </Panel>
          <Panel title="Required next action">
            <div className="flex gap-2">
              <Clock3 className="size-4 text-attention" />
              <p className="text-sm">
                Owner must complete evidence and route the task to {item.ownerName}'s reviewer
                before {item.dueDate}.
              </p>
            </div>
          </Panel>
          <Panel title="Escalation path">
            <div className="space-y-2 text-sm">
              <div>1. {item.ownerName}</div>
              <div>2. Entity Manager</div>
              <div>3. Group Compliance Officer</div>
            </div>
          </Panel>
          <Panel title="Related assurance">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-4" /> {linkedRisks.length} linked risks
              </div>
              <div className="flex items-center gap-2">
                <Link2 className="size-4" /> {item.evidenceIds.length + tasks.length} linked records
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
