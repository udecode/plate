# Markdown Docs Footnote Example

## Goal

Make `/docs/markdown` visibly demonstrate GFM footnote syntax instead of only
documenting it in prose.

## Scope

- update the markdown demo seed content
- optional small docs-copy nudge if needed
- browser verification on `/docs/markdown`

## Non-Goals

- markdown package behavior changes
- footnote UX redesign
- broad docs rewrite

## Current Findings

- `/docs/markdown` already documents footnote support in prose.
- The top markdown demo seed does not contain any `[^1]` / `[^1]: ...`
  content, so the page fails to prove the feature visually.

## Working Plan

- [x] add real GFM footnote syntax to the markdown demo seed
- [x] verify the docs page renders the footnote example
- [x] run lint only

## Progress Log

- 2026-04-06: confirmed the docs page documents footnotes but the example seed
  omits them
- 2026-04-06: added `[^1]` / `[^1]: ...` syntax to the side-by-side markdown
  demo seed in `markdown-to-slate-demo.tsx`
- 2026-04-06: browser-verified `/docs/markdown` now shows the footnote example
  content and ran `pnpm lint:fix`
