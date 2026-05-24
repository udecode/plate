# Shadcn Base Migration Progress

## Goal

Continue the docs restart from `docs/plans/2026-05-23-shadcn-docs-restart-comparison.md`: move `apps/www` toward the upstream shadcn/Fumadocs base while preserving Plate docs content, registry docs, API MDX, CN docs, MCP, and Plate Plus hooks.

## Current Slice

Status: third slice complete

1. Make Fumadocs metadata/pageTree the docs navigation authority.
2. Move sidebar and pager reads off direct `docsConfig` runtime access.
3. Replace command menu docs search with Fumadocs search API.
4. Keep `docsConfig` only as migration overlay for labels, CN titles, and non-content registry/app links until those live in Fumadocs metadata or registry docs source.
5. Replace Plate's old LLM copy/view buttons with the upstream-style copy-page dropdown and `.md` markdown route model.
6. Remove the old Plate theme/customizer shell surface called out for deletion in the comparison doc.

## Findings

- Contentlayer removal and Fumadocs source loading are already complete.
- `docsConfig` still exists, but this slice removes direct runtime reads from `DocsNav`, pager, command menu, and mobile docs nav.
- Fumadocs supports root `meta.json` with `pages`, links, and separators; links can represent app-only and registry-derived docs routes.
- The current content layout has root pages plus folders such as `(guides)`, `(plugins)`, `api`, `components`, `examples`, `installation`, `migration`, and `releases`.
- CN routes can keep using English metadata because `DocsNav` applies locale labels and href prefixing.
- Fumadocs search maps i18n locale names into Orama tokenizer languages. Plate's `cn` locale must be mapped explicitly to a supported tokenizer.
- The upstream `.md` model maps `/docs/*.md` through a hidden `/llm/*` route. Plate now mirrors that for `/docs/*.md` and `/cn/docs/*.md`, while keeping canonical `https://platejs.org` source URLs in copied markdown.
- The old Plate theme/customizer surface was only reachable from the English and CN home pages. Removing those entrypoints made `themes.css`, `lib/themes.ts`, `ThemeCustomizer`, theme selectors, theme copy-code helpers, `useThemesConfig`, the unused drawer component, and the `vaul` dependency dead.

## Verification Plan

- Run `pnpm --filter www build:source`.
- Run `pnpm --filter www typecheck`.
- Run `pnpm lint:fix`.
- If a browser-visible sidebar/search change is left in a runnable state this turn, verify via Browser Use before claiming full UI completion.
- If a browser-visible app-shell/homepage change is left in a runnable state this turn, verify `/` and `/cn` render without the discarded theme/customizer surface.

## Progress Log

- 2026-05-24: Loaded comparison artifact and prior solution notes. Selected navigation/search/pageTree as the next aligned migration slice.
- 2026-05-24: Added `content/meta.json` generated from the current `docsConfig` nav, added `apps/www/scripts/sync-docs-meta.mts`, and added `sync:docs-meta`.
- 2026-05-24: Added `apps/www/src/lib/docs-page-tree.ts` so sidebar and pager read Fumadocs pageTree with `docsConfig` only as a migration overlay for labels/CN titles.
- 2026-05-24: Rewired English and CN docs layouts to pass pageTree-derived nav into `DocsNav`.
- 2026-05-24: Rewired English and CN docs pages to pass pageTree-derived neighbours into `DocContent`; deleted the old `components/pager.tsx` docsConfig pager.
- 2026-05-24: Replaced command-menu docs search with Fumadocs `useDocsSearch` and added `/api/search`.
- 2026-05-24: Mapped search locale `cn` to Orama's `english` tokenizer to prevent runtime search crashes.
- 2026-05-24: Verification passed: `pnpm install`, `pnpm --filter www build:source`, `pnpm --filter www typecheck`, `pnpm lint:fix`.
- 2026-05-24: Browser Use passed on `http://localhost:3100/docs` and `http://localhost:3100/cn/docs/table`: sidebar groups render from meta/pageTree, pager next link appears, command search returns Fumadocs results, and browser error/warning logs are empty after the fix.
- 2026-05-24: Replaced old `LLMCopyButton` and `ViewOptions` docs UI with `DocsCopyPage`, added `/llm` and `/cn/llm` markdown routes, and rewrote `/docs/*.md` plus `/cn/docs/*.md` to those routes.
- 2026-05-24: Verification passed for the LLM slice: `pnpm lint:fix`, `pnpm --filter www typecheck`, and Browser Use on `http://localhost:3100/docs`, `http://localhost:3100/docs.md`, and `http://localhost:3100/cn/docs/table.md` with empty browser error/warning logs.
- 2026-05-24: Removed the old home-page Themes button and customizer drawer from English and CN home pages; deleted the old theme library, generated theme CSS import, customizer/theme selector components, theme copy helper, `useThemesConfig`, unused drawer component, and `vaul`.
- 2026-05-24: Verification passed for the theme cleanup slice: `pnpm install`, `pnpm --filter www build:source`, `pnpm --filter www typecheck`, `pnpm lint:fix`, and Puppeteer smoke on `http://localhost:3100/` plus `http://localhost:3100/cn`. The smoke confirmed the new descriptions render, Themes/Customizer text and buttons are absent, and meaningful browser logs are empty. Four manifest CORS log lines were ignored because the dev server ran on port 3100 while the manifest URL points at the default localhost origin.
