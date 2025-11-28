<script lang="ts">
  import { cn } from '$lib/utils';

  interface Props {
    checked?: boolean;
    disabled?: boolean;
    class?: string;
    onchange?: (checked: boolean) => void;
  }

  let {
    checked = $bindable(false),
    disabled = false,
    class: className = '',
    onchange
  }: Props = $props();

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    checked = target.checked;
    onchange?.(checked);
  }
</script>

<input
  type="checkbox"
  {checked}
  {disabled}
  class={cn(
    'h-4 w-4 rounded border-gray-300 text-primary',
    'focus:ring-2 focus:ring-ring focus:ring-offset-1',
    'transition-all duration-150',
    'disabled:cursor-not-allowed disabled:opacity-50',
    className
  )}
  onchange={handleChange}
/>

