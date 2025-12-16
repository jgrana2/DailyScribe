<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { fade, slide } from 'svelte/transition';
  import CalendarView from '$lib/components/CalendarView.svelte';
  import NoteCard from '$lib/components/NoteCard.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { notesCache, fetchNotesForMonth, currentDate, deleteNote } from '$lib/stores/notes';
  import { toISODateString, formatDate, parseISODate, generateTasksCsv, downloadBlob } from '$lib/utils';
  import type { DailyNote } from '$lib/types';

  let selectedDate = $state(new Date());
  let viewMode: 'list' | 'calendar' = $state('calendar');
  let isLoading = $state(true);
  let currentMonth = $state(new Date().getMonth() + 1);
  let currentYear = $state(new Date().getFullYear());

  // Get notes sorted by date (newest first)
  let sortedNotes = $derived.by(() => {
    const notes = Array.from($notesCache.values());
    return notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  // Get selected note
  let selectedNote = $derived.by(() => {
    const dateStr = toISODateString(selectedDate);
    return $notesCache.get(dateStr) ?? null;
  });

  onMount(async () => {
    const now = new Date();
    await fetchNotesForMonth(now.getFullYear(), now.getMonth() + 1);
    isLoading = false;
  });

  function handleSelectDate(date: Date) {
    selectedDate = date;
  }

  function navigateToNote(note: DailyNote) {
    const date = typeof note.date === 'string' ? parseISODate(note.date) : note.date;
    const dateStr = toISODateString(date);
    console.log('navigateToNote called with note.date:', note.date, 'parsed date:', date, 'dateStr:', dateStr);
    goto(`/?date=${dateStr}`);
  }

  function navigateToSelectedDate() {
    const dateStr = toISODateString(selectedDate);
    goto(`/?date=${dateStr}`);
  }

  async function handleDeleteNote(note: DailyNote) {
    const date = typeof note.date === 'string' ? parseISODate(note.date) : note.date;
    const success = await deleteNote(date);
    if (!success) {
      alert('Failed to delete note');
    }
  }

  function handleExportCsv() {
    // Filter notes for the current month
    const notesForMonth = Array.from($notesCache.values()).filter(note => {
      const noteDate = typeof note.date === 'string' ? parseISODate(note.date) : note.date;
      return noteDate.getMonth() + 1 === currentMonth && noteDate.getFullYear() === currentYear;
    });

    if (notesForMonth.length === 0) {
      alert('No tasks to export for this month.');
      return;
    }

    const csvBlob = generateTasksCsv(notesForMonth);
    const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('en-US', { month: 'long' });
    const filename = `tasks-${monthName.toLowerCase()}-${currentYear}.csv`;
    downloadBlob(csvBlob, filename);
  }
</script>

<svelte:head>
  <title>History | Daily Scribe</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" in:fade={{ duration: 200 }}>
    <div>
      <h1 class="text-2xl font-bold text-foreground sm:text-3xl">History</h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Browse and review your past daily notes
      </p>
    </div>

    <div class="flex items-center gap-2">
      <button
        class="inline-flex items-center gap-1.5 rounded-lg border border-input bg-white px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
        onclick={handleExportCsv}
        title="Export tasks to CSV"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="hidden sm:inline">Export CSV</span>
      </button>
      <div class="flex rounded-lg border border-input bg-white p-1">
        <button
          class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {viewMode === 'calendar'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'}"
          onclick={() => (viewMode = 'calendar')}
        >
          Calendar
        </button>
        <button
          class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {viewMode === 'list'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'}"
          onclick={() => (viewMode = 'list')}
        >
          List
        </button>
      </div>
    </div>
  </div>

  {#if isLoading}
    <div class="flex items-center justify-center py-12">
      <svg class="h-8 w-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  {:else if viewMode === 'calendar'}
    <div class="grid gap-6 lg:grid-cols-2" in:fade={{ duration: 200 }}>
      <!-- Calendar -->
      <div>
        <CalendarView 
          {selectedDate} 
          onSelectDate={handleSelectDate} 
          onMonthChange={(year, month) => { currentYear = year; currentMonth = month; }}
        />
      </div>

      <!-- Selected Day Details -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-foreground">
            {formatDate(selectedDate)}
          </h2>
          <Button variant="outline" size="sm" onclick={navigateToSelectedDate}>
            {#snippet children()}
              {#if selectedNote}
                Edit
              {:else}
                Create
              {/if}
            {/snippet}
          </Button>
        </div>

      {#if selectedNote}
        <div in:slide={{ duration: 200 }}>
          <NoteCard 
            note={selectedNote} 
            onclick={() => navigateToNote(selectedNote)} 
            ondelete={() => handleDeleteNote(selectedNote)}
          />
        </div>
      {:else}
          <div
            class="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center"
            in:fade={{ duration: 150 }}
          >
            <svg
              class="mx-auto h-12 w-12 text-muted-foreground/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p class="mt-3 text-sm text-muted-foreground">No notes for this day</p>
            <Button
              variant="outline"
              size="sm"
              class="mt-4"
              onclick={navigateToSelectedDate}
            >
              {#snippet children()}
                <span>Create Note</span>
              {/snippet}
            </Button>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <!-- List View -->
    <div class="space-y-3" in:fade={{ duration: 200 }}>
      {#if sortedNotes.length === 0}
        <div class="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
          <svg
            class="mx-auto h-16 w-16 text-muted-foreground/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 class="mt-4 text-lg font-medium text-foreground">No notes yet</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Start capturing your daily standup notes
          </p>
          <Button class="mt-4" onclick={() => goto('/')}>
            {#snippet children()}
              <span>Create Your First Note</span>
            {/snippet}
          </Button>
        </div>
      {:else}
        {#each sortedNotes as note, i (note.id)}
          <div
            in:fade={{ delay: Math.min(i * 50, 300), duration: 200 }}
          >
            <NoteCard
              {note}
              onclick={() => navigateToNote(note)}
              ondelete={() => handleDeleteNote(note)}
            />
          </div>
        {/each}
      {/if}
    </div>
  {/if}
</div>

