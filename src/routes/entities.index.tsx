import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/entities/")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Entities — Quantbit Compliance AI" },
      { name: "description", content: "Restaurants and offices in compliance scope." },
      { property: "og:title", content: "Entities — Quantbit Compliance AI" },
      { property: "og:description", content: "Restaurants and offices in compliance scope." },
    ],
  }),
  component: Pentitiesindextsx,
});

function Pentitiesindextsx() {
  return <PlaceholderPage path="/entities" />;
}
