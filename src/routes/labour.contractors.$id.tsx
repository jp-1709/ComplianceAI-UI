import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, HardHat, ShieldCheck } from "lucide-react";
import { getLabourContractor } from "@/services/modules";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { StatusBadge } from "@/components/grc/badges";
import { RecordHeader } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
export const Route = createFileRoute("/labour/contractors/$id")({ component: ContractorDetail });
function ContractorDetail() {
  const { id } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["labour-contractor", id],
    queryFn: () => getLabourContractor(id),
  });
  if (!data) return <div className="py-20 text-center">Loading contractor…</div>;
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <Breadcrumbs items={[{ label: "Labour Compliance", to: "/labour" }, { label: data.id }]} />
      <RecordHeader
        id={data.id}
        title={data.name}
        badges={<StatusBadge status={data.status} />}
        meta={
          <>
            <span>{data.workers} deployed workers</span>
            <span>BOCW: {data.bocw}</span>
            <span>Insurance: {data.insurance}</span>
          </>
        }
        primaryAction={
          <Button onClick={() => toast.success("Contractor remediation pack requested")}>
            Request Remediation Pack
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Panel title="Overall score">
          <div className="text-4xl font-semibold">{data.score}</div>
          <Progress value={data.score} className="mt-3" />
        </Panel>
        <Panel title="Control scores">
          <Score label="Safety induction" value={data.induction} />
          <Score label="Wage compliance" value={data.wageCompliance} />
        </Panel>
        <Panel title="Access decision">
          <div className="flex gap-2 rounded-lg border border-critical/30 bg-critical-soft p-3 text-sm text-critical">
            <AlertTriangle className="size-4 shrink-0" /> Site access remains restricted until BOCW
            evidence and missing inductions are verified.
          </div>
        </Panel>
      </div>
      <Panel title="Contractor control checklist">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            "BOCW registration and cess evidence",
            "Contract labour licence",
            "Worker identity and age verification",
            "Safety induction",
            "Wage and overtime records",
            "Insurance and medical fitness",
          ].map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-lg border p-3">
              <ShieldCheck
                className={`size-4 ${index === 0 && data.bocw === "Missing" ? "text-critical" : "text-compliant"}`}
              />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/labour/evidence-pack">
            <HardHat className="size-4" /> Open contractor evidence pack
          </Link>
        </Button>
      </Panel>
    </div>
  );
}
function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-xs">
        <span>{label}</span>
        <b>{value}%</b>
      </div>
      <Progress value={value} />
    </div>
  );
}
