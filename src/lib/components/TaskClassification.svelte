<script lang="ts">
  import Card from './ui/Card.svelte';
  import Button from './ui/Button.svelte';
  import { taskClassification, isClassifying, classifyWithAI, processedNote, rawText } from '$lib/stores/notes';
  import { slide } from 'svelte/transition';

  let selectedCategory = $state('');
  let selectedDescription = $state('');

  // Sync with store
  $effect(() => {
    if ($taskClassification) {
      selectedCategory = $taskClassification.taskCategory;
      selectedDescription = $taskClassification.taskDescription;
    }
  });

  async function reclassify() {
    const note = $processedNote;
    const raw = $rawText;

    if (note) {
      await classifyWithAI({
        yesterday: note.yesterday,
        today: note.today,
        blockers: note.blockers,
        proseSummary: note.proseSummary
      });
    } else if (raw) {
      await classifyWithAI({ rawText: raw });
    }
  }
</script>

<div in:slide={{ duration: 300 }}>
  <Card class="p-4 animate-slide-up">
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="flex items-center gap-2 font-medium text-foreground">
          <span>🏷️</span>
          <span>Task Classification</span>
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onclick={reclassify}
          disabled={$isClassifying}
          loading={$isClassifying}
        >
          {#snippet children()}
            {#if !$isClassifying}
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            {/if}
            <span>Reclassify</span>
          {/snippet}
        </Button>
      </div>

      {#if selectedCategory && selectedDescription}
        <div class="rounded-lg bg-muted/50 p-3 text-sm" in:slide={{ duration: 200 }}>
          <span class="font-medium">{selectedCategory}</span>
          <span class="mx-2 text-muted-foreground">→</span>
          <span class="text-muted-foreground">{selectedDescription}</span>
        </div>
      {/if}
    </div>
  </Card>
</div>

