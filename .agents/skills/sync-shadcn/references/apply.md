# Accepted Slice Application (`apply`)

Applies a pasted dashboard review payload. Permissions and `deltas.json` state meanings live in [policy](./policy.md).

## Payload Shape

```md
$sync-shadcn apply

- command-menu/command-footer-shortcuts (Command Menu / Footer shortcuts and copy payloads): defer -> pending note: Add copy only for components and editor kits.

Questions:
- registry/registry-review (Registry / Full registry review): Which registry rows should include copy shortcuts?
```

## Rules

- Direct bullet rows under `$sync-shadcn apply` (or optional `Rows` heading) are the only mutation units. Never infer decisions for unlisted rows.
- Rows under `Questions` (or question-only notes) are answered in chat without mutating `deltas.json`.
- Target states `pending`, `defer`, and `rejected` are metadata decisions.
- Target state `synced` is implementation mode: inspect row files and suggestion, implement the change, run focused verification, then update `deltas.json` to `synced`.
- Target state `fork` is implementation mode when the note, suggestion, or files imply work in Plate; verify/implement before marking `fork`. Metadata-only `fork` is allowed only when the Plate fork already exists, the note asks for no code/content work, and source evidence is verified first.
- Never mark `synced` or `fork` before implementation is present and verified. Ask one focused question only when target behavior is unclear; do not ask for review when files, suggestion, and acceptance criteria are clear.
- Use row notes to update `decision`, `suggestion`, or summary text when appropriate.
- On `synced` or `rejected`, remove the row's `screenshots` object and delete unreferenced local screenshot files under `docs/sync/shadcn/runs/**`. Keep screenshots for `fork` rows.
- When a `synced` row takes a file in `apps/www/src/components/ui` from a newer upstream commit, advance `status.json`'s `uiSyncedCommit` and add a `pending` item for each site UI file that differs at the new commit and has no item ([dashboard](./dashboard.md)).
- After any JSON mutation, run `pnpm sync-shadcn dashboard`.
