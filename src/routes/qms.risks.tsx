import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/qms/risks")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Risk Management — Quantbit Compliance AI" },
      { name: "description", content: "Risk register and heat map." },
      { property: "og:title", content: "Risk Management — Quantbit Compliance AI" },
      { property: "og:description", content: "Risk register and heat map." },
    ],
  }),
  component: Pqmsriskstsx,
});

function Pqmsriskstsx() {
  return <PlaceholderPage path="/qms/risks" />;
}
