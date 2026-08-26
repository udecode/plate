# Sync Shadcn Latest cd54e09..b9938d9

## Range

- Upstream repo: `shadcn-ui/ui`
- Upstream app: `../shadcn/apps/v4`
- Base: `cd54e0927f3853a777f700a0bbf34507cf697b9c` (tracked `lastSyncedCommit`)
- Target: `b9938d94635fca7a4560449713b0b1ba87d77bc6`
  (2026-08-24, `fix(ci): bump @changesets/cli for npm 12 publish detection (#11613)`)
- Range ancestry: base is an ancestor of target
- Commits in the full upstream range: 228
- Commits touching `apps/v4`: 191
- Changed `apps/v4` rows: 6,342
- Plate app: `apps/www`
- Plate docs content: `content/docs`
- Artifact directory:
  `docs/sync/shadcn/runs/2026-08-24-cd54e09-to-b9938d9`

## Summary

Plan the range, keep the baseline at `cd54e09`, and implement the registry
preset contract first. Plate currently declares `radix`, `base`, and `aria`
Toolbar variants, but installed `shadcn@4.10.0` exports only `radix` and `base`
from `shadcn/preset`. The registry builder therefore creates 19 targets and
omits all eight `aria-*` targets. Upstream `shadcn@4.19.0` exports all three
bases and the same eight styles, which raises the truthful target set to 27.

Do not copy upstream's 374 base-source rows or its old style trees. Upgrade the
published preset/schema owner, assert the Plate/preset base sets match, and let
Plate's existing registry resolver keep owning the editor-specific Toolbar
variants.

No qualifying micro-overlap was applied. The one-line upstream Calendar fix is
for React DayPicker v9; Plate still owns a v8 Calendar, so treating it as a
direct patch would be wrong.

## What happened to base-luma and base-lyra

They were not introduced by this run. Both existed before the tracked June 2
baseline and were already inventoried by the June sync plan. That plan excluded
the upstream style variants and generated payloads, except for one shared
Button hover fix.

This range changes their storage model:

- `18fcf0f76` (`feat: @shadcn/react`) centralized the base/style component
  source.
- `3a124632a` and `dd679a6e2` stopped tracking 4,797 generated/style rows in
  `apps/v4`.
- `767387d42` added per-style generated component-map shards such as
  `registry/__components__/base-luma.tsx` and `base-lyra.tsx`.
- `2b89d67e1` added React Aria as the third base, producing the same style
  names under `aria-*`.

Plate consumes upstream preset names as style inventory. Its supported provider
set is an explicit Radix/Base subset, and its registry graph is not derived
from the full upstream base list.

## Complete Upstream Inventory

The complete row table is [inventory.md](./inventory.md). Machine-readable
counts are in [classification-summary.json](./classification-summary.json).

### Counts

### Change types

| Change | Count |
| --- | ---: |
| Added | 1,188 |
| Deleted | 4,797 |
| Modified | 266 |
| Renamed | 91 |
| Total | 6,342 |

### Decisions

| Decision | Count | Meaning |
| --- | ---: | --- |
| `smart-merge` | 402 | Source reference for retained registry/docs owners; never a bulk copy. |
| `plate-fork` | 251 | Plate owns the corresponding product, docs, route, or registry content. |
| `exclude-upstream` | 1,832 | Create/typeset/theme/style/product/example content has no retained Plate job. |
| `no-op` | 3,857 | Generated output or internal indexes are represented by Plate source/build owners. |
| `adopt-upstream` | 0 | No file is safe or useful as a wholesale direct adoption. |
| `delete-plate-residue` | 0 | No Plate residue was proven by this planning range. |
| `needs-question` | 0 | Durable policy resolves every row. |
| Total | 6,342 | Reconciles exactly to `upstream-name-status.tsv`. |

## Added Files

- 336 rows add or extend the three-base registry source, dominated by the new
  React Aria implementation.
- 660 rows add shadcn examples. They remain excluded from Plate editor
  examples.
- 97 rows add shadcn docs content. Plate keeps its own content, API MDX, CN,
  registry, and release owners.
- 27 rows are generated per-style registry indexes and are no-op output.
- The remaining additions are typeset/create/product surfaces, assets, and
  small retained-engine candidates.

## Deleted Files

- 3,818 rows delete tracked generated registry payloads.
- 973 rows delete old tracked style source after upstream moved it behind
  `@shadcn/react`.
- The remaining six deletions are upstream product/example cleanup.
- No Plate deletion follows from these rows; Plate already keeps authored
  registry source and owner-controlled generated output.

## Modified Files

- 141 modified docs-content rows remain Plate forks.
- 48 modified rows and 16 renamed rows map to retained registry/docs owners and
  need selective review.
- 65 renamed rows reorganize create/init product code under the shadcn app;
  settled policy excludes that product flow.
- The registry contract rows establish `shadcn@4.19.0`, three preset bases,
  `@shadcn/react`, sharded component maps, and new source checks.
- The docs-engine rows add pre-hydration sidebar scroll restoration, stable
  selection for duplicate active links, a Fumadocs package refresh, and
  typeset-specific styling. Only the scroll/active-link behavior maps cleanly
  to Plate's retained docs navigation.

### Renamed Files

- 91 rows are renames: 65 reorganize excluded create/init product code, 16
  belong to the selectively reviewed base-source set, five are upstream
  examples, four are Plate-forked preview routes, and one is Plate-forked docs
  content.

## Recommended Merge Slices

| Order | Slice | Class | Files | Why | Verification |
| ---: | --- | --- | --- | --- | --- |
| 1 | `registry-preset-contract` | `smart-merge` | `apps/www/package.json`, `pnpm-lock.yaml`, registry build/routes, source-only registry checks/tests | Keep shadcn 4.19.0 for current preset inventory while Plate supports only Base/Radix. Build the canonical Base graph once, build the four-item Radix overlay once, and materialize complete supported-style responses without Aria fallback. | `pnpm install`; registry source check; build-target/response/variant tests; `pnpm --filter www build:registry`; isolated Base/Radix installs and compiler comparison. |
| 2 | `docs-sidebar-scroll` | `smart-merge` | `apps/www/src/components/docs-nav.tsx` plus the smallest client-safe scroll owner/test | Port upstream's pre-hydration scroll restoration and longest-active-route selection into Plate's accordion/filter/locale navigation. Preserve EN/CN hrefs and open-section state. | Focused lint/typecheck; Browser proof on long EN and CN docs routes, reload, back/forward, duplicate-prefix routes, filtering, and console logs. |
| 3 | `fumadocs-source-refresh` | `smart-merge` | Fumadocs versions in `apps/www/package.json`/lockfile and Plate source/config adapters only where required | Move from core/ui 16.9.3 and MDX 15.0.10 to upstream's 16.10.5/15.0.12 contract while preserving `collections/server`, dynamic/async source modes, CN locale mapping, and Plate metadata overlays. | `pnpm install`; `build:source`; docs parity; `www` typecheck; Browser proof on EN/CN MDX and registry fallback pages plus search. |
| 4 | `calendar-v9` | `smart-merge`, defer | `apps/www/src/components/ui/calendar.tsx`, React DayPicker dependency, focused Calendar proof | Upstream's `table` to `month_grid` fix is valid only after Plate accepts a DayPicker v9 migration. It is not a micro-fix against Plate v8. | Focused Calendar tests/typecheck and browser interaction for navigation, range selection, outside days, and month dropdown. |

## Explicit Exclusions

- Do not vendor `@shadcn/react` or copy the 374 upstream base primitive/example
  files. `shadcn/preset` is the contract Plate needs.
- Do not restore tracked `base-luma`, `base-lyra`, or other style source trees.
  Upstream itself deleted them from `apps/v4`.
- Do not copy generated `public/r/**`, schema, or per-style index output.
- Keep v0, create, typeset, charts, theme/customizer, upstream homepage cards,
  and shadcn product examples excluded.
- Keep Plate docs content, API MDX, CN, MCP, Plus/Pro, GA, home/editor demos,
  registry content, lazy registry-source route, and sidebar accordion/filter
  behavior as Plate forks.
- Keep Base as Plate's default editor output. Radix is available through the
  four proven provider boundaries; React Aria routes are unsupported.

## Plate Forks To Preserve

- Plate docs content, API MDX, CN content and routes, committed metadata, MCP,
  and release data.
- Plate home, editor demos, Plus/Pro hooks, GA, product navigation, and product
  copy.
- Plate sidebar accordion/filter/localization behavior; only scroll resilience
  is a merge candidate.
- Plate registry content, `@plate/*` install contract, app-owned Toolbar base
  variants, source-only validation, and CI-owned generated output.
- Lazy `/api/registry-source/[name]` code-view loading, workspace aliases, and
  package integration tests.

## Micro Auto-Merges

N/A. No change met all direct-merge gates.

- Calendar's tiny hunk crosses a React DayPicker major-version boundary.
- Docs TOC/callout class changes depend on upstream's typeset/layout model.
- Sidebar restoration needs a new owner and browser proof.
- Package changes require a lockfile and source-contract verification.

## Smart Merge Details

- 374 `base-registry-source` rows are one source-reference group. The upstream
  provider trees are not copied. Plate uses preset style names as inventory and
  validates its complete Radix/Base installed graphs through Toolbar,
  FloatingPopover, DropdownMenu, and ContextMenu boundaries.
- Five registry-contract rows provide the `shadcn@4.19.0` package/preset/build
  contract. Plate keeps its registry content, URL namespace, builders, and
  source validation.
- Fifteen docs-engine and six docs-shell rows are reviewed selectively. Plate
  takes sidebar scroll/active-link resilience and compatible Fumadocs changes,
  while keeping locale, metadata, content, lazy source, and product routing.
- Two Calendar rows contribute the v9 `month_grid` correction. Plate keeps its
  current v8 Calendar until a named v9 migration is accepted.

## Local owner evidence

- `apps/www/scripts/build-registry.mts` builds one canonical Base graph and one
  sparse Radix overlay; supported style routes materialize those owners.
- `apps/www/src/registry/registry.ts` declares Radix/Base support. Central
  variant metadata owns Toolbar, FloatingPopover, DropdownMenu, and
  ContextMenu variants.
- Installed `shadcn@4.10.0` reports
  `PRESET_BASES=["radix","base"]`; upstream target source reports
  `["radix","base","aria"]` and tag `shadcn@4.19.0`.
- `apps/www/src/components/docs-nav.tsx` owns Plate accordion, filter,
  locale, and active-section behavior but has no scroll-state owner.
- `apps/www/src/components/ui/calendar.tsx` uses React DayPicker v8 class keys;
  upstream's `month_grid` fix targets v9.
- `apps/www/src/lib/source.ts` and `apps/www/source.config.ts` preserve Plate's
  CN, metadata, dynamic/async source, and code-processing requirements.

## Artifacts

- [upstream-name-status.tsv](./upstream-name-status.tsv)
- [upstream-numstat.tsv](./upstream-numstat.tsv)
- [upstream-commits.txt](./upstream-commits.txt)
- [inventory.md](./inventory.md)
- [classification-summary.json](./classification-summary.json)
- [build-inventory.mjs](./build-inventory.mjs)

No `.patch` file or generated registry/template output was created.

## Visual Evidence

N/A for this planning run. The first slice is a source/registry contract fix.
The docs-sidebar and Calendar implementation slices require Browser proof when
accepted; no visual decision was made from screenshots here.

## Questions

No policy question remains. Review the plan and either accept
`registry-preset-contract` or name a different slice/order.

## Status Update Rule

- Set `lastPlannedCommit` to
  `b9938d94635fca7a4560449713b0b1ba87d77bc6`.
- Set `lastPlan` and `lastFullPlan` to this plan.
- Keep `lastSyncedCommit`, `lastSyncedAt`, and `lastSyncPlan` at the June 2
  baseline until accepted slices and final accounting are implemented and
  verified.
- Do not add a `partialSyncs` entry for this planning-only run.

## Review request

Review this plan before implementation. The recommended first accepted slice
is `registry-preset-contract`. Invoke `sync-shadcn` again with this plan path
and that slice after acceptance.

No policy question remains. The only required decision is whether to accept
the recommended first slice or change its order/scope.

## Implementation Result: `registry-preset-contract`

Implemented and corrected through 2026-08-25 after the user accepted the
recommended first slice and required a complete Base surface.

- Upgraded `apps/www` from exact `shadcn@4.10.0` to `4.19.0` and updated the
  lockfile.
- Kept `shadcn/preset` as the upstream catalog and declared Plate's supported
  subset explicitly: Radix and Base. React Aria routes and author source fail
  closed because the installed Plate graph does not support them.
- Built docs and common registry items once. Base owns the canonical graph.
  The Radix overlay contains only `toolbar`, `floating-popover`,
  `editor-dropdown-menu`, and `editor-context-menu`.
- Preserved Plate registry content, `@plate` namespace semantics, and
  `/r/{style}/{name}.json`. Plate self-dependencies resolve through the
  requested supported style.
- Routed provider-sensitive popover, dropdown, and context-menu consumers
  through the four interaction adapters.
- Kept the 11 `*-classic` items canonical and maintenance-only. Every public
  classic item installs through Base and Radix without provider-specific
  assembly copies. Did not copy `@shadcn/react`, the 374 base-source rows, or
  edit templates.

Verification:

- CLI/preset readback: `4.19.0`; its `radix/base/aria` list remains upstream
  inventory, not Plate compatibility.
- Registry source check passed.
- Focused registry contract tests pass.
- Isolated shadcn 4.19 consumers install all 380 public items under Base and
  Radix. The four adapter owners typecheck under both providers, and normalized
  full `tsc -b` diagnostics have no provider-only rows.
- `pnpm --filter www build:registry` built the canonical Base graph once and
  the four-item Radix overlay.

This is a partial sync. `docs-sidebar-scroll`, `fumadocs-source-refresh`, and
`calendar-v9` remain deferred. `lastSyncedCommit`, `lastSyncedAt`, and
`lastSyncPlan` remain on the June 2 baseline; only a complete accepted
accounting may advance them.
