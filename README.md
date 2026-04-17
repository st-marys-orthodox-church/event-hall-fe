# Fellowship Event Hall

Marketing site for **Fellowship Event Hall** — the event venue on the property of [St. Mary Romanian Orthodox Church](https://saintmaryro.org). Production URL: [events.saintmaryro.org](https://events.saintmaryro.org).

## Stack

| Layer      | Choice                                               |
| ---------- | ---------------------------------------------------- |
| Framework  | Next.js 15 (Pages Router)                            |
| Runtime    | React 19                                             |
| Language   | TypeScript 5                                         |
| Styling    | Tailwind CSS 3 + MUI 6 + Emotion                     |
| Animation  | `react-animation-on-scroll` + `animate.css`          |
| Gallery    | `react-photo-gallery` + `react-images`               |
| SEO        | `next-seo` + `next-sitemap`                          |
| Email      | SendGrid (contact form → `/api/sendgrid`)            |
| Lint/Format| [Biome](https://biomejs.dev) (replaces ESLint + Prettier) |
| Git hooks  | Husky + lint-staged                                  |

## Requirements

- Node.js **>= 20** (use `nvm use` — see `.nvmrc`)
- npm, pnpm, or yarn

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.local` and set:

```
SENDGRID_API_KEY=<your-sendgrid-key>
```

Used by `src/pages/api/sendgrid.ts` to deliver the contact form.

## Scripts

| Command              | What it does                                    |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Start the dev server                            |
| `npm run build`      | Production build (runs `next-sitemap` after)    |
| `npm run start`      | Start the production server                     |
| `npm run clean`      | Remove `.next` and `out`                        |
| `npm run build-stats`| Build with the bundle analyzer enabled          |
| `npm run build-types`| Type-check without emitting (`tsc --noEmit`)    |
| `npm run lint`       | Lint with Biome                                 |
| `npm run lint:fix`   | Lint and auto-fix with Biome                    |
| `npm run format`     | Format with Biome                               |
| `npm run check`      | Lint + format + organize imports (one command)  |

## Project layout

```
src/
├── pages/            # Next.js pages + API routes
│   ├── index.tsx     # Landing page
│   ├── packages.tsx  # Pricing / packages
│   ├── gallery.tsx   # Photo gallery
│   └── api/
│       └── sendgrid.ts
├── ui/
│   ├── base/         # Meta, Navbar, Footer, Logo, Template
│   ├── components/   # Small reusable primitives
│   ├── features/     # Larger page sections (Hero, Banner, Gallery, ...)
│   ├── layout/       # Section/grid containers
│   └── modals/       # Contact modal
├── hooks/            # UseContactForm, UseDropdown, UseWindowDimensions
├── stores/           # Global context
├── styles/           # Tailwind entry + MUI theme
└── utils/            # AppConfig, Constants, Helpers, Photos
```

## SEO

- Per-page metadata is set via `src/ui/base/Meta.tsx` (wraps `next-seo`).
- Global site metadata lives in `src/utils/AppConfig.ts`.
- `next-sitemap.config.js` generates `sitemap.xml` and `robots.txt` on `postbuild`.

## Deployment

Any Next.js-compatible host (Vercel, Netlify, self-hosted Node). Make sure `SENDGRID_API_KEY` is set in the deploy environment.

## AI-assisted development

This repo is set up for AI pair-programming. See [CLAUDE.md](./CLAUDE.md) for conventions and [.claude/agents/](./.claude/agents/) for reusable agent definitions.
