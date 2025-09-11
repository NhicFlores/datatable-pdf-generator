"use client";

import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { QuarterOption } from "@/lib/actions/quarter-data-actions";

interface QuarterSelectorProps {
  currentQuarter: string;
  quarters: QuarterOption[];
  onQuarterChange: (quarter: string) => Promise<void>;
  className?: string;
}

export function QuarterSelector({
  currentQuarter,
  quarters,
  onQuarterChange,
  className,
}: QuarterSelectorProps) {
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);
  const [isPending, startTransition] = useTransition();

  const handleQuarterChange = (newQuarter: string) => {
    setSelectedQuarter(newQuarter);

    startTransition(async () => {
      try {
        await onQuarterChange(newQuarter);
      } catch (error) {
        console.error("Error changing quarter:", error);
        // Reset to previous quarter on error
        setSelectedQuarter(currentQuarter);
      }
    });
  };

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        <label htmlFor="quarter-selector" className="text-sm font-medium">
          Quarter:
        </label>
        <Select
          value={selectedQuarter}
          onValueChange={handleQuarterChange}
          disabled={isPending}
        >
          <SelectTrigger className="w-[300px]" id="quarter-selector">
            <SelectValue placeholder="Select quarter" />
          </SelectTrigger>
          <SelectContent>
            {quarters.map((quarter) => (
              <SelectItem key={quarter.value} value={quarter.value}>
                {quarter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isPending && (
          <div className="text-sm text-muted-foreground">Loading...</div>
        )}
      </div>
    </div>
  );
}
