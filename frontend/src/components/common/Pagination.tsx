import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between py-4 px-1 ${className}`}>
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-[hsl(var(--border))] text-sm font-semibold rounded-lg text-[hsl(var(--text-primary))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-[hsl(var(--border))] text-sm font-semibold rounded-lg text-[hsl(var(--text-primary))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 transition-colors"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-[hsl(var(--text-secondary))]">
            Page <span className="font-bold text-[hsl(var(--text-primary))]">{currentPage}</span> of{' '}
            <span className="font-bold text-[hsl(var(--text-primary))]">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px gap-1" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--text-primary))] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4.5 w-4.5" aria-hidden="true" />
            </button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNum = index + 1;
              const isSelected = pageNum === currentPage;

              // Simple pagination item clipping for massive page counts
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                Math.abs(pageNum - currentPage) <= 1
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`relative inline-flex items-center px-3.5 py-2 rounded-lg border text-sm font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--text-primary))]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }

              if (
                pageNum === 2 ||
                pageNum === totalPages - 1
              ) {
                return (
                  <span
                    key={pageNum}
                    className="relative inline-flex items-center px-2 py-2 text-sm font-bold text-[hsl(var(--text-muted))]"
                  >
                    ...
                  </span>
                );
              }

              return null;
            })}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center p-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--surface))] text-sm font-semibold text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--text-primary))] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
