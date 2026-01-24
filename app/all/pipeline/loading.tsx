import { Skeleton } from "@/components/ui/skeleton"

export default function PipelineLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-[220px]" />
      </div>

      {/* Filters skeleton */}
      <div className="flex items-center gap-3 p-4 border-b">
        <Skeleton className="h-10 w-[140px]" />
        <Skeleton className="h-10 w-[160px]" />
        <Skeleton className="h-10 w-[160px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>

      {/* Kanban columns skeleton */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="flex gap-4 h-full">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex-shrink-0 w-[300px]">
              <Skeleton className="h-12 w-full mb-2 rounded-t-lg" />
              <div className="space-y-2">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
