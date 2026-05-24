# Shadcn Docs Restart Comparison

## Goal

Compare latest local upstream shadcn docs in `../ui/apps/v4` with Plate's current docs app in `apps/www`, then identify every meaningful Plate-specific change before restarting Plate docs from upstream.

The question is not "how do we merge this today." The question is: when Plate restarts from latest shadcn docs, what is worth deliberately reapplying, what should be thrown away, and what should be adopted from upstream without debate?

## Bottom Line

Restart from `../ui/apps/v4`. Do not try to patch the current `apps/www` app forward. The two apps no longer differ by theme and copy. They have different route maps, search models, registry pipelines, and product surface.

Upstream should win for:

- Fumadocs source pipeline.
- Docs routing/page tree/search.
- shadcn v4 registry contract, style/base layout, create/init/view flow.
- Core shell pieces that are still generic shadcn docs infrastructure.

Plate should reapply only the parts that are real Plate product leverage:

- Plate docs content from root `content/**`.
- Plate API MDX component vocabulary and generated API docs support.
- Plate registry content and install docs, modernized onto upstream shadcn v4 registry behavior.
- Plate editor demos and registry preview/source display.
- Workspace-package source aliases and split typecheck model.
- Package integration tests if `apps/www` remains the integration harness.
- CN docs only if Chinese docs are still a product requirement.
- Plate-specific header links, MCP entry, Plate Plus links, and LLM/raw-markdown support through the upstream copy-page model.

Throw the Plate theme/customizer work. Brutal take: it is old fork residue with high surface area and low leverage. Upstream's current theme/style system is stronger, fresher, and tied to the actual shadcn v4 product.

## 2026-05-24 Current-State Refresh

This artifact was first written before the Plate docs source cutover landed. The current checkout is already past that first step:

- The local upstream shadcn docs source is `../ui/apps/v4`; `../shadcn/apps/v4` is not present in this workspace.
- `apps/www` now has `source.config.ts`, `src/lib/source.ts`, `createMDX` in `next.config.ts`, `build:source`, `postinstall: fumadocs-mdx`, and docs routes that read `source.getPage(...)`.
- English docs rendering uses `doc.data.body`, `doc.data.getText("raw")`, and the registry component/example fallback.
- CN docs are modeled through Fumadocs i18n with `languages: ["en", "cn"]`.
- Contentlayer is gone from `apps/www` scripts and dependencies.
- Docs content now lives under `content/docs/**`, with `content/docs/meta.json` as the committed Fumadocs page-tree metadata root.
- Runtime docs navigation, pager metadata, mobile docs nav, and command-menu fallback links no longer read `docsConfig` directly.

The current middle state is narrower than the original restart problem, but still not the final restart:

- `docsConfig` still exists as a metadata generator/parity source while labels, CN titles, and registry/app-only links finish moving into committed metadata or registry sources.
- The route tree, registry build, generated registry output model, and retained Plate product surfaces still need further upstream-aligned pruning.

So the next useful restart work is not "remove Contentlayer." That is done. The next useful work is to replace the remaining navigation/search/registry/app-shell authorities with the upstream Fumadocs and shadcn v4 model while deliberately reapplying Plate product surfaces.

## Evidence Snapshot

| Area | Upstream `../ui/apps/v4` | Plate `apps/www` | Take |
| --- | --- | --- | --- |
| Main app files | 206 under `app` | 51 under `src/app` | Route tree diverged hard. |
| Content files | 227 under `content/docs`, including `meta.json` | Plate docs now live under `content/docs/**`, including CN files and `meta.json` | Content root is aligned; exact document set is Plate-owned. |
| Registry files | 1127 under `registry` | 381 under `src/registry` | Different registry ownership and generated output model. |
| Components | 71 under `components` | 104 under `src/components` | Plate added docs/API/editor/product components. |
| Scripts | 6 under `scripts` | 7 under `apps/www/scripts` | Plate replaced upstream registry/docs build pieces. |
| Shared app paths | 5 exact relative matches | 36 Plate-only app files | This is a rewrite candidate, not a merge candidate. |
| Shared content paths | 0 exact relative matches | 251 Plate-only content files | Content has to be migrated, not merged. |
| Tests | 6 upstream app tests | 70+ Plate app/registry/package integration tests | Plate tests are a separate asset. |

## Source Stacks

### Upstream stack

Files:

- `../ui/apps/v4/package.json`
- `../ui/apps/v4/next.config.mjs`
- `../ui/apps/v4/source.config.ts`
- `../ui/apps/v4/lib/source.ts`
- `../ui/apps/v4/mdx-components.tsx`

Upstream uses `fumadocs-mdx`, `fumadocs-ui`, `fumadocs-core`, `shadcn@4.8.0`, `next@16.1.6`, React `19.2.3`, `@base-ui/react`, `radix-ui`, icon packs, and a shadcn v4 registry build.

Important scripts:

- `postinstall: fumadocs-mdx`
- `dev: pnpm icons:dev & next dev --turbopack --port 4000`
- `build: pnpm registry:build && next build`
- `registry:build: pnpm --filter=shadcn build && bun run ./scripts/build-registry.mts`

Fumadocs source is first-class:

- `source.config.ts` calls `defineDocs({ dir: "content/docs" })`.
- `lib/source.ts` loads `@/.source` through `fumadocs-core/source`.
- `next.config.mjs` wraps config with `createMDX({})`.

### Plate stack

Files:

- `apps/www/package.json`
- `apps/www/next.config.ts`
- `apps/www/source.config.ts`
- `apps/www/src/lib/source.ts`
- `apps/www/src/components/mdx-components.tsx`
- `apps/www/scripts/build-registry.mts`
- `apps/www/scripts/build-docs-registry.mts`
- `apps/www/scripts/check-docs-source-parity.mts`

Plate now uses `fumadocs-mdx@13.0.2`, `fumadocs-core@15.5.1`, `createMDX`, `defineDocs({ dir: "../../content/docs" })`, and `shadcn@4.8.0`. It still uses many `@platejs/*` workspace deps, editor runtime deps, AI/upload/docx/yjs/dnd deps, and package integration tests.

Important scripts:

- `prebuild: pnpm build:source`
- `build: pnpm build:registry && next build` with the `prebuild` lifecycle running `pnpm build:source`
- `build:source: fumadocs-mdx`
- `dev: pnpm build:source && next dev`
- `typecheck: pnpm build:source && tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-docs-source-parity.mts && tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.package-integration.json`
- `build:registry: tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/build-registry.mts`

Decision: the Fumadocs source-engine adoption is already done in this checkout. Keep Plate's API MDX vocabulary and registry docs publishing as content/features, then finish the restart by replacing the remaining old nav/search/registry/app-shell pieces.

## Routing Comparison

### Upstream routes

Primary files:

- `../ui/apps/v4/app/(app)/(root)/page.tsx`
- `../ui/apps/v4/app/(app)/docs/[[...slug]]/page.tsx`
- `../ui/apps/v4/app/(app)/docs/layout.tsx`
- `../ui/apps/v4/app/(app)/blocks/[...categories]/page.tsx`
- `../ui/apps/v4/app/(app)/charts/[type]/page.tsx`
- `../ui/apps/v4/app/(app)/colors/page.tsx`
- `../ui/apps/v4/app/(app)/create/page.tsx`
- `../ui/apps/v4/app/(app)/llm/[[...slug]]/route.ts`
- `../ui/apps/v4/app/(create)/init/route.ts`
- `../ui/apps/v4/app/(create)/init/md/route.ts`
- `../ui/apps/v4/app/(create)/init/v0/route.ts`
- `../ui/apps/v4/app/(view)/view/[style]/[name]/page.tsx`
- `../ui/apps/v4/app/api/search/route.ts`

Upstream docs app is also a shadcn product app:

- Home.
- Docs.
- Blocks.
- Charts.
- Colors.
- Create.
- Examples.
- View renderer.
- Init API.
- Search API.
- LLM markdown route.

### Plate routes

Primary files:

- `apps/www/src/app/(app)/page.tsx`
- `apps/www/src/app/(app)/docs/[[...slug]]/page.tsx`
- `apps/www/src/app/(app)/docs/[[...slug]]/doc-content.tsx`
- `apps/www/src/app/(app)/docs/layout.tsx`
- `apps/www/src/app/(app)/docs/api/page.tsx`
- `apps/www/src/app/(app)/docs/components/page.tsx`
- `apps/www/src/app/(app)/docs/examples/page.tsx`
- `apps/www/src/app/(app)/docs/plugins/page.tsx`
- `apps/www/src/app/(app)/docs/examples/slate-to-html/page.tsx`
- `apps/www/src/app/(app)/editors/page.tsx`
- `apps/www/src/app/(blocks)/blocks/[name]/page.tsx`
- `apps/www/src/app/(blocks)/blocks/playground/page.tsx`
- `apps/www/src/app/api/registry/[name]/route.ts`
- `apps/www/src/app/cn/docs/[[...slug]]/page.tsx`
- `apps/www/src/app/dev/**`

Plate docs app is a Plate product/docs/registry app:

- Plate homepage.
- Docs.
- Editors.
- Component docs.
- Example docs.
- API docs.
- Plugin docs.
- CN docs.
- Editor/block demos.
- Dev/debug routes.
- Custom registry source API.

Decision: use upstream route shape as the base, then reintroduce Plate routes deliberately. Do not copy Plate's route tree wholesale.

## Docs Engine And Content Model

### Upstream

Files:

- `../ui/apps/v4/source.config.ts`
- `../ui/apps/v4/lib/source.ts`
- `../ui/apps/v4/content/docs/**`
- `../ui/apps/v4/content/docs/**/meta.json`

Upstream docs are Fumadocs-native:

- `source.generateParams()`.
- `source.getPage(params.slug)`.
- `source.pageTree`.
- `page.data.getText("raw")`.
- `doc.body` as the compiled MDX component.
- Fumadocs `meta.json` drives navigation structure.

### Plate

Files:

- `content/**/*.mdx`
- `apps/www/source.config.ts`
- `apps/www/src/lib/source.ts`
- `apps/www/src/config/docs.ts`
- `apps/www/src/config/docs-api.ts`
- `apps/www/src/config/docs-examples.ts`
- `apps/www/src/config/docs-plugins.ts`
- `apps/www/src/config/registry-to-nav.ts`

Plate docs are Fumadocs MDX plus hand-authored nav config:

- Root `content/**`, not app-local `content/docs/**`.
- `(group)` directory names are stripped from slugs.
- `*.cn.mdx` translated docs live beside English docs.
- `docsConfig.sidebarNav` is the real nav source.
- `source.config.ts` extends Fumadocs frontmatter for `component`, `docs`, `featured`, `links`, `published`, and `toc`.
- `apps/www/src/lib/source.ts` exposes Fumadocs i18n with English and Chinese languages.

Decision: the source engine has migrated, but the content layout has not restarted from upstream. The target should still be `content/docs/**` or an equally explicit Fumadocs layout with committed `meta.json` navigation, not root content plus permanent TS nav authority.

Keep from Plate:

- The actual Plate docs content.
- The `docs`, `links`, `toc`, and API-related frontmatter concepts if still used.
- The category grouping idea: guides, installation, plugins, API, examples, components.

Throw from Plate:

- Root-content routing as an implicit permanent compatibility layer.
- The manual `docsConfig` nav as the only page-tree source.
- Any lingering docs metadata fallback that duplicates Fumadocs page data without a transition check.

## MDX And API Docs

### Upstream MDX

Files:

- `../ui/apps/v4/mdx-components.tsx`
- `../ui/apps/v4/components/component-preview.tsx`
- `../ui/apps/v4/components/component-source.tsx`
- `../ui/apps/v4/components/components-list.tsx`
- `../ui/apps/v4/components/code-tabs.tsx`
- `../ui/apps/v4/components/code-block-command.tsx`

Upstream MDX components are mostly shadcn docs primitives:

- Typography.
- `Callout`.
- `CodeTabs`.
- `ComponentPreview`.
- `ComponentSource`.
- `ComponentsListWrapper`.
- `DirectoryList`.
- `Kbd`.
- Tabs and accordions.

### Plate MDX

Files:

- `apps/www/src/components/mdx-components.tsx`
- `apps/www/src/components/api-list.tsx`
- `apps/www/src/components/package-info.tsx`
- `apps/www/src/components/component-installation.tsx`
- `apps/www/src/components/component-preview.tsx`
- `apps/www/src/components/component-preview-pro.tsx`
- `apps/www/src/components/component-source.tsx`
- `apps/www/src/components/framework-docs.tsx`
- `apps/www/src/components/release-index.tsx`
- `apps/www/src/registry/blocks/fumadocs/fumadocs-mdx-components.tsx`
- `apps/www/src/registry/blocks/fumadocs/mdx-plate-components.tsx`

Plate MDX adds a real API documentation language:

- `API`
- `APIAttributes`
- `APIItem`
- `APIList`
- `APIListAPI`
- `APIMethods`
- `APIOptions`
- `APIParameters`
- `APIProps`
- `APIReturns`
- `APIState`
- `APISubList`
- `APISubListItem`
- `APITransforms`
- `KeyTable`
- `KeyTableItem`
- `PackageInfo`
- `ComponentInstallation`
- `ComponentPreviewPro`
- `ReleaseIndex`

Usage evidence:

- Root `content/api/**` heavily uses `APIItem`, `APIOptions`, `APIParameters`, `APIReturns`, `APISubListItem`, and `PackageInfo`.
- The scan found thousands of Plate API component tags across MDX. This is not cosmetic.
- `apps/www/src/registry/blocks/fumadocs/fumadocs-mdx-components.tsx` already looks like a bridge for rendering Plate API docs in Fumadocs.

Decision: keep Plate API MDX vocabulary. Rebuild it as a Fumadocs-compatible MDX component layer, starting from `apps/www/src/registry/blocks/fumadocs/*`, not from the old Contentlayer runtime wrapper.

Throw:

- `useMDXComponent` from `next-contentlayer2/hooks`.
- Jotai-only hydration inside MDX unless a current component still needs it.
- Empty placeholder wrappers for registry install if the new target can render them cleanly.

Keep:

- API component names and rendered behavior.
- `PackageInfo` if bundle/source/npm metadata still matters.
- `ComponentInstallation` if component docs remain generated from registry metadata.
- `ComponentPreviewPro` only if Plate Plus examples remain linked from docs.

## Docs Page And Layout

### Upstream docs page

Files:

- `../ui/apps/v4/app/(app)/docs/[[...slug]]/page.tsx`
- `../ui/apps/v4/app/(app)/docs/layout.tsx`
- `../ui/apps/v4/components/docs-sidebar.tsx`
- `../ui/apps/v4/components/docs-toc.tsx`
- `../ui/apps/v4/components/docs-copy-page.tsx`
- `../ui/apps/v4/components/docs-base-switcher.tsx`
- `../ui/apps/v4/components/open-in-v0-cta.tsx`

Upstream page behavior:

- Static docs with `dynamic = "force-static"`, `dynamicParams = false`, `revalidate = false`.
- Metadata requires `title` and `description`.
- Uses `findNeighbour(source.pageTree, page.url)`.
- Uses `DocsCopyPage`.
- Shows `DocsBaseSwitcher` for base/radix component docs.
- Renders TOC from Fumadocs doc data.
- Uses Fumadocs sidebar from `source.pageTree`.

### Plate docs page

Files:

- `apps/www/src/app/(app)/docs/[[...slug]]/page.tsx`
- `apps/www/src/app/(app)/docs/[[...slug]]/doc-content.tsx`
- `apps/www/src/app/(app)/docs/layout.tsx`
- `apps/www/src/components/docs-nav.tsx`
- `apps/www/src/components/docs-toc.tsx`
- `apps/www/src/components/llm-copy-button.tsx`
- `apps/www/src/components/view-options.tsx`
- `apps/www/src/components/open-in-plus.tsx`

Plate page behavior:

- Static docs with `dynamic = 'force-static'`.
- Looks up Fumadocs pages with `source.getPage(params.slug, "en")`.
- Falls back to registry-derived docs for `/docs/components/[name]` and `/docs/examples/[name]`.
- Generates static params from both `source.getPages("en")` and registry items.
- Builds related docs from registry file/dependency data.
- Renders `ComponentInstallation` for component docs.
- Renders `ComponentPreview` for example docs.
- Adds `LLMCopyButton`, `ViewOptions`, `OpenInPlus`, related docs badges, previous/next buttons, and custom TOC.

Decision: keep the registry-derived docs behavior. The first Fumadocs route cutover is already in place, but `doc-content.tsx`, related docs, pager/nav metadata, and LLM UI still need to be judged against upstream's Fumadocs page model instead of carried forward by inertia.

Keep:

- Registry fallback pages for Plate UI components and examples.
- Related docs inference from registry dependencies and `file.meta.docs`.
- Plate-specific LLM context only if upstream's copy-page and `.md` route model leaves a real gap.
- `OpenInPlus` if Plate Plus is still part of docs conversion.

Throw or rewrite:

- Custom `DocsNav` accordion/filter as the primary nav. Use upstream `DocsSidebar`/Fumadocs page tree first.
- Manual active-section syncing and delayed scroll hacks in `DocsNav`.
- `docsMap` fallback as a substitute for source metadata.

## Registry And Generated Docs

### Upstream registry model

Files:

- `../ui/apps/v4/scripts/build-registry.mts`
- `../ui/apps/v4/registry/bases/base/registry.ts`
- `../ui/apps/v4/registry/bases/radix/registry.ts`
- `../ui/apps/v4/registry/new-york-v4/**`
- `../ui/apps/v4/registry/styles/style-*.css`
- `../ui/apps/v4/public/r/**`
- `../ui/apps/v4/registry/config.test.ts`

Upstream v4 registry pipeline:

- Authored source lives in `registry/bases/base` and `registry/bases/radix`.
- Style tokens live in `registry/styles/style-*.css`.
- Demos live in examples.
- Build creates base/style combinations.
- Build emits runtime indexes, public registry JSON, styled UI copies, RTL UI for supported combinations, and generated output under `public/r`.
- Registry schema comes from `shadcn/schema`.
- Build uses upstream `shadcn/utils` transforms.

This is the contract Plate should follow at the installer boundary.

### Plate registry model

Files:

- `apps/www/src/registry/registry.ts`
- `apps/www/src/registry/registry-ui.ts`
- `apps/www/src/registry/registry-components.ts`
- `apps/www/src/registry/registry-examples.ts`
- `apps/www/src/registry/registry-blocks.ts`
- `apps/www/src/registry/registry-hooks.ts`
- `apps/www/src/registry/registry-lib.ts`
- `apps/www/src/registry/registry-kits.ts`
- `apps/www/src/registry/registry-pro.ts`
- `apps/www/scripts/build-registry.mts`
- `apps/www/scripts/build-docs-registry.mts`
- `apps/www/src/lib/rehype-utils.ts`
- `apps/www/src/lib/registry-cache.ts`
- `apps/www/public/r/**`
- `apps/www/public/rd/**`

Plate registry pipeline:

- Builds a `plate` registry with homepage `https://platejs.org`.
- Resolves non-`@` registry dependencies to `/r` or `/rd` URLs.
- Generates `src/__registry__/index.tsx` with `React.lazy` component previews.
- Writes `public/r/registry.json` or `public/rd/registry.json`.
- Runs `shadcn build` against generated registry JSON.
- Optionally merges docs registry items into the main registry.
- Builds `registry-docs.json` from root `content/**`.
- Ships a `fumadocs` registry item containing `mdx-components.tsx`, `mdx-plate-components.tsx`, and docs dependencies.

Decision: keep Plate registry content and delivery, but modernize it around upstream shadcn v4 schema/resolver/base behavior. Do not preserve old shadcn `2.6.3` assumptions.

Keep:

- Plate registry source files in `apps/www/src/registry/**`.
- Plate install namespace/content.
- Docs registry publishing concept from `build-docs-registry.mts`.
- `fumadocs` registry item idea.
- `registry-shadcn.json` lookup only if Plate registry still references upstream `@shadcn/*`.

Rewrite:

- `build-registry.mts` around upstream shadcn v4 conventions.
- URL dependency resolution to prefer namespace semantics where possible.
- Server-side registry file reading so client-only registry items do not poison server builds.

Throw:

- Any Plate-only registry schema idea that upstream shadcn does not understand.
- Raw URL sprawl when upstream namespace dependencies work.
- One-off generated index assumptions that force client components into server routes.

## Component Preview And Source Display

### Upstream

Files:

- `../ui/apps/v4/components/block-viewer.tsx`
- `../ui/apps/v4/components/component-preview.tsx`
- `../ui/apps/v4/components/component-source.tsx`
- `../ui/apps/v4/app/(view)/view/[style]/[name]/page.tsx`

Upstream `BlockViewer`:

- Uses style-specific `/view/[style]/[name]`.
- Has preview/code tabs.
- Has responsive preview sizes.
- Has mobile image fallback from `/r/styles/new-york-v4/...`.
- Supports Open in v0 and block copy tracking.
- Reads highlighted code already on `item.files`.

### Plate

Files:

- `apps/www/src/components/block-viewer.tsx`
- `apps/www/src/components/component-preview.tsx`
- `apps/www/src/components/component-installation.tsx`
- `apps/www/src/components/component-source.tsx`
- `apps/www/src/app/api/registry/[name]/route.ts`
- `apps/www/src/app/(blocks)/blocks/[name]/page.tsx`

Plate `BlockViewer`:

- Uses `/blocks/[name]` or `item.meta.src` instead of upstream `/view`.
- Lazy-fetches highlighted code from `/api/registry/[name]` when switching to code view.
- Handles Pro examples through `item.meta.isPro`.
- Copies `npx shadcn@latest add ${siteConfig.registryUrl}${item.name}`.
- Shows dependency install commands inside manual install flow.

Decision: start from upstream preview/view architecture, then reapply Plate registry install behavior and Plate editor demo rendering. The Plate preview code has product value, but upstream's current view/style architecture is cleaner.

Keep:

- Plate dependency-aware manual install display.
- Plate registry URL install command.
- Plate Pro handling if still used.
- Plate examples/editor preview routing, if the routes stay.

Adopt:

- Upstream `/view` concept if style previews matter.
- Upstream mobile image fallback if Plate screenshots are generated.
- Upstream source display polish and event tracking if analytics stays.

Throw:

- The extra `/api/registry/[name]` lazy code route unless the new Fumadocs page cannot get highlighted files statically.
- Stale commented image fallback blocks in Plate `block-viewer.tsx`.

## Search And Navigation

### Upstream search

Files:

- `../ui/apps/v4/app/api/search/route.ts`
- `../ui/apps/v4/components/command-menu.tsx`
- `../ui/apps/v4/lib/page-tree.ts`
- `../ui/apps/v4/lib/source.ts`

Upstream search:

- Uses `createFromSource(source)` from `fumadocs-core/search/server`.
- Uses `useDocsSearch({ type: "fetch" })`.
- Searches Fumadocs pages.
- Also includes nav pages, colors, blocks, component commands, package-manager command copy, search analytics, and delayed groups.

### Plate search

Files:

- `apps/www/src/components/command-menu.tsx`
- `apps/www/src/config/docs.ts`
- `apps/www/src/components/docs-nav.tsx`

Plate search:

- Client-only `cmdk` over `docsConfig.mainNav` and `docsConfig.sidebarNav`.
- Searches item titles, labels, keywords, and manually listed headings.
- Uses invisible Unicode suffixes to work around duplicate command values.
- Pushes routes directly from nav config.
- Keeps API group last.

Decision: use upstream Fumadocs search. Plate's current command menu is a hack and should not survive as-is.

Keep:

- Plate-specific searchable groups: API, plugins, examples, editors, Plate Plus, MCP.
- Locale-aware route display if CN survives.

Throw:

- Invisible suffix uniqueness workaround.
- Client-only nav config search as the main docs search.
- Manual heading anchors derived from nav config.

## Themes, Styling, And Customizer

### Upstream styling

Files:

- `../ui/apps/v4/app/globals.css`
- `../ui/apps/v4/app/legacy-themes.css`
- `../ui/apps/v4/components/active-theme.tsx`
- `../ui/apps/v4/components/theme-customizer.tsx`
- `../ui/apps/v4/lib/themes.ts`
- `../ui/apps/v4/registry/styles/style-*.css`
- `../ui/apps/v4/registry/themes.ts`

Upstream has a current shadcn v4 theme/style system:

- Imports `shadcn/tailwind.css`.
- Imports generated style CSS files like `style-vega`, `style-nova`, `style-lyra`, `style-maia`, `style-mira`, `style-luma`, `style-sera`.
- Uses `ActiveThemeProvider` to apply `theme-${activeTheme}` and `theme-scaled`.
- Has create/customizer flow tied to presets, base colors, radius, fonts, icon libraries, and v0/project generation.

### Plate styling

Files:

- `apps/www/src/app/globals.css`
- `apps/www/src/app/themes.css`
- `apps/www/src/lib/themes.ts`
- `apps/www/src/components/theme-customizer.tsx`
- `apps/www/src/components/customizer-drawer.tsx`
- `apps/www/src/components/themes-button.tsx`
- `apps/www/src/components/themes-selector.tsx`
- `apps/www/src/components/themes-styles.tsx`
- `apps/www/src/hooks/use-themes-config.ts`

Plate custom themes include named palettes like Ayu, Catppuccin, Dune, Everforest, GitHub, Horizon, Linear, One Dark Pro, plus many custom CSS theme/radius/font variants.

Plate CSS has explicit cleanup comments:

- `Custom scrollbar styling (remove after sync).`
- `Custom prose styling (remove after sync).`
- `MDX (remove after sync).`

Decision: throw Plate themes/customizer. Keep only Plate brand tokens that are actually used outside theme browsing.

Throw:

- `apps/www/src/lib/themes.ts`.
- `apps/www/src/app/themes.css`.
- `customizer-drawer.tsx`.
- Plate theme selector/customizer components.
- Old prose/scrollbar/code CSS marked for sync removal.

Adopt:

- Upstream shadcn v4 style/theme system.
- Upstream `ActiveThemeProvider`.
- Upstream create/customizer flow only if Plate wants a real install preset builder.

## Providers And Runtime Boundaries

### Upstream

Files:

- `../ui/apps/v4/app/layout.tsx`
- `../ui/apps/v4/components/theme-provider.tsx`
- `../ui/apps/v4/components/active-theme.tsx`

Upstream providers:

- `NuqsAdapter`.
- `LayoutProvider`.
- `ActiveThemeProvider`.
- `ThemeProvider`.
- Base and radix tooltip providers.
- `Toaster`.
- `Analytics`.
- `TailwindIndicator`.
- LocalStorage script for theme/layout classes.
- Theme shortcut toggles dark/light with `d`.

### Plate

Files:

- `apps/www/src/app/layout.tsx`
- `apps/www/src/components/context/providers.tsx`
- `apps/www/src/components/context/theme-provider.tsx`

Plate providers:

- Jotai provider.
- Next themes provider, defaulting to light.
- Cookie sync for theme.
- React DnD provider with `HTML5Backend`.
- `Agentation` in dev.
- GA.
- `Toaster`.
- `TailwindIndicator`.

Decision: start from upstream providers, then add Plate runtime providers only where current features require them.

Keep:

- `DndProvider` if editor demos are still rendered in the docs app.
- Jotai if any retained MDX/editor component uses atoms.
- Theme cookie sync only if server behavior depends on it.
- `Agentation` only if this repo still wants local visual feedback in dev.

Adopt:

- Upstream `ActiveThemeProvider`.
- Upstream tooltip provider stack.
- Upstream theme shortcut unless it conflicts with editor keyboard shortcuts.

Known trap:

- `docs/solutions/developer-experience/2026-03-28-next-prerendered-client-editors-need-dnd-hooks-to-noop-on-the-server.md` says app-level DnD providers are not enough. Browser-only DnD hooks must no-op during prerender. Do not "fix" docs restart DnD crashes by slapping `ssr: false` everywhere.

## Next Config, SSR, And Build Behavior

### Upstream

File: `../ui/apps/v4/next.config.mjs`

Upstream config:

- `createMDX({})` wrapper.
- `typescript.ignoreBuildErrors = true`.
- Output tracing includes `./registry/**/*` and `./styles/**/*`.
- Turbopack root is repo root.
- Redirects shadcn docs legacy paths.
- Rewrites `/docs/:path*.md` to `/llm/:path*`.
- Rewrites `/init.md` to `/init/md`.
- Remote image hosts include GitHub, Unsplash, Vercel avatar.

### Plate

File: `apps/www/next.config.ts`

Plate config:

- Builds workspace source aliases dynamically in dev.
- `externalDir` only in dev.
- `reactCompiler: !isDev`.
- `staticPageGenerationTimeout: 1200`.
- `transpilePackages: ['ts-morph']`.
- Output tracing includes registry, public registry, and Tailwind assets for docs/blocks routes.
- Redirects `/r/:path` and `/rd/:path` to JSON.
- Redirects old `?locale=cn` URLs to `/cn`.

Decision: merge the configs by intent, not by text.

Keep:

- Dynamic workspace source aliases for Plate packages.
- Registry/public output tracing for docs pages that render registry files.
- `/r` and `/rd` JSON redirects if public registry URLs still rely on them.
- Static generation timeout if Plate docs still generate a lot of registry/API pages.

Adopt:

- Fumadocs `createMDX`.
- Upstream `/docs/*.md` LLM rewrite.
- Upstream init/create rewrites if create/init routes are kept.

Throw:

- Contentlayer prebuild assumptions.
- Old commented webpack fallbacks in `apps/www/next.config.ts`.

Known trap:

- `docs/solutions/developer-experience/2026-03-12-typescript-workspace-subpath-aliases-in-apps-www.md` explains why workspace source aliases matter. Do not simplify them into broad wildcard aliases and call it done. That caused mixed source/dist TypeScript nonsense.

## TypeScript And Tests

Files:

- `apps/www/tsconfig.json`
- `apps/www/tsconfig.package-integration.json`
- `../ui/apps/v4/tsconfig.json`
- `apps/www/src/__tests__/package-integration/**`
- `apps/www/src/registry/**/*.spec.ts*`
- `../ui/apps/v4/app/(create)/**.test.ts`
- `../ui/apps/v4/registry/config.test.ts`

Upstream TS config is simple and app-local:

- `@/*` maps to app root.
- Includes app files, scripts, `next.config.mjs`.
- Has a `react` types path.

Plate TS config is a docs app plus package harness:

- `@/*` maps to `./src/*`.
- Exact aliases for many `@platejs/*/react` and package root imports.
- Broad `@platejs/*` and `@udecode/*` source aliases.
- `registry` maps to `./public/r/registry.json`.
- `registry-shadcn` maps to `./registry-shadcn.json`.
- Split `tsconfig.package-integration.json` checks package integration tests against built package contracts.

Decision: keep Plate split typecheck. It exists because the docs app doubles as package integration proof.

Keep:

- `tsconfig.package-integration.json`.
- Package integration tests if apps/www remains the test harness.
- Registry component specs.
- Exact package source aliases.

Adopt:

- Upstream simpler app tsconfig where possible for docs-only code.

Throw:

- Any alias that only exists for Contentlayer after Contentlayer is gone.

## CN Docs And Localization

Files:

- `content/**/*.cn.mdx`
- `apps/www/src/app/cn/**`
- `apps/www/src/hooks/useLocale.ts`
- `apps/www/src/lib/withLocale.ts`
- `apps/www/src/components/languages-dropdown-menu.tsx`
- `apps/www/src/components/docs-nav.tsx`

Plate has 124 CN MDX files and a duplicate `/cn` route tree. Upstream has no i18n in this app.

Decision: keep CN. Port it using Fumadocs i18n patterns. Do not preserve the current duplicate route logic unless forced.

Keep:

- Existing translated content.
- Language dropdown.
- Locale-aware nav labels.

Rewrite:

- `/cn/docs/[[...slug]]` duplicated page logic.
- `hrefWithLocale` and manual route-prefix behavior around the new Fumadocs source tree.

Throw:

- The old duplicate `/cn` route plumbing once Fumadocs i18n covers the same behavior.

## Homepage, Header, Product Links

### Upstream

Files:

- `../ui/apps/v4/app/(app)/(root)/page.tsx`
- `../ui/apps/v4/components/site-header.tsx`
- `../ui/apps/v4/lib/config.ts`
- `../ui/apps/v4/components/main-nav.tsx`
- `../ui/apps/v4/components/mobile-nav.tsx`

Upstream header/nav:

- Uses Fumadocs `source.pageTree`.
- Has Docs, Components, Blocks, Charts, Directory, Create.
- Includes `GitHubLink`, `SiteConfig`, `ModeSwitcher`, create/v0 controls, New button.

### Plate

Files:

- `apps/www/src/app/(app)/page.tsx`
- `apps/www/src/components/site-header.tsx`
- `apps/www/src/config/site.ts`
- `apps/www/src/components/logo.tsx`
- `apps/www/src/components/main-nav.tsx`
- `apps/www/src/components/mobile-nav.tsx`
- `apps/www/src/components/mcp-dialog.tsx`
- `apps/www/src/components/languages-dropdown-menu.tsx`

Plate header/nav:

- Plate brand.
- Docs.
- Editors.
- GitHub.
- Discord.
- Language dropdown.
- Mode switcher.
- Setup MCP dialog.
- Plate Plus links.

Decision: keep Plate branding and product links, but use upstream Fumadocs-aware nav infrastructure where possible.

Keep:

- Plate logo/name/site config.
- Docs and Editors nav.
- GitHub/Discord links.
- MCP dialog if it is still a real onboarding path.
- Plate Plus link if it remains commercial surface.

Throw:

- Plate theme button/customizer on the homepage.
- Potion/pro iframe homepage pieces unless they are still part of current product direction.

## LLM Routes And Copy Actions

Upstream files:

- `../ui/apps/v4/app/(app)/llm/[[...slug]]/route.ts`
- `../ui/apps/v4/components/docs-copy-page.tsx`
- `../ui/apps/v4/lib/llm.ts`

Plate files:

- `apps/www/src/components/llm-copy-button.tsx`
- `apps/www/src/components/view-options.tsx`
- `apps/www/src/lib/llm-context.ts`

Upstream serves `.md` routes through Fumadocs and `page.data.getText("raw")`. Plate exposes copy/view actions on docs pages, but the restart should not preserve that duplicate UI by default.

Decision: adopt upstream `.md` route and copy-page model. Reapply Plate-specific LLM context only if the upstream route cannot cover a real Plate agent/docs workflow.

Keep:

- Plate LLM context helpers only if they add context upstream cannot derive from Fumadocs raw text.

Adopt:

- Upstream `/docs/:path*.md` rewrite.
- Upstream LLM route structure.

## Generated/Public Artifacts

Plate files:

- `apps/www/public/r/**`
- `apps/www/public/rd/**`
- `apps/www/registry-shadcn.json`
- `apps/www/src/__registry__/index.tsx`

Upstream files:

- `../ui/apps/v4/public/r/**`
- `../ui/apps/v4/registry/__index__.tsx`
- `../ui/apps/v4/registry/bases/__index__.tsx`
- `../ui/apps/v4/examples/__index__.tsx`

Decision: generated artifacts should come from the new source pipeline. Do not hand-edit them. For the restart, preserve source and scripts, not old generated output.

Keep source:

- `apps/www/src/registry/**`.
- `apps/www/scripts/build-registry.mts` only as input to rewrite.
- `apps/www/scripts/build-docs-registry.mts` only as input to rewrite.

Regenerate:

- `public/r/**`.
- `public/rd/**`.
- `src/__registry__/index.tsx`.

## Known Local Traps From Prior Solution Notes

Read these before phase two implementation:

- `docs/solutions/developer-experience/2026-03-12-typescript-workspace-subpath-aliases-in-apps-www.md`
  - Exact package source aliases and split typecheck prevent source/dist type conflicts.
- `docs/solutions/developer-experience/2026-04-06-next-turbopack-needs-client-boundaries-at-react-package-entrypoints.md`
  - Server routes that import generated registry indexes can accidentally pull client-only registry items into the server graph.
- `docs/solutions/developer-experience/2026-04-06-registry-helper-refactors-must-update-template-registry-dependencies.md`
  - Generated consumers depend on registry metadata, not whatever files exist in `apps/www/src`.
- `docs/solutions/developer-experience/2026-04-27-mdx-generated-markers-must-use-jsx-comments.md`
  - Generated MDX markers must use JSX comments, not HTML comments.
- `docs/solutions/developer-experience/2026-03-28-next-prerendered-client-editors-need-dnd-hooks-to-noop-on-the-server.md`
  - DnD failures during prerender are package runtime issues, not automatically missing provider bugs.

## Keep, Throw, Adopt Matrix

| Item | Files | Verdict | Phase Two Action |
| --- | --- | --- | --- |
| Fumadocs engine | `../ui/apps/v4/source.config.ts`, `../ui/apps/v4/lib/source.ts` | Adopted | Already wired in `apps/www/source.config.ts` and `apps/www/src/lib/source.ts`; preserve it. |
| Contentlayer engine | former `apps/www/contentlayer.config.js`, `next-contentlayer2` usage | Thrown | Already removed; do not recreate compatibility layers around it. |
| Plate docs content | `content/**` | Keep | Currently loaded by Fumadocs from root; still decide whether to move into `content/docs/**` or keep root with explicit metadata. |
| Fumadocs meta | `../ui/apps/v4/content/docs/**/meta.json` | Adopt | Still missing in Plate; generate or hand-author `meta.json` and replace manual nav config as page-tree authority. |
| Manual docs nav | `apps/www/src/config/docs*.ts` | Rewrite | Still runtime input for sidebar, pager, command menu, and docs registry export; use as migration data, not final authority. |
| Plate API MDX components | `apps/www/src/components/api-list.tsx`, `apps/www/src/registry/blocks/fumadocs/*` | Keep | Port into Fumadocs MDX layer. |
| Plate MDX Contentlayer wrapper | `apps/www/src/components/mdx-components.tsx` | Rewritten partly | `useMDXComponent` is gone; keep auditing component boundaries against Fumadocs/server rendering. |
| Registry-derived docs pages | `apps/www/src/app/(app)/docs/[[...slug]]/page.tsx` | Kept partly | Fumadocs fallback is wired; next pass should simplify metadata fallbacks and align with upstream static highlighted-source flow. |
| Plate `DocContent` UX | `apps/www/src/app/(app)/docs/[[...slug]]/doc-content.tsx` | Keep selectively | Port related docs, Plus CTA, and any retained copy UX onto upstream page/tree assumptions. |
| Plate `DocsNav` | `apps/www/src/components/docs-nav.tsx` | Keep UX, rewrite code | Keep accordion/grouped sidebar behavior for Plate's large docs tree, but rebuild it on Fumadocs page data and upstream sidebar primitives. |
| Plate command menu | `apps/www/src/components/command-menu.tsx` | Throw/rewrite | Replace with upstream Fumadocs search plus Plate groups. |
| Invisible command suffix hack | `apps/www/src/components/command-menu.tsx` | Throw | Do not port. |
| Upstream search route | `../ui/apps/v4/app/api/search/route.ts` | Adopt | Use Fumadocs search API. |
| Plate registry content | `apps/www/src/registry/**` | Keep | Upgrade to shadcn v4 contract. |
| Plate registry build | `apps/www/scripts/build-registry.mts` | Rewrite | Keep Plate content rules, adopt upstream v4 registry model. |
| Plate docs registry build | `apps/www/scripts/build-docs-registry.mts` | Keep concept | Generate Fumadocs-ready docs registry. |
| Upstream registry v4 pipeline | `../ui/apps/v4/scripts/build-registry.mts` | Adopt patterns | Use schema/resolver/base/style behavior as source of truth. |
| `/api/registry/[name]` | `apps/www/src/app/api/registry/[name]/route.ts` | Maybe throw | Keep only if static docs cannot carry highlighted source. |
| Plate component install UI | `apps/www/src/components/component-installation.tsx` | Keep | Reapply for Plate registry items. |
| Plate previews | `apps/www/src/components/component-preview.tsx`, `block-viewer.tsx` | Keep selectively | Combine with upstream `/view` model. |
| Upstream `/view` route | `../ui/apps/v4/app/(view)/view/[style]/[name]/page.tsx` | Adopt if style previews stay | Prefer over Plate-only block preview route. |
| Plate editor demos | `apps/www/src/registry/examples/**`, `apps/www/src/app/(app)/editors/**` | Keep | These are Plate docs product surface. |
| Plate theme library | `apps/www/src/lib/themes.ts`, `apps/www/src/app/themes.css` | Throw | Use upstream shadcn theme/style system. |
| Plate customizer drawer | `apps/www/src/components/customizer-drawer.tsx`, theme selectors | Throw | Dead weight for restart. |
| Upstream create/customizer | `../ui/apps/v4/app/(app)/create/**` | Adopt if wanted | Use for preset/style generation, not Plate old theme UI. |
| Plate providers | `apps/www/src/components/context/providers.tsx` | Keep selectively | Add DnD/Jotai only for retained editor surfaces. |
| Upstream providers | `../ui/apps/v4/app/layout.tsx`, `components/theme-provider.tsx`, `active-theme.tsx` | Adopt | Use as base shell. |
| Workspace aliases | `apps/www/next.config.ts`, `apps/www/tsconfig.json` | Keep | Required for local package dev/typecheck sanity. |
| Split typecheck | `apps/www/tsconfig.package-integration.json` | Keep | Required if app remains package harness. |
| CN docs | `content/**/*.cn.mdx`, `src/app/cn/**` | Keep | Keep Chinese docs; rewrite routing with Fumadocs/i18n instead of duplicating the old route logic. |
| MCP dialog | `apps/www/src/components/mcp-dialog.tsx` | Keep | Keep MCP install/docs/header flow. |
| Plate Plus links | `OpenInPlus`, `ComponentPreviewPro`, `registry-pro.ts` | Keep | Keep public Plus/Pro docs hooks. |
| Dev routes | `apps/www/src/app/dev/**` | Throw from public docs base | Move to internal/debug app if still useful. |
| Package integration tests | `apps/www/src/__tests__/package-integration/**` | Keep | Do not lose behavioral coverage during app restart. |

## Proposed Final Decision Table

This is the recommended default for confirmation. "Discard upstream" means do not carry that shadcn product feature into Plate's public docs app, even if the implementation is good upstream code.

| Area | Keep From Upstream Shadcn | Discard From Upstream Shadcn | Keep From Custom Plate | Discard From Custom Plate | Suggested Default |
| --- | --- | --- | --- | --- | --- |
| Base app foundation | `apps/v4` app-router structure, Fumadocs-first docs shell, modern shadcn v4 app patterns | Upstream brand/product copy | Plate brand, `siteConfig`, Plate nav labels | Current app shell if it fights Fumadocs | Start from upstream, rebrand to Plate |
| Docs engine | `fumadocs-mdx`, `fumadocs-ui`, `source.config.ts`, `lib/source.ts`, `createMDX` Next wrapper | None | Plate docs content and custom MDX vocabulary | Contentlayer runtime and `next-contentlayer2` | Engine is adopted; keep it hard-cut from Contentlayer |
| Content source | Fumadocs `content/docs/**` layout and `meta.json` navigation model | Upstream shadcn docs content as public Plate docs | Root `content/**` Plate docs, API docs, examples, guides, plugins, install docs | Content path grouping only if it blocks Fumadocs | Add explicit Fumadocs metadata; move content only if root layout blocks page-tree authority |
| Public docs navigation | Fumadocs page tree, upstream `DocsSidebar` primitives, mobile nav model | Upstream nav items for Components, Blocks, Charts, Directory, Create unless Plate wants those pages | Plate nav categories: Docs, Editors, API, Plugins, Examples, Installation | Manual nav as runtime authority | Use Fumadocs tree, generate/port Plate nav structure |
| Sidebar accordion/filter | Upstream shadcn sidebar primitives and Fumadocs page-tree data | Upstream always-expanded flat docs sidebar as the final Plate UX | Plate accordion sections, active-section compression, filter input, labels, CN labels | Current `DocsNav` implementation: manual `docsConfig` authority, timeout scroll, direct DOM query, route-prefix hacks | Keep the Plate accordion UX, rewrite it cleanly |
| Search | Fumadocs `app/api/search/route.ts`, `useDocsSearch`, upstream command-menu architecture | Upstream color/block/create/v0 search groups | Plate API, plugins, examples, editors, MCP groups | Invisible Unicode suffix hack and client-only nav search | Adopt upstream search, inject Plate groups |
| Docs page rendering | Static Fumadocs page loading, TOC, neighbours, upstream copy-page pattern | `OpenInV0Cta` | Plate `DocContent` ideas: related docs and Plus CTA | Metadata fallbacks that duplicate Fumadocs, Plate extra LLM copy/view UI | Continue rewriting Plate UX around Fumadocs page data |
| API MDX docs | Fumadocs MDX compile/runtime path | None | `API*`, `APISubList*`, `KeyTable`, `PackageInfo`, current API docs content | Old `useMDXComponent` wrapper | Keep strongly |
| Fumadocs API bridge | Upstream default MDX components and Fumadocs UI primitives | None | `src/registry/blocks/fumadocs/fumadocs-mdx-components.tsx`, `mdx-plate-components.tsx` | Placeholder behavior that hides needed docs UI | Use this as the port starting point |
| Component docs generated from registry | Upstream component-source/preview patterns | Upstream shadcn component docs content | Plate `ComponentInstallation`, registry-derived `/docs/components/[name]` | Contentlayer fallback shape | Keep concept, rewrite implementation |
| Example docs generated from registry | Upstream preview/source UI patterns | Generic shadcn example docs content | Plate registry examples and `/docs/examples/[name]` pages | Old duplicate preview paths if replaced by upstream `/view` | Keep |
| Registry contract | shadcn v4 schema, namespace behavior, resolver behavior, local-file install semantics | Upstream registry content that is unrelated to Plate | Plate registry item content under `src/registry/**`, `@plate` namespace | Plate-only schema ideas or installer workarounds | Upstream contract, Plate content |
| Registry build | Upstream v4 build design, style/base transforms, schema validation, generated output discipline | Upstream styles/components that Plate does not ship | Plate docs-registry generation and local `public/r`/`public/rd` delivery needs | Old shadcn `2.6.3` assumptions | Rewrite Plate build from upstream v4 patterns |
| Generated registry output | Upstream rule: generated output comes from source pipeline | Hand-copied upstream public output | Plate `public/r`, `public/rd`, `src/__registry__/index.tsx` as regenerated artifacts | Manual edits to generated output | Regenerate only |
| Template/local install sync | Upstream local-file install semantics | Any upstream template workflow not used by Plate | Plate template sync tooling and `@plate` install entrypoint | Generated-template hand edits | Keep Plate sync, align with upstream installer |
| Source code preview | Upstream highlighted code/file tree design | v0-specific copy/open actions | Plate dependency-aware manual install and registry URL copy command | Lazy registry API if static files can replace it | Keep install/source UX, drop v0 |
| `/api/registry/[name]` | None unless needed | None | Maybe keep only for lazy highlighted files | Prefer static highlighted files in Fumadocs | Default discard after replacement |
| Blocks route | Upstream `/view/[style]/[name]` renderer pattern | Upstream block gallery categories as public Plate pages | Plate editor block demo routes | Plate duplicate route shape if upstream `/view` can cover it | Keep renderer, not gallery |
| Charts pages | Maybe chart component implementation if registry needs it | `/charts/**` public product pages | None obvious | None | Discard from Plate public docs |
| Colors pages | Maybe color utilities/tokens if style system needs them | `/colors` public product page | None obvious | Plate old color/theme pages | Discard page |
| Create/customizer app | Maybe low-level preset/style code if registry build needs it | `/create` public page, create app UX, project form, share/history/random UI | None from Plate old customizer | Plate theme/customizer drawer | Discard for now |
| v0 | None | `OpenInV0Cta`, `V0Button`, `app/(create)/init/v0`, v0 search/copy/project hooks | None | Plate commented v0 remnants | Discard all v0 |
| Init route | Upstream `/init` and `/init.md` pattern for shadcn-compatible bootstrap | v0 init route | Plate registry install URLs and `@plate` bootstrap needs | Any custom installer semantics beyond shadcn-compatible registry bootstrap | Keep non-v0 Plate init/bootstrap if it directly serves `@plate`; no create/v0 side quest |
| Directory/registry docs | Upstream registry contract docs as implementation reference | Public shadcn directory pages | Plate installation/local-docs/MCP docs | Old docs that explain obsolete Plate registry behavior | Rewrite as Plate registry docs |
| Theme system | Upstream shadcn v4 CSS tokens, style CSS, `ActiveThemeProvider` | Upstream public theme/create UI if not needed | Minimal Plate brand tokens | `themes.css`, `src/lib/themes.ts`, custom theme selector/drawer | Keep upstream system, discard Plate themes |
| CSS/prose/code styles | Upstream current globals and code styling | Any shadcn brand-only styles | Plate-specific prose/code tweaks only if API docs require them | CSS blocks marked "remove after sync" | Start upstream, reapply minimal Plate fixes |
| Header | Upstream Fumadocs-aware header structure, mobile nav behavior | Create/New/v0 controls, shadcn nav labels | Plate logo, GitHub, Discord, Docs, Editors, language switcher, MCP entry | Old header comments, customizer buttons, v0/create buttons | Keep Plate brand on upstream structure |
| Homepage | Upstream app structure patterns if useful | Upstream shadcn marketing content | Plate homepage direction: centered product/editor positioning | Theme customizer, theme gallery, random Potion/pro iframe clutter | Keep a Plate home page, centered and no themes |
| Public assets and manifest | Upstream asset layout if useful | shadcn favicons/brand images | Plate favicon, manifest, `_og.png`, Plate metadata assets | Stale generated registry screenshots/assets only if regenerated | Keep Plate assets, regenerate generated assets |
| Redirects and rewrites | Upstream `.md` LLM rewrite, non-v0 init rewrite if kept | shadcn legacy redirects unrelated to Plate, v0 rewrites | Plate `/r` and `/rd` JSON redirects, old `?locale=cn` redirects | Redirects for discarded theme/create/v0 pages | Keep Plate registry/CN redirects and upstream LLM rewrite |
| Providers | Upstream theme provider, tooltip providers, toaster, layout providers | v0/create-only providers | Plate `DndProvider`, Jotai only where retained components need them, Agentation dev only if wanted | Providers required only by discarded theme/customizer code | Start upstream, add minimal Plate providers |
| DnD/editor runtime | None directly | None | DnD provider and package-level prerender no-op expectations for editor demos | Route-level SSR hacks as default fix | Keep if editor demos stay |
| Package workspace aliases | None from upstream simple app | Upstream simple-only tsconfig as complete answer | Plate `next.config.ts` source aliases, exact `tsconfig` paths, split integration typecheck | Contentlayer aliases after removal | Keep Plate alias/typecheck model |
| Package integration tests | None comparable upstream | None | `apps/www/src/__tests__/package-integration/**`, registry specs | Tests only tied to discarded Contentlayer UI | Keep |
| Upstream create/init tests | Tests for kept non-v0 init behavior | v0 tests | Add Plate registry/install tests around kept behavior | None | Keep only matching retained routes |
| CN docs | None | None | Existing `*.cn.mdx`, language dropdown, locale labels | Duplicate `/cn` route implementation if Fumadocs i18n replaces it | Keep CN |
| Plate Plus / Pro | None | None | `ComponentPreviewPro`, `OpenInPlus`, `registry-pro.ts`, public Plus links | Pro iframe/homepage clutter if not strategic | Keep Plus/Pro hooks |
| MCP docs/dialog | Upstream MCP docs can inform structure | Upstream shadcn-specific MCP copy | Plate `mcp-dialog`, installation MCP docs, header entry | None unless duplicated by better docs UI | Keep MCP |
| LLM docs | Upstream `/docs/*.md` rewrite, LLM route, and shadcn copy-page UI | None | Plate-specific context only if upstream route cannot cover it | Plate `LLMCopyButton`, `ViewOptions`, duplicate LLM UI | Use shadcn LLM/copy model |
| Analytics | None beyond basic app analytics shape | v0/create/per-click event tracking | Plate GA | Per-click event tracking and analytics around discarded surfaces | Keep GA only |
| OG/RSS | Upstream OG/RSS structure | shadcn-specific content | Plate OG branding and metadata | Stale duplicate font assets if not needed | Keep structure, rebrand |
| Dev/debug routes | None | None | Move useful debug tools elsewhere if still needed | `apps/www/src/app/dev/**` in public docs app | Discard from restart |
| Slate-to-HTML special page | None | None | `docs/examples/slate-to-html`, `blocks/slate-to-html`, Tailwind trace include | Generic preview path for this page, because RSC cannot be previewed normally | Keep special route/page |
| Release docs | Fumadocs content patterns | shadcn changelog content | Plate `content/releases/index.mdx`, `ReleaseIndex` if release docs stay | Contentlayer-only release generation assumptions | Keep content, port renderer |
| Dependencies | Current upstream Fumadocs/shadcn v4 deps | v0-only deps if any | Plate editor/runtime deps required by retained demos | `contentlayer2`, `next-contentlayer2`, old theme-only deps | Keep upgrading and pruning |
| Verification model | Upstream app tests for retained upstream routes | Tests for discarded routes | Plate package integration and registry validation | Browser checks for discarded theme/create/v0 paths | Verify retained surfaces only |

## Recommended Phase Two Order

1. Treat the Fumadocs source cutover as complete; do not redo the Contentlayer removal.
2. Create Fumadocs metadata from `docsConfig` and current content grouping, then move sidebar/pager toward `source.pageTree`.
3. Replace command-menu search with upstream Fumadocs search plus Plate groups.
4. Start the app-shell restart from `../ui/apps/v4`, bringing over Plate `siteConfig`, logo, product nav labels, and minimal providers.
5. Confirm whether root `content/**` remains acceptable. Move Plate content into `content/docs/**` only if that is needed for clean Fumadocs metadata and page-tree authority.
6. Continue porting Plate API MDX components using `apps/www/src/registry/blocks/fumadocs/*` as the starting point.
7. Keep and simplify registry-derived docs pages for components/examples around Fumadocs page data.
8. Port Plate registry content and rewrite build scripts against upstream shadcn v4 registry behavior.
9. Reapply editor demos and preview/source display.
10. Reapply confirmed product surfaces: CN docs, Plate Plus/Pro hooks, MCP docs/dialog, GA-only analytics, centered Plate homepage, Slate-to-HTML special route, and non-v0 `@plate` init/bootstrap if useful.
11. Preserve package integration tests and workspace alias/typecheck model.
12. Regenerate public registry output.
13. Run build/typecheck/lint/browser verification.

## Confirmed Product Decisions

- CN docs: keep.
- Plate Plus / Pro: keep public docs hooks such as `ComponentPreviewPro`, `OpenInPlus`, and `registry-pro.ts`.
- MCP: keep install/docs/dialog flow.
- LLM UI: use upstream shadcn `.md` route and copy-page model; discard Plate's extra `LLMCopyButton` / `ViewOptions` unless a later gap appears.
- Analytics: keep GA only; no per-click event tracking.
- Homepage: keep a Plate homepage, aligned with the current Plate direction, centered, no theme/customizer surface.
- Slate-to-HTML: keep the special route/page because it cannot be previewed through the normal registry preview path.
- Init route: keep a non-v0 Plate init/bootstrap route only if it directly serves `@plate` registry install; skip create/v0/product-generator behavior.

## Hard Calls

- Custom Plate themes: throw.
- Contentlayer: throw.
- Manual nav config as runtime source: throw.
- Plate API docs components: keep.
- Plate registry content: keep.
- Plate registry build scripts: rewrite.
- Plate editor demos: keep.
- CN docs: keep.
- Plate Plus / Pro: keep public docs hooks.
- MCP: keep.
- LLM UI: use shadcn model, discard Plate's extra copy/view UI.
- Analytics: keep GA only.
- Homepage: keep Plate homepage, centered, no themes.
- Slate-to-HTML: keep special route/page.
- Init route: keep non-v0 `@plate` bootstrap only if directly useful.
- `/api/registry/[name]`: probably throw after static highlighted files work in Fumadocs.
- `docsConfig` files: use as migration data, not the new architecture.

## Verification

Completed evidence pass:

- Compared package scripts/dependencies for both apps.
- Compared app route trees.
- Compared content file layout and counts.
- Compared MDX engines and component vocabulary.
- Compared docs page/layout behavior.
- Compared registry source/build/public output models.
- Compared search/nav implementations.
- Compared theme/customizer/provider surfaces.
- Compared TypeScript configs and test inventories.
- Checked prior `docs/solutions` traps relevant to `apps/www`.

2026-05-24 refresh evidence:

- Confirmed `../ui/apps/v4` exists and `../shadcn/apps/v4` does not in this workspace.
- Confirmed upstream still has 206 app files, 227 docs content/meta files, and 1127 registry files.
- Confirmed Plate currently has 51 app files, 251 MDX content files, 124 Chinese MDX files, 0 committed `meta.json` files, and 381 registry source files.
- Confirmed `apps/www/package.json` uses `build:source`, `postinstall: fumadocs-mdx`, and `typecheck` runs `scripts/check-docs-source-parity.mts`.
- Confirmed `apps/www/source.config.ts`, `apps/www/src/lib/source.ts`, and `apps/www/next.config.ts` are the active Fumadocs source path.
- Confirmed `apps/www/src/app/(app)/docs/[[...slug]]/page.tsx` uses `source.getPage`, `source.getPages`, `doc.data.body`, and `doc.data.getText("raw")`.
- Confirmed `docs-nav`, `pager`, `site-header`, and `command-menu` still import `docsConfig`.

No runtime verification was needed because this refresh only updated the research artifact. No source app behavior was changed.
