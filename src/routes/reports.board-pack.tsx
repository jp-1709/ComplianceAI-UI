import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Presentation, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { boardPackSections } from "@/services/platform";
import { Breadcrumbs, Panel, ReadinessRing } from "@/components/grc/widgets";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
export const Route = createFileRoute("/reports/board-pack")({ component: BoardPack });
function BoardPack() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Breadcrumbs
        items={[{ label: "Reports", to: "/reports" }, { label: "Board Compliance Pack" }]}
      />
      <header className="enterprise-panel flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-primary">
            <Presentation className="size-4" /> Board-ready reporting
          </div>
          <h1 className="mt-1 text-2xl font-semibold">Board Compliance Pack · Q2 FY2026-27</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Data as of 05-Oct-2026 11:30 IST · applied scope: KFC India Demo, all entities and
            modules.
          </p>
        </div>
        <Button onClick={() => toast.success("Board pack PDF generated with source appendix")}>
          <Download className="size-4" /> Export Board PDF
        </Button>
      </header>
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <Panel title="Pack readiness">
          <ReadinessRing value={97} label="ready" />
          <div className="mt-4 rounded-lg border border-compliant/30 bg-compliant-soft p-3 text-xs text-compliant">
            <ShieldCheck className="mr-1 inline size-3.5" />
            All material claims link to governed source records.
          </div>
        </Panel>
        <Panel title="Pack sections">
          <div className="space-y-3">
            {boardPackSections.map((section) => (
              <div key={section.id} className="flex items-center gap-4 rounded-lg border p-4">
                <span className="grid size-9 place-items-center rounded bg-primary-soft font-mono text-xs text-primary">
                  {section.pages}p
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{section.title}</div>
                  <Progress value={section.readiness} className="mt-2" />
                </div>
                <span className="text-xs">{section.readiness}%</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Material matters requiring Board visibility">
        <div className="grid gap-3 md:grid-cols-3">
          <Drill id="RSK-0001" label="Delhi cold-chain risk above appetite" to="/qms/risks/$id" />
          <Drill id="CAPA-0004" label="Pune BOCW remediation overdue" to="/qms/capa/$id" />
          <Drill id="GST-NOT-001" label="Bengaluru GST scrutiny notice" to="/tax/notices/$id" />
        </div>
      </Panel>
    </div>
  );
}
function Drill({ id, label, to }: { id: string; label: string; to: string }) {
  return (
    <Link to={to} params={{ id }} className="rounded-lg border p-4 hover:border-primary">
      <div className="font-mono text-xs text-primary">{id}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
    </Link>
  );
}
