const CARDS_PER_COLUMN = [3, 2, 2, 1, 1];

export default function DashboardSkeleton() {
  return (
    <div
      className="h-[calc(100dvh-var(--nav-h))] overflow-hidden bg-muted/40"
      role="status"
      aria-label="Loading your job hunt"
    >
      <div className="container mx-auto flex h-full flex-col px-4 py-6 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted sm:h-9" />
          <div className="mt-2 h-5 w-64 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
          {CARDS_PER_COLUMN.map((cards, i) => (
            <div
              key={i}
              className="flex h-full w-72 shrink-0 flex-col gap-3 rounded-xl border border-border bg-card/60 p-3"
            >
              <div className="h-5 w-28 animate-pulse rounded-md bg-muted" />
              {Array.from({ length: cards }).map((_, j) => (
                <div
                  key={j}
                  className="h-24 animate-pulse rounded-lg border border-border bg-muted/70"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
