<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { fade, slide } from 'svelte/transition';
  import NoteCapture from '$lib/components/NoteCapture.svelte';
  import StructuredNote from '$lib/components/StructuredNote.svelte';
  import ActionItems from '$lib/components/ActionItems.svelte';
  import TaskClassification from '$lib/components/TaskClassification.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Toast from '$lib/components/ui/Toast.svelte';
  import {
    currentDate,
    rawText,
    processedNote,
    taskClassification,
    isSaving,
    saveNote,
    loadCurrentNote,
    resetStores
  } from '$lib/stores/notes';
  import { formatDate, toISODateString, parseISODate, getStartOfDay } from '$lib/utils';

  let showToast = $state(false);
  let toastMessage = $state('');
  let toastType: 'success' | 'error' | 'info' = $state('success');
  let hasProcessed = $state(false);

  // Sync state with URL
  $effect(() => {
    const dateParam = $page.url.searchParams.get('date');
    const targetDate = dateParam ? parseISODate(dateParam) : getStartOfDay(new Date());
    const currentStr = toISODateString($currentDate);
    const targetStr = toISODateString(targetDate);
    console.log('Effect triggered, dateParam:', dateParam, 'targetDate:', targetDate);

    // Only update if the date is different
    if (currentStr !== targetStr) {
      console.log('Updating to new date:', targetDate);
      currentDate.set(targetDate);
      resetStores();
      loadCurrentNote();
      hasProcessed = false;
    } else if ($rawText === '' && !$processedNote && !$taskClassification) {
      console.log('Initial load');
      // Initial load if store is empty (e.g. on page refresh)
      loadCurrentNote();
    }
  });

  function handleProcessed() {
    hasProcessed = true;
  }

  async function handleSave() {
    const date = $currentDate;
    const raw = $rawText;
    const processed = $processedNote;
    const classification = $taskClassification;

    if (!raw.trim()) {
      showNotification('Please enter some notes first', 'error');
      return;
    }

    const result = await saveNote(date, {
      rawText: raw,
      yesterday: processed?.yesterday,
      today: processed?.today,
      blockers: processed?.blockers,
      proseSummary: processed?.proseSummary,
      actionItems: processed?.actionItems,
      taskCategory: classification?.taskCategory,
      taskDescription: classification?.taskDescription
    });

    if (result) {
      showNotification('Notes saved successfully!', 'success');
    } else {
      showNotification('Failed to save notes', 'error');
    }
  }

  function handleDateChange(e: Event) {
    const target = e.target as HTMLInputElement;
    goto(`/?date=${target.value}`);
  }

  function goToToday() {
    goto('/');
  }

  function showNotification(message: string, type: 'success' | 'error' | 'info') {
    toastMessage = message;
    toastType = type;
    showToast = true;
    setTimeout(() => {
      showToast = false;
    }, 3000);
  }

  // Check if there's content to show
  let hasContent = $derived($processedNote !== null || hasProcessed);
</script>

<svelte:head>
  <title>Daily Notes | Daily Scribe</title>
</svelte:head>

<div class="space-y-6">
  <!-- Date Header -->
  <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" in:fade={{ duration: 200 }}>
    <div>
      <h1 class="text-2xl font-bold text-foreground sm:text-3xl">
        {formatDate($currentDate)}
      </h1>
      <p class="mt-1 text-sm text-muted-foreground">
        Capture your daily standup notes
      </p>
    </div>

    <div class="flex items-center gap-2">
      <input
        type="date"
        value={toISODateString($currentDate)}
        onchange={handleDateChange}
        class="rounded-lg border border-input bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <Button variant="outline" size="sm" onclick={goToToday}>
        {#snippet children()}Today{/snippet}
      </Button>
    </div>
  </div>

  <!-- Note Capture -->
  <NoteCapture onProcessed={handleProcessed} />

  <!-- Processed Content -->
  {#if hasContent}
    <div class="space-y-4" in:slide={{ duration: 300 }}>
      <StructuredNote />
      <ActionItems />
      <TaskClassification />

      <!-- Save Button -->
      <div class="flex justify-end pt-2">
        <Button
          onclick={handleSave}
          disabled={$isSaving || !$rawText.trim()}
          loading={$isSaving}
          class="min-w-[140px]"
        >
          {#snippet children()}
            {#if !$isSaving}
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            {/if}
            <span>{$isSaving ? 'Saving...' : 'Save Notes'}</span>
          {/snippet}
        </Button>
      </div>
    </div>
  {/if}
</div>

<Toast message={toastMessage} type={toastType} visible={showToast} onclose={() => (showToast = false)} />
