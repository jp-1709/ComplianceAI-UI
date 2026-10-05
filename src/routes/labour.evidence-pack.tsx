import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getModuleWorkspace } from "@/services/modules";
import { ModuleEvidencePack } from "@/components/modules/EvidencePack";
export const Route = createFileRoute("/labour/evidence-pack")({ component: Pack });
function Pack() {
  const { data } = useQuery({
    queryKey: ["module", "labour"],
    queryFn: () => getModuleWorkspace("labour"),
  });
  return (
    <ModuleEvidencePack module="labour" title="Labour Compliance" records={data?.evidence ?? []} />
  );
}
