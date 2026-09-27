---
review_scopes: [history]
review_basis: [2026-09-23-history-async-replay-api]
work_kind: design
---

# History replay lifecycle — revised

Status: Complete — superseding design ready for execution; adoption not started and no product source changed.

This is a project-owned file template under Task. Apply the project's standing Autogoal request for long-running work unless the user opts out. Apply `.agents/rules/task/references/workflow.md` to timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

Objective:
Correct and close the history replay-lifecycle design without mutating its
immutable predecessor; done when binary readiness gates pass; plan
`docs/plans/2026-09-23-history-replay-lifecycle-revised.md`.

Flow mode:
agent-led plan hardening

Goal plan:
docs/plans/2026-09-23-history-replay-lifecycle-revised.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:

- `standard`. The high-risk history/collaboration/React triggers add the
  three-failure section below; no external comparison or Benchmark lane is
  triggered (see Scale contract).

Completion threshold:

- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:

- Planning proof (fresh, 2026-09-23):
  `bun test ./docs/plans/artifacts/2026-09-23-history-replay-lifecycle/lifecycle.probe.test.ts`
  and
  `bun test ./docs/plans/artifacts/2026-09-23-history-replay-lifecycle-revised/claim-model.probe.test.ts`.
- Execution gates per slice: `pnpm --filter plitejs test:partition:history`,
  `pnpm --filter plitejs typecheck:partition:history`, the named Plite React,
  Yjs and Plate Comments spec files, the TaskHub-22 Chromium case, and the new
  slow-persistence Chromium case. Load Verify Plate's command recipes before
  running the browser lane.

Constraints:

- User request (2026-09-23): "retain truthful async completion, unify replay
  timing, expose pending state, and remove the silent editor lock."
- Governing review `2026-09-23-history-async-replay-api`: keep
  `Promise<HistoryResult>`; no synchronous replay, no sync-or-Promise union,
  no `undoSync`/`undoAsync`, no Comments-only stack. Shared A/B/C order,
  server-first persistence, typed block, unchanged head on failure and no
  deletion of foreign comment work stay hard.
- `transactions-synchronous-boundary.md`: no async transaction API.
- The September 16 configuration Stop (Plate `HistoryPlugin` adapter and live
  getters) remains in force.
- The immutable predecessor
  `docs/plans/2026-09-23-history-replay-lifecycle.md` and its execution record
  remain unchanged. This plan supersedes its design target after the user's
  accepted final review.
- The user's 2026-09-23 "go" authorizes this amendment and its ledger closure,
  not product implementation.
- No public compatibility aliases or runtime shims.

Boundaries:

- In scope: Plite History replay scheduling, pending state, settlement and
  failure/retirement semantics; Plite React mounted replay initiation and
  `useEditorHistory`; one mounted replay-result callback on `Editable`; the
  Plate Comments session-effect owner, Plate combobox replay caller and
  registry history toolbar button; history docs, Plite vision doctrine and
  Best API doctrine.
- Source owners: `packages/plitejs/src/history/history-plugin.ts`,
  `packages/plitejs/src/history/history-state.ts`,
  `packages/plitejs/src/react/components/editable-text-blocks.tsx`,
  `packages/plitejs/src/react/editable/editable-dom-runtime.ts`,
  `packages/plitejs/src/react/editable/runtime-root-state.ts`,
  `packages/plitejs/src/react/hooks/use-plite-history.ts`,
  `packages/platejs/src/features/comments/BaseCommentsPlugin.ts`.
- Non-goals: history configuration adapter; grouping heuristics; persisted
  History JSON; authored selective revert; a local-first Comments contract;
  aborting in-flight owner work; product toast/copy for refused undo; an API
  for discarding a permanently blocked history head.
- Direct Plate/collaboration adoption owners: Plate Comments (serialization and
  interleaved creation), Plate combobox (`BaseComboboxPlugin` undo/redo),
  registry `history-toolbar-button.tsx`, Plite Yjs remote import (proof only;
  no adapter change).

Output budget strategy:

- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:

- None. The user accepted single-flight replay. Recovery from a permanently
  blocked head is preserved as a separate decision and does not change this
  lifecycle target.

Plite Plan state:

- phase: prove-and-hand-off
- next: product execution slices 1-5 when separately authorized
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Constraints above quote the request and review requirements. |
| Task plan and execution authority verified | yes | Amendment and ledger closure authorized; product execution remains outside this request; branch `next`. |
| Current owners read | yes | History plugin/state, mounted runtime, keyboard/native/external-text/browser-handle initiators, controller, Comments owner, Yjs policy, docs, vision, TaskHub-22 plan. |
| Best API target resolved | yes | Final review resolved return ownership, mounted dispatch, the result sink and retirement truthfulness; see Decision brief and ledger rows 1-11. |
| Runtime scale applicability resolved | yes | Source-backed N/A; see Scale contract. |
| Pre-acceptance Benchmark probe selected | no | N/A: no hot path, index, subscription or fan-out changes; see Scale contract. |
| Mode and execution boundary resolved | yes | `standard`; amendment stops at handoff. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every scale-sensitive target has a passing executable current-owner versus
      target Benchmark receipt before its decision row locks; paper complexity,
      a review score, or deferred measurement does not satisfy this row.
      (No scale-sensitive target; source-backed N/A in Scale contract.)
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Canonical state versus exact-view presentation is classified when
      applicable: no parallel state, copied payload, or editor-global policy
      owner survives without an independent job.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All rows resolved; see ledger, slices and proof matrix. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Probe run 2026-09-23 against the current checkout: 9/9 current-behavior receipts plus the revised claim-model and reproducible mutant checks. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Rows 1-11; rejected alternatives and the separate blocked-head recovery decision are recorded. |
| Pre-acceptance scale proof | no | Source-backed N/A | Scale contract. |
| Production scale rerun contract | no | Source-backed N/A | Scale contract. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/Benchmark/provenance work or give one scoped N/A reason | Conditional evidence below. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Verification evidence below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff below. |
| P1 autoreview | no | Task gate | N/A: planning only, and never on `next`. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-23-history-replay-lifecycle-revised.md` | Pass recorded in Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Owners read; 9 current-behavior probes pass | Decide |
| Decide | complete | Ledger resolved; claim model checked over 1,684,893 settled sequences and its wrong-insertion mutant reproduced | Prove and hand off |
| Prove and hand off | complete | Corrected slices, proof matrix and superseding handoff | Product execution when authorized |

## Current state (live evidence)

Every row is a passing current-behavior receipt in
[lifecycle.probe.test.ts](artifacts/2026-09-23-history-replay-lifecycle/lifecycle.probe.test.ts)
([log](artifacts/2026-09-23-history-replay-lifecycle/lifecycle-probe.log)) or a
cited source line.

| # | Finding | Evidence | Consequence |
| --- | --- | --- | --- |
| F1 | Document replay publishes inside `undo()`; session replay publishes after an `await`. | `history-plugin.ts:916-918` vs `:879-900`; probe "current replay timing". | Two timing models under one signature. |
| F2 | While a session replay awaits, the transaction guard throws for **every** publication: typing, selection-only updates and `history-skip` updates. | `history-plugin.ts:1002-1009`; probes "selection-only", "history-skip". | Editor-wide lock. Yjs imports use `history-skip` (`yjs/core/editor-adapter.ts:36-46`), so remote collaboration throws too. |
| F3 | `sessionReplayPending` and `replayQueue` live in the `history(options)` closure, not per editor. | `history-plugin.ts:525-526`; probe "shared history() descriptor". | One pending comment undo locks every editor sharing a raw Plite descriptor. Plate is unaffected because `HistoryPlugin` calls `history()` per editor through `.extend`. |
| F4 | A document replay queued behind a session replay runs after the `await` and loses the initiator's ambient update tags (`preserve` focus policy). | `editable-dom-runtime.ts:958-965`, `public-state.ts:2017-2038`; probe "queued document replay". | Queued intents need context capture machinery. |
| F5 | A throwing owner rejects `undo()`; six native initiators `void` the Promise. | Probe "throwing session owner"; `mutation-history.ts:21`, `keyboard-input-strategy.ts:574-590,829-844`, `external-text-runtime.ts:909`, `browser-handle.ts:746,900`. | Unhandled rejections; blocked outcomes are dropped. |
| F6 | Mounted replay clears the projected view selection before the await and repairs focus after it without re-checking `connected`. | `editable-dom-runtime.ts:957-986`. | Selection paint vanishes during persistence; an unmounted runtime can repair focus. |
| F7 | Creating a second comment during a pending creation undo persists remotely, publishes locally, then throws at the history record. | `BaseCommentsPlugin.ts:930-957`; probe "second creation". | Server/local thread exists without a history entry; caller sees a rejection after success. |
| F8 | Creation replay calls `commitMutation` directly, bypassing the per-thread queue. | `BaseCommentsPlugin.ts:776-782` vs `enqueue` `:649-671`; probe "bypasses the per-thread queue". | A reply racing an undo leaves the server thread removed while local state keeps it (`comments-stale`). |
| F9 | No public pending read; `useEditorHistory` enables controls throughout. | `history-plugin.ts:941-954`, `use-plite-history.ts:97-103,187-197`. | Controls cannot reflect in-flight replay. |
| F10 | Every production and documented `useEditorHistory` consumer passes `undo`/`redo` directly as an event handler; only the hook's own tests await the result. | `history-toolbar-button.tsx:15,27`, `external-text.tsx:361-376`, `multi-root-document.tsx:196-207`, `react-hooks.mdx:143-160`, `use-plite-history.test.tsx:97-108`. | The mounted controller Promise has no independent current job; its rejected Promise is routinely discarded. |

## Decision brief

- outcome: One replay lifecycle. Each `undo()`/`redo()` takes effect in call
  order by claiming its branch entry before it returns. A document batch
  applies in that call. A batch holding a live-session effect publishes
  `pending` in that call and settles when its owner finishes. Edits,
  selection and remote updates keep publishing throughout. Overlapping replay
  requests resolve `busy`.
- chosen shape: keep `Promise<HistoryResult>`; add `{ status: 'busy' }`; add
  `editor.read.history.pending(): 'undo' | 'redo' | null`; `useEditorHistory`
  folds pending into `canUndo`/`canRedo`, exposes `pending`, and returns
  fire-and-forget `undo()`/`redo()` dispatchers. `Editable.onHistoryReplay`
  receives every fulfilled result initiated by mounted UI. Direct model callers
  keep the Promise on `editor.api.history`.
- strongest rejected alternative: the review's "one FIFO replay queue". A
  queued request outlives its call (F4), would pass a pending claim if it
  targeted the next entry, and cannot keep a stable target once edits stay
  live. Making it correct needs per-request context capture plus cancellation
  on every recorded edit. Single-flight deletes the queue and both mechanisms.
- consequence: rapid repeated undo across a comment waits for persistence
  (extra presses return `busy`, with controls disabled). The editor never
  locks and never rejects native input. A blocked entry remains the next entry
  by TaskHub-22's accepted safety rule; explicit recovery is a separate API
  decision.

### Target call sites

```ts
import { createEditor } from 'platejs';

const result = await editor.api.history.undo();

if (result.status === 'busy') {
  // Another replay is settling; nothing was replayed.
}

const pending = editor.read.history.pending(); // 'undo' | 'redo' | null
```

```tsx
import { EditorContent, useEditor, useEditorHistory } from 'platejs/react';

const { canUndo, pending, undo } = useEditorHistory({ editor: useEditor() });

<EditorContent
  onHistoryReplay={({ direction, result }) => {
    if (result.status === 'blocked') {
      showHistoryRefusal(direction, result);
    }
  }}
/>;

<ToolbarButton
  aria-busy={pending !== null}
  disabled={!canUndo}
  onClick={undo}
/>;
```

### Why call-order claim is forced

- Hard law: native and IME input cannot be refused or buffered in
  contenteditable. `beforeinput` cancellation is unreliable during
  composition, and `contenteditable=false` destroys focus and composition. The
  editor must accept local edits while persistence runs.
- Hard law: collaboration imports must apply (F2). A publication fence cannot
  cover remote commits.
- Therefore, recorded edits publish during a pending replay. The only
  consistent history is the one where the replay happened at its call with the
  outcome that its owner later reports. The review's "disabled" option fails
  both laws. "Buffered" fails native input. "Safely cancelled" survives only as
  a refusal of overlapping *replays*, never of edits.
- This is sound because a session entry is always one effect-only batch
  (`history-plugin.ts:642-649`). It changes no document coordinates, so it can
  leave or enter the branch below newer entries without rebasing them.

### Settlement table

The replay claims entry `S`; `E` means at least one recorded local edit
published after the claim and before settlement.

| Claim | Owner result | No `E` | With `E` |
| --- | --- | --- | --- |
| undo | applied | Move `S` from undo head to redo head. | Remove `S` from its undo position; redo was already cleared by `E`, so `S` is dropped. |
| undo | blocked | `S` stays at undo head. | `S` stays below `E`. |
| redo | applied | Move `S` from redo head to undo head. | Insert `S` into the undo branch directly above the claim-time undo head, below `E`. |
| redo | blocked | `S` stays at redo head. | `S` was cleared from redo by `E`; drop it. |

- The claim is a grouping boundary: a recorded update published during the
  claim starts a new batch, including an explicit `history: 'merge'`. Session
  entries are already non-mergeable (`history-plugin.ts:698-702`), and replay
  already closes the automatic window (`:594`). The boundary changes only an
  explicit merge that the reference model would have applied after an
  applied undo or a blocked redo.
- Settlement moves `S` only if it still exists. Replacement, restore,
  maxDepth clipping or an effect `map` that drops it leave settlement as a
  pending-state clear only.
- A redo claim keeps `S` at the redo head until the first recorded edit clears
  the redo branch. At that moment, `S` is detached with its current mapping
  journal. Later remote mappings reach it through the undo branch after
  insertion. Removal appends `S`'s journal to the entry below it
  (`history-state.ts:393-483` forwards journals down unchanged through an empty
  change).
- The [claim-model check](artifacts/2026-09-23-history-replay-lifecycle-revised/claim-model.probe.test.ts)
  ([log](artifacts/2026-09-23-history-replay-lifecycle-revised/claim-model-probe.log))
  compares this table with "the replay happened at its call with its eventual
  outcome" over every settled sequence up to length 8 (1,684,893 sequences,
  including interleaved edits and session creations). All pass. A mutant that
  places the redo-applied entry on top is retained as a second executable test
  and fails the same reference on its minimal six-operation witness. The check
  models branch order only; mapping journals are execution slice 1 proof.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Replay return type | `Promise<HistoryResult>`: `applied`, `empty`, `blocked` | Same Promise; add `Readonly<{ status: 'busy' }>` for an overlapping request that replayed nothing | Plite History | Review verdict holds; `busy` is distinct from `blocked` because no head was tried and the requested head may already be claimed | Plite type, Plate type re-export, docs; exhaustive switches gain one arm | Branch contract tests; type tests in `packages/platejs/type-tests` | Callers treating non-`applied` as failure show a false error; docs name `busy` | keep |
| 2. Replay scheduling | Sync apply for document batches; FIFO `replayQueue` for session batches and anything behind them | Synchronous claim at call; document batch claims and settles in one update; session batch publishes a claim, awaits its owner, then settles; no queue | Plite History | Call-order claim is the only linearization compatible with live input (above); a queue creates intents that outlive their call (F4) | Delete `replayQueue`, `replayNow` chaining and the queued-replay test; mounted tag context works unchanged because no document replay runs after an await | Claim-model check; slice 1 tests | Rapid repeated undo across a session entry waits | rearchitect |
| 3. Pending publication fence | Guard throws for every commit while `sessionReplayPending` | Removed; every commit publishes; recorded commits mark the claim edited and start a new batch | Plite History | Native input and remote collaboration laws (F2) | Delete `sessionReplayPending` and its guard branch and the "cannot publish" error | Probes F2 converted to passing publication tests; Yjs remote import during pending | Journal handling at settlement | cut |
| 4. Pending state read | None | `editor.read.history.pending(): 'undo' \| 'redo' \| null`, published with the claim and settlement commits | Plite History | Explicit user requirement; controls need it; history owns the lifecycle | New read on `HistoryStateApi`; Plate inherits through `HistoryPlugin` read types; docs | Subscriber sees claim and settlement; `useEditorHistory` re-renders | Needs a publication that carries no document change; `tx.history.restore` already publishes annotation-only commits (`history-plugin.ts:959-967`) | rearchitect |
| 5. Lifecycle state location | Descriptor closure shared by every editor using the same `history()` value (F3) | Per-editor record keyed like `HISTORY_ACTIVATION`, released by activation cleanup | Plite History | Construction inputs stay in factory closures; runtime state is per editor | Internal | Shared-descriptor test | None beyond slice 1 | move |
| 6. Owner failure and retirement | Owner throw rejects; pending flag reset; retirement unhandled after the await | Throw while the activation is live: publish pending clear, leave `S` in place and reject. If the activation retires before settlement, never touch its replacement history and return the owner's actual outcome: `applied`, the owner's typed `blocked`, or rejection | Plite History | A server-first effect that applied stays applied even when its old history owner is gone; `{ status: 'blocked', reason: 'history-retired' }` would lie | Docs; mounted dispatcher reports rejection | Applied, blocked and throwing owner results across history deactivation; React unmount test | A destroyed Comments owner can still report `comments-stale` after its server committed; that older Comments problem remains separate | rearchitect |
| 7. Mounted replay dispatch | Six callers discard the Promise independently; view selection clears before the await; focus repair does not re-check mount (F5, F6) | One private fire-and-forget runtime dispatcher used by keyboard, `historyUndo`/`historyRedo` input, controller commands, external text and browser handle. It owns Promise consumption, emits each fulfilled result once, reports each rejection once through `globalThis.reportError` when present or a microtask throw otherwise, updates projected selection only for an applied batch, and repairs focus only while still connected with no later local commit or focus change | Plite React | Event paths need one completion/error owner; direct model callers retain their Promise | Replace independent `void` sites with the dispatcher; browser-handle post-apply repair stays an internal dispatcher continuation | Mounted unit tests and Chromium slow-persistence/error recorder | The callback must not fire twice when a browser-handle continuation also observes success | rearchitect |
| 8. React controller | `undo()`/`redo()` return `Promise<EditableHistoryReplayResult>` although every production and documented consumer passes them directly as event handlers; `canUndo`/`canRedo` ignore replay state | `undo()`/`redo()` return `void` and dispatch through row 7. `canUndo`/`canRedo` are false while pending; the controller exposes `pending`; `onKeyDown` prevents default and dispatches a no-op `busy` outcome while pending | Plite React `useEditorHistory` | The controller is mounted UI, focus and shortcut policy. Awaited model completion already belongs to `editor.api.history`; keeping both Promise surfaces creates dropped rejections without a second current job | Delete `EditorHistoryResult`; update controller type, its tests, three production callers and React-hook docs; registry button adds `aria-busy` | Type tests plus `use-plite-history.test.tsx` asserting void dispatch and pending | A consumer that inferred the undocumented Promise must move to `editor.api.history` and own focus separately | cut |
| 9. Mounted replay result channel | Fulfilled `blocked`, `busy`, `empty` and `unavailable` outcomes are discarded by mounted callers | Add `EditableProps.onHistoryReplay?: (event: Readonly<{ direction: 'undo' \| 'redo'; result: EditableHistoryReplayResult }>) => void`. The exact initiating `EditableDOMRuntime` emits every fulfilled dispatcher result once; direct `editor.api.history` calls do not emit | Plite React `Editable` / Plate `EditorContent` passthrough | Expected refusals need an observable owner without sticky state, an event bus or a second controller method; the exact mounted interaction owner already exists | `EditableProps`, runtime update cell, `EditorContentProps` passthrough by inheritance, docs and the discussion proof route | Controller, keyboard, beforeinput, external-text and browser-handle result cases; exact-once callback assertion | Multiple mounted views must notify only the initiating runtime's callback | add |
| 10. Product message for refused comment undo | None | The lifecycle exposes row 9; product copy and toast presentation remain Plate Comments UI policy | Plate Comments UI | Substrate must expose refusal, while product wording and presentation have no settled requirement | The discussion proof route consumes the callback for deterministic browser evidence; no generic toast in this execution | Callback/browser proof | Ordinary product UI can remain silent until the separate presentation decision | defer |
| 11. Permanently blocked history head | A typed block leaves the same entry at the branch head; TaskHub-22 requires the next undo to target that entry again and never an older batch | Preserve the unchanged-head rule in this lifecycle. Do not auto-skip and do not add a discard API here. Record a separate Best API Review question for an explicit user-authorized recovery action | Plite History plus product policy | A notification makes the refusal visible but cannot make skipping safe. Automatically reaching an older batch would violate the accepted ordering/safety law | No product adoption in this execution; the future question must compare explicit discard, conflict resolution and keeping the barrier | C22-ORDER and C22-SAFETY remain green; blocked replay callback is emitted | Without a later recovery design, a permanently divergent entry remains a deliberate barrier | defer |
| 12. Comments creation replay | `replayCreation` bypasses `enqueue` (F8); interleaved creation throws at the record (F7) | Replay runs inside `enqueue(thread.id, …)`; creation's history record publishes normally during a pending claim | Plate Comments | Per-thread order must hold for every thread mutation; F7 is removed by row 3 | `BaseCommentsPlugin.ts` private change | Two new cases in `BaseCommentsPlugin.spec.ts` | Queue ordering changes block reasons from `stale` to `thread-changed`; keep the typed reasons stable | rearchitect |
| 13. Session effect owner contract | `historyReplay(editor, value)`; sync or Promise result; effect-only batch invariant | Unchanged; the effect-only invariant becomes load-bearing and is documented as such | Plite History | An `AbortSignal` has no current consumer, and aborting server-first work cannot tell whether the server applied it | None | Existing invariant test | None | keep |
| 14. Replay receipt bridge | `PREPARED_HISTORY_REPLAYS` and `recordEditorHistoryReplayReceipt` feed mounted focus | Unchanged; settlement produces the receipt | Plite History / Plite React | Single consumer, independent of scheduling | None | Existing focus tests | None | keep |
| 15. Doctrine and docs | Vision requires the fence (`docs/vision/plite.md:292-296`); guide promises "one complete replay" | Vision states call-order claim, live publication, single flight and effect-only law; guide and hook docs teach `pending`, `busy`, the void mounted controller and `onHistoryReplay` | Sync Vision owner, Plate Docs, Best API | Doctrine teaches the rejected fence and the public docs currently omit mounted outcome ownership | `docs/vision/plite.md`, `history.mdx`, `react-hooks.mdx`, `best-api.mdc` rule, Plate Next version | Docs build and source audit for "cannot publish while" and the old Promise controller type | None | rearchitect |

Canonical versus view classification: pending is per-editor observable runtime
lifecycle state owned by History. It is never serialized in History JSON,
included in snapshots or shared through collaboration. Focus, view-selection
repair and fulfilled-result delivery stay private to the exact mounted runtime
that initiated the replay (rows 7 and 9). No copied payload or editor-global
policy owner survives.

Private bridge: one mounted dispatcher joins native/controller initiation to
the exact `Editable` callback and error reporter. It is runtime-only, carries no
document state and is not a compatibility path.

## Execution slices

| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Claim lifecycle | Plite History (`history-plugin.ts`, `history-state.ts`) | Rows 1-6: per-editor claim record; synchronous claim; `busy`; `pending()` read; delete queue and fence; settlement table with identity splice and insert, journal forwarding and redo detachment; grouping boundary; truthful owner result across retirement | Product execution authorization | All history tests pass; the "queues the next undo" test is replaced by busy, live-publication and settlement-table tests; no `sessionReplayPending`, `replayQueue`, synthetic `history-retired` result or "cannot publish while" string remains | `pnpm --filter plitejs test:partition:history`; `pnpm --filter plitejs typecheck:partition:history`; new cases in `packages/plitejs/test/history/history-branch-contract.spec.ts`: busy, typing/selection/`history-skip` during pending, all eight table cells, remote mapping before and after the first interleaved edit, maxDepth clip, replacement and restore, shared descriptor, owner applied/blocked/throw across retirement, explicit-merge boundary |
| 2. Collaboration guard | Plite Yjs proof | Remote import during a pending session replay | Slice 1 | Remote update applies; settlement still follows the table | One case in `packages/plitejs/test/yjs/collaborative-history-contract.slow.ts` using `YjsUpdatePolicy.remote` |
| 3. Mounted lifecycle | Plite React (`editable-text-blocks.tsx`, `editable-dom-runtime.ts`, `runtime-root-state.ts`, `keyboard-input-strategy.ts`, `mutation-history.ts`, `external-text-runtime.ts`, `browser-handle.ts`, `use-plite-history.ts`) | Rows 7-11 | Slice 1 | One private dispatcher owns every mounted Promise; controller `undo()`/`redo()` return `void`; `pending` disables controls; `onKeyDown` consumes pending shortcuts; the initiating `Editable.onHistoryReplay` receives each fulfilled result once; each rejection is reported once; no late selection/focus repair | `packages/plitejs/test/react/use-plite-history.test.tsx` (void type, pending controls, busy callback with `preventDefault`, exact-runtime delivery, unmount during pending); `packages/plitejs/test/react/input-history-contract.test.ts`; external-text and browser-handle focused cases; Plite React typecheck |
| 4. Plate adoption | Plate Comments, combobox, registry | Row 12; combobox event path dispatches through the mounted owner; `history-toolbar-button.tsx` uses the void controller and adds `aria-busy`; `EditorContentProps` inherits `onHistoryReplay`; `pnpm --filter www build:registry` | Slices 1 and 3 | Probes F7 and F8 fail as current-behavior receipts because behavior changed; replacement spec cases pass; callback passthrough and TaskHub-22 C22 cases pass | `bun --config=./bunfig.toml --cwd=. test ./packages/platejs/src/features/comments/BaseCommentsPlugin.spec.ts`; combobox spec; Plate type tests; registry build |
| 5. Browser, docs, doctrine, release | Verify Plate, Plate Docs, Sync Vision, Best API, Changeset | Add a development-only persistence gate and `onHistoryReplay` recorder to `/blocks/discussion-proof`; Chromium cases: slow undo plus typing, slow undo plus toolbar, slow undo plus refusal; rows 15 and 13 docs; Plate Next version; changesets for `plitejs` and `platejs`; registry changelog for the toolbar button; `EDIT-COMMENT-HISTORY-PENDING-001` row in `docs/editor-behavior/editor-protocol-matrix.md`; history decision page and feature-history closure | Slices 1-4 | Chromium: typing during pending inserts text with no runtime error; the thread disappears after release; the caret stays after the typed text; the next Cmd+Z removes the typed text, not `A`; the toolbar is disabled with `aria-busy`; refusal emits one blocked callback, keeps the thread and leaves the same entry as the next target (B, never A); C22-ORDER, C22-SAFETY and C22-FOCUS pass | `pnpm --filter www exec playwright test tests/browser/comment.spec.ts --config playwright.config.ts --project=chromium`; docs build; `node .agents/rules/plate-next/scripts/version.mjs validate`; `pnpm install` mirror regeneration and source audit; `review-ledger.mjs draft-execution`, `record`, `render` and `check` |

Execution order is by dependency (1, 2, 3, 4, 5). Value rank: 3 (unlocks
input and collaboration), 2 (single-flight claim), 12 (Comments data safety),
7-9 (mounted UX and result ownership), then docs.

## Proof matrix

| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Current fence rejects typing, selection and `history-skip` commits | Probes pass | Replaced by live-publication tests | planning-proved |
| Current state leaks across editors sharing a descriptor | Probe passes | Shared-descriptor test | planning-proved |
| Queued replay loses ambient tags | Probe passes | Deleted by construction; no queued replay exists | planning-proved |
| Comments replay races thread mutations and interleaved creation throws | Probes pass | Two spec cases | planning-proved |
| The settlement table equals call-order semantics | Revised claim-model check, 1,684,893 sequences; retained wrong-insertion rule diverges on a six-operation witness | Slice 1 table tests on real branches with mapping journals | design-proved; implementation pending |
| Remote imports apply during pending | Source: Yjs remote tags include `history-skip` | Slice 2 Yjs case | pending execution |
| Late settlement does not move the caret or focus after later interaction | Source: `editable-dom-runtime.ts:958-986` has no post-await checks | Slice 3 test and Chromium case | pending execution |
| Mounted completion has one owner | Production census: controller commands are event handlers; six runtime paths discard Promises independently | Slice 3 exact-once result/error tests; Chromium result and runtime-error recorders | pending execution |
| TaskHub-22 order, safety and focus remain | Existing receipts in the TaskHub-22 plan | Rerun C22 specs and assert blocked recovery stays B, never A | pending execution |

## Scale contract

- applicability and source evidence: not scale-sensitive. The per-commit
  transaction guard check changes one-for-one from `sessionReplayPending` to a
  per-editor claim lookup (`history-plugin.ts:1000-1009`). Ordinary document
  replay keeps its single synchronous update and publishes no claim. Session
  settlement rebuilds only the entries recorded during the pending window,
  bounded by `maxDepth` (default 100). It adds no index, subscription,
  projection, fan-out or scheduler; it deletes one scheduler.
- user operation, current owner, proposed owner: undo/redo; Plite History for
  both.
- independent scale variables and cohorts: N/A for the reason above.
- frozen budget and noise rule: N/A.
- current baseline and target artifacts: N/A.
- deterministic work indicators: entries rebuilt at settlement = recorded
  entries since the claim; zero for document replay.
- correctness/native guard: slice 1 and 3 tests; Chromium slow-persistence
  case.
- final production-path rerun owner and exact command: N/A; no performance
  claim is made.

Conditional evidence:

- High-risk scenarios (history, collaboration, IME, React subscription):
  1. Journal corruption when `S` leaves or enters below newer entries makes a
     later undo remove the wrong text. Guard: slice 1 remote-mapping cases
     before and after the first interleaved edit; assert the effect-only
     invariant at claim time.
  2. Late settlement moves the caret or focus after the user kept typing or
     moved to a comment composer. Guard: row 7 rule, slice 3 test and
     Chromium caret assertion.
  3. Comments server/local divergence under racing thread mutations. Guard:
     row 12 serialization and spec.
  4. Mounted replay reports a fulfilled result twice or reports a rejection
     after a caller already consumed it. Guard: one dispatcher, exact-runtime
     callback counts and one error-recorder assertion per initiating path.
  Blast radius: every History consumer, including Plate core `HistoryPlugin`,
  AI streaming history tests, combobox, the collaboration examples and the
  TaskHub-22 route. Rollback: revert the slice. Hard-cut answer: no queue
  semantics or fence survives as a compatibility path. IME: composition
  commits during pending are ordinary recorded edits; the existing
  `replayHistory` composing guard stays. Physical-device IME receipts are
  deferred; no device claim is made.
- External research: N/A. The review already checked Slate and Lexical.
  Their synchronous document-only history has no fallible external job, so
  it cannot change this design.
- Issue/PR provenance: TaskHub #22 C22-ORDER, C22-SAFETY and C22-FOCUS must
  stay green. Its blocked-head rule remains authoritative; recovery is a
  separate Best API Review question. No public issue.
- Browser: Chromium on `/blocks/discussion-proof` for native keyboard,
  toolbar and focus under slow persistence. Browser/Benchmark/docs/release
  owners are named in slice 5. Benchmark: N/A (Scale contract).
- Behavior law: add `EDIT-COMMENT-HISTORY-PENDING-001` at execution closeout
  through Task's source-authority reconciliation.
- Performance pack, pre-acceptance receipt and final rerun: N/A with source
  evidence in Scale contract.

Findings:

- F1-F10 in Current state. F2 (remote collaboration rejected), F3
  (cross-editor leak) and F10 (controller Promise without a current consumer)
  strengthen the cut.

Decisions and tradeoffs:

- Single flight over queue: gives up buffered rapid presses across a session
  entry in exchange for a stable target per call, no queued context, no
  cancellation rule and a synchronous claim for every request.
- `busy` is a new status rather than a `blocked` reason, because `blocked`
  promises the requested head was tried and kept.
- History retirement suppresses settlement into the retired activation but
  never rewrites the owner's outcome. An applied server mutation reports
  `applied`; a typed block stays blocked; a throw rejects.
- `useEditorHistory` is a mounted event controller, so its commands return
  `void`. Awaited replay remains one level lower on `editor.api.history`.
- `Editable.onHistoryReplay` is an exact-runtime callback, not sticky state or
  an editor-global event bus.
- No `AbortSignal`, no sticky last-result state and no blocked-head discard API
  in this lifecycle (rows 9, 11 and 13).

Review fixes:

- Challenged the review's "one uniformly scheduled replay queue". Replaced it
  with single-flight call-order claims. The review's open question (disable,
  buffer or cancel) is answered: never disable or buffer edits; refuse only
  overlapping replays.
- Corrected the first design's false `history-retired` result, split the
  Promise model API from the void mounted controller, added one exact-runtime
  result callback, preserved TaskHub-22's unchanged blocked head as a separate
  recovery decision, and made the wrong settlement rule executable evidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Tag-context probe used `skip-dom-selection` on an effect-only batch, which adds that tag itself | 1 | Observe the queued document replay instead | Probe now isolates F4 |

Verification evidence:

- 2026-09-23 `bun test ./docs/plans/artifacts/2026-09-23-history-replay-lifecycle/lifecycle.probe.test.ts`:
  9 pass, 0 fail, 26 assertions
  ([log](artifacts/2026-09-23-history-replay-lifecycle/lifecycle-probe.log)).
  These assert current behavior; they are not adopted regression tests.
- 2026-09-23 `bun test ./docs/plans/artifacts/2026-09-23-history-replay-lifecycle-revised/claim-model.probe.test.ts`:
  2 pass, 1,684,894 assertions
  ([log](artifacts/2026-09-23-history-replay-lifecycle-revised/claim-model-probe.log)).
  The settlement rule is injected. The retained wrong-insertion rule diverges
  from call order on its minimal six-operation witness.
- 2026-09-23
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-23-history-replay-lifecycle-revised.md`:
  pass.
- No product source, package test, browser or docs run in this planning pass.

Final handoff prepared:

- Ownership and target API/runtime: Plite History owns one per-editor replay
  claim, `pending()` and settlement. Plite React owns mounted initiation and
  focus plus the exact-runtime result callback. Plate Comments owns per-thread
  serialization.
- Public breaks and adoption: `HistoryResult` gains `busy`. `HistoryStateApi`
  gains `pending()`. `EditorHistoryController` gains `pending`, returns `void`
  from `undo()`/`redo()`, and disables availability while pending.
  `EditableProps` gains `onHistoryReplay`, inherited by `EditorContentProps`.
  Editor updates no longer throw during pending and the queue is removed.
  Adoption covers Plate types, Comments, combobox, the registry button, docs,
  vision and Plate Next doctrine.
- Applicable browser/Benchmark/docs/provenance decisions: Chromium
  slow-persistence cases plus C22; no Benchmark; history and react-hooks docs;
  TaskHub-22 provenance.
- Scale applicability: N/A with source evidence.
- Proof and execution risks: journal forwarding at settlement (slice 1), late
  focus repair (slice 3), Comments queue ordering (slice 4).
- Execution order and user attention: slices 1-5. Single-flight `busy` is
  accepted. Permanently blocked-head recovery remains a separate API decision;
  this execution preserves B as the next target and never reaches A.

Timeline:

- 2026-09-23T13:38:22.576Z Plite Plan created.
- 2026-09-23 Ground: owners read; 9 current-behavior probes recorded.
- 2026-09-23 Decide: claim model checked; ledger resolved.
- 2026-09-23 Handoff prepared.
- 2026-09-23 Final review: five corrections accepted; immutable revised plan,
  reproducible mutant and superseding outcome prepared.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Handoff prepared |
| Where am I going? | Product execution slices 1-5 when authorized |
| What is the goal? | One truthful, live, single-flight replay lifecycle |
| What have I learned? | See Current state and Findings |
| What have I done? | See Timeline |

Open risks:

- Journal forwarding when a claimed entry leaves or enters below newer
  entries; slice 1 must prove remote mapping on both sides of the first
  interleaved edit.
- Browser case needs a deterministic persistence gate on the development-only
  proof route; do not rely on timing.
- Product refusal copy remains deferred after the lifecycle exposes an exact
  mounted result callback.
- Explicit recovery from a permanently blocked head requires the separate
  row-11 Best API Review; auto-skip is forbidden by the current TaskHub-22 law.
