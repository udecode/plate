# Review Board (`dashboard`, `drift`, `compat`)

Visual decision board for shadcn sync deltas. Permissions and `deltas.json` item state definitions (`synced`, `defer`, `pending`, `fork`, `rejected`) live in [policy](./policy.md).

## Data Model and Build Gates

- `docs/sync/shadcn/deltas.json` is the editable decision source; `docs/sync/shadcn/dashboard.json` and `docs/sync/shadcn/dashboard.html` are generated views.
- Use `suggestion` as the durable recommendation field (rendered with an `Apply` button that copies it into `Note`). Never use an item-level `next` field; workflow guidance comes from item state, `decision`, `suggestion`, and group summary.
- **Plan slice coverage:** planning adds each slice in `lastPlan`'s `## Recommended Merge Slices` table as `pending` ([planning](./planning.md)); the build fails while any slice has no item.
- **Site UI drift coverage:** the build compares every file in `apps/www/src/components/ui` against `apps/v4/registry/new-york-v4/ui` at `status.json`'s `uiSyncedCommit`, ignoring formatting, imports, comments, and formatter/lint rewrites (class, prop, and key order). It fails while any differing file is unlisted by a `pending`, `defer`, `fork`, or `rejected` item's `files` (`synced` does not cover a differing file; matching files need no item). All site UI files share one `uiSyncedCommit`: to pull a newer commit, advance `uiSyncedCommit`, rebuild, and give each newly differing file an item.
- **Create compatibility coverage:** the build reads every `shadcn create` option at `../shadcn`'s `origin/main` (fetch first; header displays commit and date):
  - each base in `PRESET_BASES`, each `PRESET_FIELDS_V2` field, each value of `style`, `iconLibrary`, and `menuColor` (code-changing fields need per-value verdicts; CSS-variable-only fields take one `preset:` verdict), each install marker in the style map's `ALLOWLIST`, and each install transformer `update-files.ts` passes to `transform(...)`.
  - Feature `create-compat` (and no other feature) records verdicts via `options`, using ids like `base:aria`, `preset:radius`, `style:nova`, `icon:tabler`, `menu:inverted`, `marker:cn-menu-target`, `transform:transformMenu`.
  - Served Plate values come from `PLATE_REGISTRY_BASES`, `PLATE_REGISTRY_STYLE_NAMES`, `ICON_PLACEHOLDER_LIBRARIES`, and `SHADCN_INSTALL_MARKERS`.
  - Build fails if an upstream option lacks an item, an item lists a removed option, two items share an option, an option item lacks `decision` or `evidence`, or a Plate-served value lacks a `synced`/`fork` item.
- When adding a landed slice, update `status.json` first, update `deltas.json`, then rebuild. When rejecting, deferring, or forking, record upstream behavior, suggestion, owner files, and rationale in `deltas.json`.
- For non-`synced` visual rows, set `screenshots.suggestion` and `screenshots.shadcn` when available; leave source-only rows blank. HTML review controls are intentionally non-persistent: the user copies the generated prompt back to `sync-shadcn apply`.

## Commands

```bash
pnpm sync-shadcn dashboard              # rebuilds and opens browser (--no-open or SYNC_SHADCN_NO_OPEN=1 for non-GUI)
pnpm sync-shadcn drift                  # lists differing site UI files, diff line counts, and items (writes nothing)
pnpm sync-shadcn drift <component>      # prints one file's diff, e.g. card (writes nothing)
pnpm sync-shadcn compat [--ref <ref>]   # lists create options at origin/main or <ref>, Plate support, state, item; exits 1 on dashboard gate errors (writes nothing)
```
