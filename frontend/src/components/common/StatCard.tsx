import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: string | number;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  className = '',
}: StatCardProps) {
  return (
    <div className={`p-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-xs flex items-center justify-between gap-4 card-hover ${className}`}>
      <div className="space-y-1.5 flex-1">
        <p className="text-xs font-semibold text-[hsl(var(--text-secondary))] tracking-wider uppercase">
          {title}
        </p>
        <h4 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--text-primary))]">
          {value}
        </h4>
        {trend && (
          <p className="text-xs flex items-center gap-1">
            <span
              className={`font-semibold ${
                trend.isPositive
                  ? 'text-[hsl(var(--success))]'
                  : 'text-[hsl(var(--danger))]'
              }`}
            >
              {trend.value}
            </span>{' '}
            <span className="text-[hsl(var(--text-muted))]">since last month</span>
          </p>
        )}
        {description && !trend && (
          <p className="text-xs text-[hsl(var(--text-secondary))] truncate">
            {description}
          </p>
        )}
      </div>
      <div className="p-3.5 rounded-xl bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] shrink-0">
        {icon}
      </div>
    </div>
  );
}

export default StatCard;
