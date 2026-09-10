### `dashboard`

Use `sync-shadcn dashboard` when the user wants a visual decision board for
the shadcn sync delta instead of prose status output.

Purpose:

- render feature-owned sync deltas grouped by product surface, such as header,
  home, editors, releases, command menu, registry, create, preview routes, and
  sidebar
- show review states that can be re-decided later: `pending`, `defer`,
  `fork`, `rejected`, and `synced`
- keep settled exclusions visible in the dashboard without polluting routine
  `status` output
- make user review possible through a local static HTML artifact
- include browser-only state controls, note textareas, and a copy button that
  builds a concise `$sync-shadcn apply` payload
- include quick row actions in two rows: `Ask`, `Defer`, then `Sync`,
  `Reject`, `Fork`; `pending` is a state/filter, not a row action
- keep note textareas locked until the user chooses an explicit row intent:
  `Ask`, a quick apply action, or a changed state value
- render review actions as selected controls; `Sync` copies an
  `$sync-shadcn apply` row targeting `synced`, which means implementation mode
  for that row
- render `Fork` as an implementation-capable action too: copied payloads
  targeting `fork` mean "make or verify the Plate-owned fork", not "metadata
  only"
- use `suggestion` as the durable item field for Plate-owned recommendation
  text, rendered as `Suggestion` in the dashboard with an explicit `Apply`
  action that copies that suggestion into `Note`
- treat `Ask` as question-only: it keeps the current row state, writes the row
  under `Questions`, and must not mutate `deltas.json`
- treat question-only notes as questions to answer in chat, not as decisions to
  apply to `deltas.json`; only rows under `Rows` in a `$sync-shadcn apply`
  payload should mutate structured state
- open on the actionable filter by default:
  `pending` and `defer`; keep `synced`, `rejected`, and `fork` available
  behind explicit filters
- split state filters into an Action row and a Done row so active review work
  is visually separate from settled policy/history
- render Suggestion and shadcn screenshot columns for non-`synced` review rows when
  row screenshot paths exist, with click-to-zoom and close behavior in the
  static HTML page
- remove screenshot refs for `synced` and `rejected` rows during dashboard
  generation, and delete unreferenced local screenshot files; keep screenshot
  evidence for `fork` rows because forked differences stay useful
- render one card per delta item instead of a wide table, with Suggestion vs shadcn
  text in two responsive columns and empty screenshot areas hidden
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
- delegate implementation to `task`
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

Dashboard output shape:

```md
Dashboard: docs/sync/shadcn/dashboard.html
Data: docs/sync/shadcn/dashboard.json
Opened: file:///.../docs/sync/shadcn/dashboard.html

| Feature | State | Items |
| --- | --- | ---: |
| Registry | defer | 2 |
```

