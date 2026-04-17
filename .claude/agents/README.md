# Agents

Reusable AI agent definitions for this repo. Each `.md` file in this directory defines a subagent that Claude Code can invoke via the `Agent` tool.

## Convention

- `name` — kebab-case identifier, used as `subagent_type`.
- `description` — when the main agent should reach for this one.
- `tools` — which Claude Code tools the subagent is allowed to use. Keep read-only agents (auditors, reviewers) from writing.

## Current agents

| Agent | File | Description |
|---|---|---|
| **seo-auditor** | [seo-auditor.md](./seo-auditor.md) | Audits pages for metadata, structured data, heading hierarchy, and sitemap coverage. Read-only. |
| **dependency-reviewer** | [dependency-reviewer.md](./dependency-reviewer.md) | Reviews `package.json` for outdated, unmaintained, or unused packages. Read-only. |
| **content-writer** | [content-writer.md](./content-writer.md) | Writes and edits copy — headlines, meta descriptions, section text, social captions. Knows brand voice and venue facts. Read-only. |
| **component-builder** | [component-builder.md](./component-builder.md) | Builds new UI sections and components following the design system. Can read and write files. |
| **seo-fundatmentals** | [seo-fundatmentals.md](./seo-fundatmentals.md) | Understand SEO best principles and approaches for a professional and corporate approach |
| **scripts** | [scripts](./scripts/) | Contains python script intended for seo-fundamentals.md agent |

## Adding a new agent

1. Create `<name>.md` with the YAML frontmatter (`name`, `description`, `tools`).
2. Write a self-contained prompt — the agent doesn't inherit the main conversation's context. Include the specific facts it needs to act correctly.
3. Use read-only tools (`Read`, `Grep`, `Glob`, `WebFetch`) for audit-style agents. Grant `Edit`/`Write` only when the agent is meant to make changes.

## Cursor equivalent

Cursor rules live in `.cursor/rules/` as `.mdc` files. They cover the same ground but work differently — rules are injected into context automatically based on `globs` or `alwaysApply`, rather than being explicitly invoked. Keep both in sync when updating conventions.
