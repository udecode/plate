---
title: History ownership
type: decision
status: implemented
updated: 2026-09-19
review_scope: history
current_review: 2026-09-16-history-post-adoption-reassessment
review_history:
  - ../review-records/2026-09-15-history-replay-boundary.json
  - ../review-records/2026-09-16-history-post-adoption-reassessment.json
source_refs:
  - ../../../packages/plitejs/src/history/history-plugin.ts
  - ../../../packages/plitejs/src/history/history-state.ts
  - ../../../packages/plitejs/src/react/hooks/use-plite-history.ts
related:
  - ../reviews.md#history
  - transactions-synchronous-boundary.md
  - collaboration-ownership.md
---

# History ownership

**Stop the Plite configuration redesign.** Keep the Plate history adapter and
its live getters. Plite owns exact descriptors whose immutable construction
inputs live in factory closures; Plate adds its richer descriptor structure,
inference, terminal configuration and mutable per-editor store. The adapter is
the honest boundary between those contracts, not a redundant second history
owner.

Status: Implemented and verified. The
[Task plan](../../plans/2026-09-15-history-explicit-replay-and-one-grouping-authority.md)
adopts the target across Plite, Plate, native/mounted consumers, AI actions,
public teaching and release artifacts. The dated assessment below preserves the
original audit evidence and limits; the final production receipt records the
source-stable implementation proof.

Objective: Review all 10 history ledger units, their public contracts and
materially different consumers; compare keeping, cutting, merging and replacing
owners before deciding whether further design work is justified.

Completion threshold: Every unit has a disposition, decisive claims cite live
source or a bounded executable diagnostic, prior evidence and its limits are
reconciled, and the immutable review plus generated ledger validate.

Hard laws: Undo preserves local user intent, skipped/remote changes, atomic
document updates, schema and effects, exact selection/root ownership, native
composition grouping, and editor/view retirement. Authored selective reversal
and collaborative identity must earn their distinct replay jobs. Compatibility
does not choose the target.

History also owns the single session order for fallible local effects whose
durable mutation lives outside the document. Such an effect is local,
effect-only, non-mergeable and excluded from persisted History JSON. Replay
awaits its owner before moving the branch; a typed block leaves the same head in
place, and editor publication is fenced while that replay is pending. The
public `undo()` and `redo()` results are promises so mounted focus repair and
callers observe the settled external mutation and document branch together.

Acceptance:

- [x] Inspect all 10 ledger units and material consumers.
- [x] Compare first-principles API and ownership alternatives.
- [x] Reconcile prior research and gather decisive current evidence.
- [x] Consume native-consumer and collaboration/authored sidecar findings.
- [x] Record one verdict, adoption/proof limits, and next owner.
- [x] Validate the review record and generated ledger.

## Final configuration reassessment

The final September 16 pass reverses the two intermediate Pursue records about
native configuration. The user's correction exposed the missing hard boundary:
Plate does not merely re-export the native plugin. `definePlugin` and
`BasePlugin` add Plate structure, inferred authoring capabilities,
`initialState`, `.configure()` and a scoped store. Extending a raw Plite
descriptor preserves its native API/read/update identity, but an already-created
descriptor cannot retroactively parameterize the closure created by
`history(options)`.

The [Plate wrapper](../../../packages/platejs/src/lib/plugins/HistoryPlugin.ts)
therefore has a real job. Its state is the Plate runtime-parameter contract;
the getters let the Plite history implementation read that live per-editor
state while retaining one recorder. The apparent duplication reflects two
different public contracts:

```text
Plite: history(options) -> exact descriptor with immutable factory inputs
Plate: HistoryPlugin.configure({ initialState }) -> enriched descriptor/store
Adapter: Plate store getters -> native history options
```

The rejected alternatives do not remove this work:

- An unchanged native re-export loses Plate structure, methods and inference.
- A generic native-to-Plate adapter can adopt static native capabilities, as
  current `.extend(RawPlugin)` already proves, but cannot infer an absent state
  schema or rebuild a captured factory closure.
- Adding `initialState`, a store or `.configure()` to Plite creates a second
  runtime-configuration model for this one adapter. It conflicts with the
  established raw contract that construction inputs stay in factory closures.
- Using only `history(options)` in Plate snapshots construction-time values and
  abandons Plate's standard configuration/store contract.
- Raw `tx.plugins.reconfigure(slot, history(options))` is transactional plugin
  replacement. It is not Plate store mutation, and history activation resets
  automatic grouping time during replacement.

The repeated default literals are an internal drift risk, including another
`100` in Plite history-state initialization. Centralizing an internal constant
could reduce that risk, but it does not justify a public configuration
primitive, a new adapter API or another design task.

This is a **Stop** verdict for Plite/Plate configuration redesign. It reaffirms
the original post-adoption ownership decision and reverses the later native
configuration and adaptation Pursue records. No follow-up design plan is
warranted. The immutable
[final-pass record](../review-records/2026-09-16-history-configuration-final-pass.json)
preserves the correction and proof limits.

## Earlier post-adoption reassessment

The following dated reasoning remains authoritative and is reinforced by the
final configuration pass above.

The September 16 reassessment deletes every surviving public noun and owner in
turn. None produces a material improvement:

- `editor.api.history.undo()` and `redo()` each own one complete update and an
  explicit outcome. Moving replay back into `tx.history` recreates the broken
  transaction-local stack promise proved by the original audit.
- `editor.read.history.hasUndo()` and `hasRedo()` keep controls off full branch
  materialization. The callable snapshot remains the narrow explicit inspection
  surface; the Yjs collaboration example reads branch depth from it, while
  `History.toJSON(editor)` separately owns persistence. Deleting it would trade
  one general read for depth methods or JSON inspection without removing the
  history representation.
- `editor.update({ history })` owns policy chosen by the outer caller;
  `tx.history.skip()`, `merge()` and `newBatch()` let nested helpers choose policy
  inside an update they do not own. Both forms have current non-test consumers.
- Atomic publication already uses the private generic transaction-guard bridge.
  History's remaining core bridge carries only next-batch identity and replay
  receipts to mounted selection/focus repair. Generalizing that single-consumer
  metadata path would add registration and lifecycle concepts without deleting
  behavior.
- Plate's `HistoryPlugin.configure({ initialState })` keeps one installed
  descriptor and one recorder while allowing live store configuration. A second
  factory or history-specific configuration channel would restore the duplicate
  recorder failure found during design.

The strongest rejected alternative is a generic transactional plugin-state
participant protocol. The source already has the useful half of that idea:
history prepares through `registerEditorTransactionGuard`, then publishes before
commit observers. Extending it over authored state, anchors, plugin
reconfiguration and mounted metadata would conflate different lifetimes and
failure laws. No second consumer needs the history identity bridge.

This is a **Stop** verdict for further history work. It reaffirms the adopted
September 15 target rather than superseding its implementation evidence. There
is no history-owned follow-up plan or consolation backlog.

## Original audit evidence

The [disposable probes](../../plans/artifacts/2026-09-15-history-review/transaction.probe.test.ts)
start with two separate batches inserting `a` and `b`:

| Operation | Observed result |
| --- | --- |
| Two separate `editor.update.history.undo()` calls | Empty text, zero undo entries, two redo entries. |
| `tx.history.undo(); tx.history.undo()` in one update | Throws `Cannot apply change length 6 to document length 5`. The second call selects the same published head. |
| `tx.history.undo(); tx.history.redo()` in one update | Text stays `a`; redo sees the pre-commit empty redo branch. |
| Undo, then insert `X` in one update; undo again | Text becomes `X`: the new edit was absorbed into historic replay, and the later undo removes the earlier `a`. |
| Separate undo, edit `X`, undo updates | Text correctly returns to `a`. |

The mixed-edit diagnostic does not settle whether a future combined operation
should form one new group or several. It establishes that today's surface
neither rejects unsupported composition nor gives it ordinary reversible-edit
semantics. These are API-level model observations, not browser claims.

[History replay](../../../packages/plitejs/src/history/history-plugin.ts)
reads the published head in `applyHistoryAction`, stages one last-wins
`history.action` annotation, and moves one entry in its commit observer. The
normal transaction builder cannot give that external stack transaction-local
semantics. A new spelling alone would not repair this contract.

The [availability probe](../../plans/artifacts/2026-09-15-history-review/availability.probe.test.ts)
retains 20 batches, performs one skipped insert, then evaluates
`editor.read.history.undos().length > 0`. It observes **20 calls to
`DocumentChange.transform`**. [The state owner](../../../packages/plitejs/src/history/history-state.ts)
resolves both full branches before returning the array. The React controller
uses array lengths for ordinary availability, and native focus code inspects
the last batch through those arrays. This is measured work count, not a latency
or speedup claim. Full stack materialization should serve explicit inspection
and persistence, rather than be required by common controls.

An authored dependent proposal can leave one undo entry while replay is blocked
by a conflict. The existing contract proves rejection preserves the document
and stack. `useEditorHistory` derives `canUndo` from depth and rethrows the
replay error. Detailed design must distinguish an existing entry from a
successful replay and give callers an honest outcome without promising a
costly speculative replay on every render.

## Native grouping and mounted replay

React's [input-history owner](../../../packages/plitejs/src/react/editable/input-history.ts)
uses a private **1000ms** timer and emits explicit merge/push tags. Plite's
history option defaults to **500ms**; explicit native merge bypasses that
configured delay. The [controlled-clock diagnostic](../../plans/artifacts/2026-09-15-history-review/grouping.probe.test.ts)
proves both directions through the actual native-tag helper and history owner:
`newBatchDelay: 50` with a 100ms pause merges into one batch; `newBatchDelay: 5000`
with a 1500ms pause splits into two. This is helper/model proof, not real keyboard
or physical IME proof.

Cut the React idle-time policy and let one history grouping authority interpret
native intent. Composition-session grouping is a separate hard law: the
selection deletion and final committed insertion must remain one user action
even across a long composition. Preserve native path/root boundaries and
explicit semantic session boundaries while testing automatic grouping.

Mounted replay is also duplicated. Native
[mutation-history](../../../packages/plitejs/src/react/editable/mutation-history.ts)
wraps replay in `withPliteViewSelectionHistory`, transferring projected-selection
metadata to the inverse batch. The
[React hook](../../../packages/plitejs/src/react/hooks/use-plite-history.ts)
reads that metadata but does not perform the transfer. It also checks
render-captured availability, while the native keyboard path first settles
pending input. These source differences justify consolidating mounted replay
preparation, metadata transfer and focus handling at the existing view owner.
Projected-owner loss across toolbar undo/redo cycles and pending-input ordering
need exact mounted/browser reproductions during design; this audit does not
claim those visible failures were reproduced.

## Ownership that survives

There is one current history stack per document owner. Plate's
[HistoryPlugin](../../../packages/platejs/src/lib/plugins/HistoryPlugin.ts)
extends Plite history, and `platejs/history` forwards the public substrate.
Yjs imports remote changes with `history-skip`; ordinary history maps local
batches through those changes. No competing current Yjs UndoManager was found.
Do not add a history backend selector or CRDT-only history authority.

Authored retained history serves selective attribution and compensation across
reload and retention, whereas local undo reverses interaction groups. Existing
authored effects preserve proposal identity and dependency checks during
replay. Keep those effects and the authored owner; replacing them with raw
inverse text changes would lose semantics.

Atomic restore is a real transaction job. The authored-ingress contract loads
`tx.value.replace(saved)` and `tx.history.restore(decoded)` in one update and
then successfully undoes/redoes. Grouping controls also modify the current edit.
Neither job justifies replaying arbitrary old batches inside an edit draft.
At audit time, AI cancellation additionally used `undo` plus `discardRedo` and then performed
replacement/insertion edits inside the same transaction in `AIChatPlugin`.
This is a real counterexample to a mechanical service move. Compare removing
that historical branch surgery through the existing preview/authored-change
owner against a fully transaction-local replay model. Preserve atomic
cancellation/replacement and decide its exact request identity and redo policy.
The follow-up source check corrects the initial guard description: the existing
fallback checks an AI-marked head and any AI-marked node, not exact request/batch
identity. Separate undo and replacement updates would expose an intermediate
state and are not an adequate adoption. This is a history migration constraint;
the global AI feature review remains separate and last in the queue.

## Adopted contract and alternatives

Installed call shape:

```ts
// The installed history owner opens one complete replay operation.
const outcome = editor.api.history.undo();
editor.api.history.redo();

// Edit policy still belongs to the current transaction.
editor.update({ history: 'new-batch' }, (tx) => {
  tx.text.insert('Hello');
});

// Atomic document and history loading remains possible.
editor.update((tx) => {
  tx.value.replace(savedDocument);
  tx.history.restore(History.fromJSON(editor, savedHistory));
});
```

The service uses the existing descriptor-owned `api` namespace. It introduces
no second runtime, store, public replay builder, wrapper plugin or transport.
Replay performs one internal canonical update with selection, effects, admission
guards and accepted-commit publication. `HistoryResult`, lazy head availability,
nested-call rejection and exact mounted binding are implemented contracts;
public branch discard is deleted.

| Lane | Verdict and reason |
| --- | --- |
| Keep/configure | Keep inverse canonical changes, skipped-change mapping, bounded branches, effects, schema validation and exact root selection. Caller discipline cannot correct the demonstrated replay composition failures. |
| Repair transaction composition | Strongest alternative to the service: stage stack heads, mapping/recovery, repeated actions and mixed edits in the transaction, then publish atomically. AI cancellation is real pressure for it. Compare this against removing AI's branch surgery at its preview/authored owner; the service cut is provisional until that adoption is concrete. |
| Change API and move ownership | Pursue whole-batch replay through the current history owner's `api`, with honest outcomes and narrow availability/next-entry reads. Preserve transactional policy, atomic load and intentional branch discard. |
| Delete/merge/inline | Pursue cutting transaction replay after atomic cancellation adoption, remove React's competing grouping clock, and consolidate duplicated mounted replay orchestration. Remove full-stack inspection from control paths. Retain Plate's facade and native focus/input adapters because they own distribution and browser jobs. |
| Add primitive | Reject a generic history backend/session/manager abstraction. Existing plugin capability, canonical transaction and commit owners can host the needed service. A new availability read must remove actual traversal and preserve dropped-batch semantics. |
| Replace with document snapshots | Reject: undo must preserve skipped/remote changes, domain effects and anchor/root identity. Replacing the entire document with an old snapshot loses those laws. |
| Replace with Yjs or authored history everywhere | Reject: raw offline/local history has an independent job; authored selective reversal has attribution, retention and conflict semantics that an interaction stack cannot replace. |

The September 15 **Pursue** verdict is adopted. Matched
frozen-baseline/final-source packets
cover replay, grouping and availability under retained depth, skipped structural
and text edits, named roots and authored effects. Source-first package checks,
packed declarations and managed browser matrices verify the integrated runtime.
No second history owner or compatibility API was retained.

## Ledger coverage

Expected: **10** units; reviewed: **10**; excluded: **0**; unreviewed or
disposition-unresolved: **0**. Adoption and proof are complete for all ten
history units.

| Ledger unit | Disposition |
| --- | --- |
| `capability/history` | Keep one installed capability; replay, reads and transaction policy share its inferred types. |
| `export/platejs/./history` | Keep the Plate facade for Plate consumers and package declarations. |
| `export/plitejs/./history` | Keep optional raw installation, codecs and headless use. |
| `platejs/history` | Keep the forwarding/configuration adapter; it does not own another stack. |
| `plitejs/history` | Keep the explicit replay service, lazy availability, snapshot inspection, canonical mapping, effects and validated persistence. |
| `plitejs/react/editable/history-focus` | Keep exact mounted-root focus restoration after complete model replay. |
| `plitejs/react/editable/history-keyboard` | Keep native event decoding; it owns no history state or grouping clock. |
| `plitejs/react/editable/input-history` | Keep native session/path/root annotations; the canonical history owner alone decides time grouping. |
| `plitejs/react/editable/mutation-history` | Keep the native event adapter that settles input and delegates to the mounted replay owner. |
| `ui/history-toolbar-button` | Keep the copied UI and public controller over lazy availability and mounted replay. |

## Prior evidence and proof limits

This is the first dedicated `history` review record. The June OSS history
research promoted skipped-overlap deletion; that invariant still exists and
passes in the current history suite. Its old package names and measurements
are historical, not current proof. The transaction review's atomic update law,
collaboration's admitted canonical commit path, and authored selective-reversal
ownership are reaffirmed. No fresh upstream discovery was necessary.

Current evidence: **131 history tests**, **31 anchor-history tests**, the
history typecheck, and **13 selected authored/Yjs tests** pass. Eight disposable
diagnostics produce three passing controls/work-count observations and five
expected failures demonstrating composition and configured-grouping gaps. The initial probe
used a nonexistent `tx.string` helper; that harness error is retained separately
and is not product evidence. The native sidecar used source inspection only;
the lead ran the controlled-clock diagnostic after reconciling that finding.

See the [receipt](../../plans/artifacts/2026-09-15-history-review/proof.md)
for commands and preserved outputs. No product source was edited. No new
runtime candidate, matched performance comparison, browser/device run,
declaration build or full repository gate is claimed. Structured Autoreview was
not run under the `next` branch policy. Two bounded independent subagents
provided native-consumer and authored/collaboration evidence; the lead owns the
final judgment.

The accepted API change repaired public history teaching and actual stale Best
API/layer examples, then versioned and regenerated affected doctrine.
The current rule requiring mutations through `editor.update` also permits a
complete service that owns that update; do not weaken it. The adopted API and
that ownership law are now taught together.

## Task design follow-up

The [canonical plan](../../plans/2026-09-15-history-explicit-replay-and-one-grouping-authority.md)
selects complete replay services, transaction grouping/restore, lazy head
availability, one core grouping clock and one exact mounted replay owner.
It cuts public transaction replay, duplicate array readers and branch-discard
surgery after atomic AI adoption. Plate configures its installed history
descriptor through initial state; its facade remains the same owner.

The deeper comparison reproduced two additional defects: a throwing history
inversion can publish content without an inverse batch, and extending Plate's
default descriptor with another history factory records two edits four times.
The plan includes private canonical preparation and a single configuration
adapter. Authored rejection followed by an accepted insertion is feasible in
one update; inline AI generation intentionally becomes a persistent proposal in
proposed review mode. This is a stated behavior change, not invisible parity.

The [design receipt](../../plans/artifacts/2026-09-15-history-design/proof.md)
separates disposable candidate, source/DOM fixture, scale and declaration
evidence from the original audit. The
[production receipt](../../plans/artifacts/2026-09-15-history-design/production-harness-receipt.md)
binds the final implementation, frozen baselines and source-stable production
packets. The immutable audit record is unchanged. All ten ledger units are
adopted and verified; AI's full feature audit remains separate.

Task completed S1-S6. There is no remaining history-owned adoption step.
Publication and a physical-device IME claim remain outside this task. AI timing
retains its formal inconclusive verdict under the frozen noise rule, so this
decision makes no speed claim.
