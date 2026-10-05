import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  BellRing,
  CheckCheck,
  ChevronRight,
  Clock3,
  FileWarning,
  Radar,
  ShieldAlert,
} from "lucide-react";
import { getNotifications, type NotificationItem } from "@/services/work";
import { Breadcrumbs } from "@/components/grc/widgets";
import { SeverityBadge } from "@/components/grc/badges";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Quantbit Compliance AI" },
      {
        name: "description",
        content: "Grouped regulatory, deadline, evidence, approval and escalation notifications.",
      },
    ],
  }),
  component: NotificationsCenter,
});

const typeMeta: Record<NotificationItem["type"], { icon: typeof Bell; tone: string }> = {
  Regulatory: { icon: Radar, tone: "text-ai bg-ai-soft" },
  Deadline: { icon: Clock3, tone: "text-attention-foreground bg-attention-soft" },
  Evidence: { icon: FileWarning, tone: "text-primary bg-primary-soft" },
  Approval: { icon: CheckCheck, tone: "text-compliant bg-compliant-soft" },
  Escalation: { icon: ShieldAlert, tone: "text-critical bg-critical-soft" },
};

function NotificationsCenter() {
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    staleTime: 30_000,
  });
  const [read, setRead] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const items = useMemo(
    () =>
      (query.data ?? []).filter(
        (item) => filter === "all" || (item.unread && !read.includes(item.id)),
      ),
    [query.data, filter, read],
  );
  const groups = (
    ["Escalation", "Regulatory", "Approval", "Evidence", "Deadline"] as NotificationItem["type"][]
  )
    .map((type) => ({ type, items: items.filter((item) => item.type === type) }))
    .filter((group) => group.items.length);
  const unreadCount = (query.data ?? []).filter(
    (item) => item.unread && !read.includes(item.id),
  ).length;
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Breadcrumbs items={[{ label: "Home", to: "/command-center" }, { label: "Notifications" }]} />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Notifications Center</h1>
            <span className="rounded-full bg-critical px-2 py-0.5 text-xs font-semibold text-critical-foreground">
              {unreadCount} unread
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Regulatory changes, workflow decisions, evidence events and escalations in one triage
            queue.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setRead((query.data ?? []).map((item) => item.id))}
        >
          <CheckCheck className="size-4" /> Mark all read
        </Button>
      </div>
      <div className="flex gap-2">
        {(["all", "unread"] as const).map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs capitalize",
              filter === value && "border-primary bg-primary-soft text-primary",
            )}
          >
            {value}
          </button>
        ))}
      </div>
      {query.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        groups.map((group) => {
          const meta = typeMeta[group.type];
          return (
            <section key={group.type} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={cn("grid size-7 place-items-center rounded-md", meta.tone)}>
                  <meta.icon className="size-4" />
                </div>
                <h2 className="text-sm font-semibold">{group.type}</h2>
                <span className="text-xs text-muted-foreground">{group.items.length}</span>
              </div>
              <div className="enterprise-panel divide-y overflow-hidden">
                {group.items.map((item) => {
                  const isRead = read.includes(item.id) || !item.unread;
                  return (
                    <Link
                      key={item.id}
                      to={item.to}
                      search={{ filter: item.filter }}
                      onClick={() => setRead((current) => [...current, item.id])}
                      className={cn(
                        "grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 p-4 transition hover:bg-muted/40",
                        !isRead && "bg-primary-soft/20",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1 size-2 rounded-full",
                          isRead ? "bg-border-strong" : "bg-primary",
                        )}
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{item.title}</span>
                          <SeverityBadge severity={item.severity} />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{item.detail}</div>
                        <div className="mt-1 text-[11px] text-muted-foreground">{item.at}</div>
                      </div>
                      <ChevronRight className="mt-2 size-4 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
      {!query.isPending && items.length === 0 && (
        <div className="rounded-lg border border-dashed py-20 text-center">
          <BellRing className="mx-auto size-8 text-compliant" />
          <h2 className="mt-3 font-semibold">You’re all caught up</h2>
          <p className="mt-1 text-sm text-muted-foreground">No unread notifications remain.</p>
        </div>
      )}
    </div>
  );
}
