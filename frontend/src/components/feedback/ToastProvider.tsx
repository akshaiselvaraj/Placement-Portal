import { useToastStore } from '@/store';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-9999 flex flex-col gap-2 max-w-md w-full px-4 sm:px-0">
      {toasts.map((t) => {
        let icon = <Info className="h-5 w-5" />;
        let borderClass = 'border-[hsl(var(--info)/0.3)] bg-[hsl(var(--surface))]';
        let textClass = 'text-[hsl(var(--text-primary))]';
        let iconColor = 'text-[hsl(var(--info))]';

        if (t.type === 'success') {
          icon = <CheckCircle className="h-5 w-5" />;
          borderClass = 'border-[hsl(var(--success)/0.3)] bg-[hsl(var(--surface))]';
          iconColor = 'text-[hsl(var(--success))]';
        } else if (t.type === 'error') {
          icon = <AlertCircle className="h-5 w-5" />;
          borderClass = 'border-[hsl(var(--danger)/0.3)] bg-[hsl(var(--surface))]';
          iconColor = 'text-[hsl(var(--danger))]';
        } else if (t.type === 'warning') {
          icon = <AlertTriangle className="h-5 w-5" />;
          borderClass = 'border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--surface))]';
          iconColor = 'text-[hsl(var(--warning))]';
        }

        return (
          <div
            key={t.id}
            className={`flex items-start justify-between gap-3 p-4 rounded-xl border shadow-lg glass animate-slide-in-right transition-all duration-300 ${borderClass}`}
          >
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 shrink-0 ${iconColor}`}>{icon}</span>
              <p className={`text-sm font-medium leading-relaxed ${textClass}`}>
                {t.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] transition-colors p-0.5 rounded-lg hover:bg-[hsl(var(--muted))]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastProvider;
