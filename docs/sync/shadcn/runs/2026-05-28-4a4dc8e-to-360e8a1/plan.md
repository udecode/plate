# Sync Shadcn 4a4dc8e..360e8a1

## Range

- Upstream repo: `shadcn-ui/ui`
- Upstream app: `../shadcn/apps/v4`
- Base: `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2` (2026-05-22, `Update pnpm release age settings (#10719)`)
- Target: `360e8a19c3ee13ac78b656027462007c8bdaa6d5` (2026-05-27, `fix(transform-rtl): preserve quotes in transformed className literals (#10495)`)
- Plate app: `apps/www`
- Status source: `docs/sync/shadcn/status.json`
- Artifact directory: `docs/sync/shadcn/runs/2026-05-28-4a4dc8e-to-360e8a1`

## Summary

`../shadcn` was fast-forwarded to `360e8a19c3ee13ac78b656027462007c8bdaa6d5`. The `apps/v4` diff is large by file count but narrow by product meaning: 520 rows are theme/style output, 136 rows are registry-build or registry-output plumbing, and 66 rows are shadcn home/create product surfaces. Most of that is excluded or no-op for Plate by current policy.

Actionable Plate work is small: inspect the shadcn 4.8.2 package bump, smart-merge the docs-shell token/sidebar/command-menu polish that maps to retained Plate docs UI, and separately decide whether Plate should expose an upstream-style `/r/registries.json` directory route. Do not import Rhea, create, generated style registries, or shadcn homepage cards.

### Status Counts

| Key | Count |
| --- | ---: |
| `A` | 561 |
| `D` | 22 |
| `M` | 156 |

### Subsystem Counts

| Key | Count |
| --- | ---: |
| `assets` | 2 |
| `deps-config` | 3 |
| `docs-engine` | 4 |
| `other` | 1 |
| `product-page` | 66 |
| `registry-build` | 136 |
| `routing` | 2 |
| `shell-nav-sidebar` | 5 |
| `theme-style` | 520 |

### Decision Counts

| Key | Count |
| --- | ---: |
| `adopt-upstream` | 1 |
| `exclude-upstream` | 566 |
| `no-op` | 156 |
| `plate-fork` | 6 |
| `smart-merge` | 10 |

## Complete Upstream Inventory

Full inventory with every changed upstream path: [`inventory.md`](./inventory.md).

Source artifacts:

- [`upstream-name-status.tsv`](./upstream-name-status.tsv)
- [`upstream-numstat.tsv`](./upstream-numstat.tsv)
- [`upstream-commits.txt`](./upstream-commits.txt)
- [`app-components-lib.patch`](./app-components-lib.patch)
- [`registry-scripts.patch`](./registry-scripts.patch)
- [`docs-mdx-source.patch`](./docs-mdx-source.patch)

## Added Files

- 561 added files. Most are Rhea style registry output and shadcn homepage card/create preview files.
- Actionable added file: `apps/v4/app/r/registries.json/route.ts`, which serves `registry/directory.json` through a static route.
- Explicit exclusions: Rhea images, Rhea style source/output, create preview fonts/layout, and shadcn homepage cards.

## Modified Files

- 156 modified files. Actionable rows include `apps/v4/package.json`, docs page text token changes, docs sidebar wrapper/border changes, command-menu trigger styling, registry validation/build script changes, and `content/docs/registry/registry-index.mdx`.
- Plate already has the `lg:[--header-height:calc(var(--spacing)*16)]` layout change in `apps/www/src/app/layout.tsx:105-108`, so upstream `app/layout.tsx` is `no-op`.
- Plate still has `text-neutral-800 dark:text-neutral-300` on docs content at `apps/www/src/app/(app)/docs/[[...slug]]/doc-content.tsx:90`, matching an upstream fix candidate to `text-foreground`.
- Plate already has `px-2.5` on `SidebarContent`, but still has the decorative vertical border at `apps/www/src/components/docs-nav.tsx:83`; upstream removed that border.

## Deleted Files

- 22 deleted files. 21 are old shadcn root-page demo components replaced by Rhea cards; no Plate import.
- `apps/v4/public/r/registries.json` was deleted because upstream now serves the directory from `/r/registries.json`; this is the only deleted file with possible Plate infrastructure relevance.

## Recommended Merge Slices

| Order | Slice | Class | Files | Why | Verification |
| --- | --- | --- | --- | --- | --- |
| 1 | Docs shell parity polish | `smart-merge` | `apps/www/src/app/(app)/docs/[[...slug]]/doc-content.tsx`, `apps/www/src/components/docs-nav.tsx`, possibly `apps/www/src/components/command-menu.tsx` | Upstream has retained docs UI polish: foreground text tokens, sidebar border removal, command trigger styling. Plate owns the accordion UX but should keep primitives aligned. | `pnpm --filter www typecheck`, `pnpm lint:fix`, browser check `/docs` and `/cn/docs/table`. |
| 2 | shadcn package bump audit | `adopt-upstream` | `apps/www/package.json`, lockfile | Upstream moved `shadcn` `4.8.0 -> 4.8.2`; Plate still pins `4.8.0`. This may carry registry/RTL fixes relevant to Plate registry validation. | `pnpm install`, `pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts`, `pnpm --filter www typecheck`. |
| 3 | Registry directory route decision | `smart-merge` | possible Plate `/r/registries.json` route or explicit no-op note | Upstream stopped generating `public/r/registries.json` and serves `registry/directory.json` through a static route. Plate currently does not expose a shadcn registry directory, so this needs a product decision before implementation. | If implemented: route smoke for `/r/registries.json`, source-only validation. If rejected: record exclusion. |
| 4 | Rhea/create/theme exclusion audit | `exclude-upstream` | Rhea style files, create preview files, homepage cards, generated style output | Current Plate policy rejects themes/create and keeps Plate homepage. This slice is just a source search if implementing another slice touches nearby code. | `rg -n "rhea|style-rhea|style-registry|legacy-themes|create" apps/www content/docs` scoped to ensure no accidental import. |

## Explicit Exclusions

- Rhea style system and generated style registry output: excluded by `docs/sync/shadcn/decisions.md` theme/customizer policy.
- Upstream create/customizer work: excluded unless the user explicitly asks for a Plate create flow.
- Upstream homepage Rhea cards and deleted old demo components: excluded because Plate keeps its own homepage/editor positioning.
- Upstream public registry output under `apps/v4/public/r/styles/**`: no manual import; Plate generated registry output remains CI/source-pipeline-owned.
- Upstream shadcn registry directory entries such as blockus/dominik/toc-cn are shadcn product directory content, not Plate docs content.

## Plate Forks To Preserve

- Plate sidebar accordion/filter UX, rebuilt on shadcn sidebar primitives.
- Lazy `/api/registry-source/[name]` code-view payload route for bandwidth.
- Plate API MDX components and generated API docs support.
- CN docs routes/labels.
- MCP dialog/docs/header entry.
- Plate Plus/Pro hooks.
- GA only, no per-click analytics resurrection.
- Plate home page and editor demos.
- Workspace source aliases and package integration tests.

## Smart Merge Details

- Docs content wrapper: take upstream `text-foreground dark:text-foreground` direction, but preserve Plate `isWideContent`, registry fallback, related docs, Plus CTA, and CN behavior.
- Sidebar: take upstream border/wrapper parity only; preserve Plate accordion grouping, filter behavior, localized labels, and Fumadocs metadata source.
- Command menu: inspect the upstream muted trigger styling; preserve Plate search groups and locale-safe fallback links.
- Registry directory route: upstream route shape is clean, but Plate should only add it if Plate wants to publish a registry directory surface. Do not confuse this with Plate item registry `/r/{name}.json`.
- Package bump: adopt `shadcn@4.8.2` only after local registry source validation; do not pull upstream generated registry output.

## Questions

One real decision before implementation: should Plate expose a shadcn-compatible `/r/registries.json` directory route, or should this upstream registry-directory feature stay excluded as shadcn product surface?

Docs shell polish and package bump do not need a policy question; they are normal smart-merge/adopt candidates if you want implementation.

## Status Update Rule

Do not advance `lastSyncedCommit` yet. This plan accounts for the full range, but implementation has not run and the `/r/registries.json` directory-route question is unresolved. `lastPlannedCommit` may point at `360e8a19c3ee13ac78b656027462007c8bdaa6d5` with this plan path.

## Suggested Next Step

Recommended first implementation slice: docs shell parity polish. It is small, maps directly to retained Plate UI, and avoids the unresolved registry-directory product question.
