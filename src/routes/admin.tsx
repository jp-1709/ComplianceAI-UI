import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage, placeholderSearch } from "@/components/shell/PlaceholderPage";

export const Route = createFileRoute("/admin")({
  validateSearch: placeholderSearch,
  head: () => ({
    meta: [
      { title: "Administration — Quantbit Compliance AI" },
      { name: "description", content: "Users, roles and configuration." },
      { property: "og:title", content: "Administration — Quantbit Compliance AI" },
      { property: "og:description", content: "Users, roles and configuration." },
    ],
  }),
  component: Padmintsx,
});

function Padmintsx() {
  return <PlaceholderPage path="/admin" />;
}
