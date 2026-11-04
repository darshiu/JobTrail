# Job Tracker

A job-application tracker with a drag-and-drop Kanban board. Sign up, and you get a "Job Hunt" board with default columns. Add applications and move them between stages as you progress.

## Features

- Email and password authentication (Better Auth), with a 1-hour sliding session and an idle timeout
- Kanban board with drag and drop (dnd-kit), including touch support (hold to drag, swipe to scroll)
- Create, edit, move and delete job applications (company, position, location, salary, URL, tags, notes)
- Optimistic UI updates that roll back if the server rejects the change
- Light and dark theme, saved in the browser
- Responsive layout


https://github.com/user-attachments/assets/b8e61dc4-7b60-4c4d-bbd2-84319d103da8


## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, `cacheComponents`) and React 19
- [Better Auth](https://www.better-auth.com) for authentication
- MongoDB (Atlas) with Mongoose for app data
- [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com), Tailwind CSS 4
- [dnd-kit](https://dndkit.com) for drag and drop
- TypeScript

## Getting started

### Prerequisites

- Node.js 20 or newer
- A MongoDB database, such as a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster. If you use Atlas, add your IP address under Network Access.

### Setup

```bash
git clone <your-repo-url>
cd jobTracker
npm install
```

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
BETTER_AUTH_SECRET=<a long random string>
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

You can generate a secret with `openssl rand -base64 32`. Never commit `.env.local`. It is already in `.gitignore`.

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The URL must match `BETTER_AUTH_URL`. If you restart on another port, update the env values and restart the server.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production (fails on TypeScript errors) |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run seed:jobs` | Insert sample jobs (edit the hardcoded `USER_ID` in `scripts/seed.ts` first) |

## Project structure

```
app/                  Routes: landing page, sign-in, sign-up, dashboard, auth API
components/           UI components (Kanban board, job card, navbar, dialogs)
components/ui/        shadcn/ui components
lib/actions/          Server actions for job applications
lib/auth/             Better Auth server and client setup
lib/models/           Mongoose models and shared TypeScript types
lib/hooks/            Client state for the board
scripts/              Seed script
proxy.ts              Redirects signed-in users away from the auth pages
```

## How it works

- **Data model:** `Board` has many `Column`s, and each `Column` has many `JobApplication`s. Children also store their parent ids, and the server actions keep both sides in sync.
- **Mutations:** all changes are server actions in `lib/actions/job-applications.ts`. Each one checks the session and ownership, then revalidates `/dashboard`.
- **New users:** a Better Auth hook creates a "Job Hunt" board with five default columns when someone signs up.

## Troubleshooting

- **Page keeps refreshing or redirecting:** open the app on exactly the URL in `BETTER_AUTH_URL`, delete the `.next` folder, restart, and clear site cookies.
- **`SSL alert number 80` or `Topology is closed`:** your IP is not on the Atlas Network Access list.
- **Opening the dev server from another device:** add its address to `allowedDevOrigins` in `next.config.ts`.
