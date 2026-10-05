import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BellRing,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Columns3,
  LayoutList,
  Send,
  UserRoundCog,
} from "lucide-react";
import { toast } from "sonner";
import {
  bulkWorkAction,
  getMyWork,
  moveWorkItem,
  type BoardState,
  type WorkItem,
  type WorkTab,
} from "@/services/work";
import { Breadcrumbs } from "@/components/grc/widgets";
import { DueDateIndicator, SeverityBadge, StatusBadge } from "@/components/grc/badges";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const searchSchema = (search: Record<string, unknown>) => ({
  filter: typeof search.filter === "string" ? search.filter : undefined,
});
export const Route = createFileRoute("/my-work")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "My Work — Quantbit Compliance AI" },
      {
        name: "description",
        content: "Personal work, approvals, evidence and delegated compliance tasks.",
      },
    ],
  }),
  component: MyWork,
});

const tabMeta: { value: WorkTab; label: string }[] = [
  { value: "assigned", label: "Assigned to me" },
  { value: "approval", label: "Awaiting my approval" },
  { value: "evidence", label: "Awaiting evidence" },
  { value: "overdue", label: "Overdue" },
  { value: "week", label: "Due this week" },
  { value: "watching", label: "Watching" },
  { value: "delegated", label: "Delegated" },
  { value: "completed", label: "Completed" },
];
const boardStates: BoardState[] = ["To do", "In progress", "In review", "Done"];

function filterToTab(filter?: string): WorkTab {
  return (
    [
      "assigned",
      "approval",
      "evidence",
      "overdue",
      "week",
      "watching",
      "delegated",
      "completed",
    ] as WorkTab[]
  ).includes(filter as WorkTab)
    ? (filter as WorkTab)
    : "assigned";
}

function MyWork() {
  const search = Route.useSearch();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<WorkTab>(filterToTab(search.filter));
  const [view, setView] = useState<"table" | "board" | "calendar">("table");
  const [selected, setSelected] = useState<string[]>([]);
  const [savedView, setSavedView] = useState("My priority work");
  const query = useQuery({ queryKey: ["my-work"], queryFn: getMyWork, staleTime: 30_000 });
  const moveMutation = useMutation({
    mutationFn: ({ id, state }: { id: string; state: BoardState }) => moveWorkItem(id, state),
    onMutate: async ({ id, state }) => {
      await queryClient.cancelQueries({ queryKey: ["my-work"] });
      const previous = queryClient.getQueryData<WorkItem[]>(["my-work"]);
      queryClient.setQueryData<WorkItem[]>(["my-work"], (items = []) =>
        items.map((item) => (item.id === id ? { ...item, boardState: state } : item)),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      queryClient.setQueryData(["my-work"], context?.previous);
      toast.error("Workflow move was rolled back");
    },
    onSuccess: () => toast.success("Work item state updated"),
  });
  const bulkMutation = useMutation({
    mutationFn: ({ action }: { action: "assign" | "remind" }) => bulkWorkAction(selected, action),
    onSuccess: (_result, input) => {
      toast.success(
        input.action === "assign"
          ? `${selected.length} items assigned`
          : `Reminders sent for ${selected.length} items`,
      );
      setSelected([]);
    },
  });
  const all = useMemo(() => query.data ?? [], [query.data]);
  const items = useMemo(() => all.filter((item) => item.tabs.includes(tab)), [all, tab]);
  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs items={[{ label: "Home", to: "/command-center" }, { label: "My Work" }]} />
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Work</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tasks, decisions and evidence routed to Ananya Rao · Group Compliance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={savedView} onValueChange={setSavedView}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "My priority work",
                "Critical this week",
                "GST oversight",
                "Entity escalations",
              ].map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="inline-flex rounded-md border bg-surface p-1">
            <Button
              size="sm"
              variant={view === "table" ? "secondary" : "ghost"}
              onClick={() => setView("table")}
            >
              <LayoutList className="size-4" /> Table
            </Button>
            <Button
              size="sm"
              variant={view === "board" ? "secondary" : "ghost"}
              onClick={() => setView("board")}
            >
              <Columns3 className="size-4" /> Board
            </Button>
            <Button
              size="sm"
              variant={view === "calendar" ? "secondary" : "ghost"}
              onClick={() => setView("calendar")}
            >
              <CalendarDays className="size-4" /> Calendar
            </Button>
          </div>
        </div>
      </div>
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setTab(value as WorkTab);
          setSelected([]);
        }}
      >
        <TabsList className="h-auto w-full justify-start overflow-x-auto bg-transparent p-0">
          {tabMeta.map((item) => (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              {item.label}
              <span className="ml-1.5 rounded-full bg-muted px-1.5 text-[10px]">
                {all.filter((work) => work.tabs.includes(item.value)).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {selected.length > 0 && (
        <div className="sticky top-16 z-20 flex items-center gap-3 rounded-lg border border-primary/30 bg-surface p-3 shadow-overlay">
          <b className="text-sm">{selected.length} selected</b>
          <Button size="sm" onClick={() => bulkMutation.mutate({ action: "assign" })}>
            <UserRoundCog className="size-4" /> Bulk assign
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => bulkMutation.mutate({ action: "remind" })}
          >
            <Send className="size-4" /> Bulk remind
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
            Clear
          </Button>
        </div>
      )}
      {query.isPending ? (
        <Skeleton className="h-96 w-full" />
      ) : view === "table" ? (
        <WorkTable items={items} selected={selected} onToggle={toggle} />
      ) : view === "board" ? (
        <WorkBoard items={items} onMove={(id, state) => moveMutation.mutate({ id, state })} />
      ) : (
        <WorkCalendar items={items} />
      )}
    </div>
  );
}

function Sla({ hours }: { hours: number }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        hours < 0
          ? "bg-critical-soft text-critical"
          : hours <= 24
            ? "bg-attention-soft text-attention-foreground"
            : "bg-compliant-soft text-compliant",
      )}
    >
      <BellRing className="size-3" />
      {hours < 0 ? `${Math.abs(hours)}h breached` : `${hours}h remaining`}
    </span>
  );
}

function WorkTable({
  items,
  selected,
  onToggle,
}: {
  items: WorkItem[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="enterprise-panel overflow-x-auto">
      <table className="w-full min-w-[1050px] text-left text-sm">
        <thead className="border-b bg-muted/45 text-xs text-muted-foreground">
          <tr>
            <th className="w-10 p-3"></th>
            <th className="p-3">Work item</th>
            <th className="p-3">Entity</th>
            <th className="p-3">Owner / reviewer</th>
            <th className="p-3">Due</th>
            <th className="p-3">Priority</th>
            <th className="p-3">Evidence</th>
            <th className="p-3">SLA</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-muted/40">
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => onToggle(item.id)}
                  aria-label={`Select ${item.id}`}
                />
              </td>
              <td className="p-3">
                <div className="max-w-sm font-medium">{item.title}</div>
                <div className="mt-1 font-mono text-[11px] text-primary">{item.id}</div>
              </td>
              <td className="p-3 text-xs">{item.entityName}</td>
              <td className="p-3 text-xs">
                <div>{item.ownerName}</div>
                <div className="text-muted-foreground">Review: {item.reviewerName}</div>
              </td>
              <td className="p-3">
                <DueDateIndicator date={item.dueDate} />
              </td>
              <td className="p-3">
                <SeverityBadge severity={item.priority} />
              </td>
              <td className="p-3 text-xs">
                {item.evidenceComplete}/{item.evidenceRequired}
              </td>
              <td className="p-3">
                <Sla hours={item.slaHours} />
              </td>
              <td className="p-3">
                <StatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
        <div className="p-12 text-center text-sm text-muted-foreground">
          No work items in this view.
        </div>
      )}
    </div>
  );
}

function WorkBoard({
  items,
  onMove,
}: {
  items: WorkItem[];
  onMove: (id: string, state: BoardState) => void;
}) {
  const [dragged, setDragged] = useState<string | null>(null);
  return (
    <div className="grid gap-3 lg:grid-cols-4">
      {boardStates.map((state) => {
        const stateItems = items.filter((item) => item.boardState === state);
        return (
          <section
            key={state}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragged) onMove(dragged, state);
              setDragged(null);
            }}
            className="min-h-[480px] rounded-lg border bg-muted/25 p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">{state}</h2>
              <span className="rounded-full bg-surface px-2 text-xs">{stateItems.length}</span>
            </div>
            <div className="space-y-2">
              {stateItems.map((item) => (
                <article
                  key={item.id}
                  draggable
                  onDragStart={() => setDragged(item.id)}
                  className="cursor-grab rounded-lg border bg-surface p-3 shadow-panel active:cursor-grabbing"
                >
                  <div className="flex justify-between">
                    <span className="font-mono text-[10px] text-primary">{item.id}</span>
                    <SeverityBadge severity={item.priority} />
                  </div>
                  <div className="mt-2 text-sm font-medium leading-5">{item.title}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {item.entityName} · {item.ownerName}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Sla hours={item.slaHours} />
                    <span className="text-[10px] text-muted-foreground">
                      {item.evidenceComplete}/{item.evidenceRequired} evidence
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function WorkCalendar({ items }: { items: WorkItem[] }) {
  const days = Array.from({ length: 7 }, (_, index) => 4 + index);
  return (
    <div className="enterprise-panel overflow-hidden">
      <div className="flex items-center justify-between border-b p-3">
        <Button variant="ghost" size="icon">
          <ChevronLeft className="size-4" />
        </Button>
        <h2 className="text-sm font-semibold">Due this week · 04–10 Oct 2026</h2>
        <Button variant="ghost" size="icon">
          <ChevronRight className="size-4" />
        </Button>
      </div>
      <div className="grid min-w-[850px] grid-cols-7">
        {days.map((day) => (
          <div key={day} className="min-h-[430px] border-r p-2 last:border-r-0">
            <div className="text-center text-xs font-medium text-muted-foreground">
              {day === 4 ? "Sun" : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day - 5]}
              <div className="mt-1 text-lg text-foreground">{day}</div>
            </div>
            <div className="mt-3 space-y-2">
              {items
                .filter((item) => Number(item.dueDate.slice(0, 2)) === day)
                .map((item) => (
                  <div key={item.id} className="rounded-md border bg-surface p-2">
                    <div className="text-xs font-medium">{item.title}</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">{item.entityName}</div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
