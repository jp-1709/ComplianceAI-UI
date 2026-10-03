import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/obligations/$id")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Obligation — Quantbit Compliance AI" },
      { name: "description", content: "Obligation record." },
      { property: "og:title", content: "Obligation — Quantbit Compliance AI" },
      { property: "og:description", content: "Obligation record." },
    ],
  }),
  component: Pobligationsidtsx,
});

function Pobligationsidtsx() {
  return <PlaceholderPage path="/obligations" />;
}
