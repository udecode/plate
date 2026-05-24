# Shadcn Base Migration Progress

## Goal

Continue the docs restart from `docs/plans/2026-05-23-shadcn-docs-restart-comparison.md`: move `apps/www` toward the upstream shadcn/Fumadocs base while preserving Plate docs content, registry docs, API MDX, CN docs, MCP, and Plate Plus hooks.

## Current Slice

Status: eleventh slice complete

1. Make Fumadocs metadata/pageTree the docs navigation authority.
2. Move sidebar and pager reads off direct `docsConfig` runtime access.
3. Replace command menu docs search with Fumadocs search API.
4. Keep `docsConfig` only as migration overlay for labels, CN titles, and non-content registry/app links until those live in Fumadocs metadata or registry docs source.
5. Replace Plate's old LLM copy/view buttons with the upstream-style copy-page dropdown and `.md` markdown route model.
6. Remove the old Plate theme/customizer shell surface called out for deletion in the comparison doc.
7. Route visible registry install commands through the `@plate/*` namespace configured by `components.json`.
8. Route generated Plate registry self-dependencies through `@plate/*`, while preserving local-file template sync.
9. Upgrade the docs app to the upstream shadcn v4 package and validate Plate registry source against the v4 schema contract.
10. Move the shared app shell toward upstream's `data-slot="layout"` structure with layout-owned footer behavior and centered page headers.
11. Move root runtime providers and global CSS closer to upstream's provider stack, while keeping Plate's required DnD/Jotai/editor runtime.
12. Align header, mobile nav, and command-menu fallback links with upstream's Fumadocs-aware header behavior while preserving Plate product links.
13. Include Fumadocs `meta.json` in the docs registry export and remove old `docsConfig`-driven docs-registry generation scaffolding.
14. Move runtime docs navigation overlays out of `docsConfig` and into committed Fumadocs-adjacent metadata.

## Findings

- Contentlayer removal and Fumadocs source loading are already complete.
- `docsConfig` still exists, but this slice removes direct runtime reads from `DocsNav`, pager, command menu, and mobile docs nav.
- Fumadocs supports root `meta.json` with `pages`, links, and separators; links can represent app-only and registry-derived docs routes.
- The current content layout has root pages plus folders such as `(guides)`, `(plugins)`, `api`, `components`, `examples`, `installation`, `migration`, and `releases`.
- CN routes can keep using English metadata because `DocsNav` applies locale labels and href prefixing.
- Fumadocs search maps i18n locale names into Orama tokenizer languages. Plate's `cn` locale must be mapped explicitly to a supported tokenizer.
- The upstream `.md` model maps `/docs/*.md` through a hidden `/llm/*` route. Plate now mirrors that for `/docs/*.md` and `/cn/docs/*.md`, while keeping canonical `https://platejs.org` source URLs in copied markdown.
- The old Plate theme/customizer surface was only reachable from the English and CN home pages. Removing those entrypoints made `themes.css`, `lib/themes.ts`, `ThemeCustomizer`, theme selectors, theme copy-code helpers, `useThemesConfig`, the unused drawer component, and the `vaul` dependency dead.
- Template `components.json` files and `tooling/scripts/update-template.sh` already use `@plate` as the Plate registry entrypoint. The remaining raw URL drift is in user-facing docs, block preview, MCP, and metadata command text.
- Raw `/r/*` URLs are still the right shape for resolvable registry content links, LLM context, and v0 URLs. User install commands should prefer `npx shadcn@latest add @plate/{name}`.
- Upstream shadcn v4 resolves namespaced `registryDependencies` such as `@custom/custom-component` through configured registries. Plate can use the same contract for its own generated self-dependencies instead of emitting public `https://platejs.org/r/*.json` dependencies.
- Local template sync must rewrite `@plate/{name}` back to `{name}.json`, because `update-template.sh --local` intentionally feeds shadcn local-file mode from a prepared JSON mirror.
- The upstream shadcn v4 registry schema is exported from `shadcn/schema`; `shadcn/registry` is no longer the schema/type authority. Plate registry source and builders now use the v4 schema entrypoint.
- The full local registry build is still CI-owned, so this slice adds a source-only registry contract check to `www` typecheck instead of running `build:registry` locally.
- Upstream owns the app shell shape through `data-slot="layout"`, a layout-level footer, centered `PageHeader`, and footer visibility controlled by route descendants such as `data-slot="docs"`.
- Plate's English and CN home pages previously owned their own footers and action-row layout, which kept the old fork shell alive even after the theme/customizer removal.
- Upstream's root app uses `group/body`, a top-level tooltip provider, and a `d` theme shortcut in the theme provider. Plate still needs Jotai and DnD for retained editor surfaces, so the provider restart should add upstream behavior around those retained providers rather than deleting them.
- `apps/www/src/app/globals.css` still carried old sync markers for custom scrollbar, prose, and duplicate MDX pretty-code styles. The current shadcn-style pretty-code rules already target the active generated attributes, so the marked fallback CSS can be removed after browser-checking code blocks.
- Upstream keeps mobile nav visible until the `lg` breakpoint and lets the header pass Fumadocs page-tree data into mobile/search surfaces. Plate still needs its own product links, but those links should use the same locale href handling as docs page-tree links.
- Plate's mobile nav rendered the Fumadocs-derived tree but did not localize visible titles or hrefs at click time. On `/cn`, the mobile menu could point users back to English routes.
- Plate's command-menu fallback link groups also used raw titles and hrefs. Fumadocs search owns indexed docs results, but fallback nav groups still need locale-safe labels and links.
- `hrefWithLocale` must be safe for `/`, existing `/cn` links, hash links, and absolute external URLs. Prefixing every href blindly is how external links and CN homepage links get subtly broken.
- `build-docs-registry.mts` still had a half-removed `docsConfig`/pathMap/meta generation path. The active export scanned Fumadocs content, but it did not publish the committed `content/meta.json`, so an installed docs registry missed the navigation authority that the app now relies on.
- The docs registry should export `docs-meta` as a normal shadcn v4 registry item and make the aggregate `docs` item depend on `@plate/docs-meta`. Generating a sidecar `docs-meta.json` outside the registry dependency graph would preserve the old installer workaround instead of using upstream namespace resolution.
- `docs-page-tree.ts` still imported `docsConfig/docsMap` at runtime after pageTree adoption. That kept the old TS nav graph on the hot path for labels, CN titles, and keywords even though `content/meta.json` already owns ordering.

## Verification Plan

- Run `pnpm --filter www build:source`.
- Run `pnpm --filter www typecheck`.
- Run `pnpm lint:fix`.
- If a browser-visible sidebar/search change is left in a runnable state this turn, verify via Browser Use before claiming full UI completion.
- If a browser-visible app-shell/homepage change is left in a runnable state this turn, verify `/` and `/cn` render without the discarded theme/customizer surface.
- If provider or global CSS changes affect the root shell, verify body/layout markers, footer visibility, theme shortcut behavior, and at least one docs page with code blocks.
- If header or mobile navigation changes, verify English and CN mobile menus, external Plate Plus behavior, command-menu fallback routing, and desktop breakpoint visibility.
- If docs registry export changes, verify `createDocsRegistry()` through `check-docs-source-parity.mts`, verify source registry normalization, and run `www` typecheck.
- If docs nav metadata changes, regenerate `content/meta.json`, verify the parity script asserts the metadata overlay, and run `www` typecheck.

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
- 2026-05-24: Added `apps/www/src/lib/registry-install.ts` and rewired visible registry install commands in component installation, component source, MCP setup, block preview toolbar, block viewer toolbar, and block metadata to use `@plate/*` namespace commands instead of raw registry URLs. Added a real `DialogDescription` to the MCP dialog after the smoke surfaced Radix's missing-description warning.
- 2026-05-24: Verification passed for the registry install command slice: `pnpm install`, `pnpm --filter www build:source`, `pnpm --filter www typecheck`, `pnpm lint:fix`, rerun `pnpm --filter www typecheck`, rerun `pnpm --filter www typecheck` after the MCP dialog warning fix, and Puppeteer smoke on `http://localhost:3100/docs/components/table-node`, `http://localhost:3100/docs/table`, `http://localhost:3100/blocks/playground`, and `http://localhost:3100/blocks/editor-basic`. The smoke confirmed visible install commands, MCP setup command, and metadata descriptions use `@plate/*`, no raw localhost registry URL remains in those surfaces, and the MCP dialog warning is gone.
- 2026-05-24: Added `docs/solutions/developer-experience/2026-05-24-shadcn-registry-install-commands-should-use-configured-namespaces.md` through the ce-compound closeout. Final PR gate passed with `pnpm check` after one earlier `test:slowest` threshold failure was isolated as local load by a clean standalone `pnpm test:slowest` rerun.
- 2026-05-24: Added `apps/www/scripts/registry-dependencies.mts` so `build-registry.mts` and `build-docs-registry.mts` emit `@plate/*` for Plate self-dependencies while preserving `@shadcn/*`, direct URLs, and local path specifiers. Updated docs source parity to assert `@plate/table-docs` and `@plate/docs`.
- 2026-05-24: Updated `tooling/scripts/prepare-local-template-registry.mjs` to rewrite `@plate/*` dependencies back to local `{name}.json` dependencies for `update-template.sh --local`.
- 2026-05-24: Verification passed for the registry dependency namespace slice: `pnpm install`, `pnpm --filter www build:source`, `bun test apps/www/scripts/registry-dependencies.test.mts`, a temp-directory smoke of `tooling/scripts/prepare-local-template-registry.mjs`, `pnpm --filter www typecheck`, and `pnpm lint:fix`.
- 2026-05-24: Upgraded `apps/www` from `shadcn@2.6.3` to `shadcn@4.8.0`, moved registry schema/type imports from `shadcn/registry` to `shadcn/schema`, and validated `build-registry.mts` plus `build-docs-registry.mts` through v4 `registrySchema.parse`.
- 2026-05-24: Added `apps/www/scripts/check-registry-source.mts` to validate Plate's authored registry composition against the shadcn v4 schema and assert normalized registry dependencies use resolver-safe specifiers.
- 2026-05-24: Verification passed for the shadcn v4 schema slice: `pnpm install`, `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`, `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-docs-source-parity.mts`, `bun test apps/www/scripts/registry-dependencies.test.mts`, `pnpm --filter www build:source`, `pnpm --filter www typecheck`, and `pnpm lint:fix`.
- 2026-05-24: Added `docs/solutions/developer-experience/2026-05-24-shadcn-v4-registry-schema-needs-source-only-validation.md` through the ce-compound closeout.
- 2026-05-24: Added a shared `AppShell` for `(app)` and `/cn` routes using upstream's `data-slot="layout"` wrapper, moved footer ownership from home pages into the layout, and updated `SiteFooter` to hide on docs/designer descendants.
- 2026-05-24: Updated `PageHeader`, English home, CN home, and editors intro toward upstream's centered page-header/action composition while preserving Plate copy and product CTAs.
- 2026-05-24: Browser smoke caught that body-level footer hiding did not hide on `/docs`; fixed it by also targeting the nearer `group/layout` shell.
- 2026-05-24: Verification passed for the app-shell slice: `pnpm install`, `pnpm --filter www build:source`, `pnpm --filter www typecheck`, `pnpm lint:fix`, and a local Chrome smoke on `http://localhost:3100/`, `http://localhost:3100/cn`, and `http://localhost:3100/docs`. The smoke confirmed each route has one `data-slot="layout"` shell, English/CN home pages expose one footer, docs keeps the layout footer hidden, search/header render, and browser errors/warnings are empty.
- 2026-05-24: Added `docs/solutions/developer-experience/2026-05-24-shadcn-app-shell-footer-visibility-needs-nearest-layout-group.md` through the ce-compound closeout.
- 2026-05-24: Updated the root app shell provider layer with upstream-style `group/body`, a top-level tooltip provider, and the upstream `d` theme shortcut while preserving Plate's Jotai and DnD providers.
- 2026-05-24: Removed the old `globals.css` blocks explicitly marked `remove after sync` for custom scrollbar, custom prose, and duplicate MDX pretty-code fallback styling.
- 2026-05-24: Verification passed for the provider/CSS slice: `pnpm install`, `pnpm --filter www build:source`, `pnpm --filter www typecheck`, `pnpm lint:fix`, and local Chrome smoke on `http://localhost:3100/`, `http://localhost:3100/docs`, `http://localhost:3100/docs/migration/slate-to-plate`, and `http://localhost:3100/cn/docs/migration/slate-to-plate`. The smoke confirmed `group/body`, one layout shell, home footer visible, docs footers hidden, `d` theme shortcut toggling, visible code blocks on English/CN docs pages, and empty browser error/warning logs.
- 2026-05-24: Updated `hrefWithLocale` to avoid double-prefixing `/cn`, keep external/hash hrefs untouched, and map CN home to `/cn`.
- 2026-05-24: Updated `SiteHeader`, `Logo`, and `MainNav` toward upstream's `lg` desktop breakpoint and removed the old commented header fork.
- 2026-05-24: Updated `MobileNav` to localize top links, page-tree group titles, page-tree hrefs, and external Plate Plus behavior from the current locale.
- 2026-05-24: Updated `CommandMenu` fallback links/groups to use localized titles and locale-safe hrefs while keeping Fumadocs search as the docs-search source.
- 2026-05-24: Verification passed for the header/mobile-nav slice: `pnpm install`, `pnpm --filter www build:source`, `pnpm --filter www typecheck`, `pnpm lint:fix`, and local Chrome smoke on `http://localhost:3100/`, `http://localhost:3100/cn`, and `http://localhost:3100/docs`. The smoke confirmed English mobile links, CN mobile links, CN page-tree links, Plate Plus external target, CN command-menu routing to `/cn/docs`, one docs layout shell, hidden docs footer, desktop mobile-menu invisibility, and no meaningful browser logs after filtering the known dev-port manifest CORS noise.
- 2026-05-24: Added `docs/solutions/developer-experience/2026-05-24-shadcn-header-nav-needs-locale-safe-client-links.md` through the ce-compound closeout.
- 2026-05-24: Added a `docs-meta` registry item that publishes `../../content/meta.json` to `content/docs/plate/meta.json`, made the aggregate `docs` registry item depend on `@plate/docs-meta`, and extended docs source parity checks to assert the meta export.
- 2026-05-24: Removed the dead `docsConfig`/pathMap/meta-generation scaffolding from `build-docs-registry.mts`; docs registry export now follows the committed Fumadocs metadata instead of a stale TS-nav shadow path.
- 2026-05-24: Verification passed for the docs registry meta slice: `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-docs-source-parity.mts`, `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`, `pnpm --filter www typecheck`, `pnpm lint:fix`, and a final `pnpm --filter www typecheck` rerun after cleanup.
- 2026-05-24: Added `docs/solutions/developer-experience/2026-05-24-fumadocs-docs-registry-exports-need-meta-item.md` through the ce-compound closeout.
- 2026-05-24: Started the runtime nav-overlay slice: `sync-docs-meta.mts` now writes `_plate.sections` and `_plate.items` into `content/meta.json`; `docs-page-tree.ts` and the EN/CN docs page metadata fallback read those overlays from `content/meta.json` instead of importing `docsConfig/docsMap`.
- 2026-05-24: Verification passed for the runtime nav-overlay slice: `pnpm --filter www sync:docs-meta`, `pnpm --filter www typecheck`, `pnpm lint:fix`, and a final `pnpm --filter www typecheck` rerun after formatting. The typecheck includes `build:source`, docs parity, registry source validation, app TS, and package integration TS.
- 2026-05-24: Browser Use was not exposed by the current tool registry after two lookup attempts. Fallback HTTP smoke passed on `http://localhost:3100/docs/plugin-shortcuts` and `http://localhost:3100/cn/docs/plugin-shortcuts`, confirming `data-slot="docs"` plus English and CN page titles/text. A standalone `tsx` import smoke of `docs-page-tree.ts` failed on Fumadocs' `fumadocs-core/server` package export and was not used as evidence.
