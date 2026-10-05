import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Factory, FileWarning, HardHat, ShieldCheck } from "lucide-react";
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
import { getModuleWorkspace } from "@/services/modules";
import { Breadcrumbs, MetricCard, Panel } from "@/components/grc/widgets";
import { StatusBadge } from "@/components/grc/badges";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export const Route = createFileRoute("/ehs")({ component: EhsRoute });

function EhsRoute() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return pathname === "/ehs" || pathname === "/ehs/" ? <EhsDashboard /> : <Outlet />;
}
function EhsDashboard() {
  const { data } = useQuery({
    queryKey: ["module", "ehs"],
    queryFn: () => getModuleWorkspace("ehs"),
  });
  const incidentList = data && "incidents" in data ? data.incidents : [];
  const monitoring = data && "monitoring" in data ? data.monitoring : [];
  const licences = data && "licences" in data ? data.licences : [];
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs items={[{ label: "Home", to: "/command-center" }, { label: "EHS" }]} />
      <div className="flex justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase text-module-ehs">
            Environment, health & safety
          </div>
          <h1 className="mt-1 text-2xl font-semibold">EHS Command Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Incidents, environmental monitoring, alerts, consents and corrective action.
          </p>
        </div>
        <Button asChild>
          <Link to="/ehs/evidence-pack">
            <ShieldCheck className="size-4" /> Evidence Pack
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Open incidents"
          value={incidentList.length}
          tone="critical"
          hint="Investigation active"
          to="/ehs"
          icon={HardHat}
        />
        <MetricCard
          label="Monitoring alerts"
          value={monitoring.filter((item) => item.status !== "compliant").length}
          tone="attention"
          hint="Limit or trend alerts"
          to="/ehs"
          icon={AlertTriangle}
        />
        <MetricCard
          label="EHS licences"
          value={licences.length}
          hint="Consents and NOCs"
          to="/ehs"
          icon={Factory}
        />
        <MetricCard
          label="Expiring soon"
          value={licences.filter((item) => item.status === "attention").length}
          tone="attention"
          hint="Within renewal window"
          to="/ehs"
          icon={FileWarning}
        />
      </div>
      <Tabs defaultValue="monitoring">
        <TabsList>
          <TabsTrigger value="monitoring">Monitoring dashboard</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="licences">Licence register</TabsTrigger>
        </TabsList>
        <TabsContent value="monitoring">
          <div className="grid gap-4 lg:grid-cols-3">
            {monitoring.map((item) => (
              <Link
                key={item.id}
                to="/ehs/monitoring/$id"
                params={{ id: item.id }}
                className="enterprise-panel p-4 hover:border-primary/40"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">{item.id}</div>
                    <div className="font-medium">{item.name}</div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-4 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={item.readings.map((value, index) => ({ index: index + 1, value }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="index" hide />
                      <YAxis domain={[0, "auto"]} width={32} />
                      <Tooltip />
                      <ReferenceLine
                        y={item.limit}
                        stroke="var(--critical)"
                        strokeDasharray="5 4"
                        label="Limit"
                      />
                      <Line
                        dataKey="value"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Limit {item.limit} {item.unit} · sampled {item.lastSampled}
                </div>
              </Link>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="incidents">
          <Panel title="Incident register">
            {incidentList.map((item) => (
              <Link
                key={item.id}
                to="/ehs/incidents/$id"
                params={{ id: item.id }}
                className="flex justify-between rounded-lg border p-4 hover:border-primary/40"
              >
                <div>
                  <div className="font-mono text-xs text-muted-foreground">{item.id}</div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.occurredOn}</div>
                </div>
                <StatusBadge status={item.status} />
              </Link>
            ))}
          </Panel>
        </TabsContent>
        <TabsContent value="licences">
          <Panel title="Environmental and safety licence register">
            <div className="space-y-2">
              {licences.map((item) => (
                <Link
                  key={item.id}
                  to="/ehs/licences/$id"
                  params={{ id: item.id }}
                  className="grid gap-3 rounded-lg border p-4 hover:border-primary/40 md:grid-cols-[1fr_180px_160px_120px]"
                >
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">{item.id}</div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.authority}</div>
                  </div>
                  <div className="text-xs">{item.licenceNo}</div>
                  <div className="text-xs">Expires {item.expiresOn}</div>
                  <StatusBadge status={item.status} />
                </Link>
              ))}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
