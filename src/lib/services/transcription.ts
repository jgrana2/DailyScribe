import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

export interface TranscriptionResult {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * Transcribes audio using OpenAI Whisper API
 * @param audioBuffer - The audio file as a Buffer
 * @param filename - Original filename with extension
 * @returns Transcription result with text or error
 */
export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string = 'audio.webm'
): Promise<TranscriptionResult> {
  try {
    if (!OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OpenAI API key is not configured'
      };
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return {
        success: false,
        error: 'No audio data provided'
      };
    }

    // Create a File object from the buffer
    const file = new File([audioBuffer], filename, {
      type: getMimeType(filename)
    });

    const response = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text'
    });

    return {
      success: true,
      text: response.trim()
    };
  } catch (error) {
    console.error('Transcription error:', error);

    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        return {
          success: false,
          error: 'Invalid OpenAI API key'
        };
      }
      if (error.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        };
      }
      return {
        success: false,
        error: `API error: ${error.message}`
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown transcription error'
    };
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    webm: 'audio/webm',
    mp3: 'audio/mpeg',
    mp4: 'audio/mp4',
    m4a: 'audio/m4a',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    flac: 'audio/flac'
  };
  return mimeTypes[ext || ''] || 'audio/webm';
}

