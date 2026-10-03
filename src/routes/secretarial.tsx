import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/secretarial")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Secretarial — Quantbit Compliance AI" },
      { name: "description", content: "Board meetings, filings and registers." },
      { property: "og:title", content: "Secretarial — Quantbit Compliance AI" },
      { property: "og:description", content: "Board meetings, filings and registers." },
    ],
  }),
  component: Psecretarialtsx,
});

function Psecretarialtsx() {
  return <PlaceholderPage path="/secretarial" />;
}
