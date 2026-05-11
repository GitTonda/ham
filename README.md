# HAM: Home Assistant Monitor

Natural Language Universal Dashboard for home automation and monitoring systems.

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **UI:** shadcn/ui, Tailwind CSS, Lucide React
- **State:** Zustand (with Persistence)
- **Charts:** Recharts
- **Database:** InfluxDB
- **LLM:** Anthropic (Claude)
- **Testing:** Jest, React Testing Library, MSW

## Features
- Natural Language Querying for Home Assistant data.
- Dynamic Dashboard with Recharts.
- Real-time monitoring and alerting signatures.
- Dark Mode by default.
- Manual Card Management.

## Getting Started

### Prerequisites
- Node.js 18+
- InfluxDB instance
- Anthropic API Key

### Installation
1. Clone the repository.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your credentials.
4. Run the development server: `npm run dev`

## Development
- `npm run dev`: Start dev server.
- `npm run build`: Build for production.
- `npm run test`: Run tests.
- `npm run lint`: Run linting.

## License
MIT
