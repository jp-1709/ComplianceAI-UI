import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/obligations/")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Obligation Register — Quantbit Compliance AI" },
      { name: "description", content: "Statutory and internal obligations mapped to owners." },
      { property: "og:title", content: "Obligation Register — Quantbit Compliance AI" },
      { property: "og:description", content: "Statutory and internal obligations mapped to owners." },
    ],
  }),
  component: Pobligationsindextsx,
});

function Pobligationsindextsx() {
  return <PlaceholderPage path="/obligations" />;
}
