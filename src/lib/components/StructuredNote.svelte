<script lang="ts">
  import Card from './ui/Card.svelte';
  import { processedNote } from '$lib/stores/notes';
  import { slide, fade } from 'svelte/transition';

  const sections = [
    { key: 'yesterday', title: 'Yesterday', icon: '📋', color: 'bg-blue-50 border-blue-200' },
    { key: 'today', title: 'Today', icon: '🎯', color: 'bg-green-50 border-green-200' },
    { key: 'blockers', title: 'Blockers', icon: '🚧', color: 'bg-amber-50 border-amber-200' }
  ] as const;
</script>

{#if $processedNote}
  <div class="space-y-4 animate-slide-up" in:slide={{ duration: 300 }}>
    <h2 class="text-lg font-semibold text-foreground">Structured Notes</h2>

    <div class="grid gap-4 md:grid-cols-3">
      {#each sections as section, i}
        {@const items = $processedNote[section.key]}
        <div
          class="rounded-lg border p-4 {section.color} transition-all duration-200 hover:shadow-sm"
          in:fade={{ delay: i * 100, duration: 200 }}
        >
          <h3 class="mb-3 flex items-center gap-2 font-medium text-foreground">
            <span>{section.icon}</span>
            <span>{section.title}</span>
          </h3>
          {#if items && items.length > 0}
            <ul class="space-y-2">
              {#each items as item, j}
                <li
                  class="flex items-start gap-2 text-sm text-foreground/80"
                  in:slide={{ delay: i * 100 + j * 50, duration: 150 }}
                >
                  <span class="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-50"></span>
                  <span>{item}</span>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="text-sm italic text-muted-foreground">No items</p>
          {/if}
        </div>
      {/each}
    </div>

    {#if $processedNote.proseSummary}
      <Card class="p-4 bg-gradient-to-br from-slate-50 to-white">
        <h3 class="mb-3 flex items-center gap-2 font-medium text-foreground">
          <span>📝</span>
          <span>Meeting Summary</span>
        </h3>
        <div class="prose prose-sm max-w-none text-foreground/80">
          {#each $processedNote.proseSummary.split('\n\n') as paragraph}
            <p class="mb-2 last:mb-0">{paragraph}</p>
          {/each}
        </div>
      </Card>
    {/if}
  </div>
{/if}

