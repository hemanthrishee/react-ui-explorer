
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
import { Button } from "@/components/ui/button";

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

  const renderCompactProgress = () => {
    if (!showProgress) return null;
    
    return (
      <div className="flex items-center justify-between w-full mb-4 max-w-md mx-auto">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="rounded-full p-0 w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </Button>
        
        <div className="flex-1 mx-3">
          <Progress 
            value={(page / numPages) * 100} 
            className={`h-2 bg-gray-100 ${progressBarClassName}`} 
          />
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handlePageChange(page + 1)}
          disabled={page === numPages}
          className="rounded-full p-0 w-8 h-8 flex items-center justify-center"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
    );
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
          {renderCompactProgress()}
        </div>
        <div className="mt-4">
          {renderProgress()}
          {renderPagination()}
        </div>
      </>
    );
  }

  if (position === "top") {
    return (
      <div className="mb-4">
        {renderCompactProgress()}
      </div>
    );
  }

  return (
    <div className="mt-4">
      {renderProgress()}
      {renderPagination()}
    </div>
  );
};

export default Pagination;
