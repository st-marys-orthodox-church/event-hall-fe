# CLAUDE.md

Guidance for Claude Code (and other AI coding agents) working in this repo.

## What this repo is

Marketing site for **Fellowship Event Hall**, the event venue on the property of **St. Mary Romanian Orthodox Church** (Dacula, GA). Production at [events.saintmaryro.org](https://events.saintmaryro.org).

It is a small static-leaning Next.js site — a landing page, a packages/pricing page, a gallery, and a SendGrid-powered contact form. Not a SaaS product; not multi-tenant; not authenticated. Changes should respect that scope.

## Stack at a glance

- **Next.js 15** (Pages Router — not App Router) + **React 19** + **TypeScript 5**
- **Tailwind 3** for utility styling, **MUI 6** for icons & a few components, **Emotion** as MUI's style engine
- **next-i18next** for i18n (en / es / ro)
- **react-photo-album** + **yet-another-react-lightbox** for the gallery
- **next-seo** + **next-sitemap** for SEO
- **SendGrid** for contact form delivery
- **Biome** for lint + format (ESLint and Prettier have been removed)
- **Lefthook** for git hooks (replaces Husky + lint-staged)
- **pnpm** as the package manager

See `README.md` for the full layout.

## Commands

```bash
pnpm dev          # dev server on :3000 (Turbopack — fast HMR)
pnpm build        # production build + sitemap (webpack, not Turbopack — stable)
pnpm check        # Biome: lint + format + organize imports (autofix)
pnpm build-types  # tsc --noEmit
pnpm i18n:sync    # sync es/ro locales against en (auto-translates if ANTHROPIC_API_KEY set)
pnpm i18n:check   # CI check — fails if locales drift
```

Always run `pnpm check` and `pnpm build-types` before finishing a change. If you touched any `en` locale string, also run `pnpm i18n:sync` (or at least `pnpm i18n:check`).

## Conventions

- **Pages Router, not App Router.** Do not introduce `app/` directory routes unless we explicitly migrate.
- **Named exports** over default exports for components (see existing UI components). Page files are the exception — Next.js requires default exports.
- **Tailwind first** for layout and utility styling. Reach for MUI only when it already solves the problem (icons, date pickers). Do not introduce new MUI components if Tailwind + a small custom component will do.
- **Design tokens** live in `src/utils/DesignTokens.ts`. Prefer them over ad-hoc hex values so the palette stays coherent with Tailwind config.
- **Colors:** the brand palette uses `#7c9885` (sage green) and `#c9a86c` (warm gold) with `stone` neutrals. Keep new UI consistent.
- **Content, not components.** Static page content (features, packages, hero slides, nav items) lives in `src/utils/` — e.g. `Features.ts`, `Packages.ts`, `HeroSlides.ts`, `Navigation.ts`. Edit those instead of hardcoding JSX.
- **i18n is non-optional.** User-facing copy belongs in `public/locales/en/*.json` and is pulled in with `next-i18next`'s `useTranslation`. Do not hardcode English strings in JSX. After changing `en`, run `pnpm i18n:sync`.
- **SEO is first-class.** Any new page must use `<Meta>` from `src/ui/base/Meta.tsx` and should be added to `next-sitemap.config.js` if it needs a custom priority or exclusion.
- **Site-wide copy** (name, description, URL, social handles) lives in `src/utils/AppConfig.ts`. Do not hardcode.
- **No secrets in code.** `SENDGRID_API_KEY`, `ANTHROPIC_API_KEY`, and similar must stay in `.env.local` / host env vars.

## Things to watch out for

- `next.config.js` wires `i18n` from `next-i18next.config.js`. If you add a locale, update both that file and the locale dirs under `public/locales/`.
- `@date-io/jalaali` and `moment-jalaali` were in the old deps. They are **Persian calendar adapters** and have no business being here. Do not reintroduce them.
- `react-animation-on-scroll` is unmaintained and may warn under React 19 StrictMode. The old gallery libs (`react-photo-gallery`, `react-images`) have already been replaced with `react-photo-album` + `yet-another-react-lightbox` — don't bring the old ones back.
- `postbuild` runs `next-sitemap`. Don't stub it — search engines need it.
- `scripts/i18n-sync.mjs` calls the Anthropic API when `ANTHROPIC_API_KEY` is set; without the key it falls back to `[ES]` / `[RO]` placeholders. Keep the model id in sync with what the account has access to.

## Style

- Match the existing code style — Biome enforces single quotes, 2-space indent, 100-char line width, ES5 trailing commas.
- Write no comments unless the *why* is non-obvious. Don't narrate *what* the code does.
- Keep PRs scoped. A typo fix is not a good time for a dependency bump.

## When working on SEO

- Page titles, descriptions, and canonical URLs flow through `<Meta>`.
- Open Graph tags are handled by `next-seo` — update `openGraph` in `Meta.tsx` or per-page props.
- For structured data (events, LocalBusiness, FAQ), use helpers in `src/utils/StructuredData.ts` or inject JSON-LD via `next-seo`'s `JsonLd` components.
- SEO copy lives in `public/locales/*/seo.json`, not inline in components.
- Verify Lighthouse scores on changes to any above-the-fold markup.

## Git hooks (Lefthook)

- Config is in `lefthook.yml`. `prepare: lefthook install` wires hooks on `pnpm install`.
- **pre-commit** runs `biome check --write` on staged files.
- **pre-push** runs `biome check ./src` and `pnpm build-types`.
- Do not bypass hooks (`--no-verify`) unless the user explicitly asks for it.

## AI agents

Reusable agent definitions live under [.claude/agents/](./.claude/agents/). Claude Code auto-discovers them from that path. Cursor uses `.cursor/rules/` — add a parallel copy there if we adopt Cursor widely.
