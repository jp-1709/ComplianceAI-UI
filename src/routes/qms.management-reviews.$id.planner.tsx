import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, Clock3, GripVertical, Users } from "lucide-react";
import { toast } from "sonner";
import { getManagementReview } from "@/services/governance";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/qms/management-reviews/$id/planner")({
  head: () => ({ meta: [{ title: "Meeting Planner — Quantbit Compliance AI" }] }),
  component: MeetingPlanner,
});

function MeetingPlanner() {
  const { id } = Route.useParams();
  const { data: review } = useQuery({
    queryKey: ["management-review", id],
    queryFn: () => getManagementReview(id),
  });
  const votingPresent =
    review?.attendees.filter((item) => item.attended && item.voting).length ?? 0;
  const votingTotal = review?.attendees.filter((item) => item.voting).length ?? 0;
  return (
    <div className="mx-auto max-w-[1500px] space-y-4">
      <Breadcrumbs
        items={[
          { label: "Management Review", to: "/qms/management-reviews" },
          { label: id, to: "/qms/management-reviews/$id" },
          { label: "Meeting Planner" },
        ]}
      />
      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold">Meeting Planner</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Confirm schedule, agenda ownership, attendance and decision quorum.
          </p>
        </div>
        <Button onClick={() => toast.success("Invitations sent and agenda published")}>
          <CalendarClock className="size-4" /> Publish agenda & invitations
        </Button>
      </header>
      <div className="grid gap-4 xl:grid-cols-[1fr_.8fr]">
        <div className="space-y-4">
          <Panel title="Meeting logistics">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-medium">
                Date & time
                <Input className="mt-1" defaultValue="30-Jun-2026 14:00" />
              </label>
              <label className="text-xs font-medium">
                Venue / link
                <Input className="mt-1" defaultValue="Mumbai Boardroom + Teams" />
              </label>
              <label className="text-xs font-medium">
                Chair
                <Input className="mt-1" defaultValue={review?.chair} />
              </label>
              <label className="text-xs font-medium">
                Minute secretary
                <Input className="mt-1" defaultValue="Ananya Rao" />
              </label>
            </div>
          </Panel>
          <Panel title="Agenda planner">
            <div className="space-y-2">
              {review?.agenda.slice(0, 8).map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <GripVertical className="size-4 text-muted-foreground" />
                  <span className="text-xs font-semibold">{index + 1}</span>
                  <span className="flex-1 text-sm">{item.label}</span>
                  <Clock3 className="size-3.5 text-muted-foreground" />
                  <span className="text-xs">{item.minutes} min</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <aside className="space-y-4">
          <Panel title="Attendance & quorum">
            <div className="rounded-lg border border-compliant/30 bg-compliant-soft p-3 text-sm text-compliant">
              <CheckCircle2 className="mr-2 inline size-4" /> Quorum projected: {votingPresent}/
              {votingTotal} voting members
            </div>
            <div className="mt-3 space-y-2">
              {review?.attendees.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="grid size-7 place-items-center rounded-full bg-primary-soft text-[10px] font-semibold">
                      {person.initials}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{person.name}</div>
                      <div className="text-[10px] text-muted-foreground">{person.title}</div>
                    </div>
                  </div>
                  <span
                    className={`text-xs ${person.attended ? "text-compliant" : "text-attention-foreground"}`}
                  >
                    {person.attended ? "Accepted" : "Awaiting"}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Quorum rule">
            <div className="flex gap-2 text-sm">
              <Users className="mt-0.5 size-4 text-primary" />
              <span>
                Chair plus at least three voting members. AI and delegates never count toward
                quorum.
              </span>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
