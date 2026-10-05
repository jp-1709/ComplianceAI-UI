import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  List,
  Lock,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { getCalendarTasks, rescheduleTask, type CalendarTaskView } from "@/services/workspaces";
import { parseDate } from "@/lib/date";
import { EnterpriseDataTable } from "@/components/grc/EnterpriseDataTable";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { DueDateIndicator, SeverityBadge, StatusBadge } from "@/components/grc/badges";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const searchSchema = (search: Record<string, unknown>) => ({
  filter: typeof search.filter === "string" ? search.filter : undefined,
});

export const Route = createFileRoute("/calendar")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Compliance Calendar — Quantbit Compliance AI" },
      {
        name: "description",
        content: "Statutory deadlines, operational tasks and evidence readiness.",
      },
    ],
  }),
  component: ComplianceCalendar,
});

function formatDate(day: number) {
  return `${String(day).padStart(2, "0")}-Oct-2026`;
}

function ComplianceCalendar() {
  const search = Route.useSearch();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["calendar-tasks"],
    queryFn: getCalendarTasks,
    staleTime: 30_000,
  });
  const [selected, setSelected] = useState<CalendarTaskView | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: ({ id, dueDate }: { id: string; dueDate: string }) => rescheduleTask(id, dueDate),
    onMutate: async ({ id, dueDate }) => {
      await queryClient.cancelQueries({ queryKey: ["calendar-tasks"] });
      const previous = queryClient.getQueryData<CalendarTaskView[]>(["calendar-tasks"]);
      queryClient.setQueryData<CalendarTaskView[]>(["calendar-tasks"], (items = []) =>
        items.map((item) => (item.id === id ? { ...item, dueDate } : item)),
      );
      return { previous };
    },
    onError: (error, _input, context) => {
      queryClient.setQueryData(["calendar-tasks"], context?.previous);
      toast.error(error.message);
    },
    onSuccess: () => toast.success("Operational target rescheduled and audit trail updated"),
  });
  const tasks = query.data ?? [];
  const columns = useMemo<ColumnDef<CalendarTaskView>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Task",
        cell: ({ row }) => (
          <div className="max-w-[360px]">
            <div className="font-mono text-xs text-primary">{row.original.id}</div>
            <div className="mt-1 truncate font-medium">{row.original.title}</div>
          </div>
        ),
      },
      { accessorKey: "entityName", header: "Entity" },
      { accessorKey: "ownerName", header: "Owner" },
      {
        accessorKey: "dueDate",
        header: "Due date",
        cell: ({ row }) => (
          <DueDateIndicator date={row.original.dueDate} locked={row.original.statutoryLocked} />
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ row }) => <SeverityBadge severity={row.original.priority} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    [],
  );

  const days = Array.from({ length: 35 }, (_, index) => index - 2);
  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <Breadcrumbs
        items={[{ label: "Home", to: "/command-center" }, { label: "Compliance Calendar" }]}
      />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Compliance Calendar</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Coordinate obligations and operational work without compromising statutory deadlines.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline">October 2026</Button>
          <Button variant="outline">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Due this month", value: tasks.length },
          { label: "Statutory locked", value: tasks.filter((x) => x.statutoryLocked).length },
          { label: "Overdue", value: tasks.filter((x) => x.status === "overdue").length },
          {
            label: "Evidence incomplete",
            value: tasks.filter((x) => x.evidenceSubmitted.length < x.evidenceRequired.length)
              .length,
          },
        ].map((item) => (
          <div key={item.label} className="enterprise-panel p-4">
            <div className="text-xs text-muted-foreground">{item.label}</div>
            <div className="mt-1 text-2xl font-semibold">{item.value}</div>
          </div>
        ))}
      </div>
      <Tabs defaultValue="month">
        <TabsList>
          <TabsTrigger value="month">
            <CalendarDays className="mr-1 size-4" /> Month
          </TabsTrigger>
          <TabsTrigger value="annual">Annual</TabsTrigger>
          <TabsTrigger value="list">
            <List className="mr-1 size-4" /> Task list
          </TabsTrigger>
        </TabsList>
        <TabsContent value="month">
          <div className="enterprise-panel overflow-hidden">
            <div className="grid grid-cols-7 border-b bg-muted/40">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className="border-r px-2 py-2 text-center text-xs font-medium text-muted-foreground last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const current = day >= 1 && day <= 31;
                const dayTasks = current
                  ? tasks.filter(
                      (task) =>
                        parseDate(task.dueDate).getDate() === day &&
                        parseDate(task.dueDate).getMonth() === 9,
                    )
                  : [];
                return (
                  <div
                    key={day}
                    onDragOver={(event) => {
                      if (current) event.preventDefault();
                    }}
                    onDrop={() => {
                      if (!current || !draggedId) return;
                      const task = tasks.find((x) => x.id === draggedId);
                      if (task?.statutoryLocked)
                        return toast.error(
                          "Statutory dates are locked by the governing due-date rule",
                        );
                      mutation.mutate({ id: draggedId, dueDate: formatDate(day) });
                      setDraggedId(null);
                    }}
                    className={cn(
                      "min-h-32 border-b border-r p-2 last:border-r-0",
                      !current && "bg-muted/25",
                    )}
                  >
                    <div
                      className={cn(
                        "text-xs",
                        current ? "text-foreground" : "text-muted-foreground/40",
                      )}
                    >
                      {current ? day : day < 1 ? 30 + day : day - 31}
                    </div>
                    <div className="mt-2 space-y-1">
                      {dayTasks.map((task) => (
                        <button
                          key={task.id}
                          draggable={!task.statutoryLocked}
                          onDragStart={() => setDraggedId(task.id)}
                          onClick={() => setSelected(task)}
                          className={cn(
                            "block w-full rounded-md border p-1.5 text-left text-[10px] leading-4 transition hover:border-primary",
                            task.status === "overdue"
                              ? "border-critical/30 bg-critical-soft"
                              : "bg-surface",
                            !task.statutoryLocked && "cursor-grab active:cursor-grabbing",
                          )}
                        >
                          <div className="flex items-center gap-1">
                            {task.statutoryLocked && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Lock className="size-3 shrink-0 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  Locked statutory deadline calculated from the governing
                                  regulation.
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <span className="truncate font-medium">{task.title}</span>
                          </div>
                          <div className="truncate text-muted-foreground">{task.entityName}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Lock className="size-3" /> Statutory dates cannot be dragged
            </span>
            <span>Operational targets can be dragged; every change is audited.</span>
          </div>
        </TabsContent>
        <TabsContent value="annual">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {MONTHS.map((month, index) => {
              const monthTasks = tasks.filter(
                (task) => parseDate(task.dueDate).getMonth() === index,
              );
              return (
                <div key={month} className="enterprise-panel p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{month} 2026</h3>
                    <span className="text-xs text-muted-foreground">{monthTasks.length} tasks</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, monthTasks.length * 18)}%` }}
                    />
                  </div>
                  <div className="mt-3 space-y-1 text-xs">
                    {monthTasks.slice(0, 3).map((task) => (
                      <button
                        key={task.id}
                        onClick={() => setSelected(task)}
                        className="block w-full truncate text-left hover:text-primary"
                      >
                        {task.dueDate} · {task.title}
                      </button>
                    ))}
                    {monthTasks.length === 0 && (
                      <span className="text-muted-foreground">No scheduled work</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="list">
          <EnterpriseDataTable
            data={tasks}
            columns={columns}
            loading={query.isPending}
            initialSearch={search.filter ?? ""}
            onRowClick={setSelected}
            searchPlaceholder="Search tasks, owners or entities…"
          />
        </TabsContent>
      </Tabs>
      <TaskDetail task={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function TaskDetail({ task, onClose }: { task: CalendarTaskView | null; onClose: () => void }) {
  return (
    <Sheet open={Boolean(task)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {task?.id} · {task?.title}
          </SheetTitle>
          <SheetDescription>Calendar task execution and review record</SheetDescription>
        </SheetHeader>
        {task && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={task.status} />
              <SeverityBadge severity={task.priority} />
              {task.statutoryLocked && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                  <Lock className="size-3" /> Statutory date
                </span>
              )}
            </div>
            <Panel title="Execution">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Owner</span>
                  <div className="mt-1 flex items-center gap-2">
                    <UserRound className="size-4" />
                    {task.ownerName}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Reviewer</span>
                  <div className="mt-1">{task.reviewerName}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Entity</span>
                  <div className="mt-1">{task.entityName}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Due</span>
                  <div className="mt-1">
                    <DueDateIndicator date={task.dueDate} locked={task.statutoryLocked} />
                  </div>
                </div>
              </div>
            </Panel>
            <Panel title="Checklist">
              <div className="space-y-2">
                {task.checklist.map((step) => (
                  <label
                    key={step.label}
                    className="flex items-center gap-2 rounded-md border p-3 text-sm"
                  >
                    <input type="checkbox" defaultChecked={step.complete} />
                    <span>{step.label}</span>
                    {step.complete && <CheckCircle2 className="ml-auto size-4 text-compliant" />}
                  </label>
                ))}
              </div>
            </Panel>
            <div className="grid gap-4 sm:grid-cols-2">
              <Panel title="Evidence required">
                <div className="space-y-2 text-sm">
                  {task.evidenceRequired.map((item, index) => (
                    <div key={item} className="flex justify-between">
                      <span>{item}</span>
                      {task.evidenceSubmitted[index] ? (
                        <span className="text-compliant">{task.evidenceSubmitted[index]}</span>
                      ) : (
                        <span className="text-critical">Missing</span>
                      )}
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="Escalation">
                <div className="flex gap-2 text-sm">
                  <CircleAlert className="size-4 shrink-0 text-attention" />
                  {task.escalation}
                </div>
              </Panel>
            </div>
            <Button className="w-full">Send to {task.reviewerName} for Review</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
