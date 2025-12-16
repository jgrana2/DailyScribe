<script lang="ts">
  import Card from './ui/Card.svelte';
  import Checkbox from './ui/Checkbox.svelte';
  import { processedNote } from '$lib/stores/notes';
  import { slide, fade } from 'svelte/transition';
  import type { ActionItem } from '$lib/types';

  function toggleItem(id: string) {
    processedNote.update(note => {
      if (!note) return note;
      return {
        ...note,
        actionItems: note.actionItems.map(item =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      };
    });
  }
</script>

{#if $processedNote?.actionItems && $processedNote.actionItems.length > 0}
  <div in:slide={{ duration: 300 }}>
    <Card class="p-4 animate-slide-up">
      <h3 class="mb-3 flex items-center gap-2 font-medium text-foreground">
        <img src="/checkmark-outline.svg" alt="Action Items icon" class="w-5 h-5" />
        <span>Action Items</span>
        <span class="ml-auto text-sm text-muted-foreground">
          {$processedNote.actionItems.filter(i => i.completed).length}/{$processedNote.actionItems.length}
        </span>
      </h3>
      <ul class="space-y-2">
        {#each $processedNote.actionItems as item, i (item.id)}
          <li
            class="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
            in:fade={{ delay: i * 50, duration: 150 }}
          >
            <Checkbox
              checked={item.completed}
              onchange={() => toggleItem(item.id)}
              class="mt-0.5"
            />
            <span
              class="text-sm transition-all duration-200 {item.completed
                ? 'text-muted-foreground line-through'
                : 'text-foreground'}"
            >
              {item.text}
            </span>
          </li>
        {/each}
      </ul>
    </Card>
  </div>
{/if}
