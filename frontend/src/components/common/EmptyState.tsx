import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'No data available',
  message = 'There are no items to display at the moment.',
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto">
      <div className="p-4 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))] mb-4">
        {icon || <Inbox className="h-8 w-8 stroke-[1.5]" />}
      </div>
      <h3 className="text-base font-bold text-[hsl(var(--text-primary))] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
        {message}
      </p>
    </div>
  );
}

export default EmptyState;
