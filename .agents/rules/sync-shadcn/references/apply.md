### `apply`

Use `sync-shadcn apply` when the user pastes a dashboard review payload.

Purpose:

- apply rows listed directly under `$sync-shadcn apply` or under an optional
  `Rows` heading
- answer rows listed under `Questions` in chat without mutating
  `deltas.json`
- keep the copied dashboard prompt short by storing the mutation contract in
  this command

Apply mode may:

- read and update `docs/sync/shadcn/deltas.json`
- patch `apps/www`, `content/docs`, and related source files when a listed row
  targets `synced` or `fork`
- delegate a coherent implementation slice to `task` when a `synced` or `fork`
  row needs more than a tiny local edit
- remove screenshot refs for rows applied to `synced` or `rejected`
- delete unreferenced local screenshot files under `docs/sync/shadcn/runs/**`
- run `pnpm sync-shadcn dashboard` after any JSON mutation

Apply mode must not:

- write `docs/sync/shadcn/runs/**` except deleting unreferenced screenshots
- change `lastSyncedCommit`, `lastPlannedCommit`, `lastPlan`, or
  `partialSyncs`
- infer decisions for rows not listed in the pasted payload
- mutate `deltas.json` for question-only rows
- mark a row `synced` or `fork` before implementation is present and verified
- ask for review when the row has clear files, suggestion, and acceptance
  criteria; ask one focused question only when the target behavior is unclear

Payload shape:

```md
$sync-shadcn apply

- command-menu/command-footer-shortcuts (Command Menu / Footer shortcuts and copy payloads): defer -> pending note: Add copy only for components and editor kits.

Questions:
- registry/registry-review (Registry / Full registry review): Which registry rows should include copy shortcuts?
```

Apply rules:

- A direct bullet row under `$sync-shadcn apply`, or under an optional `Rows`
  heading, is the only mutation unit.
- Set each listed item state to the requested target state.
- Target states `pending`, `defer`, and `rejected` are metadata decisions.
- Target state `synced` is implementation mode: inspect the row files and
  suggestion, implement the requested change, run focused verification, then
  update `deltas.json` to `synced`.
- Target state `fork` is also implementation mode when the row's note,
  suggestion, or files imply work in Plate. Inspect the row files and
  suggestion, implement or verify the intentional Plate-owned fork, run focused
  verification, then update `deltas.json` to `fork`.
- A `fork` update may be metadata-only only when the Plate fork already exists,
  the row note does not ask for code/content work, and the source evidence is
  checked before updating `deltas.json`.
- Use notes to update `decision`, `suggestion`, or summary text when
  appropriate.
- If a note is only a question, keep it under `Questions`, answer it in chat,
  and do not mutate JSON.
- When applying `synced` or `rejected`, remove that row's `screenshots` object
  and delete unreferenced local screenshot files.
- Keep screenshots for `fork` rows.
- If any row is applied, run `pnpm sync-shadcn dashboard`.

