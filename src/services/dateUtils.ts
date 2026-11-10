import { format, parseISO, isValid, addDays, differenceInDays } from 'date-fns';

export function formatDisplayDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(d)) return typeof dateInput === 'string' ? dateInput : '';
    return format(d, 'dd MMMM yyyy');
  } catch {
    return typeof dateInput === 'string' ? dateInput : '';
  }
}

export function formatDateTime(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(d)) return typeof dateInput === 'string' ? dateInput : '';
    return format(d, 'dd MMM yyyy, hh:mm a');
  } catch {
    return typeof dateInput === 'string' ? dateInput : '';
  }
}

export function getTodayISODate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function calculateDueDate(baseDateStr: string, preset: string): string {
  const d = parseISO(baseDateStr);
  if (!isValid(d)) return baseDateStr;
  
  switch (preset) {
    case 'Due on receipt':
      return baseDateStr;
    case 'Within 48 hours of project completion and approval':
      return format(addDays(d, 2), 'yyyy-MM-dd');
    case '50% advance, 50% on delivery':
      return format(addDays(d, 7), 'yyyy-MM-dd');
    case 'Net 7':
      return format(addDays(d, 7), 'yyyy-MM-dd');
    default:
      return format(addDays(d, 7), 'yyyy-MM-dd');
  }
}

export function calculateValidTillDate(baseDateStr: string, days = 15): string {
  const d = parseISO(baseDateStr);
  if (!isValid(d)) return baseDateStr;
  return format(addDays(d, days), 'yyyy-MM-dd');
}

export function getDaysDifference(startDateStr: string, endDateStr: string): number {
  try {
    const start = parseISO(startDateStr);
    const end = parseISO(endDateStr);
    if (!isValid(start) || !isValid(end)) return 0;
    return differenceInDays(end, start);
  } catch {
    return 0;
  }
}


