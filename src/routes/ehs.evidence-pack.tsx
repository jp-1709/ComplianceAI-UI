import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getModuleWorkspace } from "@/services/modules";
import { ModuleEvidencePack } from "@/components/modules/EvidencePack";
export const Route = createFileRoute("/ehs/evidence-pack")({ component: Pack });
function Pack() {
  const { data } = useQuery({
    queryKey: ["module", "ehs"],
    queryFn: () => getModuleWorkspace("ehs"),
  });
  return <ModuleEvidencePack module="ehs" title="EHS" records={data?.evidence ?? []} />;
}
