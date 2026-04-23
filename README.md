# Tenaga Rakyat Frontend

Tenaga Rakyat is a role-based workforce marketplace frontend built with React, TypeScript, and Vite. It provides separate experiences for public visitors, workers, employers, and administrators.

> Frontend application for Tenaga Rakyat. The backend API must be running separately.

## Project Links

| Resource | URL |
| --- | --- |
| Demo | _Add production demo URL_ |
| Backend API | _Add backend API repository or base URL_ |
| Repository | _Add repository URL_ |

## Features

### Public

- Landing page for the Tenaga Rakyat marketplace.
- Browse available jobs.
- View public job details.

### Worker

- Worker dashboard.
- Search and browse jobs.
- Submit and manage job applications.
- Track active jobs.
- Manage work photos.
- Update worker profile information.

### Employer

- Employer dashboard.
- Create and manage job postings.
- Review job details and applications.
- Manage posting credits.
- Update employer profile information.

### Admin and Super Admin

- Admin dashboard.
- User management.
- Posting credit package management.
- Admin management for Super Admin users.

## Tech Stack

| Area | Technology |
| --- | --- |
| UI Framework | React 19 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| Server State | TanStack Query |
| HTTP Client | Axios |
| Forms | React Hook Form |
| Validation | Zod |
| Maps | Leaflet, React Leaflet |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |

## Getting Started

### Prerequisites

- Node.js 20 or newer is recommended.
- npm.
- A running Tenaga Rakyat backend API.

### Installation

```bash
npm install
```

### Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Update the API base URL in `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Development Server

```bash
npm run dev
```

The application will run on the local Vite development URL, usually:

```text
http://localhost:5173
```

### Production Build

```bash
npm run build
```

The production output is generated in `dist`.

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | `http://localhost:3000` | Base URL for the backend API. |

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check the project and build for production. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint checks. |

## Frontend Architecture

### Routing and Access Control

The application uses React Router with role-based protected routes:

- Public routes are available to all visitors.
- Worker routes require the `PEKERJA` role.
- Employer routes require the `PEMBERI_KERJA` role.
- Admin routes require the `ADMIN` or `SUPER_ADMIN` role.

Each user area has its own layout to keep navigation and page structure separated by role.

### API Client

API requests are handled through a shared Axios client. The client is configured to:

- Use `VITE_API_BASE_URL` as the backend base URL.
- Send cookies with requests through `withCredentials`.
- Attach CSRF tokens for mutating requests.
- Refresh the session on eligible `401` responses.
- Dispatch a logout event when the session can no longer be refreshed.

### Data Fetching

TanStack Query is used for server state, caching, retries, and refetch behavior. The global query client is configured with a default stale time and reduced automatic refetching.

### UI Layer

Reusable UI primitives are stored in `src/components/ui`, while role-specific layouts are stored in `src/components/layout`.

## Project Structure

```text
src/
  api/          API clients and service modules
  assets/       Static assets used by the frontend
  components/   Shared UI and layout components
  contexts/     React context providers
  pages/        Route-level pages grouped by user area
  routes/       Route guards and route helpers
  types/        Shared TypeScript types
  utils/        Formatting and utility helpers
```

## Deployment

This project is configured as a single-page application. The `vercel.json` file rewrites all requests to `/`, allowing browser-managed routes to work after deployment.

Production build command:

```bash
npm run build
```

Production output directory:

```text
dist
```

## Notes

- Wallet and escrow routes are currently disabled in the frontend, so they are not documented as active features.
- The application expects backend authentication to use cookies and CSRF protection.
- Replace the placeholder project links when production URLs are available.
