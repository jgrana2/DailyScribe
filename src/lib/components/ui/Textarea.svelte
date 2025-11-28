<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
    class?: string;
    oninput?: (e: Event) => void;
    onblur?: (e: FocusEvent) => void;
  }

  let {
    value = $bindable(''),
    placeholder = '',
    disabled = false,
    rows = 4,
    class: className = '',
    oninput,
    onblur
  }: Props = $props();
</script>

<textarea
  bind:value
  {placeholder}
  {disabled}
  {rows}
  class={cn(
    'flex min-h-[80px] w-full rounded-lg border border-input bg-white px-4 py-3',
    'text-base placeholder:text-muted-foreground',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'resize-none',
    className
  )}
  {oninput}
  {onblur}
></textarea>

