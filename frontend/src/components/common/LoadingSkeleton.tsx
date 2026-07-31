interface LoadingSkeletonProps {
  count?: number;
  height?: string;
  className?: string;
}

export function LoadingSkeleton({
  count = 3,
  height = 'h-8',
  className = '',
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  return (
    <div className={`space-y-3 w-full animate-pulse ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className={`w-full bg-[hsl(var(--muted))] rounded-lg ${height}`}
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default LoadingSkeleton;
