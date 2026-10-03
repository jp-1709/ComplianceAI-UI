import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/my-work")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "My Work — Quantbit Compliance AI" },
      { name: "description", content: "Tasks, approvals and reviews assigned to you." },
      { property: "og:title", content: "My Work — Quantbit Compliance AI" },
      { property: "og:description", content: "Tasks, approvals and reviews assigned to you." },
    ],
  }),
  component: Pmyworktsx,
});

function Pmyworktsx() {
  return <PlaceholderPage path="/my-work" />;
}
