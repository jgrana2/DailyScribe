import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db/client';
import { getStartOfDay, parseISODate } from '$lib/utils';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const date = getStartOfDay(parseISODate(params.date));
    console.log('API GET note for params.date:', params.date, 'parsed date:', date);

    const note = await prisma.dailyNote.findUnique({
      where: { date }
    });
    console.log('Found note:', note);

    if (!note) {
      return json({ success: true, data: null });
    }

    return json({ success: true, data: note });
  } catch (error) {
    console.error('Get note error:', error);
    return json(
      { success: false, error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
};

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const body = await request.json();
    const date = getStartOfDay(parseISODate(params.date));

    const {
      rawText,
      yesterday,
      today,
      blockers,
      proseSummary,
      actionItems,
      taskCategory,
      taskDescription
    } = body;

    const note = await prisma.dailyNote.upsert({
      where: { date },
      create: {
        date,
        rawText: rawText || '',
        yesterday: formatField(yesterday),
        today: formatField(today),
        blockers: formatField(blockers),
        proseSummary,
        actionItems: actionItems ? JSON.stringify(actionItems) : null,
        taskCategory,
        taskDescription
      },
      update: {
        ...(rawText !== undefined && { rawText }),
        ...(yesterday !== undefined && { yesterday: formatField(yesterday) }),
        ...(today !== undefined && { today: formatField(today) }),
        ...(blockers !== undefined && { blockers: formatField(blockers) }),
        ...(proseSummary !== undefined && { proseSummary }),
        ...(actionItems !== undefined && { actionItems: JSON.stringify(actionItems) }),
        ...(taskCategory !== undefined && { taskCategory }),
        ...(taskDescription !== undefined && { taskDescription })
      }
    });

    return json({ success: true, data: note });
  } catch (error) {
    console.error('Update note error:', error);
    return json(
      { success: false, error: 'Failed to update note' },
      { status: 500 }
    );
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    const date = getStartOfDay(new Date(params.date));
    console.log(`Attempting to delete note for date: ${date.toISOString()} (param: ${params.date})`);

    try {
      await prisma.dailyNote.delete({
        where: { date }
      });
    } catch (e: any) {
      // If record not found (P2025), try to find it by range or leniently
      if (e.code === 'P2025') {
        console.warn(`Note not found for exact date ${date.toISOString()}, trying lenient delete...`);
        // Attempt to delete any note that falls within this day in UTC or Local
        // Since date is unique, we can try to find one.
        
        // Construct range for the day in UTC
        const targetDate = new Date(params.date);
        const startOfDay = new Date(targetDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const result = await prisma.dailyNote.deleteMany({
          where: {
            date: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        });
        
        console.log(`Lenient delete result: ${result.count} deleted`);
        
        if (result.count === 0) {
            // Try one more fallback: Local time range?
            // Or just return success if it's already gone.
            return json({ success: true, message: 'Note already deleted or not found' });
        }
      } else {
        throw e;
      }
    }

    return json({ success: true });
  } catch (error) {
    console.error('Delete note error:', error);
    return json(
      { success: false, error: 'Failed to delete note' },
      { status: 500 }
    );
  }
};

function formatField(value: string | string[] | null | undefined): string | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    return value.join('\n• ');
  }
  return value;
}

