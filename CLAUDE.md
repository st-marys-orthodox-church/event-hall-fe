# CLAUDE.md

Guidance for Claude Code (and other AI coding agents) working in this repo.

## What this repo is

Marketing site for **Fellowship Event Hall**, the event venue on the property of **St. Mary Romanian Orthodox Church** (Dacula, GA). Production at [events.saintmaryro.org](https://events.saintmaryro.org).

It is a small static-leaning Next.js site — a landing page, a packages/pricing page, a gallery, and a SendGrid-powered contact form. Not a SaaS product; not multi-tenant; not authenticated. Changes should respect that scope.

## Stack at a glance

- **Next.js 15** (Pages Router — not App Router) + **React 19** + **TypeScript 5**
- **Tailwind 3** for utility styling, **MUI 6** for icons & a few components, **Emotion** as MUI's style engine
- **next-seo** + **next-sitemap** for SEO
- **SendGrid** for contact form delivery
- **Biome** for lint + format (ESLint and Prettier have been removed)

See `README.md` for the full layout.

## Commands

```bash
npm run dev          # dev server on :3000 (Turbopack — fast HMR)
npm run build        # production build + sitemap (webpack, not Turbopack — stable)
npm run check        # Biome: lint + format + organize imports (autofix)
npm run build-types  # tsc --noEmit
```

Always run `npm run check` and `npm run build-types` before finishing a change.

## Conventions

- **Pages Router, not App Router.** Do not introduce `app/` directory routes unless we explicitly migrate.
- **Named exports** over default exports for components (see existing UI components). Page files are the exception — Next.js requires default exports.
- **Tailwind first** for layout and utility styling. Reach for MUI only when it already solves the problem (icons, date pickers). Do not introduce new MUI components if Tailwind + a small custom component will do.
- **Colors:** the brand palette uses `#7c9885` (sage green) and `#c9a86c` (warm gold) with `stone` neutrals. Keep new UI consistent.
- **SEO is first-class.** Any new page must use `<Meta>` from `src/ui/base/Meta.tsx` and should be added to `next-sitemap.config.js` if it needs a custom priority or exclusion.
- **Site-wide copy** (name, description, URL, social handles) lives in `src/utils/AppConfig.ts`. Do not hardcode.
- **No secrets in code.** `SENDGRID_API_KEY` and similar must stay in `.env.local` / host env vars.

## Things to watch out for

- `next.config.js` has `typescript.ignoreBuildErrors: true`. That's intentional to avoid blocking deploys on third-party type noise, but it means **you must run `npm run build-types` yourself** — the build will not catch type errors.
- The old repo had `swcMinify: false` and `.babelrc` forcing Babel. `.babelrc` still exists for `styled-jsx-plugin-postcss`. If you remove `.babelrc`, Next 15 will use SWC by default, which is faster and unlocks newer features — but verify styled-jsx still works.
- `@date-io/jalaali` and `moment-jalaali` were in the old deps. They are **Persian calendar adapters** and have no business being here. They have been removed in the current `package.json` — do not reintroduce them.
- The legacy animation libs (`react-animation-on-scroll`, `react-photo-gallery`, `react-images`) are unmaintained. They may warn under React 19 StrictMode. If they actually break, flag it and propose a replacement rather than silently patching.
- `postbuild` now runs `next-sitemap` (previously stubbed with `echo 'Skipping sitemap'`). Don't re-stub it — search engines need it.

## Style

- Match the existing code style — Biome enforces single quotes, 2-space indent, 100-char line width, ES5 trailing commas.
- Write no comments unless the *why* is non-obvious. Don't narrate *what* the code does.
- Keep PRs scoped. A typo fix is not a good time for a dependency bump.

## When working on SEO

- Page titles, descriptions, and canonical URLs flow through `<Meta>`.
- Open Graph tags are handled by `next-seo` — update `openGraph` in `Meta.tsx` or per-page props.
- For structured data (events, LocalBusiness, FAQ), inject JSON-LD via `next-seo`'s `JsonLd` components or a `<Head>` `<script type="application/ld+json">`.
- Verify Lighthouse scores on changes to any above-the-fold markup.

## AI agents

Reusable agent definitions live under [.claude/agents/](./.claude/agents/). Claude Code auto-discovers them from that path. Cursor uses `.cursor/rules/` — add a parallel copy there if we adopt Cursor widely.
