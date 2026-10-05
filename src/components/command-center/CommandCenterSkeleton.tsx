import { Skeleton } from "@/components/ui/skeleton";

export function CommandCenterSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-5" aria-label="Loading Executive Command Center">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-[520px] max-w-full" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.1fr_1.6fr]">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-80 rounded-xl xl:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
