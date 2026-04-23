---
date: 2026-04-15
topic: slate-v2-decoration-wave-9-execution
status: in_progress
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
---

# Goal

Execute Wave 9 from the decoration roadmap:
core change metadata and touched runtime-id publication.

# Scope

- `packages/slate` core listener/change publication
- compatibility impact on existing `Editor.subscribe(...)` consumers
- targeted tests and follow-up docs only where the implementation forces it

# Constraints

- no scope reduction
- old listener usage must keep working
- no fake “post-RC” dodge; this is the active next decoration wave
- must end with fresh verification, architect review, deslop, and post-deslop
  re-verification

# Phases

- [x] Ground context and wave scope
- [x] Audit listener consumers and choose the change-record shape
- [x] Implement Wave 9 core publication
- [x] Verify with targeted and package-level evidence
- [x] Architect review
- [x] Deslop + post-deslop re-verification

# Findings

- `docs/shared/agent-tiers.md` is missing in this repo
- current core publishes only `snapshot` to listeners
- current listener consumers in `slate-react` mostly ignore payloads and just
  recompute broadly
- `slate-history` is the highest-risk existing consumer because it reacts to
  selection/content deltas from snapshot subscriptions
- smallest defensible listener contract stayed additive:
  `SnapshotListener(snapshot, change?)`
- Wave 9 implementation landed a conservative `SnapshotChange` record with:
  - `classes`
  - `dirtyPaths`
  - `dirtyScope`
  - `touchedRuntimeIds`
  - `childrenChanged`
  - `selectionChanged`
  - `marksChanged`
  - `operations`
  - `replaceEpoch`
- touched runtime ids are intentionally narrow in Wave 9:
  - exact text runtime ids for `insert_text` / `remove_text`
  - `[]` for selection-only and marks-only changes
  - `null` for replace and broad structural invalidation
- `buildSnapshotChange(...)` now publishes once from both the fast text path
  and the transaction publish path
- the markdown-preview backspace regression was fixed in the same batch because
  it lived in the touched selection/Editable package surface
- architect review caught a remaining immutable-snapshot contract hole:
  the direct text fast path was storing a mutable transformed selection in the
  committed snapshot
- the fix clones and freezes direct-path selections before publishing the
  snapshot, matching the transaction materialization path
- the final root fix introduced frozen point/range helpers and switched both
  snapshot publishers to them, so committed snapshot selections now deep-freeze
  point paths too

# Progress

## 2026-04-15

- created the Ralph context snapshot and execution note
- audited live `Editor.subscribe(...)` consumers across:
  - `slate-history`
  - `Slate`
  - `useSlateSelector`
  - projection / annotation / widget stores
  - existing snapshot and transaction tests
- implemented Wave 9 across:
  - `packages/slate/src/interfaces/editor.ts`
  - `packages/slate/src/interfaces.ts`
  - `packages/slate/src/index.ts`
  - `packages/slate/src/core/transaction-helpers.ts`
  - `packages/slate/src/core/apply.ts`
  - `packages/slate/src/core.ts`
  - `packages/slate/test/snapshot-contract.ts`
- updated the public editor API docs:
  - `docs/api/nodes/editor.md`
- fixed the markdown-preview projected-bold backspace regression and added a
  browser proof row:
  - `packages/slate-react/src/components/editable.tsx`
  - `playwright/integration/examples/markdown-preview.test.ts`
- fresh evidence so far:
  - `pnpm exec mocha --require ./config/babel/register.cjs ./packages/slate/test/snapshot-contract.ts` → `188 passing`
  - `pnpm exec mocha --require ./config/babel/register.cjs ./packages/slate-history/test/history-contract.ts` → `35 passing`
  - `pnpm install`
  - `pnpm turbo build --filter=./packages/slate`
  - `pnpm turbo typecheck --filter=./packages/slate`
  - `pnpm lint:fix`
  - `bash ./scripts/run-slate-browser-local.sh 3100 /examples/markdown-preview "pnpm exec playwright test playwright/integration/examples/markdown-preview.test.ts --project=chromium --workers=1"` → `3 passed`
  - `lsp_diagnostics` on the affected Slate files → `0 errors`
- deslop re-audit result:
  - no further dead code, duplicate logic, or pointless abstraction worth
    changing after the immutable-selection fix
- final architect outcome:
  - `APPROVED`

# Errors

- no current open errors on the Wave 9 implementation
