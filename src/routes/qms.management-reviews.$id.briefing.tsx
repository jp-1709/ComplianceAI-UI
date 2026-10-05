import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ChevronLeft, GripVertical, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getManagementReview } from "@/services/governance";
import { AIRecommendationPanel, Breadcrumbs, Panel } from "@/components/grc/widgets";
import { aiSuggestions } from "@/data/kfc";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/qms/management-reviews/$id/briefing")({
  head: () => ({ meta: [{ title: "Briefing Pack Builder — Quantbit Compliance AI" }] }),
  component: BriefingPack,
});

function BriefingPack() {
  const { id } = Route.useParams();
  const { data: review } = useQuery({
    queryKey: ["management-review", id],
    queryFn: () => getManagementReview(id),
  });
  return (
    <div className="mx-auto max-w-[1500px] space-y-4">
      <Breadcrumbs
        items={[
          { label: "Management Review", to: "/qms/management-reviews" },
          { label: id, to: "/qms/management-reviews/$id" },
          { label: "Briefing Pack Builder" },
        ]}
      />
      <header className="enterprise-panel flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
        <div className="flex gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/qms/management-reviews/$id" params={{ id }}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Briefing Pack Builder</h1>
            <p className="text-sm text-muted-foreground">
              Assemble, validate and lock the evidence baseline for leadership review.
            </p>
          </div>
        </div>
        <Button onClick={() => toast.success("All inputs locked; briefing pack v1.0 generated")}>
          <Lock className="size-4" /> Lock Inputs & Generate Pack
        </Button>
      </header>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Panel
          title="Input sequence"
          action={
            <span className="text-xs text-muted-foreground">
              {review?.coverage.length ?? 0}/16 ready
            </span>
          }
        >
          <div className="space-y-2">
            {review?.coverage.map((input, index) => (
              <div key={input.id} className="flex items-center gap-3 rounded-lg border p-3">
                <GripVertical className="size-4 text-muted-foreground" />
                <span className="grid size-7 place-items-center rounded bg-muted text-xs font-semibold">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{input.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {input.standard} · {input.evidenceCount} evidence records
                  </div>
                </div>
                <div className="w-24">
                  <Progress value={input.readiness} />
                </div>
                {input.locked ? (
                  <Lock className="size-4 text-compliant" />
                ) : (
                  <CheckCircle2 className="size-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </Panel>
        <aside className="space-y-4">
          <Panel title="Pack readiness">
            <div className="text-3xl font-semibold">96%</div>
            <Progress value={96} className="mt-3" />
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <div>✓ All 16 required inputs mapped</div>
              <div>✓ Evidence provenance complete</div>
              <div>✓ Prior outputs reconciled</div>
              <div>△ Two source summaries need chair review</div>
            </div>
          </Panel>
          <AIRecommendationPanel
            s={{
              ...aiSuggestions[0],
              id: "AI-MR-01",
              suggestion:
                "Place risk effectiveness, audit results and corrective actions consecutively in the pack.",
              why: "These inputs share five linked records and form a coherent leadership decision trail.",
            }}
          />
          <div className="rounded-lg border border-ai/30 bg-ai-soft p-3 text-xs text-ai">
            <Sparkles className="mr-1 inline size-3.5" /> AI can assemble and summarise the pack.
            Only a human chair can lock the input baseline.
          </div>
        </aside>
      </div>
    </div>
  );
}
