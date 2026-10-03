import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/qms/capa")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "CAPA — Quantbit Compliance AI" },
      { name: "description", content: "Corrective and preventive actions." },
      { property: "og:title", content: "CAPA — Quantbit Compliance AI" },
      { property: "og:description", content: "Corrective and preventive actions." },
    ],
  }),
  component: Pqmscapatsx,
});

function Pqmscapatsx() {
  return <PlaceholderPage path="/qms/capa" />;
}
