interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const norm = status.toUpperCase();

  let styles = 'bg-[hsl(var(--muted))] text-[hsl(var(--text-secondary))] border-[hsl(var(--border))]';

  // Success variants
  if (
    norm === 'VERIFIED' ||
    norm === 'SELECTED' ||
    norm === 'COMPLETED' ||
    norm === 'OPEN' ||
    norm === 'APPROVED' ||
    norm === 'PUBLISHED' ||
    norm === 'SUCCESS'
  ) {
    styles = 'bg-[hsl(var(--success-light))] text-[hsl(var(--success))] border-[hsl(var(--success)/0.2)]';
  }
  // Danger variants
  else if (
    norm === 'REJECTED' ||
    norm === 'CANCELLED' ||
    norm === 'CLOSED' ||
    norm === 'WITHDRAWN' ||
    norm === 'DANGER' ||
    norm === 'ERROR'
  ) {
    styles = 'bg-[hsl(var(--danger-light))] text-[hsl(var(--danger))] border-[hsl(var(--danger)/0.2)]';
  }
  // Warning variants
  else if (
    norm === 'PENDING' ||
    norm === 'ONGOING' ||
    norm === 'DRAFT' ||
    norm === 'INTERVIEWING' ||
    norm === 'WARNING'
  ) {
    styles = 'bg-[hsl(var(--warning-light))] text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.2)]';
  }
  // Info variants
  else if (
    norm === 'APPLIED' ||
    norm === 'SHORTLISTED' ||
    norm === 'UPCOMING' ||
    norm === 'INFO'
  ) {
    styles = 'bg-[hsl(var(--info-light))] text-[hsl(var(--info))] border-[hsl(var(--info)/0.2)]';
  }

  // Label formulation
  const label = status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border transition-colors ${styles} ${className}`}
    >
      {label}
    </span>
  );
}

export default StatusBadge;
