export const TASK_CATEGORIES = [
  'Absence',
  'Administrative',
  'Code Challenge Guideline',
  'Development',
  'Documentation',
  'Hacker Rank',
  'Idle time',
  'Internal Process',
  'Meetings (Client)',
  'Meetings (Internal)',
  'Other',
  'Technical Interview',
  'Testing',
  'Training (Trainee)',
  'Training (Trainer)'
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const TASK_DESCRIPTIONS: Record<TaskCategory, readonly string[]> = {
  Absence: ['National holiday'],

  Administrative: [
    'Daily Progress Report',
    'Email revision/answering',
    'Management Cross Company Process',
    'Other Administrative',
    'Registering hours in time tracker tools',
    'Weekly Progress Report'
  ],

  'Code Challenge Guideline': [
    'Applicant asked for a reschedule CC',
    'Applicant did not show up CC',
    'BairesDev asked for a reschedule CC',
    'CC Completed',
    'Other CC'
  ],

  Development: [
    'Architecture definition',
    'Bug Fixing',
    'Code review',
    'Configuration',
    'DB Automation',
    'DB Maintenance',
    'Debug',
    'Demo preparation',
    'Deployment',
    'Design',
    'Environment setup',
    'Features development',
    'Graphic Design',
    'Integration',
    'Library Upgrade',
    'Mockups Design',
    'Other Development',
    'Peer review',
    'Refactor',
    'Requirements analysis',
    'Research / Analysis',
    'Research and Learning',
    'Rollback',
    'Spike',
    'Support',
    'Test cases development',
    'UI definition',
    'Wireframes Design',
    'Writing User Stories'
  ],

  Documentation: [
    'Diagrams drawing',
    'Documentation reading',
    'Documentation review',
    'Documentation writing',
    'Other Documentation',
    'Research',
    'Technical Writing'
  ],

  'Hacker Rank': [
    'Applicant asked for a reschedule HR',
    'Applicant did not show up HR',
    'BairesDev asked for a reschedule HR',
    'HR Completed',
    'Other HR'
  ],

  'Idle time': [
    'Internet issues',
    'No assigned tasks',
    'Other Idle time',
    'Partial Assignment',
    'Project has not started',
    'Travel'
  ],

  'Internal Process': [
    'Coding challenges review',
    'Other Internal Process',
    'Reviewing exams',
    'Staffing Technical Interview',
    'Technical Screenings'
  ],

  'Meetings (Client)': [
    '1 1 with client focal point',
    'All Hands Meeting',
    'Backlog refinement meeting',
    'Blocker removal meeting',
    'Client Meeting',
    'Client side training',
    'Daily Meeting',
    'KickOff Meeting',
    'Other Meetings (Client)',
    'Sprint Planning',
    'Sprint Retrospective',
    'Sprint Review / Demo'
  ],

  'Meetings (Internal)': [
    '1 1 meeting with HRBP',
    '1 1 meeting with Manager',
    'Other Meetings (Internal)',
    'Team Meeting'
  ],

  Other: ['Other', 'Other Task Category'],

  'Technical Interview': [
    'Applicant asked for a reschedule',
    'Applicant did not show up',
    'BairesDev asked for a reschedule',
    'Other Technical Interview',
    'TI Completed'
  ],

  Testing: [
    'Coding',
    'Environment configuration',
    'Exploratory',
    'Functional Testing',
    'Manual testing',
    'Other Testing',
    'Production Verification',
    'Regression testing',
    'Smoke testing',
    'Test case execution',
    'Test Creation/design',
    'Testathon / UAT'
  ],

  'Training (Trainee)': [
    'Internal course',
    'Online course',
    'Other Training (Trainee)',
    'Project Onboarding (Trainee)',
    'Reading Documentation',
    'Receiving ambassador support',
    'Receiving mentoring support',
    'Self training'
  ],

  'Training (Trainer)': [
    'Other Training (Trainer)',
    'Project Onboarding (Trainer)',
    'Providing ambassador support',
    'Providing mentoring support'
  ]
} as const;

export function getDescriptionsForCategory(category: string): readonly string[] {
  return TASK_DESCRIPTIONS[category as TaskCategory] ?? ['Other Task Category'];
}

export function isValidCategory(category: string): category is TaskCategory {
  return TASK_CATEGORIES.includes(category as TaskCategory);
}

export function isValidDescription(category: string, description: string): boolean {
  const descriptions = getDescriptionsForCategory(category);
  return descriptions.includes(description);
}

