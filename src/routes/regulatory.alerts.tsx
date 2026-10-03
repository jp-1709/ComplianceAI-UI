import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/regulatory/alerts")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Regulatory Intelligence — Quantbit Compliance AI" },
      { name: "description", content: "Regulatory changes and impact assessments." },
      { property: "og:title", content: "Regulatory Intelligence — Quantbit Compliance AI" },
      { property: "og:description", content: "Regulatory changes and impact assessments." },
    ],
  }),
  component: Pregulatoryalertstsx,
});

function Pregulatoryalertstsx() {
  return <PlaceholderPage path="/regulatory/alerts" />;
}
