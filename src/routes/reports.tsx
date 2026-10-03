import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/reports")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Reports & Analytics — Quantbit Compliance AI" },
      { name: "description", content: "Board packs and analytics." },
      { property: "og:title", content: "Reports & Analytics — Quantbit Compliance AI" },
      { property: "og:description", content: "Board packs and analytics." },
    ],
  }),
  component: Preportstsx,
});

function Preportstsx() {
  return <PlaceholderPage path="/reports" />;
}
