# FlowBoard — RBAC Project Tracker

## Project overview

FlowBoard is a full-stack project and task management application that demonstrates **Role-Based Access Control (RBAC)**.

Users authenticate with JWT, then access features based on one of three roles:

- **Admin** — manage users and roles, full access to projects and tasks  
- **Manager** — create and manage projects, members, and tasks within their projects  
- **Member** — view assigned projects and manage their own or assigned tasks  

The API enforces permissions on every route, and the UI hides or blocks pages/actions the current role cannot use.

## Technology stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL via Prisma |
| Auth | JWT (Bearer), bcrypt password hashing |
| Validation | Zod |
| RBAC | Central permission catalog, role middleware, resource-level access checks |

## Setup and installation instructions

### Prerequisites

- Node.js 18+
- npm 9+
- Docker (for local PostgreSQL)

### Install dependencies

```bash
cd rbac-project-tracker
npm install
```

### Environment

Copy the example env files (or create them as below).

`server/.env`:

```env
PORT=4000
DATABASE_URL="postgresql://flowboard:flowboard@localhost:5434/flowboard?schema=public"
JWT_SECRET="flowboard-dev-secret-change-in-production"
JWT_EXPIRES_IN="7d"
CLIENT_ORIGIN="http://localhost:3000"
```

`client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Database setup and seed

```bash
npm run db:setup
```

This starts PostgreSQL with Docker, applies the Prisma schema, and seeds demo users.

### Run the application

```bash
npm run dev
```

- Frontend: http://localhost:3000  
- API health: http://localhost:4000/api/health  

## Default test credentials

Password for all seeded accounts: **`Password123!`**

| Role | Email |
| --- | --- |
| Admin | `admin@flowboard.dev` |
| Manager | `manager@flowboard.dev` |
| Member | `member@flowboard.dev` |

## Assumptions and design decisions

1. **Shared permission catalog** — permissions are defined once (`server/src/rbac/permissions.ts` and mirrored on the client) so API authorization and UI gating stay consistent.  
2. **Two-layer authorization** — route-level role permissions plus resource checks (project manager, membership, task assignee/creator).  
3. **Public signup creates Members only** — Admin/Manager roles are assigned by an Admin.  
4. **PostgreSQL** — used as the primary database; local development runs via Docker Compose.  
5. **Reusable modules** — shared Zod validators, API client, form helpers, pagination, and `RequirePermission` to avoid duplicated logic.  
6. **JWT stored in `localStorage`** — acceptable for this assessment demo; a production system would typically use httpOnly cookies.
