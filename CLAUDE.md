# Portfolio (jayhoward.dev)

Jay's portfolio site: a Preact frontend and a Cloudflare Worker backend, with every piece of content stored in a Cloudflare D1 database.

**This repo is public on GitHub** (`mistahoward/mistahoward.github.io`), and so is this file. Nothing private goes in it: no home-network addresses, nothing about the household, nothing about the job search.

**The root `README.md` is out of date.** It describes a C# WebAssembly backend. The backend is TypeScript on Cloudflare Workers, as below.

## Layout

| Path | What it is |
| --- | --- |
| `frontend/` | Preact + Vite + TypeScript, Bootstrap 5, SCSS. `VITE_API_URL` points it at the backend (see `frontend/.env.example`). |
| `frontend/src/components/about/ProjectList.tsx` | The Projects section: how each project card is drawn. |
| `frontend/src/components/admin/` | The admin panel: `AdminPanel.tsx`, one form per content type in `forms/`, and the lists in `managers/`. |
| `frontend/src/utils/iconMap.ts` | The technology icons and their labels, used by projects and experience. |
| `frontend/public/` | Served as-is: `resume.pdf`, `portrait.jpg`, the hosted email signature in `email/`, and the favicons. |
| `backend/src/index.ts` | The Worker. `routes/public.ts` is what the site reads, `routes/admin.ts` is the admin panel's create, update and delete routes, and `routes/comments.ts` is blog comments. |
| `backend/src/schema.ts` | Every table, in Drizzle. |
| `backend/migrations/` | D1 migrations. |
| `backend/wrangler.toml` | Bindings: D1 `portfolio-db` and the R2 bucket `pet-images`. |
| `testing/` | Jest unit tests and Playwright end-to-end tests, with their own `package.json`. `TESTING.md` explains them. |

## Content lives in the database, not the code

Projects, experience, skills, certifications, testimonials, blog posts, the Pet Dex and the About Me text are all rows in D1. Jay edits them himself in the admin panel on the live site. It opens with the Konami code followed by Enter (`frontend/src/utils/konami.ts`) and asks for the admin secret (`ADMIN_SECRET`, checked in `backend/src/middleware/auth.ts`).

When content needs to change, write out the values for Jay to paste into the admin form, field by field. Never change content by editing the database or writing a migration. The one exception is the migration that first moves hard-coded copy into a new table, which seeds it with the text the code had (as `010_site_content.sql` did for About Me).

- **About Me** is Markdown in the `SiteContent` table under the key `about`. The site reads it from `GET /api/content/about`, and the admin panel's "About Me" section saves it with `PUT /api/admin/content/about`, with a live preview that uses the site's own component (`AboutMeText` in `frontend/src/components/about/AboutMe.tsx`). A blank line starts a new paragraph. To make other copy editable the same way, add its key to `SITE_CONTENT_KEYS` in `backend/src/schema.ts`.
- **The admin lists use the same order as the site:** experience by start date and certifications by issue date, newest first.
- **Dates** are stored as plain `YYYY-MM-DD` text. Show them through `parseDate` or `formatDate` in `frontend/src/utils/ui.ts`, never `new Date(text)`. That reads the date as midnight UTC, which is the day before in US time zones.

## Project cards

These are the fields on the admin form's "Add New Project", and how a card shows each one:

| Field | How the card uses it |
| --- | --- |
| **Name** (required) | The card's title. |
| **Project Type** (required) | `personal`, `professional` or `academic`. Cards are grouped under Professional, Personal and Academic, in that order, and the filter buttons follow these types. |
| **Description** | Plain text, and the line breaks show, so a blank line starts a new paragraph. After 220 characters it's cut to 4 lines with a "Read more" button, so the first sentence or two has to carry the pitch. |
| **GitHub URL** | Adds a GitHub button and a stars badge. Leave it blank for a private repo, which hides both. The column is `NOT NULL`, and the form sends an empty string. |
| **Live URL** | Adds a "Live Demo" button. |
| **Technologies** | Comma-separated. Each entry is either a key from `iconMap` (`SiReact`, `FaPython`) or a label from `iconNameToLabel` (`React`, `Claude Code`), and either way it gets that icon. Case and spaces don't matter for a label. Anything else shows as plain text with no icon. The first 6 show, then "+N more". |
| **Image URL** | An optional banner across the top, 200 px tall and cropped to fill. |
| **NuGet Package ID** | Adds the package's version and download badges. |

- **Order:** newest first by `created_at` within each group (`routes/public.ts`), with no manual ordering. To put a card on top, create it last.
- **Search** matches the name, the description and the raw Technologies text.
- **Experience entries** take Technologies the same way.

### Adding a technology icon

The icons come from `react-icons` (5.5). In `frontend/src/utils/iconMap.ts`, import the icon, add it to `iconMap`, and give it a label in `iconNameToLabel`. `renderIcon` also looks icons up by label, so any card that already lists that technology by its plain name gets the icon once the change deploys, with no card edits. Pick the label to match how the cards already write it.

## Commands

From the root:

- `npm run install:all`: install everything (root, `frontend/`, `backend/`). `testing/` installs on its own.
- `npm run dev`: the frontend (Vite) and the Worker together. The Worker runs `wrangler dev --remote`, on Cloudflare against remote bindings, so check what it's bound to before testing writes. `npm run dev:local` in `backend/` keeps everything local.
- `npm run lint`: run before committing.
- `npm run format:check`: most of `frontend/src` already fails it. Don't reformat files you aren't otherwise changing, so diffs stay readable.
- `npm run build`: type-checks the backend and builds the frontend.
- In `testing/`: `npm run test:unit`, `npm run test:e2e`.

From `backend/`:

- `npm run db:generate` makes a migration from `schema.ts`, and `npm run db:migrate` applies it locally.
- `npm run db:migrate:remote` changes the live database, and `npm run deploy` deploys the live Worker. Ask Jay before running either.

**Migrations:** the newer hand-written ones use three-digit names (`009_...`, `010_...`), so they sort after the four-digit `0000`-`0008`. Don't trust a migration run on a fresh database: the old ones don't replay cleanly (`0005_testimonial_status.sql` fails on an empty DB). Before Jay applies migrations to the live database, have him run `npx wrangler d1 migrations list portfolio-db --remote` and check that only the new file is unapplied. If older ones show up, apply just the new file with `wrangler d1 execute portfolio-db --remote --file=...` instead.

**Testing locally:** `.claude/launch.json` (on Jay's PC, not in git) has `backend-local`, which runs the Worker on port 8788 against a local D1 with a throwaway admin secret, and `frontend-local-api`, which points Vite at it on port 5181. The plain `frontend` config reads the live API. To set up the local D1, run `npx wrangler d1 execute portfolio-db --local --file=...` for the tables you need.

**Deploy order** when a change needs a migration or a new route: database first, then the Worker, then the frontend. A frontend that calls a route the Worker doesn't have yet shows an error on the live site.

The frontend looks like Cloudflare Pages, judging by the response headers, but its setup isn't in this repo. Ask Jay rather than guessing how it deploys.

## Git

- Branch from `main` and open a PR on GitHub. Branches use `content/`, `fix/` and `feat/` prefixes.
- Commit messages are short and prefixed the same way: `content: ...`, `fix: ...`, `feat: ...`.
