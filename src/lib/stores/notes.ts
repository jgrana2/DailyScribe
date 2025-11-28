import { writable, derived } from 'svelte/store';
import type { DailyNote, ActionItem, ProcessedNote, TaskClassification } from '$lib/types';
import { toISODateString, getStartOfDay } from '$lib/utils';

// Current date being viewed/edited
export const currentDate = writable<Date>(getStartOfDay(new Date()));

// Raw text input
export const rawText = writable<string>('');

// Processed note data
export const processedNote = writable<ProcessedNote | null>(null);

// Task classification
export const taskClassification = writable<TaskClassification | null>(null);

// Loading states
export const isProcessing = writable<boolean>(false);
export const isClassifying = writable<boolean>(false);
export const isTranscribing = writable<boolean>(false);
export const isSaving = writable<boolean>(false);

// Notes cache for history
export const notesCache = writable<Map<string, DailyNote>>(new Map());

// Derived store for current date's note from cache
export const currentNote = derived(
  [currentDate, notesCache],
  ([$currentDate, $notesCache]) => {
    const dateKey = toISODateString($currentDate);
    return $notesCache.get(dateKey) ?? null;
  }
);

// API functions
export async function fetchNote(date: Date): Promise<DailyNote | null> {
  try {
    const dateStr = toISODateString(date);
    const response = await fetch(`/api/notes/${dateStr}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      // Parse action items if stored as JSON string
      const note = {
        ...result.data,
        actionItems: result.data.actionItems 
          ? (typeof result.data.actionItems === 'string' 
              ? JSON.parse(result.data.actionItems) 
              : result.data.actionItems)
          : null
      };
      
      // Update cache
      notesCache.update(cache => {
        cache.set(dateStr, note);
        return cache;
      });
      
      return note;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch note:', error);
    return null;
  }
}

export async function fetchNotesForMonth(year: number, month: number): Promise<DailyNote[]> {
  try {
    const response = await fetch(`/api/notes?year=${year}&month=${month}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      // Update cache
      notesCache.update(cache => {
        for (const note of result.data) {
          const dateStr = toISODateString(new Date(note.date));
          cache.set(dateStr, {
            ...note,
            actionItems: note.actionItems 
              ? (typeof note.actionItems === 'string' 
                  ? JSON.parse(note.actionItems) 
                  : note.actionItems)
              : null
          });
        }
        return cache;
      });
      
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch notes for month:', error);
    return [];
  }
}

export async function processWithAI(text: string): Promise<ProcessedNote | null> {
  isProcessing.set(true);
  try {
    const response = await fetch('/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText: text })
    });
    
    const result = await response.json();
    
    if (result.success && result.data) {
      processedNote.set(result.data);
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to process notes:', error);
    return null;
  } finally {
    isProcessing.set(false);
  }
}

export async function classifyWithAI(data: {
  yesterday?: string | string[];
  today?: string | string[];
  blockers?: string | string[];
  proseSummary?: string;
  rawText?: string;
}): Promise<TaskClassification | null> {
  isClassifying.set(true);
  try {
    const response = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success && result.data) {
      taskClassification.set(result.data);
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('Failed to classify task:', error);
    return null;
  } finally {
    isClassifying.set(false);
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<string | null> {
  isTranscribing.set(true);
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success && result.text) {
      return result.text;
    }
    return null;
  } catch (error) {
    console.error('Failed to transcribe audio:', error);
    return null;
  } finally {
    isTranscribing.set(false);
  }
}

export async function saveNote(date: Date, data: {
  rawText: string;
  yesterday?: string | string[];
  today?: string | string[];
  blockers?: string | string[];
  proseSummary?: string;
  actionItems?: ActionItem[];
  taskCategory?: string;
  taskDescription?: string;
  taskSummary?: string;
}): Promise<DailyNote | null> {
  isSaving.set(true);
  try {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: toISODateString(date),
        ...data
      })
    });
    
    const result = await response.json();
    
    if (result.success && result.data) {
      const note = {
        ...result.data,
        actionItems: result.data.actionItems 
          ? (typeof result.data.actionItems === 'string' 
              ? JSON.parse(result.data.actionItems) 
              : result.data.actionItems)
          : null
      };
      
      // Update cache
      notesCache.update(cache => {
        cache.set(toISODateString(date), note);
        return cache;
      });
      
      return note;
    }
    return null;
  } catch (error) {
    console.error('Failed to save note:', error);
    return null;
  } finally {
    isSaving.set(false);
  }
}

export async function deleteNote(date: Date): Promise<boolean> {
  try {
    const response = await fetch(`/api/notes/${toISODateString(date)}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Update cache
      notesCache.update(cache => {
        cache.delete(toISODateString(date));
        return cache;
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to delete note:', error);
    return false;
  }
}

// Reset stores for a new day
export function resetStores() {
  rawText.set('');
  processedNote.set(null);
  taskClassification.set(null);
}

// Load note for current date
export async function loadCurrentNote() {
  let date: Date;
  currentDate.subscribe(d => date = d)();
  console.log('loadCurrentNote called with date:', date);
  
  const note = await fetchNote(date);
  console.log('Fetched note:', note);
  
  if (note) {
    console.log('Setting rawText:', note.rawText);
    rawText.set(note.rawText || '');
    
    if (note.yesterday || note.today || note.blockers) {
      processedNote.set({
        yesterday: note.yesterday?.split('\n• ').filter(Boolean) ?? [],
        today: note.today?.split('\n• ').filter(Boolean) ?? [],
        blockers: note.blockers?.split('\n• ').filter(Boolean) ?? [],
        proseSummary: note.proseSummary ?? '',
        actionItems: (note.actionItems as ActionItem[]) ?? []
      });
    }
    
    if (note.taskCategory && note.taskDescription) {
      taskClassification.set({
        taskCategory: note.taskCategory,
        taskDescription: note.taskDescription,
        taskSummary: note.taskSummary ?? 'Work completed for the day'
      });
    }
  } else {
    console.log('No note found, resetting stores');
    resetStores();
  }
}

