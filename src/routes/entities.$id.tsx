import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/entities/$id")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Entity — Quantbit Compliance AI" },
      { name: "description", content: "Entity compliance profile." },
      { property: "og:title", content: "Entity — Quantbit Compliance AI" },
      { property: "og:description", content: "Entity compliance profile." },
    ],
  }),
  component: Pentitiesidtsx,
});

function Pentitiesidtsx() {
  return <PlaceholderPage path="/entities" />;
}
