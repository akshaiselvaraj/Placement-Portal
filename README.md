# Placement Management Portal

A centralized platform for managing campus placements.

## Tech Stack

### Frontend
- React.js (Vite) + TypeScript
- Tailwind CSS + shadcn/ui
- React Router, TanStack Query, Zustand
- React Hook Form + Zod
- Recharts, html2pdf.js, React-to-Print

### Backend
- Node.js + Express.js + TypeScript
- Prisma ORM + PostgreSQL (Supabase)
- JWT Authentication + bcrypt

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (Supabase account)

### Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
# Edit .env with your API URL
npm install
npm run dev
```

## Project Structure

```
├── frontend/       # React + Vite client
│   └── src/
│       ├── app/           # App entry, providers, router
│       ├── components/    # Shared UI components
│       ├── features/      # Feature modules
│       ├── hooks/         # Global hooks
│       ├── lib/           # Axios, utils, constants
│       ├── routes/        # Route definitions & guards
│       ├── store/         # Zustand stores
│       ├── styles/        # Theme, globals
│       └── types/         # Global types
├── backend/        # Express API server
│   └── src/
│       ├── config/        # DB, env, constants
│       ├── middleware/    # Auth, role, error, validate
│       ├── modules/       # Feature modules
│       └── utils/         # Helpers, response formatter
```

## Roles

| Role | Dashboard Route |
|------|----------------|
| Admin | `/admin/dashboard` |
| Placement Officer | `/placement/dashboard` |
| Recruiter | `/recruiter/dashboard` |
| Student | `/student/dashboard` |
