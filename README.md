# Daily Scribe Notes

A daily productivity app that lets you quickly capture unstructured "scrum daily" notes (yesterday, today, blockers) via text or audio, stores them in a SQLite database, and uses AI to generate structured notes, presentation summaries, and task classifications automatically.

## Features

- **Voice & Text Input**: Capture notes via voice recording (transcribed by OpenAI Whisper) or free-form text
- **AI Processing**: Automatically structures notes into Yesterday/Today/Blockers format
- **Presentation Mode**: Generates natural language summaries suitable for meetings
- **Action Items**: Extracts actionable items as a checklist
- **Task Classification**: AI-powered categorization of daily work activities
- **History**: Calendar and list view of past notes

## Tech Stack

- **Frontend**: SvelteKit 2 + Svelte 5 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn-svelte components
- **Database**: SQLite via Prisma ORM
- **AI**: OpenAI Whisper (transcription) + GPT-5.1 (processing/classification)

## Getting Started

### Prerequisites

- Node.js 20+
- An OpenAI API key

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env` file with your configuration:

```env
OPENAI_API_KEY=sk-your-api-key-here
DATABASE_URL="file:./dev.db"
```

3. Initialize the database:

```bash
npm run db:push
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
├── routes/
│   ├── +layout.svelte          # App shell with navigation
│   ├── +page.svelte             # Daily Notes screen
│   ├── history/+page.svelte     # History screen
│   └── api/                     # API endpoints
├── lib/
│   ├── components/              # UI components
│   ├── services/                # AI service modules
│   ├── db/                      # Database client
│   ├── stores/                  # Svelte stores
│   ├── types/                   # TypeScript types
│   └── constants/               # Task categories
prisma/
└── schema.prisma                # Database schema
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | Your OpenAI API key for Whisper and GPT-5.1 |
| `DATABASE_URL` | SQLite database file path |

## License

MIT

