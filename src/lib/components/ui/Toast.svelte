<script lang="ts">
  import { cn } from '$lib/utils';
  import { fade, fly } from 'svelte/transition';

  interface Props {
    message: string;
    type?: 'success' | 'error' | 'info';
    visible?: boolean;
    onclose?: () => void;
  }

  let { message, type = 'info', visible = false, onclose }: Props = $props();

  const types = {
    success: 'bg-success text-success-foreground',
    error: 'bg-destructive text-destructive-foreground',
    info: 'bg-primary text-primary-foreground'
  };
</script>

{#if visible}
  <div
    class="fixed bottom-4 right-4 z-50"
    in:fly={{ y: 20, duration: 200 }}
    out:fade={{ duration: 150 }}
  >
    <div
      class={cn(
        'flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg',
        types[type]
      )}
    >
      <span class="text-sm font-medium">{message}</span>
      {#if onclose}
        <button
          class="ml-2 opacity-70 hover:opacity-100 transition-opacity"
          onclick={onclose}
          aria-label="Close"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/if}
    </div>
  </div>
{/if}

