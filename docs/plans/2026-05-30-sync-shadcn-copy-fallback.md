# sync shadcn copy fallback

Objective:
Apply the accepted `sync-shadcn` rows for `mdx/code-command-yarn-tab` and
`mdx/copy-button-fallback`: keep the already-synced yarn tab row verified,
implement upstream-style copy fallback semantics for Plate copy helpers, mark
the copy fallback row synced, and regenerate the sync dashboard.

Completion threshold:
Complete when `code-command-yarn-tab` and `copy-button-fallback` both resolve to
`synced` in `docs/sync/shadcn/deltas.json` and `docs/sync/shadcn/dashboard.json`,
the copy helpers use a hidden-textarea fallback and only show copied state after
successful writes, yarn command support remains wired through command props,
types, config, and copy UI, the dashboard is regenerated, `lastSyncedCommit`
stays unchanged, and all verification commands recorded below pass.

Verification surface:
- `apps/www/src/components/copy-button.tsx`
- `apps/www/src/components/code-block-command.tsx`
- `apps/www/src/components/command-menu.tsx`
- `apps/www/src/lib/rehype-npm-command.ts`
- `apps/www/src/types/unist.ts`
- `apps/www/src/hooks/use-config.ts`
- `docs/sync/shadcn/deltas.json`
- `docs/sync/shadcn/dashboard.json`
- `docs/sync/shadcn/status.json`

Constraints:
- Do not run `build:registry`.
- Do not advance `docs/sync/shadcn/status.json:lastSyncedCommit`.
- Do not mutate unrelated sync rows.
- Preserve Plate analytics and dropdown copy helpers while adopting upstream
  success semantics.

Boundaries:
- In scope: source edits for copy behavior, sync row state, dashboard
  regeneration, and this closeout plan.
- Out of scope: broader MDX primitive adoption, screenshots for unrelated rows,
  registry output, baseline advancement, and unrelated shadcn deltas.

Blocked condition:
Blocked only if the copy helper change cannot pass `www` typecheck, the
dashboard cannot regenerate from `deltas.json`, or row state cannot be verified
in both durable JSON surfaces.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| `autogoal` loaded and active goal created | yes | Active goal created for the two accepted rows before mutable edits. |
| `sync-shadcn apply` mode established | yes | User requested explicit `pending -> synced` row transitions. |
| Current row state read | yes | `deltas.json` showed yarn already `synced` and copy fallback awaiting sync. |
| Upstream reference checked | yes | `../shadcn/apps/v4/components/copy-button.tsx` confirmed fallback and success-gated behavior. |
| Baseline semantics read | yes | `status.json` keeps `lastSyncedCommit` at `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`. |

Work Checklist:
- [x] Verified `code-command-yarn-tab` already has local yarn command support.
- [x] Added hidden-textarea fallback for restricted clipboard environments.
- [x] Made `copyToClipboardWithMeta` return a success boolean.
- [x] Gated copied state on successful clipboard writes in copy buttons.
- [x] Preserved Plate copy analytics and dropdown helpers.
- [x] Marked `copy-button-fallback` synced in `deltas.json`.
- [x] Regenerated `docs/sync/shadcn/dashboard.html` and `dashboard.json`.
- [x] Verified row state, JSON parse, source evidence, lint, and `www` typecheck.
- [x] Left `lastSyncedCommit` unchanged because only selected rows were applied.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Accepted row state | yes | Verify both requested rows are `synced` | Dashboard JSON extraction returned both rows with `state: synced`. |
| Yarn row preservation | yes | Verify yarn source wiring remains present | `rg` found `__yarnCommand__`, yarn config union, and yarn command tab/copy support. |
| Copy fallback behavior | yes | Verify fallback and success-gated state exist | `rg` found `legacyCopyToClipboard`, async copy helper, awaited copy calls, and gated state updates. |
| Dashboard regeneration | yes | Run sync dashboard builder | `pnpm sync-shadcn dashboard` completed and wrote dashboard HTML/JSON. |
| JSON validity | yes | Parse durable sync JSON | Node parsed `deltas.json` and `dashboard.json` successfully. |
| Source typecheck | yes | Run app typecheck after lint fix | `pnpm --filter www typecheck` passed after final lint formatting. |
| Lint formatting | yes | Run repo lint fixer | `pnpm lint:fix` passed after checking 3154 files. |
| Dashboard script syntax | yes | Check dashboard builder syntax | `node --check .agents/rules/sync-shadcn/scripts/build-dashboard.mjs` passed. |
| Baseline advancement | no | Keep sync baseline unchanged | `status.json` still reports `lastSyncedCommit` `4a4dc8eb0fc793d8e9225e780183ad605f15d2c2`. |
| Browser proof | no | No visible layout change in this apply slice | Copy behavior is source/typechecked; no screenshot needed for this row. |
| Registry/template output | no | Avoid CI-controlled generated registry/template output | No registry build or template edit performed. |
| Goal plan complete | yes | Run autogoal completion check | Recorded for final closeout. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and baseline read | done | Row states and status baseline read | none |
| Implementation | done | Copy fallback and success-gated state implemented | none |
| Sync metadata | done | `copy-button-fallback` marked synced and dashboard regenerated | none |
| Verification | done | Typecheck, lint, JSON, syntax, and source audits passed | none |
| Closeout | done | This plan records final evidence | none |

Verification evidence:
- `pnpm sync-shadcn dashboard` passed and wrote
  `docs/sync/shadcn/dashboard.html` plus `docs/sync/shadcn/dashboard.json`.
- `node --check .agents/rules/sync-shadcn/scripts/build-dashboard.mjs` passed.
- Node JSON parse passed for `docs/sync/shadcn/deltas.json` and
  `docs/sync/shadcn/dashboard.json`.
- Dashboard JSON extraction returned `code-command-yarn-tab` and
  `copy-button-fallback` with `state: synced`.
- Focused `rg` audit found yarn command plumbing and copy fallback/success
  semantics in the source files listed above.
- `pnpm lint:fix` passed after checking 3154 files.
- `pnpm --filter www typecheck` passed after the lint formatting pass.

Reboot status:
The apply slice is complete. If resumed, only run the autogoal completion check
and close the active goal; no implementation or metadata work remains.

Open risks:
None for these two rows. Remaining MDX and Code Primitive rows are separate
dashboard work and intentionally remain outside this apply slice.
