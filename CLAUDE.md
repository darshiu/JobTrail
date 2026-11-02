# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev         # next dev (reads .env.local)
npm run build       # next build — fails on TypeScript errors
npm run lint        # eslint
npm run seed:jobs   # tsx --env-file=.env.local scripts/seed.ts (sample jobs; USER_ID is hardcoded in the script)
npx tsc --noEmit    # type check without building
```

There is no test runner configured. Prisma is **not** used here — don't run `npx prisma ...`.

## Environment

`.env.local` needs `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`. Next only reads it at startup, so restart `next dev` after editing.

- Atlas rejects connections from IPs not on its Network Access list. This surfaces as `SSL alert number 80 / tlsv1 alert internal error`, then `MongoTopologyClosedError: Topology is closed` from `getSession()` in `proxy.ts`. It is not a code bug.
- The auth URLs must match the origin you open the app on (`localhost:3000`). `trustedOrigins` in `lib/auth/auth.ts` also allows `localhost`/`127.0.0.1`.
- `next.config.ts` sets `allowedDevOrigins` to a LAN IP; update it if you open the dev server from another device.

## Architecture

Job-application tracker: Next.js 16 App Router + React 19, Better Auth, MongoDB, shadcn/ui on **Base UI** (`@base-ui/react`), Tailwind 4, dnd-kit. `next.config.ts` enables `cacheComponents`, so `"use cache"` is in use.

**Two separate MongoDB clients.** Better Auth uses a raw `MongoClient` created in `lib/auth/auth.ts` (users, sessions). App data uses Mongoose through `connectDB()` in `lib/db.ts`, which caches the connection on `global`. Both read the same `MONGODB_URI`.

**Auth flow.**
- `app/api/auth/[...all]/route.ts` mounts the Better Auth handler.
- `lib/auth/auth-client.ts` is the browser client.
- `getSession()`/`signOut()` in `lib/auth/auth.ts` are the server-side helpers.
- `proxy.ts` (Next 16's replacement for `middleware.ts`) calls `getSession()` on requests and redirects signed-in users away from `/sign-in` and `/sign-up`.
- A Better Auth `databaseHooks.user.create.after` hook calls `initializeUserBoard()` (`lib/init-user-board.ts`), which creates the user's "Job Hunt" board and five default columns.

**Data model** (`lib/models/`): `Board` → `Column[]` → `JobApplication[]`. Parents hold arrays of child ObjectIds, and children also store `columnId`/`boardId`/`userId`. Keep both in sync, as the actions do with `$push`/`$pull`. `lib/models/models.types.ts` holds the plain serialisable TS types. Use those in client components, **not** the Mongoose model values, which are values rather than types.

**Mutations** are server actions in `lib/actions/job-applications.ts`. Each one checks the session and ownership, then runs `revalidatePath("/dashboard")`. Call `connectDB()` at the start of each action. `order` is stored in steps of 100. The `order` argument to `updateJobApplication` is a *target index* in the column, which the action converts to `index * 100` and shifts the neighbours.

**Dashboard** (`app/dashboard/page.tsx`): `getBoard()` is a `"use cache"` function that populates columns and jobs, and the result is serialised through JSON for the client. `components/kanban-board.tsx` is the client board (dnd-kit `DndContext` → `DroppableColumn` → `SortableContext` → `SortableJobCard`). `lib/hooks/useBoards.tsx` holds column state, and `moveJob` updates it optimistically before calling `updateJobApplication`, rolling back on error.

## UI conventions

The shadcn components in `components/ui/` wrap Base UI, not Radix. Triggers (`DropdownMenuTrigger`, `DialogTrigger`) already render a `<button>`, so to use your own `Button` pass it via `render={<Button ... />}` instead of nesting it as a child. `DropdownMenuLabel` must be inside a `DropdownMenuGroup`. Path alias: `@/*` maps to the repo root. `DialogContent` has a default `sm:max-w-sm`, so widen it with `sm:max-w-*`, not a bare `max-w-*`.

**Theming.** Colors are CSS variables in `app/globals.css` (navy/orange palette, `--brand` is a darker orange for orange *text*, since `--primary` is too light on white). Dark mode is class-based: `.dark` on `<html>`, set before first paint by an inline script in `app/layout.tsx` and toggled by `components/theme-toggle.tsx` (saved in `localStorage.theme`, falls back to the system setting). Use theme tokens (`text-foreground`, `bg-card`, `border-border`), not hard-coded `gray-*`/`white`/`black`, or dark mode breaks. Headings use Plus Jakarta Sans via `--font-heading`.

**Layout height.** `--nav-h` in `globals.css` must equal the navbar's rendered height (including its 1px border; 65px, 81px from `sm`). Full-height pages use `h-[calc(100dvh-var(--nav-h))]`. If you change the navbar height, change the variable too, or the page gets a stray scrollbar. The dashboard deliberately never scrolls vertically: the board scrolls sideways and each column scrolls its own cards.

**Board touch input.** `kanban-board.tsx` uses dnd-kit `MouseSensor` plus `TouchSensor` (250ms hold) so swiping scrolls the board. Keep the fixed `id` on `DndContext`, or hydration warns about `aria-describedby` ids.

**Other gotchas.**
- Sign-out (`components/sign-out-btn.tsx`) uses `window.location.assign("/sign-in")`, not `router.push`, because the router cache can replay the signed-in `/sign-in` -> `/dashboard` redirect from `proxy.ts`.
- Tab icons come from `app/icon.png` and `app/apple-icon.png` (Next file convention). Don't add `app/favicon.ico` back or it can override them.
- Some files (e.g. `components/kanban-board.tsx`) use CRLF line endings; keep them when editing, and match multi-line strings accordingly in scripted edits.
