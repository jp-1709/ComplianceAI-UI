import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getEhsLicence } from "@/services/modules";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { DueDateIndicator, StatusBadge } from "@/components/grc/badges";
import { KeyValue, RecordHeader, WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/ehs/licences/$id")({ component: LicenceDetail });
function LicenceDetail() {
  const { id } = Route.useParams();
  const { data } = useQuery({ queryKey: ["ehs-licence", id], queryFn: () => getEhsLicence(id) });
  if (!data) return <div className="py-20 text-center">Loading licence…</div>;
  return (
    <div className="mx-auto max-w-[1350px] space-y-4">
      <Breadcrumbs items={[{ label: "EHS", to: "/ehs" }, { label: data.id }]} />
      <RecordHeader
        id={data.id}
        title={data.name}
        badges={<StatusBadge status={data.status} />}
        meta={
          <>
            <span>{data.authority}</span>
            <span>{data.licenceNo}</span>
            <DueDateIndicator date={data.expiresOn} locked />
          </>
        }
        primaryAction={
          <Button onClick={() => toast.success("Licence renewal workflow started")}>
            Start Licence Renewal
          </Button>
        }
      />
      <Panel title="Licence lifecycle">
        <WorkflowStepper
          steps={[
            "Applicability",
            "Application",
            "Authority review",
            "Licence issued",
            "Condition monitoring",
            "Renewal preparation",
          ].map((label, index) => ({
            label,
            state: index < 4 ? "complete" : index === 4 ? "current" : "upcoming",
          }))}
        />
      </Panel>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Licence details">
          <div className="space-y-4">
            <KeyValue label="Licence number">{data.licenceNo}</KeyValue>
            <KeyValue label="Issued">{data.issuedOn}</KeyValue>
            <KeyValue label="Expires">{data.expiresOn}</KeyValue>
            <KeyValue label="Conditions">{data.conditions} monitored conditions</KeyValue>
          </div>
        </Panel>
        <Panel title="Compliance evidence">
          <p className="text-sm">
            Primary certificate {data.evidenceId}, periodic monitoring reports, returns, authority
            correspondence and condition tracker.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/ehs/evidence-pack">Open Licence Evidence Pack</Link>
          </Button>
        </Panel>
      </div>
    </div>
  );
}
