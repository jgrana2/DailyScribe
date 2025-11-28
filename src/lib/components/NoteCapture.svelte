<script lang="ts">
  import Textarea from './ui/Textarea.svelte';
  import Button from './ui/Button.svelte';
  import Card from './ui/Card.svelte';
  import VoiceRecorder from './VoiceRecorder.svelte';
  import { rawText, isProcessing, processWithAI, classifyWithAI } from '$lib/stores/notes';
  import { fade, slide } from 'svelte/transition';

  interface Props {
    onProcessed?: () => void;
  }

  let { onProcessed }: Props = $props();

  let localText = $state('');

  // Sync with store
  $effect(() => {
    localText = $rawText;
  });

  function handleTextChange(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    localText = target.value;
    rawText.set(localText);
  }

  function handleTranscription(text: string) {
    const newText = localText ? `${localText}\n\n${text}` : text;
    localText = newText;
    rawText.set(newText);
  }

  async function handleProcess() {
    if (!localText.trim()) return;

    const result = await processWithAI(localText);
    if (result) {
      // Auto-classify after processing
      await classifyWithAI({
        yesterday: result.yesterday,
        today: result.today,
        blockers: result.blockers,
        proseSummary: result.proseSummary
      });
      onProcessed?.();
    }
  }
</script>

<Card class="p-6 animate-fade-in">
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-foreground">Daily Notes</h2>
      <VoiceRecorder onTranscription={handleTranscription} disabled={$isProcessing} />
    </div>

    <div class="space-y-2">
      <p class="text-sm text-muted-foreground">
        Share what you worked on yesterday, what you're planning today, and any blockers.
        You can type freely or use voice recording.
      </p>
      <Textarea
        value={localText}
        oninput={handleTextChange}
        placeholder="Yesterday I worked on...&#10;&#10;Today I plan to...&#10;&#10;Blockers:..."
        rows={8}
        disabled={$isProcessing}
        class="font-mono text-sm"
      />
    </div>

    <div class="flex justify-end">
      <Button
        onclick={handleProcess}
        disabled={!localText.trim() || $isProcessing}
        loading={$isProcessing}
        class="min-w-[160px]"
      >
        {#snippet children()}
          {#if !$isProcessing}
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          {/if}
          <span>{$isProcessing ? 'Processing...' : 'Process with AI'}</span>
        {/snippet}
      </Button>
    </div>
  </div>
</Card>

