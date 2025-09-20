/**
 * @fileoverview Reusable UI component
 * 
 * This file is part of the Tether AI learning platform.
 * reusable ui component for the application.
 */

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  showValue?: boolean
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, showValue = false, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    return (
      <div
        ref={ref}
        className={cn("w-full", className)}
        {...props}
      >
        <div className="flex items-center justify-between mb-1">
          {showValue && (
            <span className="text-sm font-medium text-foreground">
              {value}/{max}
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
ProgressBar.displayName = "ProgressBar"

export { ProgressBar }
