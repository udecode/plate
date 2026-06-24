---
title: Refactor Plate Docs to Fumadocs
type: refactor
date: 2026-05-22
---

# Refactor Plate Docs to Fumadocs

## Overview

Move Plate's public docs source pipeline from Contentlayer to Fumadocs MDX, using `../ui/apps/v4` as the reference implementation while preserving Plate-specific behavior: `/docs/*` URLs, `/cn/docs/*` fallback semantics, registry-backed component/example pages, local docs registry generation, LLM copy/raw markdown features, and existing MDX components.

This should be a hard source-pipeline replacement, not a half-state where Contentlayer and Fumadocs both own public docs rendering.

## Problem Statement

Plate's docs are organized as raw MDX under root `content/`, but the app still depends on `contentlayer2` for document discovery, compiled MDX code, slug generation, raw body access, and type generation.

That makes Plate diverge from shadcn's current docs architecture:

- shadcn uses `apps/v4/source.config.ts` with `defineDocs({ dir: "content/docs" })`.
- shadcn exposes docs through `apps/v4/lib/source.ts` using `loader({ source: docs.toFumadocsSource(), baseUrl: "/docs" })`.
- shadcn derives navigation and neighbors from Fumadocs `pageTree` and `meta.json`.

Plate instead hand-rolls these pieces:

- `apps/www/contentlayer.config.js` reads `../../content/**/*.mdx`, strips grouping folders like `(plugins)`, and emits `allDocs`.
- `apps/www/src/app/(app)/docs/[[...slug]]/page.tsx` queries `allDocs` and falls back to registry items.
- `apps/www/src/app/cn/docs/[[...slug]]/page.tsx` duplicates the same logic with `.cn.mdx` fallback rules.
- `apps/www/src/config/docs.ts`, `docs-plugins.ts`, and `docs-api.ts` hard-code most sidebar and pager structure.
- `apps/www/scripts/build-docs-registry.mts` separately walks `content/` and manually mimics Contentlayer's path normalization for registry docs.

The result works, but it is brittle. The source parser, route tree, sidebar order, registry docs export, Chinese fallback, and LLM/raw markdown features are all separate truths.

## Proposed Solution

Introduce Fumadocs MDX as the canonical docs source and route tree for Plate, then adapt Plate's registry-specific pages around that source.

Target architecture:

1. Add `apps/www/source.config.ts` exporting a Plate docs collection via `defineDocs`.
2. Generate `apps/www/.source` through `fumadocs-mdx`.
3. Add `apps/www/src/lib/source.ts` exporting a Fumadocs `source`.
4. Replace Contentlayer imports with `source.getPage()`, `source.generateParams()`, `source.getPages()`, and `page.data.getText("raw")`.
5. Convert or generate Fumadocs `meta.json` files so page tree order is data-driven instead of only TS-config-driven.
6. Keep custom Plate docs shell, registry component pages, and CN routes as Plate-owned wrappers around the Fumadocs source.
7. Remove Contentlayer only after the route, registry, CN, and raw markdown paths are green.

## Technical Approach

### Content Layout

Preferred end state:

```text
apps/www/
  source.config.ts
  .source/
  src/lib/source.ts

content/
  meta.json
  index.mdx
  installation/
    meta.json
    plate-ui.mdx
    next.mdx
  api/
    meta.json
    core.mdx
  plugins/
    meta.json
    ...
```

Plate does not have to move content under `apps/www/content/docs` to use Fumadocs. The plan should first prove whether `defineDocs({ dir: "../../content" })` works correctly from `apps/www/source.config.ts`. If Fumadocs rejects or makes that awkward, move public content to `apps/www/content/docs` in the same PR and update registry docs export paths explicitly.

Do not keep group-directory routing magic hidden in parser code. Either:

- remove grouping folders like `content/(plugins)/(elements)/table.mdx` by physically reorganizing docs into Fumadocs folders, or
- keep groups only if Fumadocs supports them cleanly and the route result is tested.

My recommendation: physically reorganize public docs into Fumadocs folders. It is more churn up front, but it kills the most fragile part of the current pipeline.

### Fumadocs Source

Add a Plate equivalent of shadcn's setup:

```ts
// apps/www/source.config.ts
import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: '../../content',
});

export default defineConfig({
  mdxOptions: {
    rehypePlugins: (plugins) => {
      // Port existing rehypeSlug, rehypeComponent, pretty-code, npm-command behavior.
      return plugins;
    },
  },
});
```

```ts
// apps/www/src/lib/source.ts
import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});
```

Use Fumadocs' generated `.source` folder, not a custom generated map file. Add the `@/.source` alias to `apps/www/tsconfig.json`.

### Next.js Integration

Wrap `apps/www/next.config.ts` with `createMDX` from `fumadocs-mdx/next`, preserving the existing Next config:

```ts
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX({});

export default withMDX(nextConfig);
```

Keep Plate's existing Turbopack workspace aliases, tracing includes, redirects, and registry route config. Do not copy shadcn's config wholesale.

### Route Migration

Replace `allDocs` reads in:

- `apps/www/src/app/(app)/docs/[[...slug]]/page.tsx`
- `apps/www/src/app/cn/docs/[[...slug]]/page.tsx`

English route:

- `generateStaticParams()` should combine `source.generateParams()` plus existing registry component/example params.
- `getDocFromParams()` should use `source.getPage(params.slug)`.
- MDX rendering should use `const MDX = page.data.body` with the existing Plate `mdxComponents` ported to Fumadocs' component model.
- Raw markdown for LLM copy should use `await page.data.getText("raw")`.

Chinese route:

- Keep `/cn/docs/*`.
- Prefer a Chinese source page when a `.cn.mdx` equivalent exists.
- Fall back to English when a Chinese page is missing.
- Generate params for known Chinese pages plus registry component/example pages.

If Fumadocs does not naturally model `.cn.mdx` variants in one collection, create two collections in `source.config.ts`: `docs` and `docsCn`. Do not encode CN fallback by string searching generated private fields.

### Sidebar and Pager

Plate has enough custom nav metadata that a one-shot swap to `source.pageTree` is risky.

Phase it:

1. Keep `docsConfig` and `getPagerForDoc()` for the first rendering cutover.
2. Generate `meta.json` files from the existing nav config and commit them once.
3. Add a validation script that compares `docsConfig` URLs against `source.getPages()` during the transition.
4. Once routes and registry pages are green, remove `docsConfig` as sidebar source and use Fumadocs `source.pageTree`.

Do not leave `docsConfig` and `meta.json` as permanent competing truths.

### Registry Docs Export

This is the migration trap.

`apps/www/scripts/build-docs-registry.mts` currently:

- reads `../../content`
- ignores `.cn.mdx`
- strips grouping folders with `DIRECTORY_PATTERN_REGEX`
- creates `registry-docs.json`
- includes a `fumadocs` registry item with docs files and MDX component files

Update it after the content layout is final:

- read the Fumadocs content tree, not old grouped paths
- include committed `meta.json` files
- preserve `content/docs/plate/...` targets expected by consumers
- keep docs registry names stable where possible
- test that generated `public/r/registry-docs.json` still includes `docs`, `fumadocs`, and representative docs pages

Registry docs are consumer-facing. Breaking them quietly would be a real regression.

### MDX Component Compatibility

Port the existing MDX component registry from `apps/www/src/components/mdx-components.tsx`.

Must preserve:

- `ComponentPreview`
- `ComponentPreviewPro`
- `ComponentSource`
- `PackageInfo`
- `API`, `APIItem`, `APIOptions`, and related API docs helpers
- `Callout`, `Steps`, `Tabs`, `Cards`, `FrameworkDocs`
- `ReleaseIndex`
- code block wrappers and npm command transform behavior

Fumadocs compiles MDX differently than Contentlayer. Audit all custom MDX tags with:

```bash
rg -o "<[A-Z][A-Za-z0-9]*" content -g "*.mdx" | sort -u
```

Every tag in that list needs either a registered MDX component or a deliberate removal.

### Search, LLM, and Raw Markdown

Preserve current LLM affordances:

- `LLMCopyButton`
- `ViewOptions`
- raw markdown copy
- `.md` rewrites if present or added later
- `apps/www/src/lib/llm-context.ts` docs registry references

Fumadocs exposes raw text through `page.data.getText("raw")`; use that instead of `doc.body.raw`.

### Dependency Cleanup

After the migration is complete:

- remove `contentlayer2`
- remove `next-contentlayer2`
- remove `apps/www/contentlayer.config.js`
- remove `.contentlayer` tsconfig alias and include
- remove `build:contentlayer` and `prebuild` coupling from `apps/www/package.json`

Add:

- `fumadocs-mdx`
- `fumadocs-ui` only if Plate adopts Fumadocs UI components directly; otherwise keep headless/source only
- `postinstall` or an explicit app build pre-step that runs `fumadocs-mdx`

Use the same package-manager discipline as the repo: run `pnpm install` after manifest changes.

## Implementation Phases

### Phase 1: Inventory and Safety Net

- [ ] Snapshot current generated docs routes from `allDocs` and registry params into a local JSON fixture.
- [ ] Snapshot `/docs`, `/docs/installation`, `/docs/components/editor`, `/docs/table`, `/docs/api/core`, `/docs/releases`, and `/cn/docs/table`.
- [ ] Inventory all custom MDX component tags under `content/**/*.mdx`.
- [ ] Inventory all places importing `@/.contentlayer/generated`, `next-contentlayer2`, or `doc.body.code/raw`.
- [ ] Identify all code paths that read or generate `registry-docs.json`.

Success criteria:

- The plan has a concrete route parity list before code moves.
- Every custom MDX tag has an owner.
- Registry docs generation is included in scope, not found late.

### Phase 2: Fumadocs Source Prototype

- [ ] Add `source.config.ts` and `src/lib/source.ts`.
- [ ] Add `.source` alias to `apps/www/tsconfig.json`.
- [ ] Wrap Next config with `createMDX`.
- [ ] Add a temporary diagnostic script to print Fumadocs pages, URLs, titles, and raw markdown availability.
- [ ] Decide whether `../../content` is viable or whether public docs must move under `apps/www/content/docs`.

Success criteria:

- `fumadocs-mdx` generates `.source`.
- Fumadocs can list representative Plate docs.
- Raw markdown is available through `getText("raw")`.

### Phase 3: English Route Cutover

- [ ] Replace Contentlayer reads in the English docs route with Fumadocs source reads.
- [ ] Render MDX through Fumadocs compiled body and Plate MDX components.
- [ ] Keep existing registry fallback for component/example pages.
- [ ] Keep current `DocContent` shell during the first cutover.
- [ ] Keep current sidebar/pager source during the first cutover.

Success criteria:

- Existing public docs pages render from Fumadocs.
- Registry component/example pages still render.
- LLM copy still gets raw markdown.

### Phase 4: CN Route Cutover

- [ ] Add a first-class Chinese source lookup.
- [ ] Preserve `.cn.mdx` preference.
- [ ] Preserve English fallback when `.cn.mdx` is missing.
- [ ] Keep registry component/example fallbacks under `/cn/docs/*`.

Success criteria:

- `/cn/docs/table` works when a Chinese file exists.
- `/cn/docs/<english-only-page>` falls back to English.
- CN static params include translated docs and registry pages.

### Phase 5: Page Tree and Navigation

- [ ] Generate or hand-author Fumadocs `meta.json` files matching current sidebar order.
- [ ] Add a validation script that fails when a docs nav href has no source page.
- [ ] Replace pager with Fumadocs neighbor lookup after meta parity is proven.
- [ ] Replace sidebar source with Fumadocs page tree only after route parity is green.
- [ ] Remove redundant nav config once Fumadocs is authoritative.

Success criteria:

- There is one long-term nav source.
- Previous/next links match current docs order.
- Search/category grouping remains usable.

### Phase 6: Registry Docs Export

- [ ] Update `build-docs-registry.mts` for the final Fumadocs content layout.
- [ ] Include `meta.json` files in the docs registry item.
- [ ] Keep the `fumadocs` registry item working for downstream local-docs installs.
- [ ] Add fixture assertions for representative generated docs items.

Success criteria:

- `pnpm --filter www rd` produces valid docs registry JSON.
- Generated docs targets match downstream `content/docs/plate/...` expectations.
- Registry helper/docs learnings are honored: no missing helper files, no hidden app-only imports.

### Phase 7: Remove Contentlayer

- [ ] Delete `apps/www/contentlayer.config.js`.
- [ ] Remove Contentlayer dependencies and scripts.
- [ ] Remove `.contentlayer` aliases/includes.
- [ ] Remove `next-contentlayer2/hooks` usage.
- [ ] Delete dead Contentlayer utility code.

Success criteria:

- `rg "contentlayer|next-contentlayer|\\.contentlayer|allDocs" apps/www content package.json` only finds intentional migration notes or no matches.

### Phase 8: Verification

Required commands after implementation:

```bash
pnpm install
pnpm --filter www fumadocs-mdx
pnpm --filter www rd
pnpm turbo build --filter=./apps/www
pnpm turbo typecheck --filter=./apps/www
pnpm lint:fix
```

Browser Use checks:

- `/docs`
- `/docs/installation`
- `/docs/components/editor`
- `/docs/table`
- `/docs/api/core`
- `/docs/releases`
- `/cn/docs/table`
- one registry example page under `/docs/examples/*`

If package graph imports fail during package-scoped typecheck, follow repo policy: run root `pnpm build`, then rerun the same typecheck before treating unresolved workspace imports as real debt.

## SpecFlow Analysis

### User Flows

1. Developer opens a normal docs page under `/docs/*`.
   - Fumadocs source resolves the page.
   - Plate shell renders title, description, badges, MDX body, TOC, pager.
   - Raw markdown controls still work.

2. Developer opens a registry-backed component or example page.
   - Fumadocs source misses the page.
   - Existing registry fallback resolves the item.
   - Component installation/source preview still renders.

3. Chinese reader opens `/cn/docs/*`.
   - Chinese source page is preferred.
   - English fallback is used if no Chinese page exists.
   - Registry pages still work under CN routes.

4. Consumer installs Plate local docs from the registry.
   - `registry-docs.json` includes docs MDX, meta files, and Fumadocs support files.
   - Target project receives a valid Fumadocs docs tree.

5. Maintainer adds a new docs page.
   - Adds MDX and `meta.json` entry.
   - Validation catches missing nav/source entries.
   - Registry docs export includes the page.

### Gaps to Resolve Before Implementation

Critical:

- Decide whether content stays at root `content/` or moves under `apps/www/content/docs`.
- Decide whether CN docs are one collection with filename convention or a separate collection.
- Decide whether `docsConfig` is removed in the same PR or only after a transitional parity gate.

Important:

- Define generated `meta.json` ownership. If generated once, commit it and make it source of truth. If generated every time, document the generator and verification.
- Decide whether to preserve docs registry item names exactly or allow a one-time rename with compatibility redirects.
- Confirm Fumadocs MDX can parse every current custom MDX tag after component registration.

Minor:

- Decide whether to adopt Fumadocs UI docs layout pieces or keep Plate's current shell. Default: keep Plate shell.

Default assumptions if unanswered:

- Move to a clean Fumadocs folder layout.
- Use separate EN and CN collections if `.cn.mdx` is awkward.
- Keep Plate shell and registry fallbacks.
- Remove `docsConfig` only after meta/pageTree parity is verified.

## Acceptance Criteria

Functional:

- [ ] Public `/docs/*` routes render from Fumadocs source, not Contentlayer.
- [ ] `/cn/docs/*` preserves translated-page preference and English fallback.
- [ ] Registry component and example docs pages still render.
- [ ] `ComponentPreview`, `ComponentSource`, `PackageInfo`, and API docs tags render.
- [ ] Raw markdown copy uses Fumadocs `getText("raw")`.
- [ ] Sidebar and pager order match the current docs experience.
- [ ] `registry-docs.json` still publishes installable Plate docs.

Quality:

- [ ] Contentlayer dependencies, config, aliases, and route imports are removed.
- [ ] Fumadocs `meta.json` is the long-term navigation source.
- [ ] Route parity is checked with a script or fixture.
- [ ] Registry docs generation has focused assertions.
- [ ] Browser Use verifies representative English, Chinese, registry, and API docs pages.

Non-goals:

- Redesign the docs UI.
- Rewrite docs copy.
- Change public docs URLs.
- Change registry item semantics unrelated to docs.

## Risks and Mitigations

- Risk: Fumadocs route generation does not match Contentlayer's grouping-folder stripping.
  - Mitigation: remove grouping folders or add explicit route tests before deleting Contentlayer.

- Risk: CN fallback depends on Contentlayer private fields.
  - Mitigation: model CN docs explicitly in source config and route helpers.

- Risk: registry docs export silently drops files or helper dependencies.
  - Mitigation: add generated JSON assertions and follow the existing registry-helper learning.

- Risk: server route imports pull client-only registry code into the RSC graph.
  - Mitigation: keep registry lookup boundaries unchanged and verify production build.

- Risk: custom MDX tags compile but render wrong under Fumadocs.
  - Mitigation: inventory all capitalized MDX tags and add route smoke pages covering each family.

## References and Research

Internal:

- `apps/www/contentlayer.config.js` - current Contentlayer source, slug normalization, MDX plugins.
- `apps/www/src/app/(app)/docs/[[...slug]]/page.tsx` - English docs route and registry fallback.
- `apps/www/src/app/cn/docs/[[...slug]]/page.tsx` - CN docs route and fallback.
- `apps/www/src/config/docs.ts` - current sidebar source.
- `apps/www/scripts/build-docs-registry.mts` - local docs registry export.
- `apps/www/src/components/mdx-components.tsx` - custom MDX component registry.
- `../ui/apps/v4/source.config.ts` - shadcn Fumadocs source config.
- `../ui/apps/v4/lib/source.ts` - shadcn Fumadocs loader.
- `../ui/apps/v4/app/(app)/docs/[[...slug]]/page.tsx` - shadcn route pattern.

Institutional learnings:

- `docs/solutions/developer-experience/2026-04-27-mdx-generated-markers-must-use-jsx-comments.md` - generated MDX markers must use JSX comments.
- `docs/solutions/developer-experience/2026-04-06-next-turbopack-needs-client-boundaries-at-react-package-entrypoints.md` - registry server paths must not import client-only helpers as server-safe code.
- `docs/solutions/developer-experience/2026-04-06-registry-helper-refactors-must-update-template-registry-dependencies.md` - registry metadata, not app source existence, is the source of truth for generated consumers.

External:

- Fumadocs MDX `defineDocs` and `defineConfig`: https://github.com/fuma-nama/fumadocs/blob/dev/apps/docs/content/docs/(framework)/integrations/content/local-md.mdx
- Fumadocs source loader: https://github.com/fuma-nama/fumadocs/blob/dev/apps/docs/content/docs/headless/source-api/index.mdx
- Fumadocs `getText("raw")`: https://github.com/fuma-nama/fumadocs/blob/dev/apps/docs/content/blog/mdx-12.mdx
- Fumadocs generated `.source` and `@/.source` alias: https://github.com/fuma-nama/fumadocs/blob/dev/apps/docs/content/blog/mdx-v13.mdx

## Open Questions

1. Should this migration physically reorganize `content/` into Fumadocs folders in the same PR?
   - Default: yes.

2. Should CN docs remain `.cn.mdx` siblings or move to a separate `content-cn/` tree?
   - Default: separate collection, minimal file churn first.

3. Should the first implementation keep `docsConfig` for sidebar/pager until visual parity is proven?
   - Default: yes, then remove it in the same PR once `meta.json` parity passes.

4. Should generated registry docs preserve existing item names exactly?
   - Default: yes unless a generated-name collision proves impossible.

## Implementation Notes

### 2026-05-22

- Active branch: `codex/fumadocs-migration`.
- Repo was already up to date with `main` before branching.
- Fumadocs reference in `../ui/apps/v4` uses route-group folders such as `content/docs/(root)`, so Plate's existing grouped folders under `content/` should be validated before any physical content move.
- Relevant learnings:
  - Registry/server paths must not import client-only helpers accidentally.
  - Registry metadata/generated JSON is the downstream consumer contract; app source existence alone is not enough.
  - Generated MDX markers must remain valid MDX expressions.
- `docs/solutions/patterns/critical-patterns.md` was not present in this repo.
- Fumadocs generation is viable against root `../../content`; route-group folders are stripped by the Fumadocs loader, so no physical content move is needed in this slice.
- The source config initially pulled the generated registry UI graph into the MDX compiler through `rehype-utils`. Splitting runtime registry component lookup into `src/lib/registry-component.tsx` kept MDX source generation server-safe.
- App source no longer imports Contentlayer. Remaining lockfile references should disappear after `pnpm install` prunes removed dependencies.
- Sidebar, command menu, and pager still read `docsConfig` for this cutover. That preserves the current docs UX while Fumadocs owns page discovery, MDX compilation, raw markdown, and localized fallback.
- Verification passed:
  - `pnpm install`
  - `pnpm --filter www exec fumadocs-mdx`
  - `pnpm --filter www exec next build`
  - `pnpm turbo typecheck --filter=./apps/www`
  - `pnpm lint:fix`
  - dev-browser smoke for `/docs`, `/docs/installation`, `/docs/components/editor`, `/docs/table`, `/docs/api/core`, `/docs/releases`, `/cn/docs/table`, and `/docs/examples/plite-to-html`
- `next build` still reports the existing Turbopack NFT warning through `src/lib/rehype-utils.ts` and `/api/registry/[name]`. It does not block the build.
- I did not run `pnpm --filter www rd` because repo instructions forbid local registry builds outside CI.
- Closeout verification after compounding also passed:
  - `pnpm --filter www exec fumadocs-mdx`
  - `pnpm --filter www exec next build`
  - `pnpm turbo typecheck --filter=./apps/www`
  - `pnpm lint:fix`
  - Contentlayer cleanup search returned no app/script/package references.
- Reusable learning captured in `docs/solutions/developer-experience/2026-05-22-fumadocs-mdx-migrations-need-server-safe-source-config-and-mdx-boundaries.md`.
- Deferred deliberately:
  - moving sidebar/pager ownership from `docsConfig` to Fumadocs `meta.json`/`pageTree`
  - running local registry generation, because this repo forbids `build:registry` outside CI.
- Added `apps/www/scripts/check-docs-source-parity.mts` and wired it into `www` typecheck. It verifies:
  - every `docsConfig` route resolves through generated Fumadocs source, app-only docs routes, or registry fallback
  - `.cn.mdx` files are present and representative translated docs are generated
  - missing Chinese translations still have an English source for fallback
  - docs registry generation still includes `docs`, `fumadocs`, `table-docs`, and skips translated `.cn.mdx` exports without writing `public/r`

### 2026-05-23

- PR CI failure: `Registry / Validate Registry` failed while building `templates/plate-playground-template`.
- Root cause: `pnpm templates:update --local` uses `shadcn@latest`, which generated `components/ui/calendar.tsx` with `classNames.table` while the template dependency graph installed `react-day-picker@9.14.0`. React Day Picker v9.14 exposes `month_grid`, not `table`.
- Follow-up failure: the same template update path now upgrades `react-day-picker` to `10.0.1`, where `initialFocus` is removed from `DayPickerProps`.
- Fix direction: patch the template updater's generated-code normalization step for React Day Picker API drift, not `templates/**` by hand.
