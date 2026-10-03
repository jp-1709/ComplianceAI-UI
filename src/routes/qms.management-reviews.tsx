import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/qms/management-reviews")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Management Review — Quantbit Compliance AI" },
      { name: "description", content: "Review inputs, decisions and actions." },
      { property: "og:title", content: "Management Review — Quantbit Compliance AI" },
      { property: "og:description", content: "Review inputs, decisions and actions." },
    ],
  }),
  component: Pqmsmanagementreviewstsx,
});

function Pqmsmanagementreviewstsx() {
  return <PlaceholderPage path="/qms/management-reviews" />;
}
