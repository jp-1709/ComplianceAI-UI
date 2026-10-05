import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileKey2,
  MapPin,
  Receipt,
  ShieldAlert,
  Users,
  Wrench,
} from "lucide-react";
import { getEntityOverview } from "@/services/work";
import { Breadcrumbs, Panel, ReadinessRing } from "@/components/grc/widgets";
import { DueDateIndicator, SeverityBadge, StatusBadge } from "@/components/grc/badges";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/entities/$id")({
  head: () => ({
    meta: [
      { title: "Entity Overview — Quantbit Compliance AI" },
      {
        name: "description",
        content: "Entity-level compliance, evidence, risk and assurance profile.",
      },
    ],
  }),
  component: EntityOverview,
});

function EntityOverview() {
  const { id } = Route.useParams();
  const query = useQuery({
    queryKey: ["entity-overview", id],
    queryFn: () => getEntityOverview(id),
    staleTime: 60_000,
  });
  if (query.isPending)
    return (
      <div className="space-y-4">
        <Skeleton className="h-36" />
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  if (!query.data)
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-semibold">Entity not found</h1>
        <Button asChild className="mt-4">
          <Link to="/entities">Return to entities</Link>
        </Button>
      </div>
    );
  const data = query.data;
  const entity = data.entity;
  const cards = [
    {
      label: "Obligations",
      count: data.obligations.length,
      icon: ClipboardCheck,
      to: "/obligations",
      filter: entity.shortName,
    },
    {
      label: "Evidence",
      count: data.evidence.length,
      icon: FileCheck2,
      to: "/evidence",
      filter: entity.shortName,
    },
    {
      label: "Risks",
      count: data.risks.length,
      icon: ShieldAlert,
      to: "/qms/risks",
      filter: entity.id,
    },
    {
      label: "Audits",
      count: data.audits.length,
      icon: CheckCircle2,
      to: "/qms/audits",
      filter: entity.id,
    },
    { label: "CAPAs", count: data.capas.length, icon: Wrench, to: "/qms/capa", filter: entity.id },
    {
      label: "Incidents",
      count: data.incidents.length,
      icon: AlertTriangle,
      to: "/ehs",
      filter: entity.id,
    },
    {
      label: "Upcoming tasks",
      count: data.tasks.length,
      icon: CalendarClock,
      to: "/calendar",
      filter: entity.shortName,
    },
  ];
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/command-center" },
          { label: "Entities", to: "/entities" },
          { label: entity.shortName },
        ]}
      />
      <section className="enterprise-panel overflow-hidden">
        <div className="h-1.5 bg-primary" />
        <div className="flex flex-col justify-between gap-5 p-5 lg:flex-row lg:items-start">
          <div className="flex gap-4">
            <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <Building2 className="size-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{entity.name}</h1>
                <StatusBadge
                  status={
                    entity.score >= 85 ? "compliant" : entity.score >= 75 ? "attention" : "critical"
                  }
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {entity.city}, {entity.state}
                </span>
                <span>{entity.type}</span>
                <span className="flex items-center gap-1">
                  <Receipt className="size-3.5" />
                  {entity.gstin}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="size-3.5" />
                  {entity.headcount} people
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ReadinessRing value={entity.score} size={96} label="entity score" />
            <div className="text-sm">
              <div className={entity.trend >= 0 ? "text-compliant" : "text-critical"}>
                {entity.trend >= 0 ? "+" : ""}
                {entity.trend} pts
              </div>
              <div className="text-xs text-muted-foreground">vs prior period</div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold">Module health</h2>
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {data.moduleHealth.map((item) => (
            <Link
              key={item.module}
              to={
                item.module === "tax"
                  ? "/tax"
                  : item.module === "labour"
                    ? "/labour"
                    : item.module === "secretarial"
                      ? "/secretarial"
                      : item.module === "ehs"
                        ? "/ehs"
                        : item.module === "qms"
                          ? "/qms/documents"
                          : "/obligations"
              }
              search={{ filter: entity.shortName }}
              className="enterprise-panel flex flex-col items-center p-3 transition hover:border-primary/40"
            >
              <ReadinessRing value={item.score} size={76} label="" />
              <div className="mt-2 text-xs font-semibold uppercase">{item.module}</div>
            </Link>
          ))}
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            search={{ filter: card.filter }}
            className="group enterprise-panel p-4 transition hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <card.icon className="size-4 text-muted-foreground" />
              <ChevronRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5" />
            </div>
            <div className="mt-3 text-2xl font-semibold">{card.count}</div>
            <div className="text-xs text-muted-foreground">{card.label}</div>
          </Link>
        ))}
      </div>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="licences">Licences</TabsTrigger>
          <TabsTrigger value="obligations">Obligations</TabsTrigger>
          <TabsTrigger value="risks">Risks & assurance</TabsTrigger>
          <TabsTrigger value="tasks">Upcoming tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="grid gap-4 lg:grid-cols-[1fr_.7fr]">
          <Panel title="Entity profile">
            <div className="grid grid-cols-2 gap-5 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Legal / operating name</div>
                <div className="mt-1 font-medium">{entity.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">GST registration</div>
                <div className="mt-1 font-mono">{entity.gstin}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Operating type</div>
                <div className="mt-1">{entity.type}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Headcount</div>
                <div className="mt-1">{entity.headcount}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Open issues</div>
                <div className="mt-1 text-critical">{entity.openIssues}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Reporting owner</div>
                <div className="mt-1">Entity Manager → Group Compliance</div>
              </div>
            </div>
          </Panel>
          <Panel title="Assurance summary">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Evidence coverage</span>
                <b>{data.evidence.length} records</b>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Risks above appetite</span>
                <b>
                  {
                    data.risks.filter(
                      (risk) => risk.likelihood * risk.impact > risk.appetiteThreshold,
                    ).length
                  }
                </b>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Open CAPAs</span>
                <b>{data.capas.filter((capa) => capa.status !== "verified").length}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issued audits</span>
                <b>{data.audits.filter((audit) => audit.reportIssued).length}</b>
              </div>
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="licences">
          <Panel title="Licences and certificates">
            <div className="divide-y">
              {data.licences.map((licence) => (
                <div key={licence.id} className="flex items-center gap-3 py-3">
                  <FileKey2 className="size-5 text-primary" />
                  <div>
                    <div className="text-sm font-medium">{licence.title}</div>
                    <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                      {licence.id}
                    </div>
                  </div>
                  <div className="ml-auto text-right text-xs">
                    <div>Issued {licence.issuedOn}</div>
                    <div className="mt-1 text-muted-foreground">
                      Expires {licence.expiresOn ?? "Never"}
                    </div>
                  </div>
                </div>
              ))}
              {data.licences.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No licence records classified for this entity.
                </p>
              )}
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="obligations">
          <Panel title="Applicable obligations">
            <div className="divide-y">
              {data.obligations.map((item) => (
                <Link
                  key={item.id}
                  to="/obligations/$id"
                  params={{ id: item.id }}
                  className="flex items-center gap-3 py-3"
                >
                  <div>
                    <div className="font-mono text-xs text-primary">{item.id}</div>
                    <div className="mt-1 text-sm font-medium">{item.title}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <DueDateIndicator date={item.dueDate} locked={item.statutoryLocked} />
                    <StatusBadge status={item.status} />
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="risks">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Risk register">
              <div className="space-y-3">
                {data.risks.map((risk) => (
                  <div key={risk.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-primary">{risk.id}</span>
                      <span className="text-xs font-semibold">
                        Score {risk.likelihood * risk.impact}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-medium">{risk.title}</div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Audits & CAPAs">
              <div className="space-y-3">
                {data.audits.map((audit) => (
                  <div key={audit.id} className="rounded-md border p-3">
                    <div className="font-mono text-xs text-primary">{audit.id}</div>
                    <div className="mt-1 text-sm font-medium">{audit.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {audit.status} · {audit.findingIds.length} findings
                    </div>
                  </div>
                ))}
                {data.capas.map((capa) => (
                  <div key={capa.id} className="rounded-md border p-3">
                    <div className="flex justify-between">
                      <span className="font-mono text-xs text-primary">{capa.id}</span>
                      <SeverityBadge severity={capa.severity} />
                    </div>
                    <div className="mt-1 text-sm font-medium">{capa.title}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </TabsContent>
        <TabsContent value="tasks">
          <Panel title="Upcoming and overdue tasks">
            <div className="divide-y">
              {data.tasks.map((task) => (
                <Link
                  key={task.id}
                  to="/my-work"
                  search={{ filter: task.tabs.includes("overdue") ? "overdue" : "week" }}
                  className="flex items-center gap-3 py-3"
                >
                  <CalendarClock className="size-5 text-primary" />
                  <div>
                    <div className="text-sm font-medium">{task.title}</div>
                    <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                      {task.id} · {task.ownerName}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <DueDateIndicator date={task.dueDate} />
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
