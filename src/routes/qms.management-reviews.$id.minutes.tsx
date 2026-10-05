import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Download, FileCheck2, ShieldCheck } from "lucide-react";
import { getManagementReview } from "@/services/governance";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { SignatureDialog } from "@/components/grc/record";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/qms/management-reviews/$id/minutes")({
  head: () => ({ meta: [{ title: "Signed Minutes — Quantbit Compliance AI" }] }),
  component: MinutesViewer,
});

function MinutesViewer() {
  const { id } = Route.useParams();
  const { data: review } = useQuery({
    queryKey: ["management-review", id],
    queryFn: () => getManagementReview(id),
  });
  return (
    <div className="mx-auto max-w-[1200px] space-y-4">
      <Breadcrumbs
        items={[
          { label: "Management Review", to: "/qms/management-reviews" },
          { label: id, to: "/qms/management-reviews/$id" },
          { label: "Signed minutes" },
        ]}
      />
      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Signed Minutes Viewer</h1>
          <p className="text-sm text-muted-foreground">
            Immutable leadership record with decision and output traceability.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="size-4" /> Export signed PDF
          </Button>
          <SignatureDialog
            recordId={review?.signedMinutes.documentId ?? id}
            label="Apply Human Signature"
          />
        </div>
      </header>
      <article className="enterprise-panel p-8 md:p-12">
        <div className="border-b pb-6 text-center">
          <FileCheck2 className="mx-auto size-8 text-primary" />
          <h2 className="mt-3 text-xl font-semibold">{review?.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Minutes · {review?.heldOn} · Mumbai Corporate Office + Teams
          </p>
        </div>
        <div className="mt-8 space-y-8">
          <section>
            <h3 className="font-semibold">Attendance and quorum</h3>
            <p className="mt-2 text-sm leading-6">
              Six attendees were present, including five voting members. The chair confirmed quorum
              before starting the agenda.
            </p>
          </section>
          <section>
            <h3 className="font-semibold">Input coverage</h3>
            <p className="mt-2 text-sm leading-6">
              All 16 required management-review inputs were presented with linked evidence. The
              locked briefing pack forms part of this record.
            </p>
          </section>
          <section>
            <h3 className="font-semibold">Decisions and outputs</h3>
            <ol className="mt-3 space-y-3">
              {review?.enrichedOutputs.map((output, index) => (
                <li key={output.id} className="rounded-lg border p-4">
                  <div className="text-xs font-semibold text-primary">
                    Decision {index + 1} · {output.type}
                  </div>
                  <p className="mt-1 text-sm">{output.decision}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Owner {output.owner} · Due {output.dueDate} · Task {output.taskId}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <div className="mt-10 grid gap-4 border-t pt-6 md:grid-cols-2">
          <div className="rounded-lg border border-compliant/30 bg-compliant-soft p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-compliant">
              <ShieldCheck className="size-4" /> Digitally signed
            </div>
            <div className="mt-2 text-xs">
              {review?.signedMinutes.signedBy} · {review?.signedMinutes.signedAt}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="size-4 text-compliant" /> SHA-256 verified
            </div>
            <div className="mt-2 break-all font-mono text-[10px] text-muted-foreground">
              {review?.signedMinutes.sha256}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
