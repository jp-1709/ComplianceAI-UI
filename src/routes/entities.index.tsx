import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ChevronRight, MapPin, Users } from "lucide-react";
import { entities } from "@/data/kfc";
import { Breadcrumbs, ReadinessRing } from "@/components/grc/widgets";
import { StatusBadge } from "@/components/grc/badges";

export const Route = createFileRoute("/entities/")({
  head: () => ({
    meta: [
      { title: "Entities — Quantbit Compliance AI" },
      { name: "description", content: "Restaurants and offices in compliance scope." },
    ],
  }),
  component: EntitiesIndex,
});

function EntitiesIndex() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Breadcrumbs items={[{ label: "Home", to: "/command-center" }, { label: "Entities" }]} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Entities</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compliance posture across KFC India Demo locations.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {entities
          .toSorted((a, b) => b.score - a.score)
          .map((entity) => (
            <Link
              key={entity.id}
              to="/entities/$id"
              params={{ id: entity.id }}
              className="enterprise-panel group flex items-center gap-5 p-5 transition hover:border-primary/40"
            >
              <ReadinessRing value={entity.score} size={88} label="score" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 text-primary" />
                  <h2 className="truncate font-semibold">{entity.name}</h2>
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {entity.city}, {entity.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    {entity.headcount}
                  </span>
                  <span>{entity.openIssues} open issues</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge
                    status={
                      entity.score >= 85
                        ? "compliant"
                        : entity.score >= 75
                          ? "attention"
                          : "critical"
                    }
                  />
                  <span
                    className={
                      entity.trend >= 0 ? "text-xs text-compliant" : "text-xs text-critical"
                    }
                  >
                    {entity.trend >= 0 ? "+" : ""}
                    {entity.trend} pts
                  </span>
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground transition group-hover:translate-x-1" />
            </Link>
          ))}
      </div>
    </div>
  );
}
