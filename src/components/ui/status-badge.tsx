
import React from "react";
import { QuotationTaskStatus, getStatusColor, translateStatus } from "@/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: QuotationTaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span 
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-full text-white",
        getStatusColor(status),
        className
      )}
    >
      {translateStatus(status)}
    </span>
  );
}
