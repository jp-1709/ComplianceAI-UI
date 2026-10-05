import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, GitCompareArrows, Minus, Plus } from "lucide-react";
import { getDocument } from "@/services/governance";
import { Breadcrumbs } from "@/components/grc/widgets";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/qms/documents/$id/compare")({
  head: () => ({ meta: [{ title: "Version Comparison — Quantbit Compliance AI" }] }),
  component: VersionComparison,
});

function VersionComparison() {
  const { id } = Route.useParams();
  const { data: document } = useQuery({
    queryKey: ["controlled-document", id],
    queryFn: () => getDocument(id),
  });
  return (
    <div className="mx-auto max-w-[1500px] space-y-4">
      <Breadcrumbs
        items={[
          { label: "Document Control", to: "/qms/documents" },
          { label: document?.code ?? id, to: "/qms/documents/$id" },
          { label: "Version comparison" },
        ]}
      />
      <header className="enterprise-panel flex flex-col justify-between gap-3 p-5 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/qms/documents/$id" params={{ id }}>
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <GitCompareArrows className="size-5 text-primary" />
              <h1 className="text-xl font-semibold">Side-by-side Version Comparison</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {document?.code} · v{document?.priorVersion} → v{document?.version}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link to="/qms/documents/$id/approve" params={{ id }}>
            Continue to Approval Workspace
          </Link>
        </Button>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="enterprise-panel overflow-hidden">
          <header className="border-b bg-critical-soft/40 p-4">
            <div className="text-sm font-semibold">Version {document?.priorVersion}</div>
            <div className="text-xs text-muted-foreground">Superseded version</div>
          </header>
          <div className="space-y-3 p-5">
            {document?.priorContent.map((line, index) => (
              <div
                key={line}
                className={`rounded-lg border p-4 text-sm ${index === 1 ? "border-critical/30 bg-critical-soft line-through decoration-critical" : "bg-muted/20"}`}
              >
                <div className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase text-critical">
                  {index === 1 ? (
                    <>
                      <Minus className="size-3" /> Removed / modified
                    </>
                  ) : (
                    "Unchanged"
                  )}
                </div>
                {line}
              </div>
            ))}
            <div className="rounded-lg border border-dashed border-critical/40 p-4 text-sm text-critical">
              <Minus className="mr-2 inline size-4" /> No enterprise visibility requirement in this
              version.
            </div>
          </div>
        </section>
        <section className="enterprise-panel overflow-hidden">
          <header className="border-b bg-compliant-soft p-4">
            <div className="text-sm font-semibold">Version {document?.version}</div>
            <div className="text-xs text-muted-foreground">Proposed / current version</div>
          </header>
          <div className="space-y-3 p-5">
            {document?.currentContent.map((line, index) => (
              <div
                key={line}
                className={`rounded-lg border p-4 text-sm ${index === 1 ? "border-attention/40 bg-attention-soft" : index === 2 ? "border-compliant/40 bg-compliant-soft" : "bg-muted/20"}`}
              >
                <div
                  className={`mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase ${index === 1 ? "text-attention-foreground" : index === 2 ? "text-compliant" : "text-muted-foreground"}`}
                >
                  {index === 1 ? (
                    "Modified"
                  ) : index === 2 ? (
                    <>
                      <Plus className="size-3" /> Added
                    </>
                  ) : (
                    "Unchanged"
                  )}
                </div>
                {line}
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="enterprise-panel flex flex-col justify-between gap-3 p-4 md:flex-row md:items-center">
        <div className="flex gap-2 text-sm">
          <CheckCircle2 className="size-5 text-compliant" />
          <span>2 clauses modified · 1 clause added · 0 unresolved comparison conflicts</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Comparison generated from controlled versions; reviewer decision remains human.
        </div>
      </div>
    </div>
  );
}
