import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { transcribeAudio } from '$lib/services/transcription';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof File)) {
      return json(
        { success: false, error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await transcribeAudio(buffer, audioFile.name);

    if (!result.success) {
      return json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return json({
      success: true,
      text: result.text
    });
  } catch (error) {
    console.error('Transcription endpoint error:', error);
    return json(
      { success: false, error: 'Failed to process audio' },
      { status: 500 }
    );
  }
};

