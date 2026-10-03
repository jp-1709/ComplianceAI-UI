import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/tax")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Tax & GST — Quantbit Compliance AI" },
      { name: "description", content: "GST returns, TDS and reconciliations." },
      { property: "og:title", content: "Tax & GST — Quantbit Compliance AI" },
      { property: "og:description", content: "GST returns, TDS and reconciliations." },
    ],
  }),
  component: Ptaxtsx,
});

function Ptaxtsx() {
  return <PlaceholderPage path="/tax" />;
}
