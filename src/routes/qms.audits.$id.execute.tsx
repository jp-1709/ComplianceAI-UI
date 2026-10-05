import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Camera,
  CheckCircle2,
  ChevronLeft,
  FilePlus2,
  MessageSquareText,
  Paperclip,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { auditChecklist, getAudit } from "@/services/qms";
import { Breadcrumbs } from "@/components/grc/widgets";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/qms/audits/$id/execute")({
  head: () => ({ meta: [{ title: "Audit Execution — Quantbit Compliance AI" }] }),
  component: AuditExecution,
});

function AuditExecution() {
  const { id } = Route.useParams();
  const { data: audit } = useQuery({
    queryKey: ["qms", "audit", id],
    queryFn: () => getAudit(id),
    staleTime: 60_000,
  });
  const [selected, setSelected] = useState(1);
  const item = auditChecklist[selected];
  return (
    <div className="mx-auto max-w-[1800px] space-y-4">
      <Breadcrumbs
        items={[
          { label: "Internal Audit", to: "/qms/audits" },
          { label: id, to: "/qms/audits/$id" },
          { label: "Execution workspace" },
        ]}
      />
      <header className="enterprise-panel flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon">
              <Link to="/qms/audits/$id" params={{ id }}>
                <ChevronLeft className="size-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{audit?.title ?? "Audit execution"}</h1>
              <p className="text-xs text-muted-foreground">{id} · Autosaved just now</p>
            </div>
          </div>
        </div>
        <div className="flex min-w-72 items-center gap-3">
          <Progress value={audit?.progress ?? 54} className="flex-1" />
          <span className="text-sm font-semibold">
            {audit?.completedItems ?? 28}/{audit?.totalItems ?? 52}
          </span>
        </div>
      </header>
      <div className="grid min-h-[640px] gap-4 xl:grid-cols-[260px_minmax(0,1fr)_330px]">
        <aside className="enterprise-panel overflow-hidden">
          <div className="border-b p-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Checklist navigation
          </div>
          <div className="p-2">
            {auditChecklist.map((check, index) => (
              <button
                key={check.id}
                onClick={() => setSelected(index)}
                className={`mb-1 w-full rounded-lg p-3 text-left transition ${selected === index ? "bg-primary-soft ring-1 ring-primary/30" : "hover:bg-muted"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-muted-foreground">{check.id}</span>
                  {check.result === "Conforming" && (
                    <CheckCircle2 className="size-3.5 text-compliant" />
                  )}
                </div>
                <div className="mt-1 text-xs font-medium">{check.section}</div>
                <div className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                  {check.question}
                </div>
              </button>
            ))}
          </div>
        </aside>
        <main className="enterprise-panel p-6">
          <div className="font-mono text-xs text-muted-foreground">
            {item.id} · {item.section}
          </div>
          <h2 className="mt-2 text-xl font-semibold leading-8">{item.question}</h2>
          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assessment result
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {["Conforming", "Minor NC", "Major NC", "Observation"].map((result) => (
                <button
                  key={result}
                  onClick={() => toast.success(`${result} selected for ${item.id}`)}
                  className={`rounded-lg border px-3 py-3 text-sm font-medium transition hover:border-primary ${item.result === result ? "border-primary bg-primary-soft text-primary" : "bg-surface"}`}
                >
                  {result}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Auditor rationale
            </div>
            <Textarea
              className="mt-2 min-h-32"
              defaultValue={
                item.result === "Major NC"
                  ? "Sampled competency records show induction attendance, but no observed skill re-verification after the recurring incident trend."
                  : "Record the objective evidence and sampling rationale here."
              }
            />
          </div>
          <div className="mt-5 rounded-lg border bg-muted/30 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Criteria and sampling guidance
            </div>
            <p className="mt-2 text-sm">
              Test at least three records across two shifts. Confirm document version, performer
              competency, reviewer independence and evidence provenance.
            </p>
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setSelected(Math.max(0, selected - 1))}>
              Previous item
            </Button>
            <Button
              onClick={() => {
                toast.success("Checklist response saved");
                setSelected(Math.min(auditChecklist.length - 1, selected + 1));
              }}
            >
              <Save className="size-4" /> Save & next
            </Button>
          </div>
        </main>
        <aside className="space-y-4">
          <section className="enterprise-panel">
            <div className="border-b p-3 text-sm font-semibold">Evidence & notes</div>
            <div className="space-y-3 p-4">
              <Button variant="outline" className="w-full">
                <Paperclip className="size-4" /> Attach evidence
              </Button>
              <Button variant="outline" className="w-full">
                <Camera className="size-4" /> Capture photo
              </Button>
              <div className="rounded-lg border p-3">
                <div className="text-xs font-medium">{item.evidence} evidence records linked</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Hash and provenance are preserved automatically.
                </div>
              </div>
              <Textarea placeholder="Private auditor notes…" />
            </div>
          </section>
          <section className="enterprise-panel border-critical/30">
            <div className="border-b p-3 text-sm font-semibold">Finding</div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground">
                Create a traceable finding pre-filled with this checklist item, criteria and
                attached evidence.
              </p>
              <Button
                className="mt-3 w-full"
                onClick={() => toast.success(`Draft finding created from ${item.id}`)}
              >
                <FilePlus2 className="size-4" /> Raise finding from this item
              </Button>
              <Button variant="ghost" className="mt-2 w-full">
                <MessageSquareText className="size-4" /> Add lead note
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
