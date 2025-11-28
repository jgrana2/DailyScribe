import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import type { ProcessedNote, ActionItem } from '$lib/types';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

const SYSTEM_PROMPT = `You are an AI assistant that processes daily scrum notes. Given unstructured text about someone's workday, you must:

1. Extract and structure the information into three categories:
   - Yesterday: What was done yesterday (as bullet points)
   - Today: What is planned for today (as bullet points)
   - Blockers: Any blockers or impediments (as bullet points)

2. Generate a presentation-friendly summary:
   - Two short paragraphs of natural prose summarizing the work
   - Suitable for reading aloud in a standup meeting
   - Professional but conversational tone

3. Extract action items:
   - Identify specific tasks or action steps mentioned
   - Each should be actionable and clear

Respond ONLY with valid JSON in this exact format:
{
  "yesterday": ["bullet point 1", "bullet point 2"],
  "today": ["bullet point 1", "bullet point 2"],
  "blockers": ["blocker 1"] or [],
  "proseSummary": "First paragraph about what was accomplished.\\n\\nSecond paragraph about today's plans and any challenges.",
  "actionItems": [
    {"id": "1", "text": "Action item text", "completed": false}
  ]
}

If a section has no content, use an empty array. Always include all fields.`;

export interface ProcessingResult {
  success: boolean;
  data?: ProcessedNote;
  error?: string;
}

/**
 * Processes unstructured daily notes using GPT-5.1
 */
export async function processNotes(rawText: string): Promise<ProcessingResult> {
  try {
    if (!OPENAI_API_KEY) {
      return fallbackProcessing(rawText, 'OpenAI API key is not configured');
    }

    if (!rawText.trim()) {
      return {
        success: false,
        error: 'No text provided for processing'
      };
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-5.1-2025-11-13',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: rawText }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return fallbackProcessing(rawText, 'No response from AI');
    }

    const parsed = JSON.parse(content);
    
    // Validate and normalize the response
    const processed: ProcessedNote = {
      yesterday: Array.isArray(parsed.yesterday) ? parsed.yesterday : [],
      today: Array.isArray(parsed.today) ? parsed.today : [],
      blockers: Array.isArray(parsed.blockers) ? parsed.blockers : [],
      proseSummary: typeof parsed.proseSummary === 'string' ? parsed.proseSummary : '',
      actionItems: normalizeActionItems(parsed.actionItems)
    };

    return {
      success: true,
      data: processed
    };
  } catch (error) {
    console.error('Note processing error:', error);
    return fallbackProcessing(
      rawText,
      error instanceof Error ? error.message : 'Unknown processing error'
    );
  }
}

function normalizeActionItems(items: unknown): ActionItem[] {
  if (!Array.isArray(items)) return [];
  
  return items
    .filter((item): item is Record<string, unknown> => 
      typeof item === 'object' && item !== null
    )
    .map((item, index) => ({
      id: String(item.id ?? index + 1),
      text: String(item.text ?? ''),
      completed: Boolean(item.completed)
    }))
    .filter(item => item.text.trim().length > 0);
}

/**
 * Fallback processing using basic heuristics when AI is unavailable
 */
function fallbackProcessing(rawText: string, reason: string): ProcessingResult {
  console.warn('Using fallback processing:', reason);

  const lines = rawText.split('\n').filter(line => line.trim());
  const yesterday: string[] = [];
  const today: string[] = [];
  const blockers: string[] = [];

  let currentSection: 'yesterday' | 'today' | 'blockers' | null = null;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Detect section headers
    if (lowerLine.includes('yesterday') || lowerLine.includes('did')) {
      currentSection = 'yesterday';
      continue;
    } else if (lowerLine.includes('today') || lowerLine.includes('plan') || lowerLine.includes('will')) {
      currentSection = 'today';
      continue;
    } else if (lowerLine.includes('blocker') || lowerLine.includes('block') || lowerLine.includes('issue')) {
      currentSection = 'blockers';
      continue;
    }

    // Add to current section
    const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
    if (cleanLine) {
      if (currentSection === 'yesterday') {
        yesterday.push(cleanLine);
      } else if (currentSection === 'today') {
        today.push(cleanLine);
      } else if (currentSection === 'blockers') {
        blockers.push(cleanLine);
      } else {
        // Default to today if no section detected
        today.push(cleanLine);
      }
    }
  }

  // Generate simple prose summary
  const proseParts: string[] = [];
  if (yesterday.length > 0) {
    proseParts.push(`Yesterday, work was done on: ${yesterday.join(', ')}.`);
  }
  if (today.length > 0) {
    proseParts.push(`Today's focus will be on: ${today.join(', ')}.`);
  }
  if (blockers.length > 0) {
    proseParts.push(`Current blockers include: ${blockers.join(', ')}.`);
  }

  return {
    success: true,
    data: {
      yesterday,
      today,
      blockers,
      proseSummary: proseParts.join('\n\n') || 'No structured content could be extracted.',
      actionItems: []
    }
  };
}

