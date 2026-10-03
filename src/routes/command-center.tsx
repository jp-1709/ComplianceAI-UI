import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/command-center")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Executive Command Center — Quantbit Compliance AI" },
      { name: "description", content: "Group-wide compliance posture for KFC India." },
      { property: "og:title", content: "Executive Command Center — Quantbit Compliance AI" },
      { property: "og:description", content: "Group-wide compliance posture for KFC India." },
    ],
  }),
  component: Pcommandcentertsx,
});

function Pcommandcentertsx() {
  return <PlaceholderPage path="/command-center" />;
}
