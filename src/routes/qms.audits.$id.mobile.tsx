import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Check, ChevronLeft, ChevronRight, Mic, Paperclip, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { auditChecklist } from "@/services/qms";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/qms/audits/$id/mobile")({
  head: () => ({ meta: [{ title: "Mobile Audit Checklist — Quantbit Compliance AI" }] }),
  component: MobileAudit,
});

function MobileAudit() {
  const { id } = Route.useParams();
  const [index, setIndex] = useState(0);
  const item = auditChecklist[index];
  return (
    <div className="mx-auto max-w-md pb-24">
      <header className="sticky top-0 z-10 -mx-4 border-b bg-surface/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="icon">
            <Link to="/qms/audits/$id" params={{ id }}>
              <ChevronLeft className="size-5" />
            </Link>
          </Button>
          <div className="text-center">
            <div className="text-sm font-semibold">Mobile audit checklist</div>
            <div className="font-mono text-[10px] text-muted-foreground">{id}</div>
          </div>
          <WifiOff className="size-4 text-compliant" aria-label="Offline ready" />
        </div>
        <Progress value={((index + 1) / auditChecklist.length) * 100} className="mt-3" />
      </header>
      <main className="space-y-4 pt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{item.section}</span>
          <span>
            {index + 1} of {auditChecklist.length}
          </span>
        </div>
        <section className="enterprise-panel p-5">
          <div className="font-mono text-xs text-primary">{item.id}</div>
          <h1 className="mt-2 text-lg font-semibold leading-7">{item.question}</h1>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {["Conforming", "Minor NC", "Major NC", "Observation"].map((result) => (
              <button
                key={result}
                onClick={() => toast.success(`${result} saved offline`)}
                className="rounded-lg border p-4 text-sm font-medium hover:border-primary hover:bg-primary-soft"
              >
                {result}
              </button>
            ))}
          </div>
        </section>
        <section className="enterprise-panel p-4">
          <div className="text-sm font-semibold">Capture objective evidence</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Button variant="outline" className="h-16 flex-col">
              <Camera className="size-5" /> Photo
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <Paperclip className="size-5" /> File
            </Button>
            <Button variant="outline" className="h-16 flex-col">
              <Mic className="size-5" /> Voice note
            </Button>
          </div>
          <Textarea className="mt-3" placeholder="Field notes…" />
        </section>
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="lg"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
          >
            <ChevronLeft className="size-4" /> Previous
          </Button>
          <Button
            size="lg"
            onClick={() => {
              toast.success("Response synced");
              setIndex(Math.min(auditChecklist.length - 1, index + 1));
            }}
          >
            {index === auditChecklist.length - 1 ? (
              <>
                <Check className="size-4" /> Finish
              </>
            ) : (
              <>
                Next <ChevronRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
