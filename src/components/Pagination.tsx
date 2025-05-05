import React from 'react';

interface PaginationProps {
  page: number;
  numPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({ page, numPages, onPageChange, className = '' }) => {
  if (numPages <= 1) return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (page > 1) {
      scrollToTop();
      onPageChange(page - 1);
    }
  };
  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (page < numPages) {
      scrollToTop();
      onPageChange(page + 1);
    }
  };
  return (
    <div className={`flex items-center justify-center gap-2 mt-4 ${className}`}>
      <button
        className="px-2 py-1 rounded border text-sm disabled:opacity-50"
        onClick={handlePrev}
        disabled={page === 1}
        type="button"
      >
        Prev
      </button>
      {Array.from({ length: numPages }, (_, i) => (
        <button
          key={i + 1}
          className={`px-2 py-1 rounded border text-sm ${page === i + 1 ? 'bg-blue-500 text-white' : ''}`}
          onClick={e => { e.preventDefault(); scrollToTop(); onPageChange(i + 1); }}
          type="button"
        >
          {i + 1}
        </button>
      ))}
      <button
        className="px-2 py-1 rounded border text-sm disabled:opacity-50"
        onClick={handleNext}
        disabled={page === numPages}
        type="button"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
