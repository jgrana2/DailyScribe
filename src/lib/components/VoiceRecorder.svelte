<script lang="ts">
  import { cn } from '$lib/utils';
  import Button from './ui/Button.svelte';
  import type { RecordingState } from '$lib/types';

  interface Props {
    onTranscription: (text: string) => void;
    disabled?: boolean;
  }

  let { onTranscription, disabled = false }: Props = $props();

  let recordingState: RecordingState = $state('idle');
  let mediaRecorder: MediaRecorder | null = $state(null);
  let audioChunks: Blob[] = $state([]);
  let error: string | null = $state(null);

  async function startRecording() {
    error = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: mediaRecorder?.mimeType || 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await transcribe(audioBlob);
      };

      mediaRecorder.start();
      recordingState = 'recording';
    } catch (err) {
      console.error('Failed to start recording:', err);
      error = 'Could not access microphone. Please check permissions.';
      recordingState = 'idle';
    }
  }

  function stopRecording() {
    if (mediaRecorder && recordingState === 'recording') {
      mediaRecorder.stop();
      recordingState = 'processing';
    }
  }

  async function transcribe(audioBlob: Blob) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success && result.text) {
        onTranscription(result.text);
      } else {
        error = result.error || 'Failed to transcribe audio';
      }
    } catch (err) {
      console.error('Transcription error:', err);
      error = 'Failed to transcribe audio. Please try again.';
    } finally {
      recordingState = 'idle';
    }
  }
</script>

<div class="flex flex-col items-center gap-2">
  {#if recordingState === 'idle'}
    <Button
      variant="outline"
      size="lg"
      {disabled}
      onclick={startRecording}
      class="gap-2"
    >
      {#snippet children()}
        <svg
          class="h-5 w-5 text-red-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
        <span>Start Recording</span>
      {/snippet}
    </Button>
  {:else if recordingState === 'recording'}
    <Button
      variant="destructive"
      size="lg"
      onclick={stopRecording}
      class="gap-2 animate-pulse-recording"
    >
      {#snippet children()}
        <span class="relative flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <span>Stop Recording</span>
      {/snippet}
    </Button>
  {:else}
    <Button variant="secondary" size="lg" disabled class="gap-2">
      {#snippet children()}
        <svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Transcribing...</span>
      {/snippet}
    </Button>
  {/if}

  {#if error}
    <p class="text-sm text-destructive animate-fade-in">{error}</p>
  {/if}
</div>

