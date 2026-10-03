import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/ehs")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "EHS — Quantbit Compliance AI" },
      { name: "description", content: "Environment, health and safety." },
      { property: "og:title", content: "EHS — Quantbit Compliance AI" },
      { property: "og:description", content: "Environment, health and safety." },
    ],
  }),
  component: Pehstsx,
});

function Pehstsx() {
  return <PlaceholderPage path="/ehs" />;
}
