import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quantbit Compliance AI — KFC India" },
      { name: "description", content: "Enterprise compliance, risk and quality command center." },
      { property: "og:title", content: "Quantbit Compliance AI — KFC India" },
      {
        property: "og:description",
        content: "Enterprise compliance, risk and quality command center.",
      },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/command-center" });
  },
});
