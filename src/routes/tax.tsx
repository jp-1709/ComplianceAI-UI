import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, FileSearch, Landmark, Receipt, ShieldCheck } from "lucide-react";
import { getModuleWorkspace } from "@/services/modules";
import { Breadcrumbs, MetricCard, Panel } from "@/components/grc/widgets";
import { DueDateIndicator, StatusBadge } from "@/components/grc/badges";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const money = (value: number) => `₹${(value / 100000).toFixed(2)} lakh`;
export const Route = createFileRoute("/tax")({ component: TaxRoute });

function TaxRoute() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return pathname === "/tax" || pathname === "/tax/" ? <TaxDashboard /> : <Outlet />;
}
function TaxDashboard() {
  const { data } = useQuery({
    queryKey: ["module", "tax"],
    queryFn: () => getModuleWorkspace("tax"),
  });
  const filings = data && "filings" in data ? data.filings : [];
  const mismatches = data && "mismatches" in data ? data.mismatches : [];
  const notices = data && "notices" in data ? data.notices : [];
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs items={[{ label: "Home", to: "/command-center" }, { label: "Tax & GST" }]} />
      <div className="flex justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase text-module-tax">
            Indirect tax operations
          </div>
          <h1 className="mt-1 text-2xl font-semibold">Tax & GST Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Filing readiness, ITC reconciliation, notices, treatment and approval evidence.
          </p>
        </div>
        <Button asChild>
          <Link to="/tax/evidence-pack">
            <ShieldCheck className="size-4" /> Evidence Pack
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Open filings"
          value={filings.filter((item) => item.status !== "compliant").length}
          hint="GSTR-1, 3B and TDS"
          to="/tax"
          icon={Receipt}
        />
        <MetricCard
          label="ITC mismatches"
          value={mismatches.length}
          tone="attention"
          hint={money(
            mismatches.reduce((sum, item) => sum + Math.abs(item.books - item.government), 0),
          )}
          to="/tax"
          icon={AlertTriangle}
        />
        <MetricCard
          label="Open notices"
          value={notices.length}
          tone="critical"
          hint="₹4.58 lakh exposure"
          to="/tax"
          icon={Landmark}
        />
        <MetricCard
          label="Approvals pending"
          value={mismatches.filter((item) => item.approval !== "Approved").length}
          hint="Treatment decisions"
          to="/tax"
          icon={FileSearch}
        />
      </div>
      <Tabs defaultValue="filings">
        <TabsList>
          <TabsTrigger value="filings">Filing register</TabsTrigger>
          <TabsTrigger value="itc">ITC reconciliation</TabsTrigger>
          <TabsTrigger value="notices">Notice inbox</TabsTrigger>
        </TabsList>
        <TabsContent value="filings">
          <Panel title="Statutory filing register">
            <div className="space-y-2">
              {filings.map((item) => (
                <Link
                  key={item.id}
                  to="/tax/filings/$id"
                  params={{ id: item.id }}
                  className="grid gap-3 rounded-lg border p-4 hover:border-primary/40 md:grid-cols-[100px_1fr_160px_160px_120px]"
                >
                  <b>{item.form}</b>
                  <div>
                    <div className="text-sm font-medium">{item.period}</div>
                    <div className="text-xs text-muted-foreground">{item.arn}</div>
                  </div>
                  <DueDateIndicator date={item.dueDate} locked />
                  <div className="text-sm">{money(item.liability)}</div>
                  <StatusBadge status={item.status} />
                </Link>
              ))}
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="itc">
          <Panel title="GSTR-2B reconciliation queue">
            <div className="space-y-2">
              {mismatches.map((item) => (
                <Link
                  key={item.id}
                  to="/tax/reconciliation/$id"
                  params={{ id: item.id }}
                  className="grid gap-3 rounded-lg border p-4 hover:border-primary/40 md:grid-cols-[1fr_130px_130px_170px]"
                >
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">{item.id}</div>
                    <div className="text-sm font-medium">{item.vendor}</div>
                    <div className="text-xs text-muted-foreground">{item.type}</div>
                  </div>
                  <div className="text-sm">
                    <span className="text-xs text-muted-foreground">Books</span>
                    <br />
                    {money(item.books)}
                  </div>
                  <div className="text-sm">
                    <span className="text-xs text-muted-foreground">Government</span>
                    <br />
                    {money(item.government)}
                  </div>
                  <div className="text-xs">
                    {item.treatment}
                    <br />
                    <span className="text-muted-foreground">{item.approval}</span>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="notices">
          <Panel title="Tax notice inbox">
            <div className="space-y-2">
              {notices.map((item) => (
                <Link
                  key={item.id}
                  to="/tax/notices/$id"
                  params={{ id: item.id }}
                  className="flex justify-between rounded-lg border p-4 hover:border-primary/40"
                >
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">
                      {item.id} · {item.section}
                    </div>
                    <div className="text-sm font-medium">{item.subject}</div>
                    <div className="text-xs text-muted-foreground">{item.authority}</div>
                  </div>
                  <div className="text-right">
                    <DueDateIndicator date={item.respondBy} locked />
                    <div className="mt-1 text-sm font-semibold">{money(item.amount)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
