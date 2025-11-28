import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import { TASK_CATEGORIES, TASK_DESCRIPTIONS, type TaskCategory } from '$lib/constants/categories';
import type { TaskClassification } from '$lib/types';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

const CATEGORIES_JSON = JSON.stringify(
  Object.fromEntries(
    TASK_CATEGORIES.map(cat => [cat, TASK_DESCRIPTIONS[cat]])
  ),
  null,
  2
);

const SYSTEM_PROMPT = `You are an AI assistant that classifies daily work activities into predefined categories.

Given structured daily notes (yesterday, today, blockers) and a prose summary, you must:
1. Determine the PRIMARY Task Category that best describes the day's main work
2. Select the most appropriate Task Description from that category's allowed values
3. Generate a concise, task-oriented single-line summary of what was accomplished

IMPORTANT: You MUST only choose from these exact categories and descriptions:

${CATEGORIES_JSON}

Rules:
- Choose the category that represents the MAJORITY of the day's work
- If multiple activities are present, pick the most significant one
- If unsure, default to "Other" category with "Other Task Category" description
- The taskSummary should be a brief, action-oriented sentence describing the actual work done (e.g., "Implemented user authentication and fixed login validation bug")
- Keep the taskSummary under 100 characters
- Your response must be valid JSON with exact string matches from the allowed values

Respond ONLY with valid JSON in this exact format:
{
  "taskCategory": "exact category name from the list",
  "taskDescription": "exact description from that category's list",
  "taskSummary": "brief task-oriented summary of what was done"
}`;

export interface ClassificationResult {
  success: boolean;
  data?: TaskClassification;
  error?: string;
}

export interface ClassificationInput {
  yesterday?: string | string[];
  today?: string | string[];
  blockers?: string | string[];
  proseSummary?: string;
  rawText?: string;
}

/**
 * Classifies daily work into a task category and description using GPT-5.1
 */
export async function classifyTask(input: ClassificationInput): Promise<ClassificationResult> {
  try {
    if (!OPENAI_API_KEY) {
      return fallbackClassification('OpenAI API key is not configured');
    }

    const contextText = buildContextText(input);
    if (!contextText.trim()) {
      return fallbackClassification('No content provided for classification');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-5.1-2025-11-13',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: contextText }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return fallbackClassification('No response from AI');
    }

    const parsed = JSON.parse(content);

    // Validate the response
    const taskCategory = String(parsed.taskCategory || '');
    const taskDescription = String(parsed.taskDescription || '');
    const taskSummary = String(parsed.taskSummary || 'Work completed for the day');

    if (!isValidClassification(taskCategory, taskDescription)) {
      console.warn('Invalid classification from AI, using fallback');
      return fallbackClassification('Invalid category or description from AI');
    }

    return {
      success: true,
      data: {
        taskCategory,
        taskDescription,
        taskSummary
      }
    };
  } catch (error) {
    console.error('Classification error:', error);
    return fallbackClassification(
      error instanceof Error ? error.message : 'Unknown classification error'
    );
  }
}

function buildContextText(input: ClassificationInput): string {
  const parts: string[] = [];

  if (input.yesterday) {
    const yesterday = Array.isArray(input.yesterday) 
      ? input.yesterday.join('\n- ') 
      : input.yesterday;
    if (yesterday) parts.push(`Yesterday:\n- ${yesterday}`);
  }

  if (input.today) {
    const today = Array.isArray(input.today) 
      ? input.today.join('\n- ') 
      : input.today;
    if (today) parts.push(`Today:\n- ${today}`);
  }

  if (input.blockers) {
    const blockers = Array.isArray(input.blockers) 
      ? input.blockers.join('\n- ') 
      : input.blockers;
    if (blockers) parts.push(`Blockers:\n- ${blockers}`);
  }

  if (input.proseSummary) {
    parts.push(`Summary:\n${input.proseSummary}`);
  }

  if (input.rawText && parts.length === 0) {
    parts.push(`Raw notes:\n${input.rawText}`);
  }

  return parts.join('\n\n');
}

function isValidClassification(category: string, description: string): boolean {
  if (!TASK_CATEGORIES.includes(category as TaskCategory)) {
    return false;
  }
  const validDescriptions = TASK_DESCRIPTIONS[category as TaskCategory];
  return validDescriptions?.includes(description) ?? false;
}

function fallbackClassification(reason: string): ClassificationResult {
  console.warn('Using fallback classification:', reason);
  return {
    success: true,
    data: {
      taskCategory: 'Other',
      taskDescription: 'Other Task Category',
      taskSummary: 'Work completed for the day'
    }
  };
}

