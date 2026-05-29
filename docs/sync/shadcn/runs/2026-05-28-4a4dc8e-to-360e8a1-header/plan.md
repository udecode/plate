# Sync Shadcn Header 4a4dc8e..360e8a1

## Range

- Upstream repo: `shadcn-ui/ui`
- Upstream app: `../shadcn/apps/v4`
- Base: `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2` (2026-05-22, `Update pnpm release age settings (#10719)`)
- Target: `360e8a19c3ee13ac78b656027462007c8bdaa6d5` (2026-05-27, `fix(transform-rtl): preserve quotes in transformed className literals (#10495)`)
- Plate app: `apps/www`
- Scope: `header`
- Status source: `docs/sync/shadcn/status.json`
- Artifact directory: `docs/sync/shadcn/runs/2026-05-28-4a4dc8e-to-360e8a1-header`

## Summary

The scoped `header` audit found 7 candidate rows in the tracked 739-row upstream range. Five rows are direct header shell/config rows, two are adjacent sidebar/announcement rows, and 732 rows remain out of scope for this lane.

There is no urgent header patch to apply. Plate already has the upstream root layout header-height cleanup and has intentionally forked the header structure around the Plate logo, product links, locale switcher, Discord, MCP, and the recent decision to keep desktop Home on the logo instead of a text nav item. The only transferable unmerged header-mounted change is upstream's command-menu trigger styling; that is deferred because the user already said command-menu work comes later.

### Status Counts

| Key | Count |
| --- | ---: |
| `A` | 561 |
| `D` | 22 |
| `M` | 156 |

### Scope Counts

| Key | Count |
| --- | ---: |
| `direct-header` | 5 |
| `header-adjacent` | 2 |
| `out-of-scope` | 732 |

### Decision Counts

| Key | Count |
| --- | ---: |
| `exclude-upstream` | 672 |
| `no-op` | 62 |
| `plate-fork` | 3 |
| `smart-merge` | 2 |

## Complete Upstream Inventory

Full inventory with every changed upstream path: [`inventory.md`](./inventory.md).

Source artifacts:

- [`upstream-name-status.tsv`](./upstream-name-status.tsv)
- [`upstream-numstat.tsv`](./upstream-numstat.tsv)
- [`upstream-commits.txt`](./upstream-commits.txt)
- [`header-candidate-name-status.tsv`](./header-candidate-name-status.tsv)
- Patch artifacts removed; inspect focused upstream diffs on demand with capped
  `git -C ../shadcn diff ...` commands instead of committing `.patch` files.

## Header Candidate Rows

| Status | Upstream file | Decision | Evidence |
| --- | --- | --- | --- |
| M | `apps/v4/app/layout.tsx` | `no-op` | Plate already has `lg:[--header-height:calc(var(--spacing)*16)]` and no `localStorage.layout`/`LayoutProvider`; see layout.tsx:92-118. |
| M | `apps/v4/components/command-menu.tsx` | `smart-merge` | Upstream changed the header search trigger to borderless `bg-muted`; Plate trigger still uses `bg-muted/50` and command-menu work was explicitly deferred; see command-menu.tsx:296-311. |
| M | `apps/v4/components/mobile-nav.tsx` | `plate-fork` | Upstream removed static Home because Home moved into shadcn navItems; Plate intentionally keeps Home in command/mobile items because the logo is hidden on mobile; see mobile-nav.tsx:55-143. |
| M | `apps/v4/components/site-header.tsx` | `plate-fork` | Keep Plate logo, Docs/Editors/Templates, GitHub, Discord, language switcher, MCP; upstream create/v0 actions stay excluded; see site-header.tsx:47-103. |
| M | `apps/v4/lib/config.ts` | `plate-fork` | Upstream added `Home` to `navItems`; Plate keeps Home in command/mobile nav and keeps desktop Home on the logo only; see site-header.tsx:19-45 and logo.tsx:14-25. |

## Header-Adjacent Rows

| Status | Upstream file | Decision | Evidence |
| --- | --- | --- | --- |
| M | `apps/v4/components/announcement.tsx` | `exclude-upstream` | Rhea announcement/product copy, not Plate header chrome; current policy excludes Rhea/create/theme surfaces. |
| M | `apps/v4/components/docs-sidebar.tsx` | `smart-merge` | Sidebar polish is adjacent but not `header`; keep in sidebar lane, where Plate owns accordion behavior. |

## Added Files

- 561 added files.
- None are direct header rows.
- Most added files are Rhea style output, create preview files, homepage cards, and registry/style artifacts. They stay out of scope for `header` and follow the full sync plan's exclusion/no-op policy.

## Modified Files

- 156 modified files.
- Direct header rows: `apps/v4/app/layout.tsx`, `apps/v4/components/command-menu.tsx`, `apps/v4/components/mobile-nav.tsx`, `apps/v4/components/site-header.tsx`, and `apps/v4/lib/config.ts`.
- Header-adjacent rows: `apps/v4/components/announcement.tsx` and `apps/v4/components/docs-sidebar.tsx`.

## Deleted Files

- 22 deleted files.
- None are direct header rows.
- Deleted files are old shadcn root demo components with no Plate header owner.

## Recommended Merge Slices

| Order | Slice | Class | Files | Why | Verification |
| --- | --- | --- | --- | --- | --- |
| 1 | Header accounting only | `plate-fork` / `no-op` | `apps/www/src/components/site-header.tsx`, `apps/www/src/components/mobile-nav.tsx`, `apps/www/src/config/site.ts`, `apps/www/src/app/layout.tsx` | Plate already has the upstream layout fix and the current Plate header intentionally keeps logo-owned Home, Plate product links, CN-safe links, language, Discord, GitHub, MCP, and excludes create/v0. | Source audit: line evidence in this plan; no implementation patch. |
| 2 | Command-menu trigger styling | `smart-merge` deferred | `apps/www/src/components/command-menu.tsx` | Upstream trigger changed to borderless `bg-muted`; Plate still uses the older `bg-muted/50` trigger. User already said command-menu comes later, so keep this out of the header implementation slice. | Later scoped lane: `sync-shadcn command-menu`; then typecheck/lint/browser header search proof. |

## Explicit Exclusions

- Upstream `/create`, v0, `ProjectForm`, `V0Button`, and create product actions stay excluded from Plate header.
- Rhea announcement/header-adjacent copy stays excluded; it is upstream product marketing, not Plate docs chrome.
- Rhea style/theme/generated style registry rows stay excluded by settled theme/customizer policy.
- Upstream homepage cards and public directory/product pages stay out of scope for `header`.

## Plate Forks To Preserve

- Plate logo remains the desktop Home control. Do not add desktop `Home` text back to the header nav.
- Mobile/command fallback can keep `Home`, because the logo is hidden on mobile and command/menu are navigation surfaces.
- Keep Plate `Docs`, `Editors`, and external `Templates` links instead of upstream shadcn Docs/Components/Blocks/Charts/Directory/Create.
- Keep GitHub, Discord, language switcher, theme switcher, and MCP dialog in the header.
- Keep locale-safe link behavior from `hrefWithLocale`/`getLocalizedPath`.
- Keep Plate sidebar accordion as a separate sidebar fork; do not collapse it into this header lane.

## Smart Merge Details

- `app/layout.tsx`: upstream removed layout localStorage/project state and added `lg:[--header-height:calc(var(--spacing)*16)]`; Plate already matches the useful part and has no layout provider residue.
- `lib/config.ts`: upstream added `Home` to navItems; Plate adopts the intent only for command/mobile fallback, not desktop text nav.
- `site-header.tsx`: upstream removed extra logo/SiteConfig but still carries create/v0 actions; Plate should preserve its current product-owned header and exclude create/v0.
- `mobile-nav.tsx`: upstream removed static Home because it moved into shadcn navItems; Plate keeps Home through `commandNavItems` for mobile.
- `command-menu.tsx`: upstream trigger styling is the only remaining header-mounted style candidate. Defer to a command-menu lane.

## Questions

None for this scoped header plan. The only unresolved header-mounted item is command-menu trigger styling, already deferred by user decision.

## Status Update Rule

This scoped plan cannot advance `lastSyncedCommit`. It accounts for header-scope rows in `4a4dc8e..360e8a1`, but 732 rows remain outside this lane and command-menu trigger styling is deferred. `lastPlannedCommit` can remain `360e8a19c3ee13ac78b656027462007c8bdaa6d5`; `lastPlan` may point to this scoped plan as the latest review artifact.

## Suggested Next Step

Review this header plan. If accepted, there is no header implementation slice to run now unless you want to override the command-menu deferral. For the deferred command-menu item, run `sync-shadcn command-menu` later.
