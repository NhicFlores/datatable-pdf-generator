"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WeekRange } from "@/lib/utils/week-utils";

interface WeekSelectorProps {
  weeks: WeekRange[];
  currentWeek: WeekRange | null;
  onWeekChange: (week: WeekRange | null) => void;
}

export function WeekSelector({
  weeks,
  currentWeek,
  onWeekChange,
}: WeekSelectorProps) {
  const [selectedWeek, setSelectedWeek] = useState<WeekRange | null>(currentWeek);

  // Sync local state with prop changes
  useEffect(() => {
    setSelectedWeek(currentWeek);
  }, [currentWeek]);

  const handleWeekChange = useCallback(
    (weekNumberStr: string) => {
      if (weekNumberStr === "all") {
        setSelectedWeek(null);
        onWeekChange(null);
        return;
      }

      const weekNumber = parseInt(weekNumberStr, 10);
      const week = weeks.find(w => w.weekNumber === weekNumber);
      
      if (week) {
        setSelectedWeek(week); // Optimistic update
        onWeekChange(week);
      }
    },
    [weeks, onWeekChange]
  );

  if (weeks.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No weeks available
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="week-selector" className="text-sm font-medium whitespace-nowrap">
        Week:
      </label>
      <Select
        value={selectedWeek?.weekNumber.toString() || "all"}
        onValueChange={handleWeekChange}
      >
        <SelectTrigger className="w-[280px]" id="week-selector">
          <SelectValue placeholder="Select a week..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Weeks</SelectItem>
          {weeks.map((week) => (
            <SelectItem
              key={week.weekNumber}
              value={week.weekNumber.toString()}
            >
              {week.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}