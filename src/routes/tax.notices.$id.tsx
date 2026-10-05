import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getTaxNotice } from "@/services/modules";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { DueDateIndicator, StatusBadge } from "@/components/grc/badges";
import { KeyValue, RecordHeader, WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/tax/notices/$id")({ component: NoticeDetail });
function NoticeDetail() {
  const { id } = Route.useParams();
  const { data } = useQuery({ queryKey: ["tax-notice", id], queryFn: () => getTaxNotice(id) });
  if (!data) return <div className="py-20 text-center">Loading notice…</div>;
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <Breadcrumbs items={[{ label: "Tax & GST", to: "/tax" }, { label: data.id }]} />
      <RecordHeader
        id={data.id}
        title={data.subject}
        badges={<StatusBadge status={data.status} />}
        meta={
          <>
            <span>{data.authority}</span>
            <span>{data.section}</span>
            <DueDateIndicator date={data.respondBy} locked />
          </>
        }
        primaryAction={
          <Button onClick={() => toast.success("Draft response sent for legal review")}>
            Send Response for Legal Review
          </Button>
        }
      />
      <Panel title="Notice response workflow">
        <WorkflowStepper
          steps={[
            "Notice received",
            "Triage",
            "Gather evidence",
            "Draft response",
            "Legal review",
            "Authorise",
            "Submit response",
          ].map((label, index) => ({
            label,
            state: index < 2 ? "complete" : index === 2 ? "current" : "upcoming",
          }))}
        />
      </Panel>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Notice details">
          <div className="space-y-4">
            <KeyValue label="Received">{data.receivedOn}</KeyValue>
            <KeyValue label="Amount under review">
              ₹{(data.amount / 100000).toFixed(2)} lakh
            </KeyValue>
            <KeyValue label="Owner">Tax Lead</KeyValue>
          </div>
        </Panel>
        <Panel title="Defence pack">
          <div className="space-y-2 text-sm">
            • GSTR-3B and GSTR-2B source files
            <br />• Books reconciliation with exception treatment
            <br />• Vendor correspondence
            <br />• Approval and CAPA trail
          </div>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/tax/evidence-pack">Open Notice Evidence Pack</Link>
          </Button>
        </Panel>
      </div>
    </div>
  );
}
