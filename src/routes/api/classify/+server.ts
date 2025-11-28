import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { classifyTask } from '$lib/services/classifier';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { yesterday, today, blockers, proseSummary, rawText } = body;

    if (!yesterday && !today && !blockers && !proseSummary && !rawText) {
      return json(
        { success: false, error: 'No content provided for classification' },
        { status: 400 }
      );
    }

    const result = await classifyTask({
      yesterday,
      today,
      blockers,
      proseSummary,
      rawText
    });

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
    console.error('Classification endpoint error:', error);
    return json(
      { success: false, error: 'Failed to classify task' },
      { status: 500 }
    );
  }
};

