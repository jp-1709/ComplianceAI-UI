import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/ai-assistant")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "AI Assistant — Quantbit Compliance AI" },
      { name: "description", content: "Drafts and recommendations — humans decide." },
      { property: "og:title", content: "AI Assistant — Quantbit Compliance AI" },
      { property: "og:description", content: "Drafts and recommendations — humans decide." },
    ],
  }),
  component: Paiassistanttsx,
});

function Paiassistanttsx() {
  return <PlaceholderPage path="/ai-assistant" />;
}
