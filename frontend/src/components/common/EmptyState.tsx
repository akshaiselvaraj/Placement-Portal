import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  description?: string;
  icon?: React.ReactNode | React.ComponentType<any>;
}

export function EmptyState({
  title = 'No data available',
  message,
  description,
  icon,
}: EmptyStateProps) {
  const displayMessage = message || description || 'There are no items to display at the moment.';

  const renderIcon = () => {
    if (!icon) {
      return <Inbox className="h-8 w-8 stroke-[1.5]" />;
    }
    if (React.isValidElement(icon)) {
      return icon;
    }
    // Treat as a React component if it's not a JSX element
    const IconComponent = icon as React.ComponentType<any>;
    return <IconComponent className="h-8 w-8 stroke-[1.5]" />;
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto">
      <div className="p-4 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--text-muted))] mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-base font-bold text-[hsl(var(--text-primary))] mb-1">
        {title}
      </h3>
      <p className="text-sm text-[hsl(var(--text-secondary))] leading-relaxed">
        {displayMessage}
      </p>
    </div>
  );
}

export default EmptyState;
