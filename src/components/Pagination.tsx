
import React from 'react';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';
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
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => handlePageChange(1)}
            className={cn(page === 1 && "pointer-events-none opacity-50")}
            aria-disabled={page === 1}
          >
            <ChevronsLeft className="h-4 w-4 mr-1" />
            <span className="sr-only md:not-sr-only md:inline">First</span>
          </PaginationPrevious>
        </PaginationItem>
        
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => handlePageChange(page - 1)}
            className={cn(page === 1 && "pointer-events-none opacity-50")}
            aria-disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            <span className="sr-only md:not-sr-only md:inline">Previous</span>
          </PaginationPrevious>
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
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => handlePageChange(page + 1)}
            className={cn(page === numPages && "pointer-events-none opacity-50")}
            aria-disabled={page === numPages}
          >
            <span className="sr-only md:not-sr-only md:inline">Next</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </PaginationNext>
        </PaginationItem>
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => handlePageChange(numPages)}
            className={cn(page === numPages && "pointer-events-none opacity-50")}
            aria-disabled={page === numPages}
          >
            <span className="sr-only md:not-sr-only md:inline">Last</span>
            <ChevronsRight className="h-4 w-4 ml-1" />
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  );
};

export default Pagination;
