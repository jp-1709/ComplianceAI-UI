import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/qms/documents")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Document Control — Quantbit Compliance AI" },
      { name: "description", content: "Controlled SOPs and acknowledgements." },
      { property: "og:title", content: "Document Control — Quantbit Compliance AI" },
      { property: "og:description", content: "Controlled SOPs and acknowledgements." },
    ],
  }),
  component: Pqmsdocumentstsx,
});

function Pqmsdocumentstsx() {
  return <PlaceholderPage path="/qms/documents" />;
}
