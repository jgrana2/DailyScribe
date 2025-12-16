import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { DailyNote } from '$lib/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISODate(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISODate(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(dateStr: string): Date {
  // Handle full ISO strings by taking only the date part
  const cleanDateStr = dateStr.split('T')[0];
  const [year, month, day] = cleanDateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function getStartOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Escapes a value for CSV format
 */
function escapeCsvField(value: string | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  // If the field contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates a CSV Blob from an array of DailyNote objects
 * Columns: Date, Task Category, Task Description, Task Summary
 */
export function generateTasksCsv(notes: DailyNote[]): Blob {
  const headers = ['Date', 'Task Category', 'Task Description', 'Task Summary'];
  
  // Sort notes by date (oldest first for chronological order in CSV)
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const rows = sortedNotes.map(note => {
    const date = typeof note.date === 'string' ? parseISODate(note.date) : note.date;
    const formattedDate = toISODateString(date);
    
    return [
      escapeCsvField(formattedDate),
      escapeCsvField(note.taskCategory),
      escapeCsvField(note.taskDescription),
      escapeCsvField(note.taskSummary)
    ].join(',');
  });
  
  const csvContent = [headers.join(','), ...rows].join('\n');
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Triggers a browser download of a Blob with a given filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

