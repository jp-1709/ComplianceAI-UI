import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, FileCheck2, ShieldCheck } from "lucide-react";
import { getItcReconciliation } from "@/services/modules";
import { Breadcrumbs, Panel } from "@/components/grc/widgets";
import { KeyValue, RecordHeader } from "@/components/grc/record";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/tax/reconciliation/$id")({
  component: ReconciliationDetail,
});
function ReconciliationDetail() {
  const { id } = Route.useParams();
  const { data } = useQuery({ queryKey: ["itc", id], queryFn: () => getItcReconciliation(id) });
  if (!data) return <div className="py-20 text-center">Loading reconciliation…</div>;
  const variance = data.books - data.government;
  return (
    <div className="mx-auto max-w-[1500px] space-y-4">
      <Breadcrumbs items={[{ label: "Tax & GST", to: "/tax" }, { label: data.id }]} />
      <RecordHeader
        id={data.id}
        title={`${data.vendor} · ${data.invoice}`}
        meta={
          <>
            <span>{data.gstin}</span>
            <span>{data.type}</span>
            <span>Owner {data.owner}</span>
          </>
        }
        primaryAction={
          <Button onClick={() => toast.success("ITC treatment approved with an audit event")}>
            Approve ITC Treatment
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <Panel title="Books data">
          <div className="text-3xl font-semibold">₹{(data.books / 100000).toFixed(2)} lakh</div>
          <div className="mt-4 space-y-3">
            <KeyValue label="Invoice">{data.invoice}</KeyValue>
            <KeyValue label="Vendor GSTIN">{data.gstin}</KeyValue>
            <KeyValue label="Evidence">Purchase register · invoice image</KeyValue>
          </div>
        </Panel>
        <div className="grid place-items-center">
          <div className="rounded-full border bg-surface p-3">
            <ArrowLeftRight className="size-5 text-primary" />
          </div>
        </div>
        <Panel title="Government data · GSTR-2B">
          <div className="text-3xl font-semibold">
            ₹{(data.government / 100000).toFixed(2)} lakh
          </div>
          <div className="mt-4 space-y-3">
            <KeyValue label="Mismatch">{data.type}</KeyValue>
            <KeyValue label="Variance">₹{(Math.abs(variance) / 100000).toFixed(2)} lakh</KeyValue>
            <KeyValue label="Portal evidence">GSTR-2B downloaded JSON</KeyValue>
          </div>
        </Panel>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Treatment and approval">
          <div className="grid grid-cols-2 gap-4">
            <KeyValue label="Treatment">{data.treatment}</KeyValue>
            <KeyValue label="Owner">{data.owner}</KeyValue>
            <KeyValue label="Approval">{data.approval}</KeyValue>
            <KeyValue label="Evidence">{data.evidence}</KeyValue>
          </div>
        </Panel>
        <Panel title="Linked corrective action">
          {data.capa ? (
            <Link
              to="/qms/capa/$id"
              params={{ id: data.capa }}
              className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary-soft p-4"
            >
              <ShieldCheck className="size-5 text-primary" />
              <div>
                <div className="font-mono text-xs">{data.capa}</div>
                <div className="text-sm font-medium">Automate variance reporting and approval</div>
              </div>
            </Link>
          ) : (
            <div className="text-sm text-muted-foreground">
              No CAPA required for this isolated mismatch.
            </div>
          )}
          <Button asChild variant="outline" className="mt-3">
            <Link to="/tax/evidence-pack">
              <FileCheck2 className="size-4" /> Evidence Pack
            </Link>
          </Button>
        </Panel>
      </div>
    </div>
  );
}
