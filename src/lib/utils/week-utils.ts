import { addDays, format, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';

export interface WeekRange {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  label: string;
}

/**
 * Get the start of week (Sunday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  return startOfDay(addDays(date, -dayOfWeek));
}

/**
 * Get the end of week (Saturday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  const dayOfWeek = date.getDay();
  const daysToSaturday = 6 - dayOfWeek;
  return endOfDay(addDays(date, daysToSaturday));
}

/**
 * Generate all weeks within a quarter date range
 */
export function generateWeeksForQuarter(quarterStartDate: Date, quarterEndDate: Date): WeekRange[] {
  const weeks: WeekRange[] = [];
  
  // Start from the first Sunday of or before the quarter start
  let currentWeekStart = getWeekStart(quarterStartDate);
  let weekNumber = 1;
  
  while (isBefore(currentWeekStart, quarterEndDate)) {
    const weekEnd = getWeekEnd(currentWeekStart);
    
    // Only include weeks that overlap with the quarter
    if (isAfter(weekEnd, quarterStartDate) && isBefore(currentWeekStart, addDays(quarterEndDate, 1))) {
      weeks.push({
        weekNumber,
        startDate: currentWeekStart,
        endDate: weekEnd,
        label: `Week ${weekNumber} (${format(currentWeekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')})`
      });
      weekNumber++;
    }
    
    // Move to next week
    currentWeekStart = addDays(currentWeekStart, 7);
  }
  
  return weeks;
}

/**
 * Find which week a date falls into within a quarter
 */
export function findWeekForDate(date: Date, weeks: WeekRange[]): WeekRange | null {
  return weeks.find(week => 
    !isBefore(date, week.startDate) && !isAfter(date, week.endDate)
  ) || null;
}

/**
 * Get current week from available weeks
 */
export function getCurrentWeek(weeks: WeekRange[]): WeekRange | null {
  const today = new Date();
  return findWeekForDate(today, weeks);
}