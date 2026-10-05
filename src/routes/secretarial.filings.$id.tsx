import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getMcaFiling } from "@/services/modules";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { DueDateIndicator, StatusBadge } from "@/components/grc/badges";
import { KeyValue, RecordHeader, WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/secretarial/filings/$id")({ component: McaDetail });
function McaDetail() {
  const { id } = Route.useParams();
  const { data } = useQuery({ queryKey: ["mca", id], queryFn: () => getMcaFiling(id) });
  if (!data) return <div className="py-20 text-center">Loading filing…</div>;
  return (
    <div className="mx-auto max-w-[1350px] space-y-4">
      <Breadcrumbs items={[{ label: "Secretarial", to: "/secretarial" }, { label: data.id }]} />
      <RecordHeader
        id={data.id}
        title={`${data.form} · ${data.purpose}`}
        badges={<StatusBadge status={data.status} />}
        meta={
          <>
            <DueDateIndicator date={data.dueDate} locked />
            <span>SRN {data.srn}</span>
          </>
        }
        primaryAction={
          <Button onClick={() => toast.success("MCA filing sent for Secretariat review")}>
            Send for Secretariat Review
          </Button>
        }
      />
      <Panel title="MCA filing workflow">
        <WorkflowStepper
          steps={[
            "Prepare attachments",
            "Certification",
            "Board authorisation",
            "Secretariat review",
            "Upload MCA",
            "Pay fees",
            "Archive SRN",
          ].map((label, index) => ({
            label,
            state: index < 2 ? "complete" : index === 2 ? "current" : "upcoming",
          }))}
        />
      </Panel>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Filing information">
          <div className="space-y-4">
            <KeyValue label="Form">{data.form}</KeyValue>
            <KeyValue label="Purpose">{data.purpose}</KeyValue>
            <KeyValue label="Due date">{data.dueDate}</KeyValue>
            <KeyValue label="Filed on">{data.filedOn ?? "Pending"}</KeyValue>
          </div>
        </Panel>
        <Panel title="Required attachments">
          <div className="space-y-2 text-sm">
            • Certified financial statements
            <br />• Board resolution / authority
            <br />• Director declarations
            <br />• Professional certification
          </div>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/secretarial/evidence-pack">Open Filing Evidence Pack</Link>
          </Button>
        </Panel>
      </div>
    </div>
  );
}
