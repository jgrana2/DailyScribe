import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { processNotes } from '$lib/services/noteProcessor';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { rawText } = body;

    if (!rawText || typeof rawText !== 'string') {
      return json(
        { success: false, error: 'No text provided for processing' },
        { status: 400 }
      );
    }

    const result = await processNotes(rawText);

    if (!result.success) {
      return json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Processing endpoint error:', error);
    return json(
      { success: false, error: 'Failed to process notes' },
      { status: 500 }
    );
  }
};

