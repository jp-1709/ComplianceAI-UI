import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/evidence")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Evidence Vault — Quantbit Compliance AI" },
      { name: "description", content: "Hashed evidence with provenance." },
      { property: "og:title", content: "Evidence Vault — Quantbit Compliance AI" },
      { property: "og:description", content: "Hashed evidence with provenance." },
    ],
  }),
  component: Pevidencetsx,
});

function Pevidencetsx() {
  return <PlaceholderPage path="/evidence" />;
}
