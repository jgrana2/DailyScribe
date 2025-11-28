<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    value?: string;
    options: readonly string[];
    placeholder?: string;
    disabled?: boolean;
    class?: string;
    onchange?: (e: Event) => void;
  }

  let {
    value = $bindable(''),
    options,
    placeholder = 'Select...',
    disabled = false,
    class: className = '',
    onchange
  }: Props = $props();
</script>

<select
  bind:value
  {disabled}
  class={cn(
    'flex h-10 w-full items-center justify-between rounded-lg border border-input',
    'bg-white px-3 py-2 text-sm',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
    'disabled:cursor-not-allowed disabled:opacity-50',
    className
  )}
  {onchange}
>
  {#if placeholder}
    <option value="" disabled>{placeholder}</option>
  {/if}
  {#each options as option}
    <option value={option}>{option}</option>
  {/each}
</select>

