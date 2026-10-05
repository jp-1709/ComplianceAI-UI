import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Building2, CalendarClock, FileWarning, Users } from "lucide-react";
import { getLabourEstablishment } from "@/services/modules";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { DueDateIndicator, StatusBadge } from "@/components/grc/badges";
import { KeyValue, RecordHeader } from "@/components/grc/record";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/labour/establishments/$id")({
  component: EstablishmentDetail,
});
function EstablishmentDetail() {
  const { id } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["labour-establishment", id],
    queryFn: () => getLabourEstablishment(id),
  });
  if (!data) return <div className="py-20 text-center">Loading establishment…</div>;
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <Breadcrumbs items={[{ label: "Labour Compliance", to: "/labour" }, { label: data.id }]} />
      <RecordHeader
        id={data.id}
        title={data.name}
        badges={<StatusBadge status={data.status} />}
        meta={
          <>
            <span>{data.state}</span>
            <span>{data.registration}</span>
            <span>{data.headcount} employees</span>
          </>
        }
        primaryAction={
          <Button onClick={() => toast.success("Labour control review opened and assigned")}>
            Review Labour Controls
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Establishment profile">
          <div className="space-y-4">
            <KeyValue label="Registration">{data.registration}</KeyValue>
            <KeyValue label="State jurisdiction">{data.state}</KeyValue>
            <KeyValue label="Headcount">
              <Users className="mr-1 inline size-4" /> {data.headcount}
            </KeyValue>
            <KeyValue label="Licence expiry">
              <DueDateIndicator date={data.licenceExpiry} locked />
            </KeyValue>
          </div>
        </Panel>
        <Panel title="Exceptions">
          <div className="space-y-3">
            <div className="rounded-lg border border-attention/30 bg-attention-soft p-4">
              <div className="text-2xl font-semibold">{data.wageExceptions}</div>
              <div className="text-xs">Wage exceptions requiring treatment</div>
            </div>
            <div className="rounded-lg border border-critical/30 bg-critical-soft p-4">
              <div className="text-2xl font-semibold">{data.missingRegisters}</div>
              <div className="text-xs">Missing statutory registers</div>
            </div>
          </div>
        </Panel>
        <Panel title="Statutory controls">
          <div className="space-y-3 text-sm">
            {[
              "Shops & Establishments registration",
              "PF/ESI coverage and remittance",
              "Minimum wages and overtime",
              "Muster roll and wage register",
              "POSH annual reporting",
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${index < 3 ? "bg-compliant" : data.missingRegisters ? "bg-attention" : "bg-compliant"}`}
                />
                {item}
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Evidence and upcoming deadlines">
        <div className="grid gap-3 md:grid-cols-3">
          <Link
            to="/labour/evidence-pack"
            className="rounded-lg border p-4 hover:border-primary/40"
          >
            <Building2 className="size-4 text-primary" />
            <div className="mt-2 text-sm font-medium">Establishment evidence pack</div>
          </Link>
          <div className="rounded-lg border p-4">
            <FileWarning className="size-4 text-attention" />
            <div className="mt-2 text-sm font-medium">Exception remediation due 15-Oct-2026</div>
          </div>
          <div className="rounded-lg border p-4">
            <CalendarClock className="size-4 text-primary" />
            <div className="mt-2 text-sm font-medium">Next statutory review 31-Oct-2026</div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
