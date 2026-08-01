# Placement Management Portal

A centralized platform for managing campus placements.

## Live Deployment Links
*   **Live Application URL:** [https://placement-portal-demo.vercel.app](https://placement-portal-cyan.vercel.app) *(Update this link once your deployment goes live)*
*   **Production API Base URL:** [https://placement-portal-api.render.com](https://placement-portal-api.render.com) *(Update this link once your backend API goes live)*

## Project Submission Deliverables
All requirements for the project submission are included in this repository:
- **Complete Source Code:** Available in the [frontend](./frontend) and [backend](./backend) directories.
- **Database Schema and Seed Data:** Refer to the comprehensive PostgreSQL DDL script: [database_schema_and_data.sql](./database_schema_and_data.sql).
- **Team Details:** View the team contributions and role allocation: [TEAM_DETAILS.md](./TEAM_DETAILS.md).
- **Software Requirements Specification:** Read functional and non-functional specifications: [SRS.md](./SRS.md).
- **Project Report:** Read the complete project summary, design structures, and outcomes: [PROJECT_REPORT.md](./PROJECT_REPORT.md).

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
If you are using Prisma (recommended):
```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Alternatively, to manually setup the PostgreSQL schema and sample data:
```bash
# Log in to your PostgreSQL instance and execute the SQL file:
psql -U your_username -d your_database_name -f ../database_schema_and_data.sql
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
