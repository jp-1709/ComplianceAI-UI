import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarClock,
  FileSpreadsheet,
  FileText,
  Plus,
  Presentation,
  ShieldCheck,
} from "lucide-react";
import { getReportsWorkspace } from "@/services/platform";
import { Breadcrumbs, MetricCard, Panel } from "@/components/grc/widgets";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/reports")({ component: ReportsLibrary });
function ReportsLibrary() {
  const { data } = useQuery({
    queryKey: ["reports"],
    queryFn: getReportsWorkspace,
    staleTime: 60000,
  });
  const reports = data?.reports ?? [];
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs
        items={[{ label: "Home", to: "/command-center" }, { label: "Reports & Analytics" }]}
      />
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <div className="text-xs font-semibold uppercase text-primary">
            Audit-ready intelligence
          </div>
          <h1 className="mt-1 text-2xl font-semibold">Reports Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saved analysis, scheduled distribution, board packs and traceable drill-downs.
          </p>
        </div>
        <Button asChild>
          <Link to="/reports/builder">
            <Plus className="size-4" /> Build custom report
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Report templates"
          value={reports.length}
          hint="Reusable governed definitions"
          to="/reports"
          icon={FileText}
        />
        <MetricCard
          label="Saved configurations"
          value={data?.configs.length ?? 0}
          hint="Personal and shared views"
          to="/reports/builder"
          icon={ShieldCheck}
        />
        <MetricCard
          label="Scheduled reports"
          value={2}
          hint="Next run tomorrow 08:00"
          to="/reports"
          icon={CalendarClock}
        />
        <MetricCard
          label="Board pack sections"
          value={data?.boardPack.length ?? 0}
          hint="Quarterly leadership pack"
          to="/reports/board-pack"
          icon={Presentation}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {reports.map((report) => (
          <Link
            key={report.id}
            to="/reports/builder"
            search={{ config: report.id }}
            className="enterprise-panel p-5 transition hover:border-primary/40"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-primary-soft text-primary">
                  {report.format === "PDF" ? (
                    <FileText className="size-5" />
                  ) : (
                    <FileSpreadsheet className="size-5" />
                  )}
                </div>
                <div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {report.id} · {report.category}
                  </div>
                  <div className="mt-1 font-semibold">{report.title}</div>
                </div>
              </div>
              <span className="rounded border px-2 py-1 text-xs">{report.format}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{report.description}</p>
            <div className="mt-4 flex justify-between text-xs text-muted-foreground">
              <span>Data as of {report.lastRun}</span>
              <span>{report.records} drill-down records</span>
            </div>
          </Link>
        ))}
      </div>
      <Panel title="Board reporting">
        <Link
          to="/reports/board-pack"
          className="flex flex-col justify-between gap-4 rounded-xl border border-primary/30 bg-primary-soft/40 p-5 md:flex-row md:items-center"
        >
          <div>
            <div className="flex items-center gap-2 font-semibold">
              <BarChart3 className="size-5 text-primary" /> Board Compliance Pack · Q2 FY2026-27
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Six sections, board commentary, watermarked external export and source drill-down.
            </p>
          </div>
          <Button>Open board pack</Button>
        </Link>
      </Panel>
    </div>
  );
}
