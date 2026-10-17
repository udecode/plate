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
- read and update `docs/sync/shadcn/deltas.json`
- write `docs/sync/shadcn/dashboard.json`
- write `docs/sync/shadcn/dashboard.html`

Dashboard mode must not:

- patch `apps/www`
- write `docs/sync/shadcn/runs/**`
- change `lastSyncedCommit`, `lastPlannedCommit`, `lastPlan`, or
  `partialSyncs`
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
