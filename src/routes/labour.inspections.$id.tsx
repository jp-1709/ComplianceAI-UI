import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { FileCheck2, ShieldAlert } from "lucide-react";
import { getLabourInspection } from "@/services/modules";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { RecordHeader, WorkflowStepper } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/labour/inspections/$id")({ component: InspectionDetail });
function InspectionDetail() {
  const { id } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["labour-inspection", id],
    queryFn: () => getLabourInspection(id),
  });
  if (!data) return <div className="py-20 text-center">Loading inspection…</div>;
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <Breadcrumbs items={[{ label: "Labour Compliance", to: "/labour" }, { label: data.id }]} />
      <RecordHeader
        id={data.id}
        title={`${data.authority} Inspection`}
        meta={
          <>
            <span>{data.date}</span>
            <span>{data.status}</span>
            <span>{data.findings} findings</span>
          </>
        }
        primaryAction={
          <Button onClick={() => toast.success("Authority response sent for legal review")}>
            Send Authority Response
          </Button>
        }
      />
      <Panel title="Inspection response workflow">
        <WorkflowStepper
          steps={[
            "Inspection received",
            "Findings classified",
            "Owners assigned",
            "Evidence assembled",
            "Legal review",
            "Authority response",
            "Closure",
          ].map((label, index) => ({
            label,
            state: index < 3 ? "complete" : index === 3 ? "current" : "upcoming",
          }))}
        />
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Scope and findings">
          <p className="text-sm">{data.scope}</p>
          <div className="mt-4 space-y-2">
            {[
              "Contractor BOCW registration copy missing",
              "Four contractor inductions incomplete",
              "Wage register reviewer signature absent",
            ]
              .slice(0, data.findings)
              .map((item) => (
                <div key={item} className="flex gap-2 rounded-lg border p-3 text-sm">
                  <ShieldAlert className="size-4 text-critical" />
                  {item}
                </div>
              ))}
          </div>
        </Panel>
        <Panel title="Response evidence">
          <div className="space-y-2">
            {[
              "Registration remediation plan",
              "Updated induction register",
              "Wage register sign-off",
            ].map((item) => (
              <div key={item} className="flex gap-2 rounded-lg border p-3 text-sm">
                <FileCheck2 className="size-4 text-primary" />
                {item}
              </div>
            ))}
          </div>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/labour/evidence-pack">Open full Evidence Pack</Link>
          </Button>
        </Panel>
      </div>
    </div>
  );
}
