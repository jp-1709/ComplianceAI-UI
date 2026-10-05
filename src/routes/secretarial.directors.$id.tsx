import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getDirector } from "@/services/modules";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { KeyValue, RecordHeader } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/secretarial/directors/$id")({ component: DirectorDetail });
function DirectorDetail() {
  const { id } = Route.useParams();
  const { data } = useQuery({ queryKey: ["director", id], queryFn: () => getDirector(id) });
  if (!data) return <div className="py-20 text-center">Loading director…</div>;
  return (
    <div className="mx-auto max-w-[1300px] space-y-4">
      <Breadcrumbs items={[{ label: "Secretarial", to: "/secretarial" }, { label: data.id }]} />
      <RecordHeader
        id={data.id}
        title={data.name}
        meta={
          <>
            <span>DIN {data.din}</span>
            <span>{data.designation}</span>
            <span>Appointed {data.appointedOn}</span>
          </>
        }
        primaryAction={
          <Button onClick={() => toast.success("Disclosure refresh requested from the director")}>
            Request Disclosure Refresh
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Panel title="Statutory profile">
          <div className="space-y-4">
            <KeyValue label="DIN">{data.din}</KeyValue>
            <KeyValue label="Designation">{data.designation}</KeyValue>
            <KeyValue label="DIR-3 KYC">{data.kyc}</KeyValue>
          </div>
        </Panel>
        <Panel title="Committee memberships">
          <div className="flex flex-wrap gap-2">
            {data.committees.map((item) => (
              <span key={item} className="rounded-lg border bg-muted px-3 py-2 text-sm">
                {item}
              </span>
            ))}
          </div>
        </Panel>
        <Panel title="Governance declarations">
          <div className="space-y-4">
            <KeyValue label="Interest disclosure">{data.interestDisclosure}</KeyValue>
            <KeyValue label="Independence confirmation">Current</KeyValue>
            <KeyValue label="Disqualification check">Clear</KeyValue>
          </div>
        </Panel>
      </div>
      <Panel title="Director evidence">
        <Button asChild variant="outline">
          <Link to="/secretarial/evidence-pack">Open Director Evidence Pack</Link>
        </Button>
      </Panel>
    </div>
  );
}
