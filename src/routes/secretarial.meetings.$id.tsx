import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, FileText, Users } from "lucide-react";
import { getBoardMeeting } from "@/services/modules";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { RecordHeader, WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/secretarial/meetings/$id")({ component: MeetingDetail });
function MeetingDetail() {
  const { id } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["board-meeting", id],
    queryFn: () => getBoardMeeting(id),
  });
  if (!data) return <div className="py-20 text-center">Loading meeting…</div>;
  return (
    <div className="mx-auto max-w-[1450px] space-y-4">
      <Breadcrumbs items={[{ label: "Secretarial", to: "/secretarial" }, { label: data.id }]} />
      <RecordHeader
        id={data.id}
        title={data.title}
        meta={
          <>
            <span>{data.date}</span>
            <span>Chair {data.chair}</span>
            <span>
              {data.quorum.present}/{data.quorum.required} quorum
            </span>
          </>
        }
        primaryAction={
          <Button onClick={() => toast.success("Signed minutes verified and opened")}>
            View Signed Minutes
          </Button>
        }
      />
      <div className="flex gap-2 rounded-lg border border-compliant/30 bg-compliant-soft p-4 text-sm text-compliant">
        <CheckCircle2 className="size-5" />
        Quorum confirmed before business commenced: {data.quorum.present} directors present,{" "}
        {data.quorum.required} required.
      </div>
      <Panel title="Meeting lifecycle">
        <WorkflowStepper
          steps={[
            "Notice issued",
            "Agenda circulated",
            "Quorum confirmed",
            "Business discussed",
            "Voting recorded",
            "Minutes drafted",
            "Minutes signed",
          ].map((label) => ({ label, state: "complete" }))}
        />
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Agenda">
          <ol className="space-y-2">
            {data.agenda.map((item, index) => (
              <li key={item} className="flex gap-3 rounded-lg border p-3 text-sm">
                <span className="font-semibold">{index + 1}</span>
                {item}
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Resolutions and voting">
          <div className="space-y-3">
            {data.resolutions.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="font-mono text-xs text-muted-foreground">{item.id}</div>
                <div className="mt-1 text-sm font-medium">{item.title}</div>
                <div className="mt-3 flex gap-4 text-xs">
                  <span className="text-compliant">For {item.votesFor}</span>
                  <span>Against {item.votesAgainst}</span>
                  <span>Abstained {item.abstained}</span>
                  <b className="ml-auto">{item.status}</b>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Minutes and attendance">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <FileText className="size-5 text-primary" />
            <div>
              <div className="text-sm font-medium">Board meeting minutes — Aug-2026</div>
              <div className="text-xs text-muted-foreground">
                {data.minutesId} · digitally signed
              </div>
            </div>
          </div>
          <Button asChild variant="outline">
            <Link to="/secretarial/evidence-pack">
              <Users className="size-4" /> Evidence Pack
            </Link>
          </Button>
        </div>
      </Panel>
    </div>
  );
}
