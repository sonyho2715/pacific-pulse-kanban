# Claude Code Project Tracker

A Kanban-style project management board specifically designed for tracking Claude Code projects from planning to payment.

## Features

✅ **Kanban Board** - Drag and drop projects between stages:
- Planning
- Started
- In Progress
- Finished
- Paid

✅ **Project Management**
- Store initial Claude Code prompts
- Track estimates (hours & budget)
- Track actuals (hours & cost)
- Payment tracking (quote, paid amount, payment date)
- Client information
- Project URLs (repository, deployment, project)
- Notes system

✅ **Pre-seeded Projects**
All your current projects are already in the system:
- Aloha Massage Spa
- BOS Auto Detail Frontend
- BG Walter Peters (Trading Dashboard)
- Kangen Autopost
- BG Wealth
- Pacific Pulse Growth Lab
- Lee Meadows SaaS
- VietHawaii
- Dr. Silke Autopost
- AI Prompts Marketplace
- Claude Code Project Tracker

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL (Railway)
- **ORM**: Prisma 6
- **Drag & Drop**: @dnd-kit
- **Icons**: lucide-react

## Getting Started

### Prerequisites

- Node.js 24.5.0 (via NVM)
- PostgreSQL database (Railway)

### Installation

```bash
# Already installed! But if you need to reinstall:
cd ~/claude-projects
npm install
```

### Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with your projects
npm run db:seed
```

### Development

```bash
# Start dev server (already running!)
npm run dev

# Open Prisma Studio (database GUI)
npm run db:studio
```

The app will be available at: http://localhost:3001

## Project Structure

```
claude-projects/
├── app/
│   ├── actions.ts          # Server Actions (CRUD operations)
│   ├── page.tsx            # Home page with Kanban board
│   ├── layout.tsx          # Root layout
│   ├── globals.css         # Global styles
│   └── projects/
│       ├── [id]/
│       │   └── page.tsx    # Project detail page
│       └── new/
│           └── page.tsx    # New project form
├── components/
│   ├── KanbanBoard.tsx     # Main Kanban board with drag-drop
│   ├── KanbanColumn.tsx    # Droppable column component
│   ├── ProjectCard.tsx     # Draggable project card
│   ├── ProjectStatusBadge.tsx  # Status badge
│   └── NewProjectForm.tsx  # Create project form
├── lib/
│   └── db.ts              # Prisma client singleton
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
└── README.md
```

## Database Schema

### Project Model

- **Status**: PLANNING → STARTED → IN_PROGRESS → FINISHED → PAID
- **Prompts**: Initial prompt, requirements
- **Estimates**: Estimated hours, budget
- **Actuals**: Actual hours, cost
- **Payment**: Quote amount, paid amount, payment date
- **Metadata**: Client, URLs, dates
- **Relations**: One-to-many notes

## Usage

### Adding a New Project

1. Click "New Project" button
2. Fill in project details (name required)
3. Add your initial Claude Code prompt
4. Set estimates if available
5. Click "Create Project"

### Moving Projects

Simply drag and drop project cards between columns to update their status.

### Viewing Project Details

Click on any project card to view full details, including:
- Complete prompt history
- Detailed estimates vs actuals
- Payment information
- All notes and updates

## Deployment

### Deploy to Vercel

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository
gh repo create claude-projects --public --source=. --push

# Deploy to Vercel
vercel

# Set environment variable in Vercel dashboard:
DATABASE_URL="your-railway-database-url"
```

### Environment Variables

Required environment variable:

```env
DATABASE_URL="postgresql://postgres:password@host:port/database"
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration (production)
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## Database Connection

- **Host**: Railway PostgreSQL
- **Connection**: Already configured in `.env`
- **Studio**: Access via `npm run db:studio`

## Future Enhancements

- [ ] Edit project functionality
- [ ] Delete project with confirmation
- [ ] Add/edit notes directly from detail page
- [ ] Filter and search projects
- [ ] Project statistics dashboard
- [ ] Export projects to CSV
- [ ] Time tracking integration
- [ ] Invoice generation

## Links

- **Railway Project**: https://railway.com/project/6fd34fa6-1ae3-4dad-bbce-ccd9c30c387a
- **Local Dev**: http://localhost:3001

## License

MIT

---

Built with Claude Code 🤖
