import { Link, useSearch } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { navByPath } from "@/lib/nav";
import { Breadcrumbs, EmptyState } from "@/components/grc/widgets";
import { Button } from "@/components/ui/button";

export const placeholderSearch = (s: Record<string, unknown>): { filter?: string | undefined } => ({
  filter: typeof s["filter"] === "string" ? s["filter"] : undefined,
});

export function PlaceholderPage({ path, title: titleOverride }: { path: string; title?: string }) {
  const item = navByPath[path];
  const search = useSearch({ strict: false }) as { filter?: string };
  const title = titleOverride ?? item?.label ?? "Page";
  const crumbs = [
    { label: "Home", to: "/command-center" },
    ...(item?.group ? [{ label: item.group }] : []),
    { label: title },
  ];
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Breadcrumbs items={crumbs} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {item && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
      </div>
      {search.filter && (
        <div className="inline-flex items-center gap-2 rounded-full border bg-primary-soft px-3 py-1 text-xs text-accent-foreground">
          Filter: <b>{search.filter}</b>
        </div>
      )}
      <EmptyState
        icon={item?.icon ?? Construction}
        title={`${title} workspace is coming next`}
        description="This module is part of the build plan. Navigation, breadcrumbs and drill-down filters already work end to end."
        action={
          <Button asChild variant="outline">
            <Link to="/command-center">Back to Command Center</Link>
          </Button>
        }
      />
    </div>
  );
}
