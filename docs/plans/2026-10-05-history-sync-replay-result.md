---
review_scopes: [history, comments]
review_basis: [2026-10-05-history-sync-replay-result]
work_kind: implementation
---

# Synchronous history replay result

Status: awaiting the owner's answer on the round-2 patch; built, reviewed in two plan and two diff panel rounds, and proven on the final bytes
Playbook: plan

**Verdict: Pursue.** `editor.api.history.undo()` and `redo()` should return their result synchronously, with a `pending` variant for the one replay that waits on an external owner. Keep the floating-promise lint on. The Promise carries no information for a document batch. The probe shows the text already reverted when `undo()` returns, and the guide says ordinary batches "settle immediately". Yet it makes every caller write `void` or `await`. HEAD has 101 `await` sites and calls the rest bare. Another session's uncommitted change adds the type-aware lint to `pnpm check`, and its sweep adds `void` to 276 history calls to satisfy `typescript/no-floating-promises`. None of the 12 production call sites waits for the result; only the mounted runtime's internal funnel does. Behind a discarded call, a throwing replay owner surfaces as an unhandled rejection (probe: 1 of 1). The one async case, comment-creation replay, already claims the branch head and publishes `pending` before its first `await`, so a synchronous result describes it exactly. The plan keeps the TaskHub-22 order and the claim lifecycle. It changes the return channel, gives replay failure one owner, and fixes a shipped defect: a throw while settling leaves `pending` set for good, so every later undo returns `busy`.

## Close

**Reversals and deviations.**

- The plan panel's round 2 reverted two round-1 fixes before the build: the Comments subscriber fix (incomplete, it covered one of four listener loops) and the split failure default (it narrowed TaskHub-22 AC5). Every failure keeps its entry, and the Comments listener defect is open work.
- Step 1 asked for two new failing tests. The build added the settlement-throw test and migrated the existing owner-throw test, which pinned the old rejection, instead of writing a duplicate.
- Step 7 asked for `plitejs` and `platejs` changesets. Only the unreleased `plite-history-persistence.md` changeset was amended; Plate exposes the history API only through its `plitejs` re-export.
- `HistoryApi` reaches Plate through `packages/platejs/src/facade.ts`, because the entrypoint graph forbids `platejs/history` importing `plitejs`.
- The build applied the plan panel's three unreviewed proof details, as the owner's Build now answer accepted: the claim version recorded in the commit handler, the migrated mounted rejection test and `build:registry`.
- The diff panel's round-2 fixes are not applied; they wait under Needs you.

**What landed.**

- `editor.api.history.undo()` and `redo()` return `HistoryResult` synchronously. A replay that waits on an effect owner returns `{ status: 'pending', settled }`; `settled` never rejects. `HistorySettlement`, `HistoryOutcome`, `HistoryResult` and `HistoryApi` are root `plitejs` exports.
- An owner or settlement failure after the claim settles `failed`, keeps the entry and reports through the lifecycle error sink, with `reportError` and then `console.error` as fallbacks. A synchronous owner result settles in the call. An owner promise from another realm still goes `pending`.
- The stuck-`pending` defect is fixed: a throwing settlement clears the claim.
- The mounted runtime keeps its timing, checks the claim version History records, removes its focus guards even when the replay throws, and no longer copies the result union or casts through `unknown`.
- About 370 call sites dropped `void` or `await`, including another session's uncommitted sweep, which no longer needs to land. Docs, the Plite reference pages, Vision, the history decision page, the `best-api` rule, the protocol matrix, the changeset and Plate Next doctrine v259 teach the new contract.

**Proof.**

- New tests, each red first or proven by mutation: the settlement throw and owner throw (`docs/research/probes/2026-10-05-history-replay-result/build-proof/red-before.txt`), the foreign-realm owner promise and the synchronous owner throw (`docs/research/probes/2026-10-05-history-replay-result/panel-diff-r1/diff-r1-red.txt`), and two mounted tests (`docs/research/probes/2026-10-05-history-replay-result/build-proof/mounted-mutations.txt`).
- `pnpm --filter plitejs test` and `pnpm --filter platejs test` exit 0 on the final bytes (`docs/research/probes/2026-10-05-history-replay-result/build-proof/final-suites.txt`); typechecks for `plitejs`, `platejs` and `www` exit 0.
- `pnpm exec oxlint --type-aware` over the 104 task files exits 0, so no bare `undo()` call trips `no-floating-promises` (`docs/research/probes/2026-10-05-history-replay-result/build-proof/lint-final.txt`).
- Chromium, five forced warm runs without retries: the Plite donor undo cases and document-state (9 of 9 each run) and the C22 comment route (1 of 1 each run) (`docs/research/probes/2026-10-05-history-replay-result/build-proof/acceptance-plite-5x.txt`, `docs/research/probes/2026-10-05-history-replay-result/build-proof/acceptance-c22-5x.txt`).
- Docs build and source parity pass; the registry regenerated; the migration grep returns nothing outside `settled` waiters; the history-depth benchmark runs as a smoke (`docs/research/probes/2026-10-05-history-replay-result/build-proof/`).

**Limits.** No Firefox, WebKit or device run. The history-depth benchmark ran as a smoke, not a timing comparison. Turbo reused cached partitions whose inputs had not changed. The two round-2 warnings remain until the patch lands.

**Attention.**

reviewed by gpt-6.1-sol

- The Pursue keeps TaskHub-22's server-first and don't-consume criteria as constraints. The research supports the return type, not that server-first comment undo is the best target; that choice stays the `cut the lifecycle` default.
- The Comments listener critical was dismissed on rarity and reload recovery without a runtime reproduction. It stays open work.
- The first version of the round-2 patch skipped the clearing retry on a blocked settlement, so a transient failure could leave `pending` set. The patch was reworked to keep the retry and skip only a repeated report of the same error, and re-proven in a detached worktree and an isolated probe.
- The first patch check claimed a clean typecheck from a filtered `tsc` with no exit status; the reworked check records `tsc` exit 0.
- Two proofs mutated the shared checkout and restored it by byte comparison: the mounted-test mutations and the first patch check. Byte equality does not show that no concurrent session edited those files meanwhile. One scratch command also ran `rm -rf` on a variable path, which `AGENTS.md` forbids; it touched only the throwaway worktree.
- Removing another session's uncommitted `void` sweep across 76 files had no row of its own; it now does, with the backup path.
- The `platejs` changeset skip rests on `.changeset/pre.json`: no shipped beta changeset carries the Promise history API, so Plate beta users see no delta.
- The review record's summary still promises focus repair inside the call, removal of the focus guards and every TaskHub-22 law. The plan supersedes those claims: timing and guards are unchanged, and the Comments listener gap stays open.

**Counts.** 24 items: 8 steps, 13 gates and 3 asks. 23 done, 1 skipped (the `platejs` changeset), 0 blocked, 1 open (the round-2 patch answer).

**Records.** Review `2026-10-05-history-sync-replay-result` and execution `2026-10-05-history-sync-replay-result-execution` (partial, until the round-2 patch answer). The ledger's next item is `reads` (Reads, snapshots and subscriptions).

**Open work.**

- Apply or review the diff panel's round-2 patch. owner: zbeyens, tracked under Needs you.
- The Comments listener, Comments storage-error and lifecycle-fallback items, and staging Comments publication in settlement. owner: zbeyens, tracked in `docs/plans/topics/history.md` Open work.
- An optional discriminated receipt instead of the optional `claimVersion`. owner: zbeyens, tracked in `docs/plans/topics/history.md` Open work.

## Brief

### What did you find?

The Promise did nothing for normal undo, because the text had already changed when `undo()` returned. It forced `void` or `await` at every call and hid an unhandled rejection. The lint was right; the API was wrong.

### What will change?

It already changed: `undo()` and `redo()` return their result in the call, comment-creation replay returns `pending` with a `settled` that never rejects, and about 370 `void`s and `await`s are gone. Type-aware lint passes with bare calls.

### What do you need from me?

One answer: apply the diff panel's last-round patch, review it first, or leave it out.

### What happens if I say go?

I apply the round-2 patch, rerun the history and React partitions, and republish this page. Nothing is committed.

### What could go wrong?

Without the patch, an owner that breaks its declared return type can still wedge undo until reload. No Firefox, WebKit or device run backs the browser claims.

## Public API

A test waiting on a comment-style replay narrows the result instead of awaiting every call.

```ts before
// packages/plitejs/test/history/history-branch-contract.spec.ts
const pending = editor.api.history.undo();
gate.resolve();
assert.deepEqual(await pending, { reason: 'external-diverged', status: 'blocked' });
assert.deepEqual(await editor.api.history.undo(), { status: 'applied' });
```

```ts after
// packages/plitejs/test/history/history-branch-contract.spec.ts (proposed)
const result = editor.api.history.undo();
assert.ok(result.status === 'pending');
gate.resolve();
assert.deepEqual(await result.settled, { reason: 'external-diverged', status: 'blocked' });
assert.deepEqual(editor.api.history.undo(), { status: 'applied' });
```

Application code that needs the final outcome waits only when the replay is pending.

```ts before
// content/docs/(guides)/history.mdx
const result = await editor.api.history.undo();
```

```ts after
// content/docs/(guides)/history.mdx (proposed)
const result = editor.api.history.undo();
const outcome = result.status === "pending" ? await result.settled : result;
```

The result types move to the root entrypoint, beside the effect replay types. They lose the Promise and gain `pending` and `failed` (proposed).

```ts before
// packages/plitejs/src/history/history-plugin.ts
export type HistoryResult =
  | Readonly<{ status: 'applied' | 'empty' }>
  | Readonly<{ status: 'busy' }>
  | Readonly<{ conflicts: readonly string[]; status: 'blocked' }>
  | Readonly<{ reason: string; status: 'blocked' }>;

export type HistoryApi = {
  redo: () => Promise<HistoryResult>;
  undo: () => Promise<HistoryResult>;
};
```

```ts after
// packages/plitejs/src/interfaces/editor.ts (proposed)
/** What a claimed replay settles to. */
export type HistorySettlement =
  | Readonly<{ status: 'applied' }>
  | Readonly<{ reason: string; status: 'blocked' }>
  | Readonly<{ status: 'failed' }>;

/** A replay that has finished. */
export type HistoryOutcome =
  | HistorySettlement
  | Readonly<{ status: 'empty' | 'busy' }>
  | Readonly<{ conflicts: readonly string[]; status: 'blocked' }>;

export type HistoryResult =
  | HistoryOutcome
  | Readonly<{
      /** Resolves once its owner finishes. Never rejects. */
      settled: Promise<HistorySettlement>;
      status: 'pending';
    }>;

export type HistoryApi = {
  redo: () => HistoryResult;
  undo: () => HistoryResult;
};
```

History's preconditions, such as a replay inside a transaction, and a document replay's own update still throw, like any `editor.update`. Once a session batch is claimed, an owner or settle failure, synchronous or not, settles `failed`, keeps the entry at the head and reports to the editor's lifecycle error sink instead of rejecting (proposed). With no sink set, the report goes to `globalThis.reportError` when the platform has it, and to `console.error` otherwise.

```ts before
// packages/plitejs/src/history/history-plugin.ts
let ownerResult;
try {
  ownerResult = await sessionHistory.replay(editor, sessionEffect.value);
} catch (error) {
  // blocked settlement, then
  throw error;
}
```

```ts after
// application code (proposed)
const editor = createEditor({
  lifecycleErrorSink: (error) => reportToTelemetry(error.cause),
});
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| `HistorySettlement`, `HistoryOutcome`, `HistoryResult`, `HistoryApi` move to root | Plite | `plitejs` (`interfaces/editor.ts`) | Root already owns `EditorEffectHistoryReplayResult` and the replay receipt; `plitejs/react` may depend only on root, dom and annotations (`tooling/entrypoints/entrypoint-dag.mjs`) |
| `undo()`/`redo()` return synchronously; a synchronous owner settles in the call | Plite | `plitejs/history` | History owns replay order and already claims synchronously |
| Any owner or settle failure after the claim keeps the entry at the head, clears `pending` and settles `failed` | Plite | `plitejs/history` | TaskHub-22 AC5: a thrown replay does not consume its entry |
| The private replay receipt carries the claim commit version | Plite | `plitejs` (`core/public-state.ts` receipt) | Only History knows which commit was the claim; the runtime's after-the-call reading can miss a commit made between claim and return |
| Replay failure reports through `reportEditorLifecycleError` with a `history` variant that falls back to `globalThis.reportError` when present | Plite | `plitejs` (`core/lifecycle-error.ts`, `interfaces/editor.ts`) | One error owner; the fallback keeps failures as visible as today's mounted path |
| Mounted dispatch consumes the synchronous result and keeps today's continuations: repair one microtask after the call, callbacks in the following reaction; the hand-copied union and casts go | Plite | `plitejs/react` | Synchronous repair has no user-visible job, since only microtasks run in that gap |

## Hard cuts and app migration

`Promise<HistoryResult>` is removed from `editor.api.history.undo()` and `redo()` with no alias. `HistoryResult` and `HistoryApi` leave `plitejs/history` for the root entrypoint; nothing outside `history-plugin.ts` imports them today (`git grep` over `packages`).

The plan's base is HEAD `36c2f43170`. The working tree also holds another session's uncommitted change: `tooling/scripts/check.mjs` adds a `lint-type-aware` step, and its sweep adds `void` to 276 history calls. Under this plan those `void`s are unnecessary, and each such call goes back to a bare call. Build copies every file that holds that session's uncommitted work to scratch before editing it, per `AGENTS.md`.

Callers that break or change:

- 12 production call sites in five `apps/www` files: `yjs-collaboration.tsx`, `yjs-hocuspocus.tsx`, `collaboration-demo.tsx`, `document-state.tsx` (through `historyPortal.api`) and `authored-changes.tsx`, which returns the call to `onClick`. All become plain calls.
- The type tests in `packages/platejs/type-tests/` that call `undo`/`redo`.
- The mounted runtime: `replayHistory` and `dispatchHistory` in `packages/plitejs/src/react/editable/editable-dom-runtime.ts`, and the browser-handle continuation in `browser-handle.ts`.
- `benchmarks/editor/benchmarks/plite-history-depth-benchmark.ts` drops `await`; its `undoResolutionMs` then times the synchronous call.
- 101 `await` sites at HEAD and the sweep's `void` sites. Tests that wait on a comment or session replay read `result.settled`. A leftover `await` on a comment undo gets `pending` and fails its assertion, so the test run finds a missed site.
- Public docs: `content/docs/(guides)/history.mdx` and `content/docs/api/react-hooks.mdx` with their `.cn.mdx` twins; the Plite reference pages `docs/plite/reference/public-docs/libraries/plite-history/history-editor.mdx`, `plite-history/history.mdx` and `plite-react/hooks.mdx`; and the subject page's Public API.
- Doctrine and rules: `docs/vision/plite.md` ("resolves an awaited outcome"); `docs/research/decisions/history-ownership.md`, including its "Do not restore synchronous replay" sentence; `.agents/rules/best-api.mdc`, whose replay rule teaches an awaited result; and the `EDIT-COMMENT-HISTORY-PENDING-001` row in `docs/editor-behavior/editor-protocol-matrix.md`.

Removed nouns and where their behavior goes:

| Removed | Behavior it carried | Replacement or proof it is redundant | Regression proof |
| --- | --- | --- | --- |
| `Promise.resolve` around document replay | Uniform return type | The `status` discriminant | History partition tests, migrated |
| Rejection from `undo()` after the call returns | Error delivery | Lifecycle sink with a `reportError` fallback, plus `failed` | New test: an owner throw raises no unhandled rejection and reaches the sink once |
| `version + (pending === direction ? 2 : 1)` in `replayHistory` | Detect commits between call and settlement | The receipt's claim version: repair only when settlement directly follows the claim and is still the last commit | New mounted tests: a synchronous owner still gets focus repair; an update between claim and return cancels it |
| `ModelHistoryResult` and the `editor.api as unknown as` casts | A copy of the result union reachable from react | Root types | `typecheck:partition:react` |
| Dead checks in `replayNow` (`history-plugin.ts:929-934`, `946-954`) | Nothing; `replay` already runs them | Proven unreachable by the traced model | History partition tests |

`useEditorHistory().undo()` already returns `void` and keeps its shape. `Editable.onHistoryReplay` keeps receiving settled outcomes and gains `failed`.

## Native behavior and proof

| Behavior | Change | Proof surface |
| --- | --- | --- |
| Cmd+Z and toolbar undo of a document batch | None: selection and focus repair stay one microtask after the call, and `onHistoryReplay` in the following reaction | Chromium: `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts` undo cases and `document-state.test.ts`; unproven on device |
| A commit made between the claim and settlement | Still cancels focus repair, now checked against the claim version History records | New mounted test; existing `focusin`/`pointerdown` guards stay |
| Cmd+Z during a pending comment replay | None: consumed, reports `busy` | Chromium `comment.spec.ts` C22 route |
| Undo of comment creation (C22-ORDER, C22-SAFETY, C22-FOCUS) | None to order and blocking | Bun `BaseCommentsPlugin.spec.ts`; Chromium `/blocks/discussion-proof` |

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Floating-promise lint | Keep `typescript/no-floating-promises` as configured | Allow `undo`/`redo` through `allowForKnownSafeCalls`, which hides the owner-throw rejection the probe reproduced | allowlist |
| Async lifecycle | Keep the claim, `pending`, `busy` and settlement table for comment-creation replay | Delete it and make comment-creation undo local-first, as Liveblocks does; breaks TaskHub-22 AC5 and AC7 | cut the lifecycle |
| Replay failure | A refused owner settles `blocked`; any owner or settle failure after the claim settles `failed`; both keep the entry at the head | Drop the entry when the owner applied before settlement failed, which narrows TaskHub-22 AC5 and loses an applied redo's undo record | drop entry |
| Failure reporting with no sink | `globalThis.reportError` when present, as the mounted path does today, else `console.error` | Console only, the lifecycle sink's current fallback | console |
| Synchronous owner result | Settles inside the call; the claim still publishes first | Every `history: { replay }` batch goes `pending` and settles a microtask later, after the external state already changed (probe P6) | always pending |
| Where the result types live | Root `interfaces/editor.ts` | Add a `plitejs/react` to `plitejs/history` graph edge | edge |
| Mounted repair and callback timing | Unchanged: repair one microtask after the call, callbacks in the following reaction | Repair inside the keydown call, which no user can see and which needs its own browser proof | sync repair |
| Mounted focus guards | Keep `focusin`/`pointerdown` armed across the call, with cleanup in a `finally` that starts before the call | Drop them for document batches after a Chromium case proves no subscriber moves focus mid-undo | drop guards |
| Comments local publication timing | Unchanged: Comments publishes inside its owner, before settlement | Two-phase owner contract that stages Comments records inside the settlement update | stage comments |

## Open questions

### Round-2 patch

Should the diff panel's last-round fixes land without another review?

Why it needs you: The panel's round cap is spent, so any further code change lands unreviewed unless you grant one more round.

- The patch is `docs/research/probes/2026-10-05-history-replay-result/panel-diff-r2/unreviewed.patch` and is not in the working tree.
- It replaces the `'then' in` check with a callable-`then` test, stops reporting the same settlement error twice while still retrying the clear, and makes the foreign-realm test pass under any `deepEqual`.
- In a detached worktree with the patch, the history tests pass 154 of 154 and `tsc` exits 0 (`docs/research/probes/2026-10-05-history-replay-result/patch-r2-proof/worktree-check.txt`). A probe shows each warning on the reviewed code and its fix on the patched copy (`docs/research/probes/2026-10-05-history-replay-result/patch-r2-proof/round2-cases.txt`).
- Without it, a valid result object that carries `then: undefined` settles a microtask late, an owner that returns a non-object wedges undo until reload, and a settlement error that repeats reports twice.

- **Apply the patch** (recommended): I run `git apply` on it, rerun the history and React partitions, and log the result. Cost: About twenty lines land that no panel seat has read.
- **Review it first**: One more panel round on the patch alone. Cost: Three more seats and about half an hour.
- **Leave it out**: The reviewed bytes stay as they are, and both warnings stay on the subject page as open work. Cost: The non-object owner result can still wedge undo until reload.

Why I pick it: Each change narrows a failure path the seats traced, and the patch passes the same tests the reviewed bytes pass.

If you say go: I apply the patch, rerun the history and React partitions, and republish this page.

## Panel gate

The plan panel ran two rounds on seats Opus, gpt-6-astra @high and gpt-6.1-sol @xhigh. Round 1 applied three critical fixes. Round 2 found one critical, in round 1's Comments fix, and two warnings against round 1's failure split; both fixes were reverted, and the wording on error delivery and callback timing was narrowed to today's behavior. Its three additive suggestions waited in `docs/research/probes/2026-10-05-history-replay-result/panel-r2/unreviewed.patch`; the owner's Build now accepted them, and the build applied them.

The diff panel ran two rounds on the same seats. Round 1 applied one critical fix: an owner promise from another realm settled as a synchronous result. Round 2 found no critical, so it is the last round. Its additive fixes wait unreviewed:

| Unreviewed | Source | Patch |
| --- | --- | --- |
| Test for a callable `then` instead of `'then' in`, so a non-object result settles `failed` and `then: undefined` settles in the call | Opus and gpt-6.1-sol, round 2 warnings | `docs/research/probes/2026-10-05-history-replay-result/panel-diff-r2/unreviewed.patch` |
| Keep the clearing retry but skip reporting the same error twice | gpt-6.1-sol warning, Opus nit; reworked after the trail review found the first version skipped the retry | same |
| Spread the foreign-realm settlement before `deepEqual` | Opus nit | same |

## Steps

One phase. Exit: keep, or revert as one change.

- [x] Write two failing Bun tests in `packages/plitejs/test/history/history-branch-contract.spec.ts` and run them on HEAD: a settle-step throw leaves `pending()` set and the next undo returns `busy`; an owner throw behind an ignored call raises an unhandled rejection. Proof: each fails on HEAD for its named defect, run on its own. Done: `docs/research/probes/2026-10-05-history-replay-result/build-proof/red-before.txt`; the owner-throw case migrated the existing test instead of adding a second one (decision log, build).
- [x] Move the four result types to `packages/plitejs/src/interfaces/editor.ts` and export them from root. Add a `history` variant to `EditorLifecycleError` and its `reportError`-when-present fallback. Proof: `pnpm --filter plitejs typecheck:partition:history`. Done: typecheck green in `docs/research/probes/2026-10-05-history-replay-result/build-proof/typecheck-plitejs.txt`.
- [x] Make `replay` synchronous in `history-plugin.ts`. Document batches return their outcome. A session batch claims, records the claim version in the private receipt, and calls its owner. A synchronous owner result settles in the call; a Promise returns `pending` with a `settled` that never rejects. Owner and settle failures follow the Replay failure default. Delete the dead checks. Proof: `pnpm --filter plitejs test:partition:history`, including both new tests now passing. Done: history partition 154 pass after the diff panel's round-1 fix (`docs/research/probes/2026-10-05-history-replay-result/panel-diff-r1/diff-r1-green.txt`).
- [x] Adapt the mounted runtime: consume the synchronous result, keep today's continuations (repair one microtask after the call, callbacks in the following reaction), check the receipt's claim version instead of the version arithmetic, start listener cleanup before the call, and delete `ModelHistoryResult` and the casts. Add two mounted tests: a synchronous owner still gets focus repair, and an update published between the claim and the return cancels it. Proof: `pnpm --filter plitejs test:partition:react` and `typecheck:partition:react`. Done: React partition 1417 pass and typecheck green; both new tests fail under their mutations (`docs/research/probes/2026-10-05-history-replay-result/build-proof/mounted-mutations.txt`).
- [x] Migrate every caller listed above. Proof: `pnpm --filter plitejs typecheck`, `pnpm --filter platejs typecheck` and `pnpm --filter www typecheck`; `bun --config=./bunfig.toml --cwd=. test ./packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts` green, C22-ORDER and C22-SAFETY included. Done: `docs/research/probes/2026-10-05-history-replay-result/build-proof/typecheck-plitejs.txt`, `docs/research/probes/2026-10-05-history-replay-result/build-proof/typecheck-platejs-2.txt`, `docs/research/probes/2026-10-05-history-replay-result/build-proof/typecheck-www-full.txt`; Comments spec 58 pass.
- [x] Run the AI chat history specs that call undo: `packages/platejs/src/ai/react/AIChatPlugin.suggestions.spec.ts`, `useAIChat.spec.tsx` and `AIChatPlugin.streaming.spec.ts`. Proof: green. Done: inside `pnpm --filter platejs test`, exit 0.
- [x] Run `plate-docs` on the public and Plite reference pages listed above, with their `.cn.mdx` twins. Update `docs/vision/plite.md`, the history decision page and the editor-protocol-matrix row. Run `best-api`'s doctrine repair on `.agents/rules/best-api.mdc`, then `pnpm install` to regenerate its skill. Add `plitejs` and `platejs` changesets through `changeset`, and append a Plate Next doctrine version. Proof: the docs build, `node .agents/rules/plate-next/scripts/version.mjs validate` and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`. Then two `git grep` searches over `packages`, `apps`, `benchmarks`, `content` and `docs/plite`, for `(void|await) [^;]*history\.(undo|redo)\(` and `(void|await) [^;]*historyPortal\.api\.(undo|redo)\(`, return nothing outside callers that wait on `settled`. Done: `docs/research/probes/2026-10-05-history-replay-result/build-proof/docs-build.txt`, `docs/research/probes/2026-10-05-history-replay-result/build-proof/build-registry.txt`, `docs/research/probes/2026-10-05-history-replay-result/build-proof/grep-gate.txt`; Plate Next v259 validates; no `.cn.mdx` twin exists for these pages; the platejs changeset was skipped (decision log, build).
- [x] Run the Chromium proof serially: `pnpm --filter plite test:plite-browser:chromium donor/examples/richtext.test.ts` (undo cases) and `document-state.test.ts`, then `pnpm --filter www exec playwright test tests/browser/comment.spec.ts --config playwright.config.ts --project=chromium --grep "local comment creation shares document undo order"`. Proof: green five times warm without retries, because undo and focus carry native risk. Done: `docs/research/probes/2026-10-05-history-replay-result/build-proof/acceptance-plite-5x.txt` (forced, 9 of 9 five times) and `docs/research/probes/2026-10-05-history-replay-result/build-proof/acceptance-c22-5x.txt` (1 of 1 five times).

## Evidence

Lanes considered before the arena:

| Lane | Candidate | Outcome |
| --- | --- | --- |
| Keep or configure | Keep `Promise<HistoryResult>`; turn off or allowlist the lint | Loses: the Promise is decorative for document batches, misleads discarding callers that read state right after the call, and the lint reports a real unhandled-rejection path |
| Change an existing API | Synchronous `HistoryResult` with a `pending` variant carrying `settled` | Wins; all three arena runners converged on it |
| Change an existing API | `HistoryResult \| Promise<HistoryResult>` (VS Code's and Monaco's shape) | Loses: callers must test for a thenable |
| Add a primitive | Split `undoSync`/`undoAsync` | Loses: callers must know the hidden batch kind before calling |
| Move ownership | Comments owns in-flight removal optimistically; history fully synchronous | Strongest deletion, matching Liveblocks. Breaks TaskHub-22 AC5 and AC7; kept as the `cut the lifecycle` default's alternative |
| Replace the architecture | Comment creation leaves document undo, as in BlockNote and the Lexical playground | Loses: drops TaskHub-22 AC1 and AC2 |

The 2026-09-23 async-replay review rejected a sync-or-Promise union because callers would have to know the hidden batch kind, and asked for "one statically honest return type". The discriminated result is one static type. It names the pending case in the type instead of hiding a microtask behind a Promise for every caller. A caller that ignores the result loses nothing it had before: a document batch has applied, and a failure reaches the sink. The same review asked to avoid conditional timing. Timing does differ, because only a server-backed owner is async, but the `pending` discriminant states it in the type, and mounted callbacks keep one timing for every batch.

Decisive evidence. Receipts sit in `docs/research/probes/2026-10-05-history-replay-result/`:

- `history-timing.txt`, at `36c2f43170`. Document undo returns a Promise with the text already `""`. Session undo publishes `pending: "undo"` before returning while the external value is unchanged. A second undo during pending returns `busy` and leaves `A`. An owner throw behind `void undo()` raises 1 unhandled rejection. Control: the same document undo resolves `{ status: "applied" }`.
- `settle-failure.txt`. A synchronous owner has already changed external state when `undo()` returns while history still reports `pending` (P6). An owner value that cannot be cloned makes the settle step throw; `pending()` stays `"undo"`, and after a new edit the next undo returns `busy` with the text left at `BA` (P7). Control: a well-formed value settles and clears `pending`.
- `settlement.txt`: `tsc` rejects `{ status: 'applied' }` against round 1's `Extract`-based settlement type; the settlement-first shape above compiles and still rejects `busy`.
- `history-plugin.ts:1039-1060`: `replay()` picks the document or session path synchronously and wraps the document result in `Promise.resolve`. `editable-dom-runtime.ts:1016-1110` awaits every result. `BaseCommentsPlugin.ts:454-476`: `notifyThreads` calls listeners with no error boundary.
- `tooling/entrypoints/entrypoint-dag.mjs`: `plitejs/react` depends on root, dom and annotations only.
- `docs/vision/plite.md`: "Public updates are synchronous and cannot nest." Undo is the only Promise-returning API in Plite core, history and interfaces; Plate's Promise APIs are network I/O (AI, upload, comments, media).
- The 2026-09-23 lifecycle plan cut the Promise from `useEditorHistory` because every production consumer discarded it. The same census now holds for `editor.api.history`.
- `grounding-how.md` holds the traced model of the current flow; `survey.md` and `survey.tsv` hold the editor survey. Ordinary editor undo is synchronous in all eleven editors read. VS Code's undo service and Monaco's `ITextModel.undo()` return `Promise<void> | void`, used for file, notebook and confirmation-dialog undo. No editor makes undo wait on a server.

Arena: runners Opus, gpt-6-astra @high and gpt-6.1-sol @xhigh, cross-judge Opus. Scores 16, 15 and 12 of 20; Opus's candidate is the base. Candidates and the judge's verdict are in `arena/`.

| Source | Taken | Rejected |
| --- | --- | --- |
| Opus (base) | Root types; synchronous owner settles in the call; one total settlement; dead-branch cut | Its new `reportEditorError` (duplicates the lifecycle sink); labelling a post-apply settle failure `blocked`; removing Comments' catch-all for `mutate` throws |
| gpt-6-astra | The lifecycle sink with a `history` source; `failed` as a status distinct from refusal; callbacks in a microtask; listener cleanup that starts before the call | Its fault barrier that blocks all undo until reload; the react to history graph edge; always-async settlement for synchronous owners |
| gpt-6.1-sol | A request-scoped settlement that clears `pending`; `pending()` is availability, not a completion receipt | Its two-phase owner contract and transactional Comments records (deferred under `stage comments`); dispatcher-only error reporting |

Challenge delta: improved. Against the first cut, the plan adds `failed` and the lifecycle-sink failure owner, moves the types to root, settles synchronous owners in the call, and fixes the stuck-`pending` defect and the listener leak. Panel round 1 then corrected the settlement type, moved the claim version into History's receipt, dropped synchronous focus repair, split the failure default by whether the owner applied, and added a Comments subscriber fix. Round 2 showed both of the last two were incomplete or narrowed TaskHub-22 AC5, so they are reverted: every failure keeps its entry, and Comments' listener errors are open work. The incumbent `Promise<HistoryResult>` still loses on every rubric line.

Risks:

1. A caller that `await`s a comment undo and checks `status === 'applied'` now sees `pending` and treats it as failure. Source code has `typescript/await-thenable` on, which flags the leftover `await`; tests have it off, and a comment test fails its assertion instead.
2. Build edits files that another session's uncommitted sweep also changes. Copying each to scratch first keeps that session's work recoverable, but the two changes must still merge.
3. An owner that applied before its settle step failed leaves its entry at the head, and the next undo blocks there until reload. This is today's behavior with `pending` now cleared; the subject's open work on staging Comments publication removes it.
4. Clearing `pending` after a failed settle commit needs a publication that does not reuse the failed update, or `useEditorHistory` keeps `pending` and disables its buttons. When that publication itself throws, `pending` stays set and the error is reported; the settlement-throw test reads `pending()` after the failure to catch the ordinary case.

Performance gate: N/A. The change removes a Promise wrapper from a per-action path and adds no repeated or document-size-dependent work (`history-plugin.ts:1039-1060`). Mounted timing is unchanged. The history-depth benchmark migrates and runs as a smoke, not a speed claim.

Proof limits: source review, two Bun probes on HEAD source with controls, one `tsc` reproduction, a source-only editor survey, a design arena and two panel rounds; no prototype of the proposed runtime, test suite, browser, device or benchmark run. Product comment-undo behavior in Google Docs, Notion, Figma, Linear and Confluence is unverified. The review record overstates the survey ("VS Code returns `Promise<void> | void` for file operations only"); this plan's narrower wording supersedes it. TaskHub-22 is tracker evidence, not law. No surveyed editor makes undo wait on a server, but that does not show the requirement is wrong, so the plan keeps it and offers the cut as a default.
