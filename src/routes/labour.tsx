import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/labour")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Labour Compliance — Quantbit Compliance AI" },
      { name: "description", content: "PF, ESI, contract labour, BOCW and POSH." },
      { property: "og:title", content: "Labour Compliance — Quantbit Compliance AI" },
      { property: "og:description", content: "PF, ESI, contract labour, BOCW and POSH." },
    ],
  }),
  component: Plabourtsx,
});

function Plabourtsx() {
  return <PlaceholderPage path="/labour" />;
}
