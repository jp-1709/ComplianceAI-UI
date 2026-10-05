import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, FileCheck2, HeartPulse, ShieldCheck } from "lucide-react";
import { getIncident } from "@/services/modules";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { SeverityBadge, StatusBadge } from "@/components/grc/badges";
import { KeyValue, RecordHeader, WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/ehs/incidents/$id")({ component: IncidentDetail });
function IncidentDetail() {
  const { id } = Route.useParams();
  const { data } = useQuery({ queryKey: ["incident", id], queryFn: () => getIncident(id) });
  if (!data) return <div className="py-20 text-center">Loading incident…</div>;
  const chain = [
    "Incident",
    "People affected",
    "Containment",
    "Evidence",
    "Root cause",
    "CAPA",
    "Risk",
    "Follow-up audit",
  ];
  return (
    <div className="mx-auto max-w-[1500px] space-y-4">
      <Breadcrumbs items={[{ label: "EHS", to: "/ehs" }, { label: data.id }]} />
      <RecordHeader
        id={data.id}
        title={data.title}
        badges={
          <>
            <SeverityBadge severity={data.severity} />
            <StatusBadge status={data.status} />
          </>
        }
        meta={
          <>
            <span>{data.occurredOn}</span>
            <span>{data.peopleAffected.length} person affected</span>
          </>
        }
        primaryAction={
          <Button onClick={() => toast.success("Investigation plan approved; actions assigned")}>
            Approve Investigation Plan
          </Button>
        }
      />
      <Panel title="Incident investigation chain">
        <WorkflowStepper
          steps={chain.map((label, index) => ({
            label,
            state: index < 5 ? "complete" : index === 5 ? "current" : "upcoming",
          }))}
        />
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="People affected">
          <div className="space-y-3">
            {data.peopleAffected.map((person) => (
              <div key={person.name} className="rounded-lg border p-4">
                <div className="flex gap-2 font-medium">
                  <HeartPulse className="size-4 text-critical" />
                  {person.name}
                </div>
                <div className="mt-2 text-sm">{person.injury}</div>
                <div className="text-xs text-muted-foreground">Lost days: {person.lostDays}</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Immediate containment">
          <div className="space-y-2">
            {data.containment.map((item) => (
              <div key={item} className="flex gap-2 rounded-lg border p-3 text-sm">
                <ShieldCheck className="size-4 text-compliant" />
                {item}
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Root cause and evidence">
          <p className="text-sm leading-6">{data.rootCause}</p>
          <div className="mt-3 flex gap-2">
            {data.evidenceIds.map((item) => (
              <span key={item} className="rounded border px-2 py-1 font-mono text-xs">
                <FileCheck2 className="mr-1 inline size-3" />
                {item}
              </span>
            ))}
          </div>
        </Panel>
        <Panel title="Linked assurance records">
          <div className="space-y-2">
            <Link
              to="/qms/capa/$id"
              params={{ id: data.capaId }}
              className="block rounded-lg border p-3 text-sm hover:border-primary"
            >
              CAPA · {data.capaId}
            </Link>
            <Link
              to="/qms/risks/$id"
              params={{ id: data.riskId }}
              className="block rounded-lg border p-3 text-sm hover:border-primary"
            >
              Risk · {data.riskId}
            </Link>
            <Link
              to="/qms/audits/$id"
              params={{ id: data.followUpAudit }}
              className="block rounded-lg border p-3 text-sm hover:border-primary"
            >
              Follow-up audit · {data.followUpAudit}
            </Link>
          </div>
        </Panel>
      </div>
      <Button asChild variant="outline">
        <Link to="/ehs/evidence-pack">
          <AlertTriangle className="size-4" /> Open Incident Evidence Pack
        </Link>
      </Button>
    </div>
  );
}
