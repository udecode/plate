# Sync Policy

## Mode Permissions Matrix

Every mode reads `docs/sync/shadcn/status.json` and never treats a plan slice, deferred item, dashboard row, or fresh review as user acceptance to implement. Never advance `lastSyncedCommit` until all baseline gates pass.

| Mode | Fetches / reads | Writes | `apps/www` edits | `status.json` mutations |
| --- | --- | --- | --- | --- |
| `planning` (default/scoped) | Fetch/pull `../shadcn`, read `status.json` & `decisions.md` | Active plan, `docs/sync/shadcn/runs/<range>/`, `deltas.json` (`pending` items), rebuild dashboard | Qualifying micro-overlap direct merges only (never on explicit planning-only) | `lastPlannedCommit`, `lastPlan`; `partialSyncs` for micro-merges; never `lastSyncedCommit` |
| `status` | Read `status.json`, `lastPlan`, `inventory.md`, latest run dir; optional fetch + `compat` | None | None | None |
| `review` | Fetch `../shadcn`, read `status.json`, plan, `inventory.md`, `upstream-name-status.tsv` | Temp diff comparison and dated `review.md` under run dir or `docs/sync/shadcn/reviews/` | None | None |
| `dashboard` (`drift`, `compat`) | Read `status.json`, `../shadcn` at `uiSyncedCommit` and `origin/main`, `deltas.json` | `deltas.json`, `dashboard.json`, `dashboard.html` (`drift` and `compat` write nothing) | None | None |
| `apply` | Read pasted payload, `deltas.json`, `status.json` | `deltas.json`; delete unreferenced local screenshots under `runs/**`; run `pnpm sync-shadcn dashboard` | Only for listed `synced` or `fork` rows requiring code/content work | `uiSyncedCommit` only when a `synced` row updates `apps/www/src/components/ui` from a newer commit; never `lastSyncedCommit`, `lastPlannedCommit`, `lastPlan`, or `partialSyncs` |

## Shared State Definitions

### `docs/sync/shadcn/status.json`

- `lastSyncedCommit`: every upstream change through this SHA has been adopted, smart-merged, intentionally forked, or explicitly excluded.
- `lastPlannedCommit`: latest target SHA with a written sync plan (`lastPlan`).
- `partialSyncs`: accepted slices (and micro-merges) landed before the whole range is accounted for.
- `uiSyncedCommit`: single upstream commit against which `apps/www/src/components/ui` files are diffed.

Advance `lastSyncedCommit` only when all five hold: (1) plan covers every row in the upstream range; (2) all selected implementation slices for that range are complete; (3) all excluded/forked rows are recorded in the plan; (4) verification for touched surfaces passed; (5) user accepted final accounting. When advancing, write `lastSyncedCommit`, `lastSyncedAt` (`YYYY-MM-DD`), `lastSyncPlan`, and `lastVerification`. Never delete older run artifacts under `docs/sync/shadcn/runs/`.

### `docs/sync/shadcn/deltas.json` item states

- `synced`: accepted, implemented, and verified.
- `defer`: acknowledged and intentionally postponed.
- `pending`: no final decision yet, including rows waiting on user decision.
- `fork`: Plate intentionally keeps a different implementation, present or verified before marking `fork`.
- `rejected`: upstream behavior explicitly excluded.

## Micro-Overlap Direct Merge Exception

During planning (unless explicit planning-only), directly merge a tiny upstream fix when all six hold:

- Maps to a retained Plate component, primitive, hook, or utility with a clear local owner (not upstream product content).
- Parent surface is `synced`, an accepted partial sync, or an overlapping primitive (`Button`, `Badge`, `Input`, `Command`, `Tooltip`, `PageHeader`, or copied docs-shell components).
- Tiny diff: one local file, one behavior/class/token/prop/import fix; no new/deleted files, dependencies, routes, data models, generated output, or package/lockfile edits.
- Local Plate file still has the old value or equivalent variant needing the same fix.
- Touches no settled exclusions: v0, charts, upstream color/theme pages and customizer, upstream docs prose, external registry directory content, or generated `public/r/**` output. (Plate `/create`, its preset pickers, and registry styles are accepted surfaces, but their multi-file work never qualifies as a micro-merge.)
- Needs no product judgment (no layout, UX, copy, route, docs-concept, registry-semantics, or multi-file architecture changes).

Qualifying examples: fixing one stale utility class on copied `Button`; applying one bugfix conditional on copied `Command`/`CopyButton`; removing one dead prop/import from a synced component. Non-qualifying (require review): package/lockfile bumps, registry schema/route changes, new/deleted components, docs concepts, multi-file UI chunks, layout rewrites, sidebar/search behavior changes, generated output, or deferred/rejected surfaces.

Procedure when found: (1) log in the plan under `## Micro Auto-Merges` (upstream path, Plate path, diff summary, why it qualifies, verification); (2) patch the Plate file in the same activation; (3) run focused lint/typecheck/source audit plus browser proof if browser-visible on a stable route; (4) record a `partialSyncs` entry without advancing `lastSyncedCommit`; (5) stop for review on all non-micro slices.

## Hard Rules and Completion Gates

- Use source evidence, not vibes: read upstream commits, file status, focused diffs, local Plate files, prior decisions, screenshots for visual surfaces, and solution notes. Record exact upstream SHAs; never say "latest shadcn".
- Prefer upstream docs infrastructure unless Plate has a real product/registry reason to diverge; prefer deleting old Plate fork residue over compatibility layers.
- Close these gates in the active plan:
  - Non-empty upstream range artifacts (or recorded target-only bootstrap exception).
  - `inventory.md` accounts for every row in `upstream-name-status.tsv`; decision counts cover every row.
  - Source-backed Plate mapping for every actionable adoption, fork, exclusion, or question group.
  - `docs/sync/shadcn/status.json` parses and matches completed work.
  - Every row in `## Recommended Merge Slices` has a `deltas.json` item and `pnpm sync-shadcn dashboard --no-open` passed.
  - Browser proof when browser-visible docs UI changed or a visual scope needs Plate-vs-shadcn parity evidence.
  - Header, nav, or search changes have browser proof on `/` and `/cn` at mobile width, with command-menu fallback navigation proved apart from search results.
  - Visual scopes capture comparable screenshots of upstream shadcn and Plate at matching viewport(s) before making/closing a parity call (save screenshots and notes only, no broad `.patch` files), with written deltas (background, spacing, disabled/gray controls, nav/header items, first-viewport framing).
  - Layout parity copies upstream component structure first, then measures deployed shadcn vs Plate at the same viewport recording `x`, `y`, `width`, and `height` for sidebar label, first item, active item, main heading, and TOC title (local `../ui` can differ from deployed DOM; screenshot-only Tailwind tweaks are not parity proof).

## Durable Policy

Read before making decisions:

- `docs/sync/shadcn/status.json` and `docs/sync/shadcn/decisions.md`
- `docs/plans/2026-05-23-shadcn-docs-restart-comparison.md` and `docs/plans/2026-05-24-shadcn-base-migration-progress.md`
- [parity](./parity.md)
- `docs/research/sources/plate-notes/tooling-and-release.md`: entries "A Plate registry dependency has three spellings", "Fumadocs search needs a tokenizer language for every locale key", and "Locale docs routes stay thin and share one renderer"
- [Plate Docs MDX and routes](../../plate-docs/references/mdx.md) for page tree `meta.json` and `_plate.items` metadata

When an accepted sync changes upstream registry style inputs, set `SHADCN_STYLE_SOURCE_COMMIT` in `apps/www/scripts/vendored-shadcn.mts` to the exact reviewed upstream SHA and run `pnpm --filter www exec tsx scripts/sync-shadcn-registry-styles.mts` from repo root. It reads that exact commit in `../shadcn` (ignoring local edits) and writes style CSS, preview classes, provenance hashes, and each base's `toggle` and `tooltip` copies under `apps/www/src/registry/bases/<base>/ui/`; `--check` fails on drift. Verify the style-transform suite before registry generation; never copy style CSS/shadcn components or hand-edit provenance/preview-class output.
