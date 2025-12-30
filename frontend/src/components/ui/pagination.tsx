"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(renderPageButton(i));
      }
    } else {
      // Always show first page
      pages.push(renderPageButton(1));

      if (currentPage > 3) {
        pages.push(<span key="ellipsis-start" className="px-2 text-gray-500"><MoreHorizontal className="w-4 h-4" /></span>);
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(renderPageButton(i));
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push(<span key="ellipsis-end" className="px-2 text-gray-500"><MoreHorizontal className="w-4 h-4" /></span>);
      }

      // Always show last page
      pages.push(renderPageButton(totalPages));
    }

    return pages;
  };

  const renderPageButton = (page: number) => (
    <Button
      key={page}
      variant={currentPage === page ? "default" : "ghost"}
      size="sm"
      onClick={() => onPageChange(page)}
      className={cn(
        "w-9 h-9 p-0",
        currentPage === page ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
      )}
    >
      {page}
    </Button>
  );

  return (
    <div className={cn("flex items-center justify-center gap-2 mt-8", className)}>
      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>

      <div className="flex items-center gap-1">
        {renderPageNumbers()}
      </div>

      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30"
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
