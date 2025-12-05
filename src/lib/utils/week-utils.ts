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
  const weekStart = startOfDay(addDays(date, -dayOfWeek));
  console.log('📅 getWeekStart:', {
    input: date.toDateString(),
    dayOfWeek,
    weekStart: weekStart.toDateString(),
    weekStartISO: weekStart.toISOString()
  });
  return weekStart;
}

/**
 * Get the end of week (Saturday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  const dayOfWeek = date.getDay();
  const daysToSaturday = 6 - dayOfWeek;
  const weekEnd = endOfDay(addDays(date, daysToSaturday));
  console.log('📅 getWeekEnd:', {
    input: date.toDateString(),
    dayOfWeek,
    daysToSaturday,
    weekEnd: weekEnd.toDateString(),
    weekEndISO: weekEnd.toISOString()
  });
  return weekEnd;
}

/**
 * Generate all weeks within a quarter date range
 */
export function generateWeeksForQuarter(quarterStartDate: Date, quarterEndDate: Date): WeekRange[] {
  const weeks: WeekRange[] = [];
  
  console.log('🗓️ WEEK GENERATION DEBUG:');
  console.log('Quarter range:', {
    start: quarterStartDate.toDateString(),
    startISO: quarterStartDate.toISOString(),
    end: quarterEndDate.toDateString(),
    endISO: quarterEndDate.toISOString()
  });
  
  // Start from the first Sunday of or before the quarter start
  let currentWeekStart = getWeekStart(quarterStartDate);
  let weekNumber = 1;
  
  console.log('First week starts:', {
    date: currentWeekStart.toDateString(),
    iso: currentWeekStart.toISOString()
  });
  
  while (isBefore(currentWeekStart, quarterEndDate)) {
    const weekEnd = getWeekEnd(currentWeekStart);
    
    const overlapCheck1 = isAfter(weekEnd, quarterStartDate);
    const overlapCheck2 = isBefore(currentWeekStart, addDays(quarterEndDate, 1));
    const shouldInclude = overlapCheck1 && overlapCheck2;
    
    console.log(`Week ${weekNumber} candidate:`, {
      start: currentWeekStart.toDateString(),
      startISO: currentWeekStart.toISOString(),
      end: weekEnd.toDateString(),
      endISO: weekEnd.toISOString(),
      overlapCheck1: `weekEnd > quarterStart = ${overlapCheck1}`,
      overlapCheck2: `weekStart < quarterEnd+1 = ${overlapCheck2}`,
      shouldInclude
    });
    
    // Only include weeks that overlap with the quarter
    if (shouldInclude) {
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
  
  console.log(`Generated ${weeks.length} weeks:`, weeks.map(w => w.label));
  
  return weeks;
}

/**
 * Find which week a date falls into within a quarter
 */
export function findWeekForDate(date: Date, weeks: WeekRange[]): WeekRange | null {
  console.log('🔍 FINDING WEEK FOR DATE:', {
    targetDate: date.toDateString(),
    targetISO: date.toISOString(),
    availableWeeks: weeks.length
  });
  
  const foundWeek = weeks.find(week => {
    const isWithinWeek = !isBefore(date, week.startDate) && !isAfter(date, week.endDate);
    console.log(`  Checking ${week.label}:`, {
      weekStart: week.startDate.toDateString(),
      weekEnd: week.endDate.toDateString(),
      dateAfterStart: !isBefore(date, week.startDate),
      dateBeforeEnd: !isAfter(date, week.endDate),
      isWithinWeek
    });
    return isWithinWeek;
  });
  
  console.log('Found week:', foundWeek ? foundWeek.label : 'none');
  return foundWeek || null;
}

/**
 * Get current week from available weeks
 */
export function getCurrentWeek(weeks: WeekRange[]): WeekRange | null {
  const today = new Date();
  return findWeekForDate(today, weeks);
}