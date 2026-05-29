# Sync Shadcn Editors Blocks Style 4a4dc8e..efdec3c

## Range

- Upstream repo: `shadcn-ui/ui`
- Upstream app: `../shadcn/apps/v4`
- Base: `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`
- Previous planned target: `360e8a19c3ee13ac78b656027462007c8bdaa6d5`
- Target: `efdec3ca4523e5edd8a714f633002a7addc203a1` (2026-05-29, `fix(styles): restore primary button hover for Nova and Lyra (#10807)`)
- Scope: `http://localhost:3003/editors` to upstream `/blocks` style
- Plate app: `apps/www`
- Status source: `docs/sync/shadcn/status.json`
- Full upstream rows in range: 751
- Scoped changed rows: 12
- Current upstream reference files: 8
- Out-of-scope rows: 739

## Summary

Recommendation: smart-merge the upstream `/blocks` page framing into Plate `/editors`, but keep Plate's editor demo content and remove the upstream product controls the user rejected.

The useful upstream shape is:

- centered `PageHeader` with the same page header/action rhythm
- `container-wrapper flex-1 section-soft md:py-12`
- simple vertical block list spacing: `flex flex-col gap-12 md:gap-24`
- block preview cards sitting inside the soft section with the same container width rhythm

Do not import:

- the `PageNav`/`BlocksNav` category strip
- `Browse all blocks`
- `Open in v0`
- bottom `Browse more blocks`, and do not create `Browse more editors`
- upstream dashboard/sidebar/login/signup block content

This scoped plan cannot advance `lastSyncedCommit`; it accounts only for the `/editors` visual parity slice and a small set of upstream block-demo rows.

## Visual Evidence

Screenshots are saved under `screenshots/`:

- `shadcn-blocks-desktop.png`: `http://localhost:4000/blocks`, 1175x1239
- `plate-editors-desktop-before.png`: `http://localhost:3003/editors`, 1175x1239
- `shadcn-blocks-mobile.png`: `http://localhost:4000/blocks`, 390x844
- `plate-editors-mobile-before.png`: `http://localhost:3003/editors`, 390x844

Measured deltas:

| Surface | Upstream `/blocks` | Plate `/editors` | Decision |
| --- | --- | --- | --- |
| Header | centered `PageHeader`, desktop `top=64 height=335` | left-aligned header inside route container, desktop `top=64 height=220` | `smart-merge` centered upstream header style with Plate copy |
| Page nav | present, `top=399 height=64`, includes Featured/Sidebar/Login/Signup and Browse all blocks | absent | keep absent; user explicitly rejected this wrapper |
| Content background | `section-soft` full-width band, desktop `top=463 height=5620` | no `section-soft`, white body | adopt `section-soft` wrapper |
| First card desktop | `left=40 top=511 width=1095 height=1048` | `left=16 top=284 width=1143 height=694` | adopt upstream content-band spacing, keep Plate cards |
| First card mobile | `left=24 top=410 width=342 height=243` | `left=16 top=270 width=358 height=694` | adopt upstream mobile side padding/top rhythm, keep Plate card heights |
| v0 | upstream block viewer includes `Open in v0` | Plate currently absent | keep absent |
| bottom CTA | upstream `/blocks` includes `Browse more blocks` | Plate `/editors` currently absent | keep absent; user explicitly said no `Browse more editors` |

The first upstream screenshot attempt failed because `NEXT_PUBLIC_APP_URL` was missing; the upstream dev server was restarted with `NEXT_PUBLIC_APP_URL=http://localhost:4000`, then screenshots were recaptured successfully.

## Complete Upstream Inventory

Full table: [inventory.md](./inventory.md)

| Decision | Count | Notes |
| --- | ---: | --- |
| `smart-merge` | 4 | Current upstream `/blocks` route/display files used as visual reference. |
| `exclude-upstream` | 15 | User-rejected nav/v0/browse surfaces plus upstream block demo content. |
| `no-op` | 1 | Category route not relevant after excluding category nav. |
| out-of-scope | 739 | Default full sync lane remains pending. |

## Added Files

None in the scoped changed rows.

## Modified Files

Scoped changed upstream rows are 12 registry block-demo files under `apps/v4/registry/bases/{base,radix}/blocks/**`. They are upstream product demo content from the Rhea/block surface. Decision: `exclude-upstream`.

Current upstream reference files used for smart merge:

- `apps/v4/app/(app)/blocks/layout.tsx`
- `apps/v4/app/(app)/blocks/page.tsx`
- `apps/v4/components/block-display.tsx`
- `apps/v4/components/block-viewer.tsx`

## Deleted Files

None in the scoped changed rows.

## Recommended Merge Slices

| Order | Slice | Class | Files | Why | Verification |
| ---: | --- | --- | --- | --- | --- |
| 1 | Editors page shell parity | `smart-merge` | `apps/www/src/app/(app)/editors/layout.tsx`, `apps/www/src/app/(app)/editors/editor-description.tsx`, `apps/www/src/app/(app)/editors/page.tsx` | Best take: make `/editors` read like shadcn `/blocks` while preserving Plate editor demos. Move to centered `PageHeader`, add `section-soft`, use upstream vertical list spacing, remove old left-aligned header rhythm. | Browser screenshots `/editors` desktop/mobile; assert no `Featured`, `Sidebar`, `Login`, `Signup`, `Browse all blocks`, `Open in v0`, or `Browse more editors`; run focused eslint/typecheck. |
| 2 | BlockViewer toolbar cleanup for editors | `smart-merge` | `apps/www/src/components/block-viewer.tsx`, maybe `apps/www/src/components/block-display.tsx` | Only if slice 1 still leaves toolbar density mismatched. Copy upstream spacing/button proportions where useful, but keep Plate install command, code/source model, `/view/[name]`, Pro button, and no v0. | Browser metrics on first `/editors` block toolbar; eslint/typecheck. |

## Explicit Exclusions

- Exclude `PageNav` and `BlocksNav` category strip. The user pasted the wrapper as unwanted.
- Exclude `Browse all blocks`.
- Exclude `Open in v0` and all v0 buttons/routes/copy.
- Exclude upstream bottom `Browse more blocks`; do not replace it with `Browse more editors`.
- Exclude upstream block demo content under `apps/v4/registry/bases/**/blocks/**`.
- Exclude upstream `/create`, `/charts`, `/colors`, Rhea/style/theme, and generated style registry surfaces unless the user explicitly opens those lanes.

## Plate Forks To Preserve

- Plate editor demos from `getAllBlocks()` and `apps/www/src/registry/**`.
- Plate `BlockViewer` registry-source/code-view behavior and `/view/[name]`.
- Plate Pro/Potion block on the editors page unless separately removed.
- Plate install commands using `@plate/*`.
- Plate header links and shared app shell.

## Smart Merge Details

Take from upstream:

- centered page header composition
- action row rhythm
- soft section band around the block list
- block-list gap rhythm
- container spacing around previews

Keep Plate-owned:

- editor route copy
- `Browse Editors` hero action if retained, but point only to `#blocks`
- editor demo item list and ordering
- Notion/Potion Pro block
- `@plate` install commands
- code/source display and lazy source loading
- no v0

## Questions

None. The user already made the policy calls for the three ambiguous surfaces: no category nav wrapper, no Open in v0, no Browse more editors.

## Status Update Rule

This scoped plan must not advance `lastSyncedCommit`. It updates `lastPlannedCommit` to the current upstream target because the plan was written against `origin/main`, but it only accounts for this `/editors` visual scope. The default full sync lane remains pending for 739 out-of-scope rows.

## Artifacts

- Full upstream rows: `upstream-name-status.tsv`
- Full upstream numstat: `upstream-numstat.tsv`
- Upstream commits: `upstream-commits.txt`
- Scoped changed rows: `scope-name-status.tsv`
- Current upstream reference rows: `target-reference-files.tsv`
- Inventory: `inventory.md`
- Screenshots: `screenshots/*.png`

