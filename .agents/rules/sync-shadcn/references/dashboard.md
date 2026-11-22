### `dashboard`

Use `sync-shadcn dashboard` when the user wants a visual decision board for
the shadcn sync delta instead of prose status output.

Purpose:

- use `suggestion` as the durable item field for Plate-owned recommendation
  text, rendered as `Suggestion` in the dashboard with an explicit `Apply`
  action that copies that suggestion into `Note`
- do not use an item-level `next` field in `deltas.json`; status and workflow
  guidance should come from item state, decision, suggestion, and group summary

Dashboard mode may:

- read `docs/sync/shadcn/status.json`
- read the upstream clone at `status.json`'s `uiSyncedCommit`, and at
  `origin/main` for the create options
- read and update `docs/sync/shadcn/deltas.json`
- write `docs/sync/shadcn/dashboard.json`
- write `docs/sync/shadcn/dashboard.html`

Dashboard mode must not:

- patch `apps/www`
- write `docs/sync/shadcn/runs/**`
- change `lastSyncedCommit`, `lastPlannedCommit`, `lastPlan`,
  `uiSyncedCommit` or `partialSyncs`
- treat a dashboard item as user acceptance to implement

State meanings:

- `synced`: the slice was accepted, implemented, and verified.
- `defer`: the item is acknowledged but intentionally postponed.
- `pending`: the item has no final decision yet, including rows waiting on a
  user decision.
- `fork`: Plate intentionally keeps a different implementation, and that
  implementation is present or has been verified before the row is marked fork.
- `rejected`: upstream behavior is explicitly excluded.

Dashboard source:

- `docs/sync/shadcn/deltas.json` is the editable structured decision source.
- Planning adds each slice of its plan as a `pending` item, as
  [Planning](./planning.md) step 6 says. The build fails while a slice in
  `lastPlan`'s `## Recommended Merge Slices` table has no item.
- Planning sees only what upstream changed in a range, so the build also
  compares each file in `apps/www/src/components/ui` with
  `apps/v4/registry/new-york-v4/ui` at `uiSyncedCommit`. The comparison
  ignores formatting, imports, comments and the orders Plate's formatter and
  lint rewrite, such as class, prop and key order. The build fails while a
  file differs and no `pending`, `defer`, `fork` or `rejected` item lists it
  in `files`. A `synced` item does not cover a file that still differs, and a
  file that matches needs no item.
- All site ui files compare against one commit. To take a file from a newer
  upstream commit, move `uiSyncedCommit` to that commit, rebuild, and give
  each file that then differs an item.
- Planning and the ui comparison see only files Plate copied, so the build
  also reads every option `shadcn create` offers at the clone's `origin/main`:
  each base in `PRESET_BASES`, each `PRESET_FIELDS_V2` field, each value of the
  `style`, `iconLibrary` and `menuColor` fields, each install marker in the style map's
  `ALLOWLIST`, and each install transformer that `update-files.ts` passes to
  `transform(...)`. An item of feature `create-compat` records Plate's verdict
  on an option by listing its id in `options`, and no other feature's items
  take `options`. Option ids look like `base:aria`, `preset:radius`,
  `style:nova`, `icon:tabler`, `menu:inverted`, `marker:cn-menu-target` or
  `transform:transformMenu`. The values of `style`, `iconLibrary` and
  `menuColor` change the code the CLI writes, so each value takes a verdict.
  Every other field writes only CSS variables, so it takes one `preset:`
  verdict and its new values need none. The values Plate serves are those of
  `PLATE_REGISTRY_BASES`, `PLATE_REGISTRY_STYLE_NAMES`,
  `ICON_PLACEHOLDER_LIBRARIES` and `SHADCN_INSTALL_MARKERS`. The build fails
  while an upstream option has no item, an item lists an option upstream no
  longer has, two items list one option, an item that lists options has no
  `decision` or `evidence`, or a value Plate serves has no `synced` or `fork`
  item. Fetch the clone first, because the check reads `origin/main` as the
  clone has it. The dashboard header shows the commit and its date.
- `docs/sync/shadcn/dashboard.json` and
  `docs/sync/shadcn/dashboard.html` are generated views.
- When adding a landed implementation slice, update `status.json` first, then
  add or update the matching `deltas.json` feature row, then regenerate the
  dashboard.
- When rejecting, deferring, or forking a feature, record the upstream behavior,
  suggestion, owner files, and state rationale in `deltas.json`.
- For non-`synced` visual rows, add screenshot paths under
  `screenshots.suggestion` and `screenshots.shadcn` when available. Leave
  source-only rows blank.
- The HTML review controls are intentionally not persistent. The user can mark
  many rows, copy the generated prompt, and send it back; Codex applies the
  JSON edits and regenerates the dashboard.

Dashboard command:

```bash
pnpm sync-shadcn dashboard
```

This regenerates `dashboard.html` and opens it in the local browser. Use
`--no-open` or `SYNC_SHADCN_NO_OPEN=1` when running in a non-GUI check.

```bash
pnpm sync-shadcn drift
pnpm sync-shadcn drift <component>
```

The first lists each site ui file that differs from upstream, with its count
of differing lines and the items that list it. The second prints one file's
difference, such as `pnpm sync-shadcn drift card`. Neither writes a file.

```bash
pnpm sync-shadcn compat
pnpm sync-shadcn compat --ref <ref>
```

This lists each create option at `origin/main`, or at `<ref>`, with whether
Plate serves it, its state and its item, and the shadcn commit it read. It
exits 1 with each problem the dashboard would fail on. It writes no file.
