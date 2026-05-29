# Sync Shadcn Home Page 4a4dc8e..360e8a1

## Range

- Upstream repo: `shadcn-ui/ui`
- Upstream app: `../shadcn/apps/v4`
- Base: `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`
- Target: `360e8a19c3ee13ac78b656027462007c8bdaa6d5` (2026-05-27, `fix(transform-rtl): preserve quotes in transformed className literals (#10495)`)
- Scope: `home page`
- Plate app: `apps/www`
- Status source: `docs/sync/shadcn/status.json`
- Full upstream rows in range: 739
- Scoped rows: 56
- Out-of-scope rows: 683

## Summary

Recommendation: keep Plate's home page as the product surface. Do not import upstream's new shadcn card mosaic, `Build Your Own` CTA, or `/create?preset=...` funnel. The only worthwhile upstream idea is layout polish around the hero/preview area: tighter header bottom spacing and a wider, less padded preview container if it makes Plate's editor preview feel more like the current shadcn page.

This scoped plan cannot advance `lastSyncedCommit`; it accounts only for the home-page rows in the already planned `4a4dc8e..360e8a1` range.

## Complete Upstream Inventory

Full table: [inventory.md](./inventory.md)

| Decision | Count | Notes |
| --- | ---: | --- |
| `smart-merge` | 1 | Root page layout/composition hunk only. |
| `exclude-upstream` | 34 | New upstream cards/demo product surface. |
| `no-op` | 21 | Upstream deletes old demo components Plate does not own. |
| out-of-scope | 683 | Default full sync lane remains pending. |

## Added Files

34 upstream files were added under `apps/v4/app/(app)/(root)/cards/**`. They are shadcn homepage card demos. Decision: `exclude-upstream`.

## Modified Files

- `apps/v4/app/(app)/(root)/page.tsx`: `smart-merge`. Keep Plate copy, CTAs, Playground preview, CN home page, and Potion/Pro path. Consider only spacing/container ideas from upstream.

## Deleted Files

21 upstream files were deleted under `apps/v4/app/(app)/(root)/components/**`. Plate does not contain those files. Decision: `no-op`.

## Recommended Merge Slices

| Order | Slice | Class | Files | Why | Verification |
| ---: | --- | --- | --- | --- | --- |
| 1 | Home layout polish only | `smart-merge` | `apps/www/src/app/(app)/page.tsx`, `apps/www/src/app/cn/page.tsx`, maybe `apps/www/src/components/page-header.tsx` if the local primitive needs a scoped class hook | Best take: keep Plate's editor/product content; borrow only the useful spacing/preview-container treatment from upstream. | Browser proof on `/` and `/cn`, plus `pnpm --filter www typecheck`. |
| 2 | Home theme/create residue audit | `delete-plate-residue` | `apps/www/src/app/(app)/_components/potion-lazy-block.tsx`, `apps/www/src/components/playground-preview.tsx`, `apps/www/src/app/globals.css` | Remove dead homepage wording/state that still says themes/customizer if it is not used by retained preview code. Do not touch shared preview theme wrappers that are still required. | `rg -n "Themes|customizer|useProject|liftMode|radius" apps/www/src/app apps/www/src/components apps/www/src/hooks apps/www/src/lib`; browser proof on `/`. |
| 3 | Upstream cards/create exclusion | `exclude-upstream` | `apps/v4/app/(app)/(root)/cards/**`, `apps/v4/app/(app)/(root)/page.tsx` CTA hunk | The card mosaic is shadcn product marketing tied to `/create`; Plate should not ship it. | Source audit only; no Plate patch unless accidental imports are found. |

## Explicit Exclusions

- Do not import upstream `CardsDemo` or any `apps/v4/app/(app)/(root)/cards/**` files.
- Do not import the `Build Your Own` CTA or `/create?preset=b27GcrRo` link.
- Do not import Rhea/style/theme/generated registry output as part of home-page work. That belongs to the excluded create/theming product surface.
- Do not replace Plate's editor preview with shadcn dashboard/card screenshots.

## Plate Forks To Preserve

- Plate English home page: `apps/www/src/app/(app)/page.tsx`.
- Plate CN home page: `apps/www/src/app/cn/page.tsx`.
- Plate editor preview: `apps/www/src/components/playground-preview.tsx`.
- Plate Pro/Potion lazy block path, unless you decide to remove the Pro promo from home separately.
- Plate docs/product CTAs: docs and GitHub, not upstream create.

## Smart Merge Details

Take from upstream only if implementation confirms it improves the current page:

- tighter header bottom padding on the home route
- less horizontal padding around the large preview area on medium/large screens
- overflow containment for the primary demo so the first viewport feels deliberate

Keep Plate-owned:

- title/copy
- docs/GitHub CTAs
- editor preview
- CN equivalent page
- no theme/customizer/create flow

## Questions

None. This follows existing policy: keep Plate homepage and exclude upstream create/theme surfaces.

## Status Update Rule

This scoped plan must not advance `lastSyncedCommit`. It may become a `partialSyncs` entry after you accept and implement a home-page slice. The default full sync lane remains pending for 683 out-of-scope rows.

## Artifacts

- Full upstream rows: `upstream-name-status.tsv`
- Full upstream numstat: `upstream-numstat.tsv`
- Upstream commits: `upstream-commits.txt`
- Scoped rows: `home-scope-name-status.tsv`
- Scoped numstat: `home-scope-numstat.tsv`
- Focused diff evidence: inspect upstream route diffs on demand; `.patch`
  artifacts are intentionally not committed.
- Inventory: `inventory.md`
