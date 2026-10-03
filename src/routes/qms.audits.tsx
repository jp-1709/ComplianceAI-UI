import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/qms/audits")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Internal Audit — Quantbit Compliance AI" },
      { name: "description", content: "Audit programme and findings." },
      { property: "og:title", content: "Internal Audit — Quantbit Compliance AI" },
      { property: "og:description", content: "Audit programme and findings." },
    ],
  }),
  component: Pqmsauditstsx,
});

function Pqmsauditstsx() {
  return <PlaceholderPage path="/qms/audits" />;
}
