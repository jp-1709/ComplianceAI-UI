import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getDocument } from "@/services/governance";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/qms/documents/$id/approve")({
  head: () => ({ meta: [{ title: "Document Approval — Quantbit Compliance AI" }] }),
  component: ApprovalWorkspace,
});

function ApprovalWorkspace() {
  const { id } = Route.useParams();
  const { data: document } = useQuery({
    queryKey: ["controlled-document", id],
    queryFn: () => getDocument(id),
  });
  const [checks, setChecks] = useState([true, true, false, false]);
  const complete = checks.every(Boolean);
  const labels = [
    "I reviewed the side-by-side version comparison",
    "Legal and regulatory references are accurate",
    "Affected controls and evidence requirements are mapped",
    "Distribution and acknowledgement audience is correct",
  ];
  return (
    <div className="mx-auto max-w-[1500px] space-y-4">
      <Breadcrumbs
        items={[
          { label: "Document Control", to: "/qms/documents" },
          { label: document?.code ?? id, to: "/qms/documents/$id" },
          { label: "Approval workspace" },
        ]}
      />
      <header className="enterprise-panel flex flex-col justify-between gap-3 p-5 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link to="/qms/documents/$id" params={{ id }}>
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Document Approval Workspace</h1>
            <p className="text-sm text-muted-foreground">
              {document?.code} · Version {document?.version} · Approver {document?.approver}
            </p>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to="/qms/documents/$id/compare" params={{ id }}>
            Open version comparison
          </Link>
        </Button>
      </header>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <Panel title="Proposed controlled content">
            <div className="space-y-4">
              {document?.currentContent.map((line, index) => (
                <div key={line} className="rounded-lg border p-4">
                  <div className="text-xs font-semibold text-muted-foreground">
                    Clause {index + 1}
                  </div>
                  <p className="mt-1 text-sm leading-6">{line}</p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    <MessageSquareText className="size-3.5" /> Add reviewer comment
                  </Button>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Approval rationale">
            <Textarea
              className="min-h-28"
              placeholder="Record why this version is suitable, sufficient and effective…"
            />
          </Panel>
        </div>
        <aside className="space-y-4">
          <Panel title="Approval checklist">
            <div className="space-y-3">
              {labels.map((label, index) => (
                <label key={label} className="flex items-start gap-2 text-sm">
                  <Checkbox
                    checked={checks[index]}
                    onCheckedChange={(value) =>
                      setChecks((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? Boolean(value) : item,
                        ),
                      )
                    }
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </Panel>
          <Panel title="Human decision">
            <div className="rounded-lg border border-ai/30 bg-ai-soft p-3 text-xs text-ai">
              <Sparkles className="mr-1 inline size-3.5" /> AI may identify changes or draft
              comments. It can never approve, reject or digitally sign a controlled document.
            </div>
            {!complete && (
              <div className="mt-3 flex gap-2 rounded-lg border border-attention/30 bg-attention-soft p-3 text-xs">
                <AlertTriangle className="size-4 shrink-0" /> Complete every review assertion before
                approval.
              </div>
            )}
            <div className="mt-4 space-y-2">
              <Button
                className="w-full"
                disabled={!complete}
                onClick={() =>
                  toast.success(
                    `${document?.code} v${document?.version} approved and queued for issue`,
                  )
                }
              >
                <ShieldCheck className="size-4" /> Approve Document Version
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast("Returned to author with comments")}
              >
                <XCircle className="size-4" /> Return for Revision
              </Button>
            </div>
          </Panel>
          <Panel title="Release effect">
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <CheckCircle2 className="size-4 text-compliant" /> Supersede prior effective version
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="size-4 text-compliant" /> Preserve immutable version
                history
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="size-4 text-compliant" /> Create acknowledgements for
                affected roles
              </div>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
