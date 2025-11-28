import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/db/client';
import { getStartOfDay, toISODateString, parseISODate } from '$lib/utils';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const dateParam = url.searchParams.get('date');
    const month = url.searchParams.get('month');
    const year = url.searchParams.get('year');

    // Get single note by date
    if (dateParam) {
      const date = getStartOfDay(parseISODate(dateParam));
      const note = await prisma.dailyNote.findUnique({
        where: { date }
      });
      return json({ success: true, data: note });
    }

    // Get notes for a specific month
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

      const notes = await prisma.dailyNote.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { date: 'desc' }
      });
      return json({ success: true, data: notes });
    }

    // Get all notes (with pagination)
    const limit = parseInt(url.searchParams.get('limit') || '30');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const notes = await prisma.dailyNote.findMany({
      take: limit,
      skip: offset,
      orderBy: { date: 'desc' }
    });

    const total = await prisma.dailyNote.count();

    return json({
      success: true,
      data: notes,
      pagination: { limit, offset, total }
    });
  } catch (error) {
    console.error('Get notes error:', error);
    return json(
      { success: false, error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      date,
      rawText,
      yesterday,
      today,
      blockers,
      proseSummary,
      actionItems,
      taskCategory,
      taskDescription,
      taskSummary
    } = body;

    if (!date || !rawText) {
      return json(
        { success: false, error: 'Date and rawText are required' },
        { status: 400 }
      );
    }

    const noteDate = getStartOfDay(parseISODate(date));

    // Upsert - create or update
    const note = await prisma.dailyNote.upsert({
      where: { date: noteDate },
      create: {
        date: noteDate,
        rawText,
        yesterday: formatField(yesterday),
        today: formatField(today),
        blockers: formatField(blockers),
        proseSummary,
        actionItems: actionItems ? JSON.stringify(actionItems) : null,
        taskCategory,
        taskDescription,
        taskSummary
      },
      update: {
        rawText,
        yesterday: formatField(yesterday),
        today: formatField(today),
        blockers: formatField(blockers),
        proseSummary,
        actionItems: actionItems ? JSON.stringify(actionItems) : null,
        taskCategory,
        taskDescription,
        taskSummary
      }
    });

    return json({ success: true, data: note });
  } catch (error) {
    console.error('Save note error:', error);
    return json(
      { success: false, error: 'Failed to save note' },
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

