# Sync Shadcn Review: Docs Structure And MDX

Review command: `sync-shadcn review`

## Verdict

- `stale-upstream`: yes. `origin/main` is ahead of `lastPlannedCommit` by 2 `apps/v4` commits and 40 file-status rows.
- `stale-local`: no hard local break found in the inspected owner paths.
- `stale-status`: no contradiction found. Existing partial syncs remain scoped; `lastSyncedCommit` must stay unchanged.
- Missed tracking: yes. The dashboard and prior scoped plans track visible pages well, but they under-track stable docs-engine surfaces that did not change in the current upstream range: MDX component mapping, codeblock primitives, copy behavior, Fumadocs source/search wiring, and docs page shell ownership.

No `apps/www` source patch was made.

## Range

| Ref | Commit | Evidence |
| --- | --- | --- |
| Base / last synced | `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2` | `docs/sync/shadcn/status.json` |
| Last planned | `efdec3ca4523e5edd8a714f633002a7addc203a1` | `docs/sync/shadcn/status.json` |
| Current upstream target | `67cef8fcb94a4223a144e8ed6cbd26169943db7a` | `../shadcn origin/main` |
| Selected plan | `docs/sync/shadcn/runs/2026-05-29-4a4dc8e-to-efdec3c-editors-blocks-style/plan.md` | status `lastPlan` |

Artifacts:

- `refs.json`
- `upstream-new-commits.txt`
- `upstream-new-name-status.tsv`
- `upstream-full-name-status.tsv`
- `upstream-full-numstat.tsv`
- `focus-file-map.tsv`

## Upstream Since Last Plan

| Commit | Summary | Review |
| --- | --- | --- |
| `67cef8f` | home mobile demo fallback images | Not docs/MDX. Keeps target stale but does not change this review's recommended docs-engine rows. |
| `4ff43ba` | `color-mix` secondary button hover across generated styles | Style/theme surface. Already excluded/deferred by Plate policy. |

`PLANNED..TARGET` count: 2 commits, 40 file-status rows.

`BASE..TARGET` recomputed inventory: 778 file-status rows. The selected scoped plan artifact had 751 rows through `efdec3c`; the 27 added rows are the new homepage images and generated style button changes above.

## Focus Findings

| Surface | Upstream Evidence | Plate Evidence | Decision | Recommended Action |
| --- | --- | --- | --- | --- |
| Docs page shell | `apps/v4/app/(app)/docs/[[...slug]]/page.tsx` owns docs rendering in one route file with Fumadocs neighbours, copy page, TOC, and v0 CTA. | `apps/www/src/app/(app)/docs/[[...slug]]/doc-page.tsx` splits route rendering into a shared helper with EN/CN fallback, registry-generated docs, component preview/install, Plate LLM markdown, custom pager, and no v0. | `plate-fork` with visual `smart-merge` only. | Keep Plate shell. Track future shadcn page-shell changes as visual/layout rows, not as a route rewrite. |
| Fumadocs source/search wiring | `apps/v4/lib/source.ts` is a simple loader with `/docs`; `app/api/search/route.ts` is default `createFromSource(source)`. | `apps/www/src/lib/source.ts` adds `en/cn` i18n; `app/api/search/route.ts` adds CN locale mapping, grouped results, and a limit. | `plate-fork`. | Keep Plate search/source config. It exists for CN docs and command/search perf, not upstream parity. |
| `source.config.ts` MDX pipeline | Upstream removes the default plugin and pushes `rehypePrettyCode` with `transformers` from `lib/highlight-code.ts`. | Plate has `rehypeSlug`, `rehypeComponent`, custom event/raw/source metadata, `rehypePrettyCode`, code-title icon labels, `rehypeNpmCommand`, autolink headings, GFM, and code import. | `plate-fork`, with selective pulls. | Do not replace. Pull only isolated upstream improvements: highlight cache, yarn command support if accepted, and cleaner transformer naming if it reduces local glue. |
| MDX component map | Upstream `mdx-components.tsx` includes explicit heading anchors, `DirectoryList`, `Kbd`, `Callout`, upstream `CodeCollapsibleWrapper`, package-manager command blocks, and component-list helpers. | Plate `mdx-components.tsx` maps to Plate Typography, keeps API MDX vocabulary, `PackageInfo`, `FrameworkDocs`, `ComponentInstallation`, `ComponentPreview`, `ReleaseIndex`, and Plate callouts. Current content search found no `<DirectoryList>` or `<Kbd>` usage. | `smart-merge` only for primitives actually used by content. | Add dashboard rows for `mdx/mdx-component-primitives` and `mdx/codeblock-primitives`; do not bulk-copy upstream MDX components. |
| Code command package managers | Upstream command transformer emits `__npm__`, `__yarn__`, `__pnpm__`, and `__bun__`; `CodeBlockCommand` renders all four tabs. | Plate `rehypeNpmCommand` emits `__npmCommand__`, `__pnpmCommand__`, and `__bunCommand__`; `CodeBlockCommand` renders three tabs. | `pending`. | My take: add `yarn`. It is small upstream parity and keeps command docs familiar. If Plate wants tighter package-manager scope, keep the three-tab fork. |
| Code collapsible wrapper | Upstream `CodeCollapsibleWrapper` has top-right Expand/Collapse, separator, bottom gradient trigger, `content-visibility:auto`, and `md:-mx-1` figure handling. | Plate `CodeBlockWrapper` keeps `full/open/expandButtonTitle`, uses an older full-overlay trigger, and has a suspicious class token: `[&_pre]:overflow-auto]`. | `pending` / best first sync row. | Smart-merge upstream wrapper behavior while preserving Plate props. This is the cleanest missed UI primitive. |
| Highlight cache | Upstream `highlightCode` uses `lru-cache`, SHA-256 keys, and a 1-hour cache. | Plate `highlightCode` has no cache, but has Plate-only `highlightFiles()` for registry file previews. | `smart-merge`. | Pull upstream LRU cache into Plate `highlightCode`, keep `highlightFiles()`. Low risk, real perf upside. |
| Copy button robustness | Upstream copy uses `navigator.clipboard` with a legacy textarea fallback and returns success before setting copied state. | Plate copy is optimistic and does not await success; registry copy helpers track events but can show copied even if browser write fails. | `smart-merge`. | Pull robust fallback into Plate copy utilities, but preserve Plate events and registry copy dropdown behavior. |
| Docs copy page menu | Upstream menu includes Markdown, v0, ChatGPT, Claude, and Scira. | Plate menu includes Markdown, ChatGPT, Claude, and GitHub discussion. It already has the shadcn button/dropdown/popover structure and excludes v0. | `plate-fork`. | Keep Plate menu. Do not add v0 or Scira unless product policy changes. |
| TOC | Upstream `DocsTableOfContents` memoizes item IDs. | Plate TOC is effectively synced but maps IDs directly. | `no-op`. | Optional micro perf only; not worth a dashboard row. |
| PageHeader | Upstream and Plate classes match after the recent sync. | Plate component is current. | `synced`. | No action. |

## Suggested Dashboard Rows To Add

These are not implementation requests. They are the missed review units that should exist if we want the dashboard to cover docs structure and MDX, not just visible route slices.

| Feature | Item | Initial State | Suggestion |
| --- | --- | --- | --- |
| Docs Engine | `docs-shell-ownership` | `fork` | Keep Plate docs shell as fork because it owns CN fallback, registry fallback pages, Plate LLM markdown, and no-v0 policy. |
| Docs Engine | `source-search-wiring` | `fork` | Keep Plate i18n source loader and grouped search route. |
| MDX | `mdx-component-primitives` | `pending` | Only pull upstream primitives when content needs them; current search found no `DirectoryList` or `Kbd` usage. |
| MDX | `codeblock-collapsible-wrapper` | `pending` | Smart-merge upstream expand/collapse wrapper behavior while preserving Plate props. |
| MDX | `code-command-yarn-tab` | `pending` | Decide whether Plate command blocks should include upstream `yarn` support. |
| MDX | `highlight-code-cache` | `pending` | Pull upstream LRU cache into Plate `highlightCode`; keep Plate `highlightFiles`. |
| MDX | `copy-button-fallback` | `pending` | Pull upstream robust clipboard fallback; preserve Plate analytics and copy dropdowns. |
| Docs Actions | `docs-copy-page-menu` | `fork` | Keep Plate Markdown, ChatGPT, Claude, GitHub menu; continue excluding v0. |

## Checks

| Check | Result | Evidence |
| --- | --- | --- |
| Upstream target | `stale-upstream` | `PLANNED..TARGET` has 2 commits and 40 `apps/v4` file-status rows. |
| Inventory | recomputed | `upstream-full-name-status.tsv` has 778 rows; selected scoped plan had 751 rows through `efdec3c`. |
| Plate owners | present | Inspected `doc-page.tsx`, `doc-content.tsx`, `mdx-components.tsx`, `source.config.ts`, `source.ts`, `search/route.ts`, code/copy components. |
| Explicit exclusions | upheld | v0/create/theme/style rows remain excluded or product-scoped; no recommendation reopens them. |
| Preserved forks | upheld | CN docs, API MDX, registry content, lazy source loading, docs shell, sidebar density, and no-v0 policy remain Plate-owned. |
| Status semantics | unchanged | No `status.json` baseline or plan fields were changed. |
| Visual screenshots | N/A | This pass is source/structure focused; no visual parity claim was made. |
| Implementation edits | none | Review-only mode; no `apps/www` source patch. |

## Next Action

Do not rerun the whole migration just for this. Add the dashboard rows above, then implement the first small slice:

1. `mdx/codeblock-collapsible-wrapper`
2. `mdx/highlight-code-cache`
3. `mdx/copy-button-fallback`
4. `mdx/code-command-yarn-tab`, only after the package-manager decision

The boring answer is the right one: keep Plate docs architecture, pull tiny upstream primitives where they buy maintainability or perf, and do not let shadcn's simpler docs shell flatten Plate's API/registry/CN behavior.
