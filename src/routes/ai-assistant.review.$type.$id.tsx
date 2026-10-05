import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, FileText, ShieldAlert, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";
import { aiReviewQueues } from "@/services/platform";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
export const Route = createFileRoute("/ai-assistant/review/$type/$id")({ component: AiReview });
function AiReview() {
  const { type, id } = Route.useParams();
  const key = type as keyof typeof aiReviewQueues;
  const item = aiReviewQueues[key]?.find((entry) => entry.id === id);
  const [draft, setDraft] = useState(item?.title ?? "");
  const [dirty, setDirty] = useState(false);
  useUnsavedChanges(dirty);
  if (!item) return <div className="py-20 text-center">AI review item not found</div>;
  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <Breadcrumbs items={[{ label: "AI Assistant", to: "/ai-assistant" }, { label: item.id }]} />
      <header className="enterprise-panel p-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-ai">
          <Sparkles className="size-4" /> AI-generated draft · human review required
        </div>
        <h1 className="mt-2 text-xl font-semibold">{item.title}</h1>
        <div className="mt-2 text-xs text-muted-foreground">
          {item.id} · {item.confidence}% confidence · {item.source} → {item.target}
        </div>
      </header>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Panel title="Suggestion">
            <Textarea
              className="min-h-44"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setDirty(true);
              }}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  setDirty(false);
                  toast.success("Accepted as a draft; human workflow remains required");
                }}
              >
                <CheckCircle2 className="size-4" /> Accept edited draft
              </Button>
              <Button
                variant="outline"
                onClick={() => toast("Another sourced suggestion requested")}
              >
                Request another
              </Button>
              <Button variant="ghost" onClick={() => toast("Suggestion rejected and logged")}>
                <XCircle className="size-4" /> Reject
              </Button>
            </div>
          </Panel>
          <Panel title="Source excerpts">
            <div className="space-y-2">
              <div className="rounded-lg border p-3 text-sm">
                <FileText className="mr-2 inline size-4 text-primary" />
                {item.source}: source record and linked evidence excerpt.
              </div>
              <div className="rounded-lg border p-3 text-sm">
                <ShieldAlert className="mr-2 inline size-4 text-primary" />
                {item.target}: current control, owner and workflow state.
              </div>
            </div>
          </Panel>
        </div>
        <aside className="space-y-4">
          <Panel title="Review context">
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Why</div>Related records indicate a
                material control gap requiring accountable human review.
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Assumptions</div>Current entity
                applicability and approved control taxonomy.
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Missing information</div>Owner
                confirmation and current-period operating evidence.
              </div>
            </div>
          </Panel>
          <div className="rounded-lg border border-attention/30 bg-attention-soft p-3 text-xs">
            Accepting creates or updates a draft only. It never approves, signs, submits, closes,
            accepts risk, or verifies effectiveness.
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/ai-assistant">Return to review queue</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
