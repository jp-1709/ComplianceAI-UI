import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock3, FileCheck2, Pause, Play, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { getManagementReview, outputTypes } from "@/services/governance";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/qms/management-reviews/$id/live")({
  head: () => ({ meta: [{ title: "Live Management Review — Quantbit Compliance AI" }] }),
  component: LiveMeeting,
});

function LiveMeeting() {
  const { id } = Route.useParams();
  const { data: review } = useQuery({
    queryKey: ["management-review", id],
    queryFn: () => getManagementReview(id),
  });
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(3240);
  const [agenda, setAgenda] = useState(11);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  const time = `${String(Math.floor(seconds / 3600)).padStart(2, "0")}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const current = review?.agenda[agenda];
  return (
    <div className="mx-auto max-w-[1800px] space-y-4">
      <Breadcrumbs
        items={[
          { label: "Management Review", to: "/qms/management-reviews" },
          { label: id, to: "/qms/management-reviews/$id" },
          { label: "Live Meeting Mode" },
        ]}
      />
      <header className="enterprise-panel flex flex-col justify-between gap-4 border-primary/30 p-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`size-2.5 rounded-full ${running ? "animate-pulse bg-critical" : "bg-attention"}`}
            />
            <h1 className="text-lg font-semibold">Live Meeting Mode</h1>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{review?.title}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="font-mono text-2xl font-semibold tabular-nums">{time}</div>
          <Button variant={running ? "outline" : "default"} onClick={() => setRunning(!running)}>
            {running ? <Pause className="size-4" /> : <Play className="size-4" />}
            {running ? "Pause" : "Resume"}
          </Button>
          <OutputDialog />
        </div>
      </header>
      <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
        <aside className="enterprise-panel overflow-hidden">
          <div className="border-b p-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Agenda progress</span>
              <span>{agenda + 1}/16</span>
            </div>
            <Progress value={((agenda + 1) / 16) * 100} className="mt-2" />
          </div>
          <div className="max-h-[680px] overflow-y-auto p-2">
            {review?.agenda.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setAgenda(index)}
                className={`mb-1 flex w-full items-start gap-2 rounded-lg p-2.5 text-left ${agenda === index ? "bg-primary-soft ring-1 ring-primary/30" : "hover:bg-muted"}`}
              >
                <span
                  className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[10px] ${index < agenda ? "bg-compliant text-white" : agenda === index ? "bg-primary text-white" : "bg-muted"}`}
                >
                  {index < agenda ? "✓" : index + 1}
                </span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </aside>
        <main className="space-y-4">
          <Panel
            title={`Agenda ${agenda + 1} · ${current?.label ?? "Review input"}`}
            action={
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock3 className="size-3" /> {current?.minutes ?? 7} min
              </span>
            }
          >
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  Relevant input
                </div>
                <div className="mt-2 text-sm font-medium">{current?.label}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Owner brief · trend · exceptions · requested decision
                </div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="text-xs font-semibold uppercase text-muted-foreground">
                  Evidence preview
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <FileCheck2 className="size-4 text-primary" /> 4 verified records
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Hashes and source links preserved
                </div>
              </div>
              <div className="rounded-lg border border-compliant/30 bg-compliant-soft p-4">
                <div className="text-xs font-semibold uppercase text-compliant">Coverage</div>
                <div className="mt-2 flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="size-4" /> Ready for decision
                </div>
              </div>
            </div>
            <div className="mt-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Meeting notes
              </div>
              <Textarea
                className="mt-2 min-h-36"
                placeholder="Capture factual discussion notes, challenge and evidence references…"
              />
            </div>
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Decision capture
              </div>
              <Textarea
                className="mt-2"
                placeholder="Record the chair-confirmed decision. AI can draft but cannot decide."
              />
            </div>
            <div className="mt-5 flex justify-between">
              <Button
                variant="outline"
                disabled={agenda === 0}
                onClick={() => setAgenda(Math.max(0, agenda - 1))}
              >
                Previous agenda item
              </Button>
              <Button
                onClick={() => {
                  toast.success("Notes and decision saved");
                  setAgenda(Math.min(15, agenda + 1));
                }}
              >
                Complete item & continue
              </Button>
            </div>
          </Panel>
        </main>
        <aside className="space-y-4">
          <Panel title="Attendance & quorum">
            <div className="rounded-lg bg-compliant-soft p-3 text-sm font-medium text-compliant">
              <Users className="mr-2 inline size-4" /> Quorum met · 5 voting members
            </div>
            <div className="mt-3 flex -space-x-2">
              {review?.attendees
                .filter((person) => person.attended)
                .map((person) => (
                  <span
                    key={person.id}
                    title={person.name}
                    className="grid size-8 place-items-center rounded-full border-2 border-surface bg-primary-soft text-[10px] font-semibold"
                  >
                    {person.initials}
                  </span>
                ))}
            </div>
          </Panel>
          <Panel title="Decisions captured">
            <div className="space-y-2">
              {review?.enrichedOutputs.map((output) => (
                <div key={output.id} className="rounded-lg border p-3">
                  <div className="text-[10px] font-semibold uppercase text-primary">
                    {output.type}
                  </div>
                  <div className="mt-1 text-xs font-medium">{output.decision}</div>
                  <div className="mt-2 text-[10px] text-muted-foreground">
                    {output.owner} · {output.dueDate}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
          <div className="rounded-lg border border-ai/30 bg-ai-soft p-3 text-xs text-ai">
            AI can surface relevant inputs and draft notes. It cannot count toward quorum, make
            decisions, create approvals, or sign minutes.
          </div>
        </aside>
      </div>
    </div>
  );
}

function OutputDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Create output
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create management-review output</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-medium">
            Output type
            <Select>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose output type" />
              </SelectTrigger>
              <SelectContent>
                {outputTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="text-xs font-medium">
            Owner
            <Input className="mt-1" placeholder="Assign accountable owner" />
          </label>
          <label className="text-xs font-medium">
            Due date
            <Input className="mt-1" defaultValue="31-Oct-2026" />
          </label>
          <label className="text-xs font-medium">
            Severity
            <Select>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                {["Critical", "Major", "Moderate", "Minor"].map((item) => (
                  <SelectItem key={item} value={item.toLowerCase()}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="text-xs font-medium sm:col-span-2">
            Standards affected
            <Input className="mt-1" placeholder="e.g. ISO 9001 9.3, FSSAI Schedule 4" />
          </label>
          <label className="text-xs font-medium sm:col-span-2">
            Decision and intended result
            <Textarea className="mt-1" placeholder="Capture the chair-confirmed decision…" />
          </label>
        </div>
        <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
          Training Initiative creates only a management-review output and downstream task. It does
          not create a separate training module.
        </div>
        <DialogFooter>
          <Button onClick={() => toast.success("Output and downstream task created")}>
            Create output & assign task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
