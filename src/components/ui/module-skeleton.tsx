interface ModuleSkeletonProps {
  readonly lines?: number;
  readonly label?: string;
}

export function ModuleSkeleton({ lines = 3, label = "Loading data" }: ModuleSkeletonProps) {
  return (
    <div className="module-skeleton" aria-busy="true" aria-label={label} role="status">
      {Array.from({ length: lines }, (_, index) => (
        <span key={index} className="skeleton-line" />
      ))}
    </div>
  );
}
