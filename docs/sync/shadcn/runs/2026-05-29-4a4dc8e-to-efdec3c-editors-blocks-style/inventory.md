# Editors Blocks Style Inventory

Scope: Plate `/editors` visual parity against upstream shadcn `/blocks`, excluding the blocks category nav, Open in v0, and a bottom browse-more CTA.

Full upstream range artifacts:

- `upstream-name-status.tsv`: 751 changed `apps/v4` rows.
- `upstream-numstat.tsv`: 751 rows.
- `upstream-commits.txt`: 13 commits.
- `scope-name-status.tsv`: 12 changed rows directly touching upstream block demo content in the range.
- `target-reference-files.tsv`: 8 unchanged current upstream files used as the visual source of truth.

Out-of-scope changed rows: 739.

## Scoped Rows

| Status | Upstream file | Subsystem | Plate owner | Decision | Evidence |
| --- | --- | --- | --- | --- | --- |
| reference | `apps/v4/app/(app)/blocks/layout.tsx` | `product-page` | `apps/www/src/app/(app)/editors/layout.tsx`, `apps/www/src/app/(app)/editors/editor-description.tsx` | `smart-merge` | Adopt centered `PageHeader`, action rhythm, and `section-soft` content wrapper; do not import `PageNav`, `BlocksNav`, or `Browse all blocks`. |
| reference | `apps/v4/app/(app)/blocks/page.tsx` | `product-page` | `apps/www/src/app/(app)/editors/page.tsx` | `smart-merge` | Adopt simple vertical block-list rhythm; do not import upstream bottom `Browse more blocks` as `Browse more editors`. |
| reference | `apps/v4/app/(app)/blocks/[...categories]/page.tsx` | `product-page` | none | `no-op` | Category-specific block routes are tied to upstream blocks gallery; user explicitly excluded the category nav surface. |
| reference | `apps/v4/components/block-display.tsx` | `preview-view` | `apps/www/src/components/block-display.tsx` | `smart-merge` | Use as layout/composition reference only; Plate keeps registry cache, editor demo items, and `/view/[name]`. |
| reference | `apps/v4/components/block-viewer.tsx` | `preview-view` | `apps/www/src/components/block-viewer.tsx` | `smart-merge` | Use toolbar density/content-wrapper cues only; explicitly exclude upstream `OpenInV0Button`. |
| reference | `apps/v4/components/page-nav.tsx` | `product-page` | none | `exclude-upstream` | User pasted this exact wrapper as unwanted. |
| reference | `apps/v4/components/blocks-nav.tsx` | `product-page` | `apps/www/src/components/blocks-nav.tsx` | `exclude-upstream` | Keep out of `/editors`; category nav belongs to upstream blocks gallery. |
| reference | `apps/v4/components/open-in-v0-button.tsx` | `preview-view` | none | `exclude-upstream` | User explicitly said no Open in v0; durable policy excludes v0. |
| M | `apps/v4/registry/bases/base/blocks/preview-02/cards/sidebar-nav.tsx` | `product-page` | none | `exclude-upstream` | Rhea/block-demo content, not Plate editor docs. |
| M | `apps/v4/registry/bases/base/blocks/preview/cards/codespaces-card.tsx` | `product-page` | none | `exclude-upstream` | Upstream block demo content, not Plate editor docs. |
| M | `apps/v4/registry/bases/base/blocks/preview/cards/ui-elements.tsx` | `product-page` | none | `exclude-upstream` | Upstream block demo content, not Plate editor docs. |
| M | `apps/v4/registry/bases/base/blocks/sidebar-07/components/nav-projects.tsx` | `product-page` | none | `exclude-upstream` | Upstream sidebar block content, not Plate editor docs. |
| M | `apps/v4/registry/bases/base/blocks/sidebar-07/components/nav-user.tsx` | `product-page` | none | `exclude-upstream` | Upstream sidebar block content, not Plate editor docs. |
| M | `apps/v4/registry/bases/base/blocks/sidebar-07/components/team-switcher.tsx` | `product-page` | none | `exclude-upstream` | Upstream sidebar block content, not Plate editor docs. |
| M | `apps/v4/registry/bases/radix/blocks/preview-02/cards/sidebar-nav.tsx` | `product-page` | none | `exclude-upstream` | Upstream block demo content, not Plate editor docs. |
| M | `apps/v4/registry/bases/radix/blocks/preview/cards/codespaces-card.tsx` | `product-page` | none | `exclude-upstream` | Upstream block demo content, not Plate editor docs. |
| M | `apps/v4/registry/bases/radix/blocks/preview/cards/ui-elements.tsx` | `product-page` | none | `exclude-upstream` | Upstream block demo content, not Plate editor docs. |
| M | `apps/v4/registry/bases/radix/blocks/sidebar-07/components/nav-projects.tsx` | `product-page` | none | `exclude-upstream` | Upstream sidebar block content, not Plate editor docs. |
| M | `apps/v4/registry/bases/radix/blocks/sidebar-07/components/nav-user.tsx` | `product-page` | none | `exclude-upstream` | Upstream sidebar block content, not Plate editor docs. |
| M | `apps/v4/registry/bases/radix/blocks/sidebar-07/components/team-switcher.tsx` | `product-page` | none | `exclude-upstream` | Upstream sidebar block content, not Plate editor docs. |

## Decision Counts

| Decision | Count |
| --- | ---: |
| `smart-merge` | 4 |
| `exclude-upstream` | 15 |
| `no-op` | 1 |
| out-of-scope changed rows | 739 |

