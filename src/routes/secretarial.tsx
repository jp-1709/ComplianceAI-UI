import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, FileClock, Landmark, ShieldCheck, Users } from "lucide-react";
import { getModuleWorkspace } from "@/services/modules";
import { Breadcrumbs, MetricCard, Panel } from "@/components/grc/widgets";
import { DueDateIndicator, StatusBadge } from "@/components/grc/badges";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export const Route = createFileRoute("/secretarial")({ component: SecretarialRoute });

function SecretarialRoute() {
  const pathname = useLocation({ select: (location) => location.pathname });
  return pathname === "/secretarial" || pathname === "/secretarial/" ? (
    <SecretarialDashboard />
  ) : (
    <Outlet />
  );
}
function SecretarialDashboard() {
  const { data } = useQuery({
    queryKey: ["module", "secretarial"],
    queryFn: () => getModuleWorkspace("secretarial"),
  });
  const directorList = data && "directors" in data ? data.directors : [];
  const meetings = data && "meetings" in data ? data.meetings : [];
  const filings = data && "filings" in data ? data.filings : [];
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs items={[{ label: "Home", to: "/command-center" }, { label: "Secretarial" }]} />
      <div className="flex justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase text-module-secretarial">
            Corporate governance
          </div>
          <h1 className="mt-1 text-2xl font-semibold">Secretarial Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Directors, board governance, resolutions, minutes and MCA filings.
          </p>
        </div>
        <Button asChild>
          <Link to="/secretarial/evidence-pack">
            <ShieldCheck className="size-4" /> Evidence Pack
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Directors"
          value={directorList.length}
          hint="Statutory directory"
          to="/secretarial"
          icon={Users}
        />
        <MetricCard
          label="Board meetings"
          value={meetings.length}
          hint="Minutes and resolutions"
          to="/secretarial"
          icon={CalendarDays}
        />
        <MetricCard
          label="MCA filings due"
          value={filings.filter((item) => item.status !== "compliant").length}
          tone="attention"
          hint="Current filing window"
          to="/secretarial"
          icon={Landmark}
        />
        <MetricCard
          label="Governance exceptions"
          value={directorList.filter((item) => item.interestDisclosure !== "Current").length}
          tone="attention"
          hint="Disclosure refresh"
          to="/secretarial"
          icon={FileClock}
        />
      </div>
      <Tabs defaultValue="directors">
        <TabsList>
          <TabsTrigger value="directors">Director directory</TabsTrigger>
          <TabsTrigger value="meetings">Board meetings</TabsTrigger>
          <TabsTrigger value="filings">MCA filing register</TabsTrigger>
        </TabsList>
        <TabsContent value="directors">
          <Panel title="Director directory">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {directorList.map((item) => (
                <Link
                  key={item.id}
                  to="/secretarial/directors/$id"
                  params={{ id: item.id }}
                  className="rounded-lg border p-4 hover:border-primary/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-primary-soft font-semibold text-primary">
                      {item.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")}
                    </span>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">DIN {item.din}</div>
                    </div>
                  </div>
                  <div className="mt-4 text-xs">
                    <b>{item.designation}</b>
                    <div className="mt-1 text-muted-foreground">{item.committees.join(" · ")}</div>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="meetings">
          <Panel title="Board and committee meetings">
            {meetings.map((item) => (
              <Link
                key={item.id}
                to="/secretarial/meetings/$id"
                params={{ id: item.id }}
                className="flex justify-between rounded-lg border p-4 hover:border-primary/40"
              >
                <div>
                  <div className="font-mono text-xs text-muted-foreground">{item.id}</div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">Chair {item.chair}</div>
                </div>
                <div className="text-right text-sm">
                  <div>{item.date}</div>
                  <div className="text-compliant">Quorum met</div>
                </div>
              </Link>
            ))}
          </Panel>
        </TabsContent>
        <TabsContent value="filings">
          <Panel title="MCA filing register">
            <div className="space-y-2">
              {filings.map((item) => (
                <Link
                  key={item.id}
                  to="/secretarial/filings/$id"
                  params={{ id: item.id }}
                  className="grid gap-3 rounded-lg border p-4 hover:border-primary/40 md:grid-cols-[100px_1fr_180px_140px]"
                >
                  <b>{item.form}</b>
                  <div>
                    <div className="text-sm font-medium">{item.purpose}</div>
                    <div className="text-xs text-muted-foreground">SRN {item.srn}</div>
                  </div>
                  <DueDateIndicator date={item.dueDate} locked />
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
