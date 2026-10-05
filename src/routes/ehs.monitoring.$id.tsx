import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getMonitoringPoint } from "@/services/modules";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { StatusBadge } from "@/components/grc/badges";
import { KeyValue, RecordHeader } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/ehs/monitoring/$id")({ component: MonitoringDetail });
function MonitoringDetail() {
  const { id } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["monitoring", id],
    queryFn: () => getMonitoringPoint(id),
  });
  if (!data) return <div className="py-20 text-center">Loading monitoring point…</div>;
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <Breadcrumbs items={[{ label: "EHS", to: "/ehs" }, { label: data.id }]} />
      <RecordHeader
        id={data.id}
        title={data.name}
        badges={<StatusBadge status={data.status} />}
        meta={
          <>
            <span>
              Limit {data.limit} {data.unit}
            </span>
            <span>Sampled {data.lastSampled}</span>
          </>
        }
        primaryAction={
          <Button onClick={() => toast.success("Monitoring alert investigation opened")}>
            Open Alert Investigation
          </Button>
        }
      />
      <Panel title="Monitoring trend with consent limit">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.readings.map((value, index) => ({ sample: `S${index + 1}`, value }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sample" />
              <YAxis />
              <Tooltip />
              <ReferenceLine
                y={data.limit}
                stroke="var(--critical)"
                strokeWidth={2}
                label="Regulatory limit"
              />
              <Line dataKey="value" stroke="var(--primary)" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Alert assessment">
          <div className="grid grid-cols-2 gap-4">
            <KeyValue label="Latest">
              {data.readings.at(-1)} {data.unit}
            </KeyValue>
            <KeyValue label="Peak">
              {Math.max(...data.readings)} {data.unit}
            </KeyValue>
            <KeyValue label="Limit">
              {data.limit} {data.unit}
            </KeyValue>
            <KeyValue label="State">{data.status}</KeyValue>
          </div>
        </Panel>
        <Panel title="Evidence and response">
          <p className="text-sm">
            Laboratory report, chain of custody, instrument calibration and management review
            signature are required.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/ehs/evidence-pack">Open Monitoring Evidence Pack</Link>
          </Button>
        </Panel>
      </div>
    </div>
  );
}
