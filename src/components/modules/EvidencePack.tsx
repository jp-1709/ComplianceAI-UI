import { Download, Eye, FileCheck2, Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { EvidenceRecord, ModuleId } from "@/data/types";
import { entities, people } from "@/data/kfc";
import { RecordLink } from "@/components/grc/RecordLink";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { Button } from "@/components/ui/button";

export function ModuleEvidencePack({
  module,
  title,
  records,
}: {
  module: ModuleId;
  title: string;
  records: EvidenceRecord[];
}) {
  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <Breadcrumbs
        items={[
          { label: title, to: `/${module === "secretarial" ? "secretarial" : module}` },
          { label: "Evidence Pack" },
        ]}
      />
      <header className="enterprise-panel flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShieldCheck className="size-4" /> Audit-ready export
          </div>
          <h1 className="mt-1 text-2xl font-semibold">{title} Evidence Pack</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Indexed source records with ownership, entity, SHA-256 integrity and access provenance.
          </p>
        </div>
        <Button onClick={() => toast.success(`${title} evidence pack queued for export`)}>
          <Download className="size-4" /> Export Evidence Pack
        </Button>
      </header>
      <div className="grid gap-3 md:grid-cols-4">
        <PackMetric label="Evidence records" value={records.length} />
        <PackMetric label="Hashes verified" value={records.length} />
        <PackMetric
          label="Linked obligations"
          value={new Set(records.flatMap((item) => item.linkedRecordIds)).size}
        />
        <PackMetric
          label="Access events"
          value={records.reduce((sum, item) => sum + item.accessHistory.length, 0)}
        />
      </div>
      <Panel title="Evidence index">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="p-3">Record</th>
                <th className="p-3">Entity / owner</th>
                <th className="p-3">Issue / expiry</th>
                <th className="p-3">SHA-256</th>
                <th className="p-3">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="p-3">
                    <div className="flex items-start gap-2">
                      <FileCheck2 className="mt-0.5 size-4 text-primary" />
                      <div>
                        <RecordLink id={record.id} className="text-xs font-semibold" />
                        <div className="font-medium">{record.title}</div>
                        <div className="text-xs text-muted-foreground">{record.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-xs">
                    <div>{entities.find((item) => item.id === record.entityId)?.shortName}</div>
                    <div className="text-muted-foreground">
                      {people.find((item) => item.id === record.ownerId)?.name}
                    </div>
                  </td>
                  <td className="p-3 text-xs">
                    <div>{record.issuedOn}</div>
                    <div className="text-muted-foreground">
                      {record.expiresOn ? `Expires ${record.expiresOn}` : "No expiry"}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex max-w-52 items-center gap-1 font-mono text-[10px]">
                      <Lock className="size-3 shrink-0" />
                      <span className="truncate">{record.sha256}</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs">
                    <div>{record.accessHistory.length} events</div>
                    <Button variant="ghost" size="sm" className="mt-1 h-6 px-1">
                      <Eye className="size-3" /> Access history
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="rounded-lg border border-attention/30 bg-attention-soft p-3 text-xs">
        External-auditor exports are automatically watermarked and exclude restricted records unless
        explicitly authorised.
      </div>
    </div>
  );
}

function PackMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="enterprise-panel p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
