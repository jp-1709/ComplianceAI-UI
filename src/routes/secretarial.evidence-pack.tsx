import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getModuleWorkspace } from "@/services/modules";
import { ModuleEvidencePack } from "@/components/modules/EvidencePack";
export const Route = createFileRoute("/secretarial/evidence-pack")({ component: Pack });
function Pack() {
  const { data } = useQuery({
    queryKey: ["module", "secretarial"],
    queryFn: () => getModuleWorkspace("secretarial"),
  });
  return (
    <ModuleEvidencePack module="secretarial" title="Secretarial" records={data?.evidence ?? []} />
  );
}
