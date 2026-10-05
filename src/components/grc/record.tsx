import { useState, type ReactNode } from "react";
import { Check, ChevronRight, Circle, MoreHorizontal, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function RecordHeader({
  id,
  title,
  meta,
  badges,
  primaryAction,
}: {
  id: string;
  title: string;
  meta: ReactNode;
  badges?: ReactNode;
  primaryAction?: ReactNode;
}) {
  return (
    <div className="enterprise-panel p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{id}</span>
            {badges}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {meta}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {primaryAction}
          <Button variant="outline" size="icon" aria-label="More record actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface WorkflowStep {
  label: string;
  state: "complete" | "current" | "upcoming";
  detail?: string;
}

export function WorkflowStepper({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="overflow-x-auto pb-1">
      <ol className="flex min-w-[900px] items-start">
        {steps.map((step, index) => (
          <li key={step.label} className="flex min-w-0 flex-1 items-start">
            <div className="min-w-0 flex-1">
              <div className="flex items-center">
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border text-xs",
                    step.state === "complete" &&
                      "border-compliant bg-compliant text-compliant-foreground",
                    step.state === "current" &&
                      "border-primary bg-primary text-primary-foreground ring-4 ring-primary-soft",
                    step.state === "upcoming" &&
                      "border-border-strong bg-surface text-muted-foreground",
                  )}
                >
                  {step.state === "complete" ? (
                    <Check className="size-3.5" />
                  ) : step.state === "current" ? (
                    <Sparkles className="size-3.5" />
                  ) : (
                    <Circle className="size-2.5" />
                  )}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-px flex-1",
                      step.state === "complete" ? "bg-compliant" : "bg-border-strong",
                    )}
                  />
                )}
              </div>
              <div className="mt-2 pr-3 text-xs font-medium">{step.label}</div>
              {step.detail && (
                <div className="mt-0.5 pr-3 text-[10px] text-muted-foreground">{step.detail}</div>
              )}
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="mt-1.5 hidden size-3 text-muted-foreground" />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function KeyValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}

export function SignatureDialog({
  recordId,
  label = "Sign minutes",
}: {
  recordId: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ShieldCheck className="size-4" /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply human digital signature</DialogTitle>
          <DialogDescription>
            Signing locks {recordId}, records the signer identity and timestamp, and creates a
            tamper-evident audit event.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-ai/30 bg-ai-soft p-3 text-sm text-ai">
          <Sparkles className="mr-2 inline size-4" /> AI may prepare or summarise minutes, but it
          can never sign, approve, attest, or override quorum.
        </div>
        <div className="space-y-2">
          <Label htmlFor="signer-name">Type your full name</Label>
          <Input
            id="signer-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Authorised signer name"
          />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <Checkbox checked={confirmed} onCheckedChange={(value) => setConfirmed(Boolean(value))} />
          <span>
            I confirm that I reviewed the complete record and am applying my own signature.
          </span>
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!confirmed || name.trim().length < 3}
            onClick={() => {
              toast.success(`${recordId} signed by ${name}`);
              setOpen(false);
            }}
          >
            Apply signature
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
