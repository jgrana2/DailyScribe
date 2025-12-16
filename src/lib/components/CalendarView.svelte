<script lang="ts">
  import { toISODateString, isToday } from '$lib/utils';
  import { notesCache, fetchNotesForMonth } from '$lib/stores/notes';
  import { fade } from 'svelte/transition';

  interface Props {
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    onMonthChange?: (year: number, month: number) => void;
  }

  let { selectedDate, onSelectDate, onMonthChange }: Props = $props();

  let viewDate = $state(new Date(selectedDate));

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let calendarDays = $derived.by(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  });

  let monthYear = $derived(
    viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  );

  function prevMonth() {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    loadMonthNotes();
    onMonthChange?.(viewDate.getFullYear(), viewDate.getMonth() + 1);
  }

  function nextMonth() {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    loadMonthNotes();
    onMonthChange?.(viewDate.getFullYear(), viewDate.getMonth() + 1);
  }

  function selectDate(date: Date) {
    onSelectDate(date);
  }

  function isSameDay(a: Date, b: Date): boolean {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  function hasNote(date: Date): boolean {
    const dateStr = toISODateString(date);
    return $notesCache.has(dateStr);
  }

  async function loadMonthNotes() {
    await fetchNotesForMonth(viewDate.getFullYear(), viewDate.getMonth() + 1);
  }

  // Load notes on mount
  $effect(() => {
    loadMonthNotes();
  });
</script>

<div class="rounded-xl border border-border bg-white p-4 shadow-sm" in:fade={{ duration: 200 }}>
  <div class="mb-4 flex items-center justify-between">
    <button
      class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      onclick={prevMonth}
      aria-label="Previous month"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <h3 class="text-lg font-semibold text-foreground">{monthYear}</h3>
    <button
      class="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      onclick={nextMonth}
      aria-label="Next month"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>

  <div class="grid grid-cols-7 gap-1">
    {#each weekDays as day}
      <div class="py-2 text-center text-xs font-medium text-muted-foreground">
        {day}
      </div>
    {/each}

    {#each calendarDays as day, i}
      {#if day === null}
        <div></div>
      {:else}
        <button
          class="relative aspect-square rounded-lg p-1 text-sm transition-all duration-150
            {isSameDay(day, selectedDate)
              ? 'bg-primary text-primary-foreground font-medium'
              : isToday(day)
                ? 'bg-primary/10 text-primary font-medium'
                : 'hover:bg-muted text-foreground'}
            focus:outline-none focus:ring-2 focus:ring-ring"
          onclick={() => selectDate(day)}
        >
          {day.getDate()}
          {#if hasNote(day)}
            <span
              class="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full
                {isSameDay(day, selectedDate) ? 'bg-primary-foreground' : 'bg-primary'}"
            ></span>
          {/if}
        </button>
      {/if}
    {/each}
  </div>
</div>

