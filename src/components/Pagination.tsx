
import React from 'react';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= numPages) {
      scrollToTop();
      onPageChange(newPage);
    }
  };
  
  // Generate page numbers for display
  const getPageNumbers = () => {
    const pages = [];
    const showEllipsisStart = page > 3;
    const showEllipsisEnd = page < numPages - 2;
    
    if (numPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= numPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Show ellipsis or additional page numbers at the start
      if (showEllipsisStart) {
        pages.push(-1); // -1 represents ellipsis
      } else {
        pages.push(2);
      }
      
      // Pages around current page
      const startPage = Math.max(2, showEllipsisStart ? page - 1 : 3);
      const endPage = Math.min(numPages - 1, showEllipsisEnd ? page + 1 : numPages - 2);
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Show ellipsis or additional page numbers at the end
      if (showEllipsisEnd) {
        pages.push(-2); // -2 represents ellipsis at the end
      } else if (numPages > 3) {
        pages.push(numPages - 1);
      }
      
      // Always show last page
      pages.push(numPages);
    }
    
    return pages;
  };

  return (
    <ShadcnPagination className={cn("py-6", className)}>
      <PaginationContent className="flex-wrap">
        {/* First page button */}
        <PaginationItem>
          <PaginationLink 
            onClick={() => handlePageChange(1)}
            className={cn("gap-1", page === 1 && "pointer-events-none opacity-50")}
            aria-disabled={page === 1}
            aria-label="Go to first page"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
        
        {/* Previous button */}
        <PaginationItem>
          <PaginationLink 
            onClick={() => handlePageChange(page - 1)}
            className={cn("gap-1", page === 1 && "pointer-events-none opacity-50")}
            aria-disabled={page === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </PaginationLink>
        </PaginationItem>
        
        {getPageNumbers().map((pageNumber, index) => (
          <PaginationItem key={`${pageNumber}-${index}`}>
            {pageNumber < 0 ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={pageNumber === page}
                onClick={() => handlePageChange(pageNumber)}
              >
                {pageNumber}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        
        {/* Next button */}
        <PaginationItem>
          <PaginationLink 
            onClick={() => handlePageChange(page + 1)}
            className={cn("gap-1", page === numPages && "pointer-events-none opacity-50")}
            aria-disabled={page === numPages}
            aria-label="Go to next page"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
        
        {/* Last page button */}
        <PaginationItem>
          <PaginationLink 
            onClick={() => handlePageChange(numPages)}
            className={cn("gap-1", page === numPages && "pointer-events-none opacity-50")}
            aria-disabled={page === numPages}
            aria-label="Go to last page"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  );
};

export default Pagination;
