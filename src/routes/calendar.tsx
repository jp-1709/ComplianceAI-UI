import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/calendar")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Compliance Calendar — Quantbit Compliance AI" },
      { name: "description", content: "Due dates and statutory deadlines." },
      { property: "og:title", content: "Compliance Calendar — Quantbit Compliance AI" },
      { property: "og:description", content: "Due dates and statutory deadlines." },
    ],
  }),
  component: Pcalendartsx,
});

function Pcalendartsx() {
  return <PlaceholderPage path="/calendar" />;
}
