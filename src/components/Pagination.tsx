
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";

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

  // Function to generate page numbers with ellipsis for many pages
  const getPaginationItems = () => {
    // Always show first and last page
    const items = [];
    const maxVisiblePages = 5;

    if (numPages <= maxVisiblePages) {
      // Show all pages if there are few
      for (let i = 1; i <= numPages; i++) {
        items.push(i);
      }
    } else {
      // Show first, last, current and 1-2 pages around current
      items.push(1);
      
      const startPage = Math.max(2, page - 1);
      const endPage = Math.min(numPages - 1, page + 1);
      
      if (startPage > 2) {
        items.push('ellipsis-start');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }
      
      if (endPage < numPages - 1) {
        items.push('ellipsis-end');
      }
      
      items.push(numPages);
    }
    
    return items;
  };

  // Calculate progress percentage
  const progressPercentage = (page / numPages) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Top Navigation and Progress Bar */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page} of {numPages}
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
              className="p-1 rounded-md hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-1 rounded-md hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === numPages}
              className="p-1 rounded-md hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(numPages)}
              disabled={page === numPages}
              className="p-1 rounded-md hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Enhanced Progress Bar */}
        <div className="relative pt-1">
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-muted"
          />
          <div 
            className="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-xs text-muted-foreground"
            style={{ transform: 'translateY(100%)' }}
          >
            <span>1</span>
            <span>{numPages}</span>
          </div>
        </div>
      </div>

      {/* Main Pagination Controls */}
      <ShadcnPagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(page - 1);
              }}
              className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
            />
          </PaginationItem>
          
          {getPaginationItems().map((item, index) => {
            if (item === 'ellipsis-start' || item === 'ellipsis-end') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            
            return (
              <PaginationItem key={item}>
                <PaginationLink 
                  isActive={page === item}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(Number(item));
                  }}
                  className="cursor-pointer"
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(page + 1);
              }}
              className={page === numPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
            />
          </PaginationItem>
        </PaginationContent>
      </ShadcnPagination>
    </div>
  );
};

export default Pagination;
