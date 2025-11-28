<script lang="ts">
  import Card from './ui/Card.svelte';
  import { formatDate, formatDateShort } from '$lib/utils';
  import type { DailyNote } from '$lib/types';
  import { fade, slide } from 'svelte/transition';

  interface Props {
    note: DailyNote;
    compact?: boolean;
    onclick?: () => void;
    ondelete?: () => void;
  }

  let { note, compact = false, onclick, ondelete }: Props = $props();

  let expanded = $state(false);

  function toggleExpand() {
    if (!compact) {
      expanded = !expanded;
    }
  }
  
  function handleDelete(e: MouseEvent) {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      ondelete?.();
    }
  }
</script>

<Card
  class="overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer {compact
    ? 'p-3'
    : 'p-4'}"
>
  <div
    class="w-full text-left group"
    role="button"
    tabindex="0"
    onclick={() => {
      onclick?.();
      toggleExpand();
    }}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onclick?.();
        toggleExpand();
      }
    }}
  >
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-medium text-foreground">
            {compact ? formatDateShort(note.date) : formatDate(note.date)}
          </span>
          {#if note.taskCategory}
            <span
              class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              {note.taskCategory}
            </span>
            {#if note.taskDescription}
              <span class="hidden sm:inline text-xs text-muted-foreground truncate max-w-[200px]">→ {note.taskDescription}</span>
            {/if}
          {/if}
        </div>

        {#if note.taskSummary || note.rawText}
          <p class="text-sm text-muted-foreground line-clamp-2">
            {note.taskSummary ?? note.rawText?.slice(0, 150)}{!note.taskSummary && note.rawText && note.rawText.length > 150 ? '...' : ''}
          </p>
        {/if}
      </div>

      <div class="flex items-center gap-2">
        {#if ondelete}
          <button
            class="p-1 text-muted-foreground hover:text-red-500 transition-colors rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
            onclick={handleDelete}
            title="Delete note"
            aria-label="Delete note"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        {/if}

        {#if !compact}
          <svg
            class="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-200 {expanded
              ? 'rotate-180'
              : ''}"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        {/if}
      </div>
    </div>
  </div>

  {#if expanded && !compact}
    <div class="mt-4 space-y-4 border-t pt-4" in:slide={{ duration: 200 }}>
      {#if note.yesterday}
        <div>
          <h4 class="mb-1 text-sm font-medium text-foreground">Yesterday</h4>
          <p class="text-sm text-muted-foreground whitespace-pre-wrap">{note.yesterday}</p>
        </div>
      {/if}

      {#if note.today}
        <div>
          <h4 class="mb-1 text-sm font-medium text-foreground">Today</h4>
          <p class="text-sm text-muted-foreground whitespace-pre-wrap">{note.today}</p>
        </div>
      {/if}

      {#if note.blockers}
        <div>
          <h4 class="mb-1 text-sm font-medium text-foreground">Blockers</h4>
          <p class="text-sm text-muted-foreground whitespace-pre-wrap">{note.blockers}</p>
        </div>
      {/if}

      {#if note.proseSummary}
        <div>
          <h4 class="mb-1 text-sm font-medium text-foreground">Summary</h4>
          <p class="text-sm text-muted-foreground whitespace-pre-wrap">{note.proseSummary}</p>
        </div>
      {/if}

      {#if note.taskCategory && note.taskDescription}
        <div class="flex items-center gap-2 text-sm">
          <span class="font-medium text-foreground">Classification:</span>
          <span class="text-muted-foreground">
            {note.taskCategory} → {note.taskDescription}
          </span>
        </div>
      {/if}
    </div>
  {/if}
</Card>

