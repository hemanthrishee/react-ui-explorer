
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";

interface PaginationProps {
  page: number;
  numPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  progressBarClassName?: string;
  showProgress?: boolean;
  position?: "top" | "bottom" | "both";
}

const Pagination: React.FC<PaginationProps> = ({ 
  page, 
  numPages, 
  onPageChange, 
  className = '',
  progressBarClassName = '',
  showProgress = true,
  position = "bottom"
}) => {
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

  const renderProgress = () => {
    if (!showProgress) return null;
    
    return (
      <div className="flex items-center gap-2 w-full mb-2">
        <div className="flex-1">
          <Progress 
            value={(page / numPages) * 100} 
            className={`h-2 bg-gray-200 ${progressBarClassName}`} 
          />
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          Page {page} / {numPages}
        </span>
      </div>
    );
  };

  const renderPagination = () => (
    <ShadcnPagination className={className}>
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
                <span className="flex h-10 w-10 items-center justify-center">...</span>
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
  );

  if (position === "both") {
    return (
      <>
        <div className="mb-4">
          {renderProgress()}
          {renderPagination()}
        </div>
        <div className="mt-4">
          {renderProgress()}
          {renderPagination()}
        </div>
      </>
    );
  }

  return (
    <div className={position === "top" ? "mb-4" : "mt-4"}>
      {renderProgress()}
      {renderPagination()}
    </div>
  );
};

export default Pagination;
