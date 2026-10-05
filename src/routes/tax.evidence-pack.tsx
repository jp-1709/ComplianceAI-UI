import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getModuleWorkspace } from "@/services/modules";
import { ModuleEvidencePack } from "@/components/modules/EvidencePack";
export const Route = createFileRoute("/tax/evidence-pack")({ component: Pack });
function Pack() {
  const { data } = useQuery({
    queryKey: ["module", "tax"],
    queryFn: () => getModuleWorkspace("tax"),
  });
  return <ModuleEvidencePack module="tax" title="Tax & GST" records={data?.evidence ?? []} />;
}
