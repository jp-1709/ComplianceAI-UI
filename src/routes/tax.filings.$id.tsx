import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getTaxFiling } from "@/services/modules";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { DueDateIndicator, StatusBadge } from "@/components/grc/badges";
import { KeyValue, RecordHeader, WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/tax/filings/$id")({ component: FilingDetail });
function FilingDetail() {
  const { id } = Route.useParams();
  const { data } = useQuery({ queryKey: ["tax-filing", id], queryFn: () => getTaxFiling(id) });
  if (!data) return <div className="py-20 text-center">Loading filing…</div>;
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <Breadcrumbs items={[{ label: "Tax & GST", to: "/tax" }, { label: data.id }]} />
      <RecordHeader
        id={data.id}
        title={`${data.form} · ${data.period}`}
        badges={<StatusBadge status={data.status} />}
        meta={
          <>
            <DueDateIndicator date={data.dueDate} locked />
            <span>{data.arn}</span>
          </>
        }
        primaryAction={
          <Button onClick={() => toast.success("Filing sent to the Tax Lead for review")}>
            Send for Tax Lead Review
          </Button>
        }
      />
      <Panel title="Filing workflow">
        <WorkflowStepper
          steps={[
            "Source close",
            "Reconcile",
            "Prepare return",
            "Review",
            "Authorise",
            "File",
            "Archive evidence",
          ].map((label, index) => ({
            label,
            state: index < 2 ? "complete" : index === 2 ? "current" : "upcoming",
          }))}
        />
      </Panel>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Return summary">
          <div className="grid grid-cols-2 gap-4">
            <KeyValue label="Form">{data.form}</KeyValue>
            <KeyValue label="Period">{data.period}</KeyValue>
            <KeyValue label="Tax liability">₹{(data.liability / 100000).toFixed(2)} lakh</KeyValue>
            <KeyValue label="ARN">{data.arn}</KeyValue>
          </div>
        </Panel>
        <Panel title="Evidence requirements">
          <div className="space-y-2 text-sm">
            {[
              "Books-to-return reconciliation",
              "Reviewer approval",
              "Filed return / challan",
              "Portal acknowledgement",
            ].map((item) => (
              <div key={item}>✓ {item}</div>
            ))}
          </div>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/tax/evidence-pack">Open Evidence Pack</Link>
          </Button>
        </Panel>
      </div>
    </div>
  );
}
