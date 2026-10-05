import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarClock, Download, FileSpreadsheet, Filter, Save } from "lucide-react";
import { toast } from "sonner";
import { savedReportConfigs } from "@/services/platform";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export const Route = createFileRoute("/reports/builder")({
  validateSearch: (s: Record<string, unknown>) => ({
    config: typeof s.config === "string" ? s.config : undefined,
  }),
  component: ReportBuilder,
});
function ReportBuilder() {
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);
  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <Breadcrumbs
        items={[{ label: "Reports", to: "/reports" }, { label: "Custom Report Builder" }]}
      />
      <header className="enterprise-panel flex flex-col justify-between gap-3 p-5 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl font-semibold">Custom Report Builder</h1>
          <p className="text-sm text-muted-foreground">
            Data as of 05-Oct-2026 11:30 IST · live governed snapshot
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => toast.success("PDF export generated")}>
            <Download className="size-4" /> Export PDF
          </Button>
          <Button variant="outline" onClick={() => toast.success("Excel export generated")}>
            <FileSpreadsheet className="size-4" /> Export Excel
          </Button>
          <Button variant="outline">
            <CalendarClock className="size-4" /> Schedule
          </Button>
          <Button
            onClick={() => {
              setDirty(false);
              toast.success("Report configuration saved");
            }}
          >
            <Save className="size-4" /> Save configuration
          </Button>
        </div>
      </header>
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Panel title="Saved configurations">
            <div className="space-y-2">
              {savedReportConfigs.map((item) => (
                <button
                  key={item.id}
                  className="w-full rounded-lg border p-3 text-left hover:border-primary/40"
                >
                  <div className="text-sm font-medium">{item.name}</div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    {item.entity} · {item.period}
                  </div>
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="Filters">
            <div className="space-y-3" onChange={() => setDirty(true)}>
              <label className="text-xs font-medium">
                Report title
                <Input className="mt-1" defaultValue="Compliance exception report" />
              </label>
              <FilterSelect
                label="Entities"
                value="all"
                items={["All entities", "Mumbai", "Pune", "Bengaluru", "Hyderabad", "Delhi"]}
              />
              <FilterSelect
                label="Period"
                value="q2"
                items={["Q2 FY27", "Sep-2026", "H1 FY27", "FY26"]}
              />
              <FilterSelect
                label="Modules"
                value="all"
                items={["All modules", "Labour", "Tax & GST", "Secretarial", "EHS", "QMS"]}
              />
              <FilterSelect
                label="Status"
                value="exceptions"
                items={["Exceptions only", "Open / overdue", "All records", "Verified"]}
              />
            </div>
          </Panel>
        </aside>
        <main className="space-y-4">
          <div className="rounded-lg border border-primary/30 bg-primary-soft/40 p-3 text-xs">
            <Filter className="mr-1 inline size-3.5" />
            <b>Applied filters:</b> All entities · Q2 FY27 · All modules · Exceptions only · Data as
            of 05-Oct-2026 11:30 IST
          </div>
          <Panel title="Report preview · drill down enabled">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="p-3">Record</th>
                    <th className="p-3">Exception</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Owner</th>
                    <th className="p-3">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <Row
                    id="RSK-0001"
                    to="/qms/risks/$id"
                    text="Residual risk above appetite"
                    entity="Delhi CP"
                    owner="Tanmay Ghosh"
                    state="Critical"
                  />
                  <Row
                    id="CAPA-0004"
                    to="/qms/capa/$id"
                    text="BOCW remediation overdue"
                    entity="Pune FC Road"
                    owner="Meera Joshi"
                    state="Overdue"
                  />
                  <Row
                    id="FND-0002"
                    to="/qms/audits/findings/$id"
                    text="Occupier review signature missing"
                    entity="Hyderabad"
                    owner="Meera Joshi"
                    state="Open"
                  />
                  <Row
                    id="OBL-0102"
                    to="/obligations/$id"
                    text="ITC reconciliation scrutiny"
                    entity="Bengaluru"
                    owner="Arvind Shetty"
                    state="Attention"
                  />
                </tbody>
              </table>
            </div>
          </Panel>
        </main>
      </div>
    </div>
  );
}
function FilterSelect({ label, value, items }: { label: string; value: string; items: string[] }) {
  return (
    <label className="block text-xs font-medium">
      {label}
      <Select defaultValue={value}>
        <SelectTrigger className="mt-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item, index) => (
            <SelectItem
              key={item}
              value={index === 0 ? value : item.toLowerCase().replaceAll(" ", "-")}
            >
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
function Row({
  id,
  to,
  text,
  entity,
  owner,
  state,
}: {
  id: string;
  to: string;
  text: string;
  entity: string;
  owner: string;
  state: string;
}) {
  return (
    <tr>
      <td className="p-3">
        <Link
          to={to}
          params={{ id }}
          className="font-mono text-xs font-semibold text-primary hover:underline"
        >
          {id}
        </Link>
      </td>
      <td className="p-3">{text}</td>
      <td className="p-3">{entity}</td>
      <td className="p-3">{owner}</td>
      <td className="p-3">{state}</td>
    </tr>
  );
}
