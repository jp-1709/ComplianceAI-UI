import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  ClipboardCheck,
  FileClock,
  GitBranch,
  Send,
  ShieldAlert,
  Sparkles,
  Wrench,
} from "lucide-react";
import { getAiWorkspace } from "@/services/platform";
import { RecordLink } from "@/components/grc/RecordLink";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const queueMeta = {
  obligations: { label: "Obligation mapping", icon: GitBranch },
  risks: { label: "Risk suggestions", icon: ShieldAlert },
  capas: { label: "CAPA root-cause drafts", icon: Wrench },
  audits: { label: "Audit checklist drafts", icon: ClipboardCheck },
};
export const Route = createFileRoute("/ai-assistant")({ component: AiWorkspace });
function AiWorkspace() {
  const { data } = useQuery({ queryKey: ["ai-workspace"], queryFn: getAiWorkspace });
  const [input, setInput] = useState("");
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs items={[{ label: "Home", to: "/command-center" }, { label: "AI Assistant" }]} />
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase text-ai">
          <Sparkles className="size-4" /> Human-controlled assistance
        </div>
        <h1 className="mt-1 text-2xl font-semibold">AI Assistant</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Draft, map, summarise and recommend—with source evidence and permanent human decision
          history.
        </p>
      </div>
      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">Chat workspace</TabsTrigger>
          <TabsTrigger value="reviews">Review queues</TabsTrigger>
          <TabsTrigger value="log">AI Decision Log</TabsTrigger>
          <TabsTrigger value="governance">Usage governance</TabsTrigger>
        </TabsList>
        <TabsContent value="chat">
          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <section className="enterprise-panel flex min-h-[620px] flex-col">
              <div className="border-b p-4 text-sm font-semibold">
                Compliance copilot · sources required
              </div>
              <div className="flex-1 space-y-4 p-5">
                <div className="max-w-2xl rounded-xl bg-muted p-4 text-sm">
                  Show me the highest-priority issues that require a human decision before the next
                  leadership review.
                </div>
                <div className="ml-auto max-w-3xl rounded-xl border border-ai/30 bg-ai-soft p-4 text-sm">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-ai">
                    <Sparkles className="size-3.5" /> AI draft · qca-2.3 · 87% confidence
                  </div>
                  <p>
                    Three decisions are material: treatment escalation for RSK-0001, independent
                    reassignment for CAPA-0002, and response strategy for GST-NOT-001.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["RSK-0001", "CAPA-0002", "GST-NOT-001"].map((id) => (
                      <span key={id} className="rounded bg-surface px-2 py-1 text-xs">
                        <RecordLink id={id} />
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Assumption: current entity scope and Q2 FY27 period. Missing: vendor
                    installation date for Delhi sensors.
                  </div>
                </div>
              </div>
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask about obligations, evidence, risks, CAPAs or audits…"
                  />
                  <Button disabled={!input}>
                    <Send className="size-4" /> Send
                  </Button>
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  AI responses are drafts. Verify sources before accepting or editing.
                </div>
              </div>
            </section>
            <Panel title="Suggested prompts">
              <div className="space-y-2">
                {[
                  "Summarise regulatory changes awaiting impact assessment",
                  "Draft a risk treatment comparison for RSK-0001",
                  "Find evidence gaps for Hyderabad monitoring",
                  "Prepare management review briefing notes",
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setInput(item)}
                    className="w-full rounded-lg border p-3 text-left text-xs hover:border-ai/40"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </Panel>
          </div>
        </TabsContent>
        <TabsContent value="reviews">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(queueMeta).map(([type, meta]) => (
              <Panel
                key={type}
                title={
                  <span className="flex items-center gap-2">
                    <meta.icon className="size-4 text-ai" />
                    {meta.label}
                  </span>
                }
              >
                <div className="space-y-2">
                  {data?.queues[type as keyof typeof data.queues].map((item) => (
                    <Link
                      key={item.id}
                      to="/ai-assistant/review/$type/$id"
                      params={{ type, id: item.id }}
                      className="block rounded-lg border p-3 hover:border-ai/40"
                    >
                      <div className="flex justify-between gap-3">
                        <span className="font-mono text-xs text-ai">{item.id}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {item.confidence}% confidence
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-medium">{item.title}</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {item.source} → {item.target} · {item.status}
                      </div>
                    </Link>
                  ))}
                </div>
              </Panel>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="log">
          <Panel
            title="Permanent AI Decision Log"
            action={
              <span className="text-xs text-muted-foreground">
                Immutable · retained with audit trail
              </span>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="p-3">Log / user / time</th>
                    <th className="p-3">Suggestion</th>
                    <th className="p-3">Model & sources</th>
                    <th className="p-3">Human decision</th>
                    <th className="p-3">Final human-edited result</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data?.decisions.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3 text-xs">
                        <b className="font-mono">{item.id}</b>
                        <div>{item.user}</div>
                        <div className="text-muted-foreground">{item.time}</div>
                      </td>
                      <td className="max-w-sm p-3 text-xs">{item.suggestion}</td>
                      <td className="p-3 text-xs">
                        <div>{item.model}</div>
                        <div className="mt-1 flex flex-wrap gap-1 text-muted-foreground">
                          {item.sources.map((source) => (
                            <RecordLink key={source} id={source} className="text-[11px]" />
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-xs font-medium">{item.decision}</td>
                      <td className="max-w-sm p-3 text-xs">{item.finalResult}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </TabsContent>
        <TabsContent value="governance">
          <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
            <Panel title="AI is permanently forbidden to">
              <div className="grid gap-3 md:grid-cols-2">
                {data?.forbidden.map((item) => (
                  <div
                    key={item}
                    className="flex gap-2 rounded-lg border border-critical/20 bg-critical-soft/30 p-3 text-sm"
                  >
                    <FileClock className="size-4 shrink-0 text-critical" />
                    {item}
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Allowed assistance">
              <div className="space-y-2 text-sm">
                {[
                  "Draft and summarise",
                  "Classify and map records",
                  "Recommend with confidence",
                  "Extract source excerpts",
                  "Highlight assumptions and missing information",
                ].map((item) => (
                  <div key={item} className="flex gap-2">
                    <Bot className="size-4 text-ai" />
                    {item}
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
