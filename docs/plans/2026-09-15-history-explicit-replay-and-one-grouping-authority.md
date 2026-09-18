# History: explicit replay and one grouping authority

This is a project-owned file template under Task. Apply the project's standing Autogoal request for long-running work unless the user opts out. Apply `.agents/rules/task/references/workflow.md` to timing, publication and review rows. Relevant domain and executable-validator gates remain required; mark unrequested publication/review N/A.

Status: Complete — S1-S6 implemented and verified; publication was not requested.

Objective:
Resolve history replay, grouping, availability and mounted-view ownership, then
adopt and prove the resulting design across every consumer in the
[ten-unit audit](../research/decisions/history-ownership.md).

Decision brief:

- outcome: honest local replay, configured grouping and atomic publication,
  with a concrete migration for every actual consumer.
- chosen shape: two history services; transaction-local grouping/restore;
  narrow availability; one mounted replay function; private group identity.
- strongest rejected alternative: a fully transaction-local history simulator.
  It retains generic replay/edit interleaving and still does not repair AI's
  snapshot rollback, authored composition or post-publication history failure.
- consequence: hard API cut, private commit-phase repair and bounded AI adoption;
  no compatibility wrapper or second history backend.


Flow mode:
execution and closure

Goal plan:
docs/plans/2026-09-15-history-explicit-replay-and-one-grouping-authority.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- package-api (docs/plans/templates/packs/package-api.md)
- performance-observability (docs/plans/templates/packs/performance-observability.md)
- registry-changelog (docs/plans/templates/packs/registry-changelog.md)

Mode:

- Standard, with bounded runtime comparison and independent AI/native design checks.

Completion threshold:

- Adoption closure: live claims sourced, one owner per responsibility, every
  decision resolved, every public break adopted, S1-S6 complete, conditional
  gates reconciled, final package/browser/production proof recorded, ledger and
  doctrine current, and `check-complete` passing.

Verification surface:

- Source-linked owner and caller review, model/DOM diagnostics, disposable
  replay/grouping/publication/configuration prototypes, final matched production
  packets, source-first and packed declarations, managed browser matrices,
  ledger/link validation and plan checking. Physical-device IME remains an
  explicit non-claim.

Constraints:

- S1-S6 execution is authorized and complete. Publication remains outside this
  task and requires separate authority.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:

- In scope: the audit's ten history units and their actual replay consumers.
- Source owners: Plite history, canonical update/admission, Plite React mounted
  replay and input, Plate history facade/controller and AI cancellation.
- Non-goals: publication, full AI redesign, the skipped
  diff audit, replacing authored selective reversal or adding a Yjs backend.
- Direct Plate/collaboration adoption owners: AI preview/replacement, combobox,
  copied toolbar, authored restore/effects, Yjs skipped-change admission.

Output budget strategy:

- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:

- A decision-changing runtime or native uncertainty that no bounded local
  source/prototype can settle; continue every independent planning obligation.

Plite Plan state:

- status: complete
- phase: closure
- next: none for this history adoption
- handoff: complete

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | User-selected history design/plan; original ten-unit acceptance and boundaries above |
| Task plan and execution authority verified | yes | User authorized full S1-S6 execution on the current `next` checkout; publication was not authorized. |
| Current owners read | yes | Live-owner table and immutable audit; 61 recorded source files match |
| Best API target resolved | yes | Public shape and hard-cut comparison recorded; scale acceptance remains a separate completion gate |
| Runtime scale applicability resolved | yes | Branch depth, mapping journal, affected anchors, effects, document width, mounted subscriptions and input clocks |
| Pre-acceptance Benchmark probe selected | yes | Four bounded source-graph comparators: service, grouping, publication and authored compound action |
| Mode and execution boundary resolved | yes | Standard Plite Plan; no product or publication authority |
| Performance pack selected | yes | Applied because repeated reads and transaction publication change |
| User-facing operation and runtime owner identified | yes | Availability, complete replay, native grouped edits, accepted publication and atomic AI disposition |
| Scale variables and cohorts fixed | yes | Frozen owner contracts; normal10/large100/stress1000 plus erased heads, mappings and affected-anchor fan-out |
| Budget frozen before target measurement | yes | Owner contracts; explicit unseen-cell sampling amendment retains numeric thresholds |
| Baseline and target probe selected | yes | Real repository owners with disposable source overlays; original source identities preserved |
| Correctness guard selected | yes | Exact value/selection/history/effects/projection, rollback, grouping, anchors and real Yjs peer observations |
| Production detector decision recorded | yes | Existing deterministic regression and Benchmark owners; no new production telemetry or protected data |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every changed scale owner has executable current-owner versus target
      evidence before its decision row locks. Grouping and changed anchor fan-out
      pass their frozen packets. History passes 224/224 deterministic comparisons,
      209 timing cells and eight cost-bound cells; its seven all-dropped same-work
      cells remain inconclusive. AI removes one complete update and meets every
      numeric budget, while two widths remain noisy. No speed claim is accepted.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Canonical state versus exact-view presentation is classified when
      applicable: no parallel state, copied payload, or editor-global policy
      owner survives without an independent job.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Performance pack: comparable current-owner receipts cover service,
      grouping, publication and AI; invalid and inconclusive packets remain visible.
- [x] Performance pack: measure the complete user-facing operation and isolate deterministic cost indicators such as iterations, visited units, renders, wakes, listeners, queries, or bytes.
- [x] Performance pack: normal, large, stress and pathological cohorts cover
      retained, erased, mapped, merged and affected-anchor work where applicable.
- [x] Performance pack: owner receipts record warm percentiles, cold observations,
      sample/warmup counts, noise, payload/work counts and exact source identities.
- [x] Performance pack: when the proposed path does not exist, build only the smallest disposable target prototype needed to test the claimed owner and scaling law before architecture acceptance.
- [x] Performance pack: compare current and proposed paths using matched source identity, fixture, action, environment, sampling, and correctness guard.
- [x] Performance pack: inspect query/render/subscription fan-out, result cardinality, pagination, repeated reads, and retained work before adding infrastructure.
- [x] Performance pack: optimize the measured owner; do not add pooling, caches, indexes, projections, stores, or schedulers without evidence that they own the work.
- [x] Performance pack: keep transaction-scoped database work serial unless the transaction owner explicitly supports parallel reads.
- [x] Performance pack: evidence contains no SQL, inputs, headers, credentials, tenant/person identifiers, or protected data.
- [x] Performance pack: add or extend a deterministic regression harness when the changed path lacked one.
- [x] Performance pack: record every budget override with baseline, owner, reason, and expiry; permanent unexplained exceptions are forbidden.

Package, documentation and registry gates:

- [x] Package/API impact is explicit: `plitejs` owns the raw service, result,
      reads and transaction cuts; `platejs` mirrors that capability and changes
      AI behavior. Public exports, declarations and packed imports require proof.
- [x] Release artifacts are resolved relative to `main`. These next-only history
      paths do not exist on `main`, so S5 updates the existing owning major
      `plitejs` and `platejs` changesets to describe the final API and behavior;
      it must not publish branch-relative removal prose or add a `minor` bump.
- [x] Registry impact is user-visible. S5 creates
      `apps/www/src/registry/changelog/entries/2026-09-15-history-actions.mdx`
      with `behavior` rows for the real `history-toolbar-button`, `ai-menu` and
      `use-chat` item IDs, then generates and checks JSON through the owning script.
- [x] Export/barrel impact is explicit: run `pnpm brl` after the final exported
      files/types settle; never hand-edit generated barrels or templates.
- [x] Current docs are source-backed and current-state only. Plate Docs updates
      the Plite history API/setup/editor pages, editor overview, React hook and
      current fork comparison plus the registry AI/history teaching reached by
      `/docs/ai`; historical v48 material and generated registry JSON stay untouched.
- [x] Docs proof includes exact imports, MDX/link checks, the registered `/docs/ai`
      route and generated-registry source identity. No migration/changelog voice
      appears in current reference pages.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Pass: public shape, private owners, adoption, failure laws and proof commands are closed below. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Pass: 61 immutable-review sources match; the final caller sweep is saved as `caller-recheck.txt`. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding | Pass: complete services, narrow reads and transaction-only grouping/restore are selected; no open P0/P1 remains. |
| Pre-acceptance scale proof | yes | Compare current and target owners across applicable cohorts | Pass for architecture selection on causal work: deterministic work/correctness passes throughout; changed fan-out and 217 service timing/cost cells pass. Seven same-work service cells and two AI widths remain timing-inconclusive and are not reclassified. |
| Production scale rerun contract | yes | Record the exact final-path rerun | Pass: S6 preserved frozen baselines and reran the service, grouping, publication and AI cohorts against final production imports. |
| Conditional risk and adoption | yes | Resolve triggered risk/browser/Benchmark/provenance work | Pass: browser/native, package, docs, release-artifact and doctrine owners are assigned; external research and publication are scoped N/A. |
| Verification recorded | yes | Record fresh implementation proof and exact execution gates | Pass: consolidated production receipt plus package, browser, source, link, ledger and plan validators below. |
| Handoff prepared | yes | Reconcile ownership, breaks, proof and remaining limits | Pass: final closure section records the adopted target and bounded evidence limits. |
| P1 autoreview | no | Never run Task Autoreview on `next` | N/A: current branch is `next`; Best API semantic review is recorded separately. |
| Goal plan complete | yes | Run the Autogoal plan checker | Pass: final verification command recorded below. |
| Warm latency budget | limited | Accept no latency claim where the frozen noise/budget gate is inconclusive | Final grouping and publication packets pass. AI meets every numeric budget but remains formally inconclusive under the frozen paired-noise rule, so no speed claim is made. The final service disposition is recorded in the production receipt. |
| Large/stress scaling | yes | Prove declared work growth on large, stress and pathological cohorts | Pass: direct head resolution, constant grouping work and A=1000 anchor promotion have executable cost evidence. |
| Cold and failure paths | yes | Record cold observations and owned failures | Pass: owner receipts include fresh-process observations; semantic probes cover inversion, conflict, rollback and stale-lifetime failures. |
| Payload and fan-out | yes | Record payload and query/render/subscription/cardinality evidence | Pass: full snapshots remain explicit; ordinary controls return booleans/small results; no new query, cache, subscription, backend or scheduler is added. |
| Production-path rerun | yes | Run after product implementation | Pass within the frozen contract and limits recorded in the production receipt; every packet reports stable source identity. |
| Correctness guard | yes | Run selected behavior/data-integrity guards | Pass on final production code through focused owner tests, strict Plite checks, browser matrices and production packets. |
| Before/after receipt | yes | Preserve comparable baseline and candidate evidence | Pass: four owner receipts retain source hashes, raw packets, failed attempts and bounded corrections. |
| Detector and privacy | yes | Select a safe owning detector | Pass: existing synthetic deterministic/Benchmark lanes; no user content, protected identifiers or runtime telemetry. |
| Performance regression check | yes | Run deterministic owner harnesses | Pass within the frozen numeric and correctness budgets; inconclusive noisy timing cells retain that verdict and make no speed claim. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Ten audit units, source owners and actual consumers reconciled | done |
| Decide | complete | Public contract, private publication, mounted/grouping and AI adoption specified | done |
| Implement | complete | S1-S5 adopted atomic publication and AI actions, explicit replay, consolidated native grouping/mounted replay, and current public teaching | done |
| Verify and close | complete | Strict package, release-artifact, browser, production-packet, ledger and doctrine proof reconciled with explicit noise limits | done |


## Current evidence and hard laws

The [history audit](../research/decisions/history-ownership.md) covers all ten
ledger units and records 131 passing history tests, 31 anchor tests, 13 targeted
authored/Yjs tests and history typechecking. Its five diagnostic failures prove
invalid replay composition and two configured-delay mismatches. Reuse those
receipts while their source fingerprints match; they are baseline evidence,
not evidence for this proposed implementation.

| Responsibility | Live owner | Required law |
| --- | --- | --- |
| Canonical updates and admission | [public-state.ts](../../packages/plitejs/src/core/public-state.ts) | Synchronous updates, no nested public update, one accepted document change, rollback before publication. |
| Local history | [history-plugin.ts](../../packages/plitejs/src/history/history-plugin.ts), [history-state.ts](../../packages/plitejs/src/history/history-state.ts) | One model-owned pair of inverse branches; preserve skipped changes, effects, schema, anchors and selection. |
| Grouping | [history-merge-policy.ts](../../packages/plitejs/src/history/history-merge-policy.ts), [input-history.ts](../../packages/plitejs/src/react/editable/input-history.ts) | One configured idle clock; preserve root, target, authored scope, explicit action boundaries and native composition intent. |
| Mounted replay | [mutation-history.ts](../../packages/plitejs/src/react/editable/mutation-history.ts), [use-plite-history.ts](../../packages/plitejs/src/react/hooks/use-plite-history.ts), [view-selection.ts](../../packages/plitejs/src/react/view-selection.ts) | Settle native input, preserve projected selection, bind focus and delayed work to the exact live mount. |
| Plate adoption | [HistoryPlugin.ts](../../packages/platejs/src/lib/plugins/HistoryPlugin.ts), [BaseAIPlugin.ts](../../packages/platejs/src/ai/lib/BaseAIPlugin.ts), [AIChatPlugin.ts](../../packages/platejs/src/ai/react/AIChatPlugin.ts) | Framework facade identity; cancellation and accepted replacement form one atomic product action. |
| Authored and Yjs | [authored-runtime.ts](../../packages/plitejs/src/core/authored-runtime.ts), [authored steps](../../packages/plitejs/src/authored/steps.ts), [Yjs adapter](../../packages/plitejs/src/yjs/core/editor-adapter.ts) | Keep attributed compensation distinct; dependent work can block replay; remote changes remain skipped and mapped. |
| Persistence | [history-codec.ts](../../packages/plitejs/src/history/history-codec.ts) | Version 4 JSON remains validated; document plus decoded history can load atomically. |

A further [publication diagnostic](artifacts/2026-09-15-history-design/publication.probe.test.ts)
proves that a history effect whose inversion throws currently commits inserted
text with an empty undo branch. The [output](artifacts/2026-09-15-history-design/publication.log)
records the history lifecycle error. This is a passing assertion of broken
current behavior, not a candidate pass. The cause is concrete: history computes
its next state in `on.commit`, after publication, and the plugin lifecycle owner
catches that callback's exception.

The design therefore includes history preparation before publication. A replay
service that returns success before a fallible history observer completes would
be an incomplete repair. External observers remain post-publication; a failed
observer must not roll back a successful edit or make it appear uncommitted.

## Private publication algorithm

The [merged-anchor candidate](artifacts/2026-09-15-history-design/publication-merge-receipt.md)
demonstrates the complete selected owner order. A plain reorder and a temporary
merge rejection were rejected during design; neither is an implementation target.

1. Finalize the draft and construct the existing canonical commit/snapshot once.
   Keep its private read scope; reject public update reentry and writes through
   captured finalized transactions.
2. Reuse authored `begin/finish/publish/close`. A private `prepare(commit)` stages
   the existing commit-keyed projection/selection capture and decodes fragment
   cleanup IDs before any publication. Failed close releases that capture.
3. Prepare the existing affected-anchor pass using finalized indexes. Retain its
   prepared listener state, restore the published state through the existing
   discard checkpoint, and retain only affected index patches. Extend the
   checkpoint with the two path-identity keys required for structural rollback;
   checkpoint historic recovery listeners before staged restore.
4. Reduce history once, including recovery consumption and merging. Retain the
   complete immutable next branch and clock; restore the old branch/clock in
   `finally`. Existing acceptance guards and plugin-registry commit stay inside
   the same prepublication rejection boundary.
5. Publish document/snapshot, authored state, prepared anchor positions/index
   patches and history state before external observers. Anchor publication only
   promotes prepared state; it does not map, capture, validate or merge again.
   Flush diagnostic work records through the lifecycle error owner, then normal
   commit/source/snapshot/afterCommit/Yjs delivery. Clear staged replay recovery
   on failure and on a no-net-change update.

The private guard receives the finalized commit and can return its prepared
publisher. It is not a new public extension/participant API. An effect inverter
inside the private preparation scope may inspect the finalized draft and anchor
geometry, while history still exposes the published branch. A later ordinary
guard read sees the original public document, projection, history and anchors.
No speculative branch leaks to a subscriber.

The candidate passes 17 target checks, nine original publication checks and
12 selected existing anchor/authored/Yjs tests. The merged operation keeps one
canonical commit, inversion, history reduction, group/batch preparation,
composition, recovery capture and recovery merge. It adds temporary checkpoints
and O(A) promotion for A affected anchors, without another all-anchor scan.
Failures in capture, merge, inversion or later acceptance restore public state;
an unrelated ten-anchor cohort is not visited. These are selected source-graph
proofs, not a full schema/fragment/root corpus or a production typecheck.

The atomicity law covers supported rejection and extension failures. It does not
promise rollback of an extension's unrelated external side effects, process
exhaustion or arbitrary corrupted internal invariants. Remaining internal pointer
promotion and snapshot allocation do not justify another public protocol.

## Adopted public API

These examples describe the installed implementation. Plate retains default
history installation and its existing facade:

```ts
import { createEditor } from 'platejs';

const editor = createEditor();
const result = editor.api.history.undo();
editor.api.history.redo();
const hasUndo = editor.read.history.hasUndo();
const snapshot = editor.read.history();
```

Raw Plite keeps explicit installation and its only grouping configuration:

```ts
import { createEditor } from 'plitejs';
import { history } from 'plitejs/history';

const HistoryPlugin = history({ newBatchDelay: 750, maxDepth: 100 });
const editor = createEditor({ plugins: [HistoryPlugin] });
editor.api.history.undo();
editor.update({ history: 'new-batch' }, (tx) => {
  tx.text.insert('Hello');
});
```

Plate configures the installed descriptor instead of extending another recorder:

```ts
import { createEditor, HistoryPlugin } from 'platejs';

const editor = createEditor({
  plugins: [HistoryPlugin.configure({
    initialState: { newBatchDelay: 750, maxDepth: 100 },
  })],
});
```

Add required numeric `HistoryPluginState` defaults on that descriptor. Its private
adapter reads the two parameters through the existing Plate store and installs
the Plite implementation once. Raw `history(options)` keeps its constructor.
During history preparation, validate both values and apply retention settings
for the next accepted update/replay; a read does not trim history merely because
the settings changed. Preserve current validation: `maxDepth` is an integer
greater than zero; `newBatchDelay` is finite and nonnegative; defaults are
100 and 500ms. Existing plugin enable/disable semantics still control presence.
No second options store, public factory, subscriber per
batch or additional commit handler is introduced.

The [configuration diagnostic](artifacts/2026-09-15-history-design/plate-options.probe.test.ts)
records two current traps: a separate factory conflicts with the default
descriptor; extending the default with that factory doubles recording. The
[in-memory candidate](artifacts/2026-09-15-history-design/plate-config-probe.ts)
proves `.configure`, single recording, delay, next-edit parameter refresh,
retention, replay and partial defaults. Parameter reads remain constant per
commit. Its recorder remains post-commit; publication has a separate owner probe.

`HistoryApi` has only `undo()` and `redo()`. Both return `HistoryResult`:

```ts
type HistoryResult =
  | Readonly<{ status: 'applied' | 'empty' }>
  | Readonly<{ status: 'blocked'; conflicts: readonly string[] }>;

type HistoryApi = {
  undo: () => HistoryResult;
  redo: () => HistoryResult;
};
```

`applied` means an accepted replay committed and its inverse branch is already
published. `empty` means no surviving entry remains after required lazy mapping.
`blocked` represents the existing authored dependency conflict, with immutable
conflicting contribution IDs. Catch that exact owned error before publication;
never classify every exception as a conflict. Invalid runtime use, failed
validation and unknown extension errors still throw. Post-commit observer errors
go to the existing lifecycle sink and do not change an applied result.

The service opens exactly one canonical update. It rejects a call from an
active update/read/spec before resolving a branch, staging anchor recovery or
mutating view state—even if the branch is empty. Sequential service calls are
separate complete actions. No callback, count, backend or root-selection options
are added. The published head can contain changes from any document root and is
always applied as one document-wide batch. The editor/view receiver supplies
only the invoking root for selection/focus presentation; the shared stack does
not filter or search for an earlier batch from that root. Add an explicit
cross-root batch case so a header invocation cannot partially replay a main-root
head or substitute a different entry.

Delete the private `historyUndoCommand` / `historyRedoCommand` descriptors and
their transaction-spec dispatch detour. Source finds no independent consumer;
the history service invokes its private batch-consumption algorithm inside the
one update it owns. Keep canonical change/effect admission, not a second command
surface or a root-level `editor.undo` alias.

Keep `tx.history.merge()`, `newBatch()`, `skip()` and `restore(decoded)`. Their
jobs modify the current edit or atomically install saved state. Remove
transaction/direct-update `undo` and `redo`; remove public `discardRedo` after
AI no longer consumes it. Keep full immutable `state.history()` for explicit
inspection and the existing version 4 codec. Delete the redundant `undos()` and
`redos()` array readers; ordinary controls use `hasUndo()` and `hasRedo()`.
Those predicates answer whether a mapped entry exists, not whether authored
admission will succeed.

Whole-document loading remains one update on the complete model editor:

```ts
import { History } from 'platejs/history';

editor.update((tx) => {
  tx.value.replace(savedDocument);
  tx.history.restore(History.fromJSON(editor, savedHistory));
});
```

The existing nominal `PluginTypeProvider` supports the additional `api` slot.
Add `api: { history: HistoryApi }` to the history provider; retain value-sensitive
read/restore types. No caller generics, callback annotations, dynamic namespace
casts or separate factory are required. The
[compile-only specimen](artifacts/2026-09-15-history-design/api-types.probe.ts)
exercises direct/portal discovery, inferred callbacks and negative capability
boundaries. It is declaration-design evidence, not emitted-package proof.

Carry `HistoryApi` through Plate's
[compact core capability definition](../../packages/platejs/src/lib/editor/coreEditorCapabilityDefinition.internal.ts)
and exact history proxy. Default, inferred and descriptor-scoped editors must
expose the same API. Do not fix default inference with a consumer cast or only
prove a raw editor.

## One grouping authority and one mounted replay owner

The [native report](artifacts/2026-09-15-history-design/grouping-report.md)
contains the comparison and diagnostics. Remove React's 1000ms timer. The only
new input facts are a private numeric mounted-source `origin` and its optional
`composition` epoch. Annotations clone values, so object-reference tokens would
be incorrect here. Allocate origin once per mounted native or external-text
source generation; reuse the current composition epoch. Derive root, target,
edit kind and contiguity from canonical changes. Do not duplicate them in
metadata or encode sessions as dynamic tag strings.

Ordinary input uses the configured core clock and current compatibility rules.
First composition input starts a batch; predeletion, final input and fallback
insertion share an epoch and may merge across arbitrary delay. A different
origin/epoch, ordinary input after composition or another saved local action
ends eligibility. Skipped remote changes create no entry and reset ordinary
timing, while a surviving mapped composition head retains its intent. Never
search backwards for a matching session. Explicit normalized history policy
remains authoritative and last-wins; do not change policy normalization while
removing the competing clock. Preserve root and authored effect compatibility.

The existing `EditableDOMRuntime` owns one private
`replayHistory(direction, focusPolicy)` used by native keyboard/beforeinput,
`useEditorHistory`, and external-text commands. Core `editor.api.history` remains
headless; it does not secretly invoke DOM work. Native decoding and React
subscriptions remain thin adapters.

At this optional integration, reuse the internal core plugin registry's
`getInstalledPlugin(editor, 'history')` and installed API resolution. Do not
import/instantiate the history factory in React just to check presence, create a
second nominal descriptor, or test stack-array shapes. Narrow the installed
history contract once at this internal boundary; type-only imports do not add a
runtime feature dependency. Public generic code keeps its actual descriptor
portal. This plan does not broaden public plugin lookup or introduce another
capability registry.

Resolve the exact live invoking view, refuse active composition without queuing
replay, settle a completed composition's pending input and the existing
repair/Android queues, then recheck permission and lifetime. Invoke the headless
service against the live head. Pending-input settlement may publish text before
replay; never select the head beforehand. Only an applied result updates
projected endpoints and schedules existing render/caret/focus repair.
Empty/blocked results do not move focus or projected selection. Delayed work
captures and rechecks the same generation, connected DOM and permission, and
cancels at retirement.

An accepted receipt also carries its canonical commit version privately. A
post-commit observer may perform another accepted edit before the service
returns; retain the original `applied` outcome but discard stale presentation
work when that version is no longer current. Scheduled focus also reuses the
existing root focus-request token and active-element guard, and compares the
captured model/projected selection with the current selection. A later caret
move or newer accepted command wins even inside the same focused mount. Add
this case to the mounted replay gate.

Keep `EditorHistoryFocusPolicy` and the root/content-owner focus resolver.
Explicit `editor` binds exactly that mount. Ambient/root-only chrome resolves
the active mounted copy once per invocation, then captures it. Neither shared
model identity nor the same root authorizes targeting a replacement view.
These root choices affect command/focus context, not history-stack membership.

`canUndo`/`canRedo` remain UI affordances: installed, writable, not actively
composing and a surviving head exists. Never use the last React render as an
execution gate. Controller commands return:

```ts
type EditorHistoryResult = HistoryResult | Readonly<{
  status: 'unavailable';
  reason: 'not-installed' | 'unmounted' | 'composing';
}>;
```

Direct commands through read-only/retired views retain normal write rejection;
disabled UI calls nothing. Owned empty/blocked native intents are consumed to
avoid browser undo diverging from the model. Unavailable active IME and unrelated
controls remain with their input owner. Copied UI can inspect a blocked result;
the history hook does not choose product dialogs or messages.

Add one private logical-group identity to the existing history branch. Allocate
on push/restore and preserve through merge, lazy mapping, clipping, snapshot
reconstruction and undo/redo movement. Do not export or serialize it. Public
Batch objects, derived groups, optional anchor recovery and store revision
have the wrong lifetime. React associates projected endpoints with that identity
through private record/map/replay/release points and an accepted receipt; it must
not rediscover a batch from a possibly newer public head.

On merge, retain the first undo endpoint—including explicit absence—and replace
only the latest redo endpoint. Preserve each endpoint's exact origin generation.
Reuse current anchor/recovery ownership to map points and content-owner paths;
rebuild projected segments from the current graph. Dropped owners or unresolved
fragments invalidate projection. Retained history must not keep a retired DOM
view alive. Identity transport is proven by the prototype; final coordinate
mapping and DOM lifetime require the execution checks below.

## Atomic AI adoption

Do not move the existing `tx.ai.undo()` call to two consecutive updates. Do not
pretend the current preview owner already solves cancellation: `cancelPreview`
restores copied blocks, and `acceptPreview` uses follow-up updates. Generate
actions can cancel before discovering that their requested insertion cannot
fit. The prior audit also overstated the guard: the source checks an AI-marked
history head plus any AI-marked node, not an exact request/batch identity.

Use the current owners according to the actual draft job:

| AI path | Target |
| --- | --- |
| Chat generation | Keep detached `previewValue`; discard locally or commit one accepted edit. |
| Inline insert generation | Stream one authored insertion proposal through the existing native block renderers and AI styling; amend that exact proposal. |
| Chat edits and cell edits | Keep authored proposals and exact replacement/cell keys. |
| Final generation insertion/replacement | One normal new batch, with formatting, fit, target and final selection validated before publication. |
| Proposal accept/reject | One normal, reversible authored decision. |
| Proposal output inserted below/replacing accepted content | Stage rejection, then the accepted edit, and publish one new batch. |

**Inline generation deliberately enters the existing proposed review mode.**
This is a product behavior change, not invisible migration glue: output is an
attributed persistent proposal; other pending proposals can become visible and
input follows that view's proposal policy. Preserve and restore the invoking
view's previous policy after successful disposition. The alternative of placing
a separate static preview editor inside the invisible anchor does not preserve
native block editing/layout; no claim of exact old interaction parity is made.
This bounded AI adoption belongs to the history cut; the complete AI feature
audit remains separate and last in the queue.

Capture the originating view policy once per request, not once per chunk. Use
the existing proposal command to build the first candidate; enter mounted
proposed mode only after that proposal commits and the same view/request is
still current. A failed first chunk must not leave an unrelated view in review
mode. Successful later chunks retain the captured policy; stop retains the
review session for disposition. Post-commit retirement suppresses UI work
without pretending the accepted proposal never committed.

Complete actions belong on the existing `AIChatPlugin.api`, which owns their
one update and commit-dependent UI work. Keep parsing and proposal amendment
with their existing implementation owners. Remove `ai.undo`, AI-marked batch
effects/guards, snapshot-restoration previews and the invisible canonical
positioning anchor. Position the current menu from the last exact generated
block key. Remove UI-open-dependent document corrections; hiding a menu must
not erase a proposal restored by undo.

```ts
import { AIChatPlugin } from 'platejs/ai/react';

const ai = editor.plugin(AIChatPlugin);
ai.api.accept();
ai.api.reset();
ai.api.insertBelow({ format: 'none' });
ai.api.replaceSelection({ format: 'none' });
```

Keep the existing `format?: 'all' | 'none' | 'single'` option, default `single`.
Keep action return vocabulary during this bounded adoption: `accept()` returns
an existing non-success `AuthoredResult` or `undefined`; `reset()` returns the
existing `AuthoredResult | null`; insertion/replacement remain `void` commands
whose rejected/no-op paths preserve state. Do not manufacture an applied review
result before a compound suffix commits. Unexpected preparation failures throw.
This cut does not introduce a second generic action-result framework.

`reset()` is explicit disposition; remove its `undo` option. `hide({ focus? })`
only hides presentation and applies the existing permitted focus policy; remove
its `undo` option and implicit document cancellation. Existing cancel/discard
handlers call reset and hide only after successful disposition. Starting a fresh
request through show/reload must resolve the old request through the same
disposition owner and stop on a blocked result; it cannot silently discard
ownership. Retain `acceptSuggestions` and `rejectSuggestions` during this
bounded history adoption: they are proposal actions, not history surgery, and
judging their overlap belongs to the separate AI API audit. Keep
transaction-local stream and amendment commands that actually compose the
current draft. Migrate the existing AI focus/action/lifecycle contracts
alongside the menu callers.

The authored owner needs one bounded composition law: a decision prefix may be
followed by ordinary accepted writes in the same draft. Keep the prohibition on
writes preceding a decision, replacement/receive mixing and unsupported
interleaving. Its current `transactionChange` guard forbids the suffix, and
`finishContent` returns after selecting the decision projection; deleting the
guard alone is incorrect. Stage the decision projection, suffix operations,
positions, selection and inverse effects in order, then publish once. Do not
add a public phase builder, second history stack or a callback option on undo.

An action builds its complete unpublished candidate before clearing preview or
changing UI. Resolve original targets against the post-rejection accepted
draft. A failed fit, missing target, invalid selection or conflict aborts that
candidate; a plain return after staging rejection is forbidden. Stage parser
state, output keys, preview clearing, view-policy restoration and menu closing
until acceptance. Post-commit observers cannot convert a successful action to
a rollback.

| Action | History and failure law |
| --- | --- |
| Discard detached generation | No content change; preserve both existing branches; discarded output never becomes redoable. |
| First canonical proposal chunk | Fresh batch; clear redo only after acceptance. |
| Further chunks | Amend the exact proposal; merge only with its uninterrupted compatible group, never an intervening user edit. |
| Reject a persistent proposal | Fresh reversible review batch; never skip rejection or secretly discard redo. Undo restores pending status intentionally. |
| Accept a proposal | Fresh review batch; undo restores the pre-action proposal state. |
| Reject plus accepted insertion/replacement | One fresh batch; one undo reverses the entire action. |
| Stop streaming | Stop transport, retain detached output or the persistent proposal for disposition. |
| Stale, blocked, failed or actual no-op | Preserve document, authored state, selection, both branches and review UI. |

Callbacks capture the actual request generation and originating editor/root,
and revalidate after every await. Validate the existing `AuthoredSelection`
document ID, proposal IDs, revisions and heads; advance expected identity only
after an own amendment commits. Node targets use exact keys. Text replacement
uses the existing document anchor with `deletion: 'drop'`, resolved through the
authored projection in the final draft. Preserve direction. Never substitute a
similar sibling or copy projected numeric paths into accepted content.

Keep anchors through streaming, stop and blocked actions. Release them after
successful disposition, request replacement, owner retirement or root removal;
release temporary projection handles at the action boundary. Map independent
foreign edits and moved targets; reject deleted/wrong-root targets, overlapping
replacement conflicts and dependent authored work. Cell streams require the
same rooted cell and valid schema. A cell-only result cannot use block-level
insert/replace actions unless complete block output was actually produced;
decline before any rejection.

## Decision ledger
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Whole-batch replay | Transaction command consumes published head | Complete `api.history.undo/redo` service | Plite history + canonical update | Replay does not compose as an ordinary draft mutation | S3 migrates all callers after S1/S2 | Replay matrix, nested rejection, one commit, return types | Authored conflict and skipped mapping | Select service; delete transaction replay |
| Availability | Both arrays materialized | Existing lazy head resolver behind `hasUndo/hasRedo` | Immutable history branch | A toolbar needs existence, not a serialized stack | S3/S4 migrate controls and combobox | Frozen scale packet; erased and surviving heads | Presence cannot promise replay admission | Reuse resolver; no cache or extra store |
| Inspection and persistence | Full immutable state + duplicate array readers | Keep callable snapshot and version 4 codec; cut array methods | History state/codec | Explicit persistence has a separate complete-data job | S3 declarations, S5 examples/tests | Roundtrip and atomic value/history restore | Wrong document/schema rejection | Retain snapshot/restore only |
| Publication | History is a fallible post-commit observer | Private preparation inside canonical transaction; publish coherent state before observers | Existing transaction, authored and anchor owners | No accepted document without its inverse history | S1 first, S6 integrated proof | Inversion/reducer/acceptance failure, anchor capture, authored caret, Yjs observer | Merge recovery must prepare before publication | One preparation protocol; no public participants |
| Raw and Plate settings | Raw constructor works; extending default descriptor duplicates recording | Raw options; Plate descriptor initial state with one private adapter | Existing history descriptor/store | Plate default capability needs ordinary `.configure` without two reducers | S3 one installation and named numeric state | Seven configuration checks; actual facade types | Changed depth applies on next accepted operation | Keep facade; delete duplicate recorder pattern |
| Grouping | Core and React clocks compete | One core delay plus private numeric native intent | History merge policy | Configuration and composition have different responsibilities | S4 removes React clock and explicit native idle tags | Controlled clock/composition matrix; native contracts | Skipped remote mapping and authored effects | Keep intent, remove competing policy |
| Mounted replay | Keyboard, hook and external text diverge | One private method on exact live Editable runtime | Mounted view runtime | Pending input and focus are view jobs | S4 all three adapters; copied toolbar uses hook | Model/DOM diagnostics; exact-view browser gates | Stale closure, active composition, retired mount | Consolidate orchestration |
| Projected replay identity | Weak metadata keyed by replaceable Batch objects | Private stable logical-group object, existing coordinate recovery | History branch + view selection adapter | Metadata must survive mapping/merge/reversal | S1 identity; S4 endpoint transfer | Identity probe and repeated projected replay | Retaining dead views or wrong endpoint | Private identity only; no JSON/session API |
| AI cancellation | Undo/discard plus edits, copied preview blocks | Detached chat output or exact authored proposal; complete action service | Existing AI and authored owners | Product cancellation must be atomic without history surgery | S2 before replay deletion | Prefix/suffix probe; request/root/stream/UI cases in S6 | Deliberate proposed-mode behavior; asynchronous staleness | Remove branch surgery and snapshot rollback |
| Authored decision composition | Guard rejects suffix; finish would omit it | Decision prefix followed by accepted edit suffix, captured once | Existing authored finish/checkpoint | Needed by one complete rejection/replacement action | S2 private accumulation; retain other mixing guards | Exact effect order, foreign content, rollback and undo/redo | Do not admit proposed suffixes or later decisions | Bounded law; no phase-builder API |
| Collaborative/selective history | Local inverse stack + authored attribution; Yjs skips remote | Same owners and admission | Existing history/authored/Yjs | Offline undo and selective compensation are independent jobs | Migrate local replay call sites only | Authored dependency conflict and real peer tests | Remote work must survive local replay | Retain; reject universal Yjs/snapshot replacement |

The strongest alternative is a transaction-local simulator that stages stack
heads and repeated replay. It would still require AI's snapshot cancellation and
canonical publication repairs, while preserving an otherwise unsupported mixed
replay/edit language. The authored prefix/suffix prototype provides the actual
atomic consumer job without that language. A spelling-only service is also
rejected: it leaves the post-publication inversion failure intact. A timer-only
patch is insufficient because it loses composition identity and mounted replay
ownership. Public batch IDs, separate history managers/backends and an editor
global focus bridge have no independent current job.

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| S1: prepare and publish | Plite canonical update, history, authored capture and affected anchors | Prepare fallible history/capture/merge before publish, restore checkpoints on failure, publish branches/clock coherently; stable group identity | Authorized execution of this plan | Every supported push/merge/skip/restore/replay retains existing behavior; observers see coherent state; no new public API | History, anchor, authored/Yjs guards plus final publication packet |
| S2: remove the AI dependency | Authored finish and Plate AI | Admit accepted suffix after decision; move complete actions to plugin API; detached chat/persistent inline proposal ownership; exact request and target lifetime | S1 publication law available | No `ai.undo`, snapshot restoration, batch marker or branch-discard consumer; all successful dispositions commit once | Atomic action, streaming, stale/dependent/failed target, table-cell and named-root proof; AI packet |
| S3: cut and publish API | Plite history and Plate facade | Introduce service/result and head reads, delete tx/direct replay/array readers/discard; descriptor configuration and exact type mirrors | S2 caller no longer needs replay in a draft | All raw/Plate/default/scoped consumers infer the target; one recorder; codec/restore intact | Source-first history/core/Plate typechecks; public capability tests; service packet |
| S4: consolidate native owner | Plite React Editable runtime, grouping, projection, external text | One core clock, numeric source/composition intent, live mounted replay, endpoint transport and focus lifetime; combobox and toolbar adoption | S1 identity + S3 service | All native/chrome/external routes call one private owner; no render-captured execution gate | React contracts; managed browser cases; grouping packet |
| S5: complete public adoption | Public docs, package release notes, registry source, exports and doctrine | Sweep actual consumers; update current history/AI docs and examples; update the owning `plitejs`/`platejs` major changesets relative to `main`; add the `history-actions` registry entry; generate barrels/registry/changelog; repair source doctrine | Public contracts settled in S2–S4 | No stale installed-API teaching; branch-only removals are absent from release notes; generated files come from owners; CI-controlled templates untouched | Caller inventory, MDX/link/route proof, changeset status, changelog generator check, `pnpm brl`, registry generation and owner checks |
| S6: integrated closure | Task + Verify Plate/Benchmark | Run exact final source proofs, production cohort packets, browser closure and original ten-unit acceptance | Cohesive final implementation | Required gates pass or an actual external limitation is identified with exact evidence; ledger adoption/proof updated honestly | Commands and acceptance below; no publication without separate authority |

These are dependency slices inside one adoption, not permission to ship a dual
API. A temporary private bridge may exist while editing S2/S3, with deletion in
S3 before its exit. Do not export compatibility overloads. S1 must not publish a
partial anchor repair that disables normal merge. If an implementation attempt
fails, revert that cohesive uncommitted attempt while preserving unrelated work
and its diagnostic evidence; no persisted format downgrade or dual-write mode
is required because version 4 remains the only history format.

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Explicit replay is truthful | Five prior failing composition/grouping diagnostics; service candidate | Applied/empty/exact-authored-blocked; invalid/unknown throws; nested update/read/spec rejects before staging; sequential undo/redo; document-wide cross-root batch from a different invoking root; readonly and retired receivers | Implemented and verified in S3/S6 |
| Reads scale with head work | Existing 20-batch traversal diagnostic and scale packet | Erased head, all erased, surviving older entry, lazy text/structural journals, named root and undo/redo | Implemented; final production disposition is source-bound in the production receipt |
| Publication is coherent | Current inversion defect; ordinary and staged publication probes | Failure before/after authored finish; merged/deleted persistent anchors; effects-only and no-op; exact clock/stacks/selection; observer order and real Yjs | Implemented and verified; internal allocation faults are not an external rollback guarantee |
| Atomic AI needs no history replay | Six candidate fixtures and matched controls, one commit/batch and eight draft applications | Accepted replacement and insertion; retained foreign work; actual remote dependencies; stale stream callbacks, fit failure and empty output preserve UI/stacks | Implemented and verified; timing remains formally inconclusive under the frozen noise rule, with no speed claim |
| Declaration shape is inferable | Raw nominal provider specimen has no additional diagnostics against focused baseline | Raw installed/absent, Plate default/configured/scoped editor, typed portal, custom Value, inferred callback, immutable conflict data, facade export identity | Verified by source-first checks and packed NodeNext/Bundler declarations |
| Native grouping follows config and intent | 12 grouping cases, 36 value/selection roundtrips, constant metadata/clock work | Typing and deletion at delay boundaries; marked multileaf composition predelete/final/fallback; interleaved user/remote changes; explicit last-wins policy | Implemented; source contracts and the managed browser matrix pass; no physical-device IME claim |
| Replay targets the correct mount | Current hook diagnostics; 5 identity tests/22 assertions | Two same-root copies, named root, projection undo/redo/undo, dropped paths, pending input, stale render, active composition, readonly and retired queues | Implemented and verified through mounted contracts and managed browser coverage |
| Persistence and collaboration remain distinct | Existing authored ingress and Yjs contracts; staged restore and peers | Atomic decoded history+document replacement, schema/root/effect rejection, local undo preserving remote work, authored retention/compensation | Reuse existing owners and focused contracts |
| Public teaching and release artifacts match implementation | Export/caller/source and `main` review | Current docs only; exact imports; owning major changesets; registry entry for three real items; barrels, generated registry/changelog, immutable doctrine version and mirror proof | S5 complete; generated owners and mirrors verify cleanly |

Execution commands (repository root unless a working directory is named):

```sh
pnpm --filter plitejs test:partition:history
pnpm --filter plitejs typecheck:partition:history
pnpm --filter plitejs typecheck:partition:core
pnpm --filter plitejs typecheck:partition:authored
bun test ./packages/plitejs/test/history/anchor-history-contract.ts
bun test ./packages/plitejs/test/authored-history-contract.test.ts ./packages/plitejs/test/authored-ingress-contract.test.ts ./packages/plitejs/test/authored-anchor-contract.test.ts ./packages/plitejs/test/yjs/authored-contract.spec.ts
bun test ./packages/platejs/src/ai/lib/BaseAIPlugin.spec.tsx ./packages/platejs/src/ai/react/AIChatPlugin.suggestions.spec.ts ./packages/platejs/src/ai/react/AIChatPlugin.streaming.spec.ts
bun test ./apps/www/src/registry/components/editor/ai.lifecycle.spec.tsx ./apps/www/src/registry/components/editor/use-chat.lifecycle.spec.tsx
pnpm --filter platejs typecheck
pnpm check:plite:dev
```

Run the selected Vitest files from `packages/plitejs`:

```sh
bun run test:react test/react/input-history-contract.test.ts test/react/use-plite-history.test.tsx test/react/projected-command-contract.test.ts test/react/view-selection-contract.test.ts test/react/input-router-contract.test.tsx test/react/composition-state-contract.test.ts test/react/external-text-contract.test.tsx test/react/selection-transport-lifecycle.test.ts test/react/runtime-root-lifecycle-contract.test.ts
```

Use the existing managed browser owner, sequentially:

```sh
pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/multi-root-document.test.ts tests/plite-browser/donor/examples/synced-blocks.test.ts tests/plite-browser/donor/examples/editable-voids.test.ts tests/plite-browser/donor/examples/external-text.test.ts tests/plite-browser/donor/examples/plaintext.test.ts
```

Those routes prove root/caret follow-up typing, active copies, editable inner
controls, external-text composition/replay/lifetime and replacement/caret undo.
Add only missing costly boundary cases to their actual owner; do not mirror
implementation details or test that removed names stay absent. The AI app check
uses the `ai-demo` registration in `registry-examples.ts`, backed by
`examples/demo.tsx` and `examples/values/ai-value.tsx`, at `/docs/ai`: stream,
stop, reject, accept, insert below, replace and ordinary undo/redo, including the
deliberate proposed-view mode. Recheck that serving registration at execution;
do not invent a Playwright file or claim the headless fixture exercised UI.
Capture source/build identity through Verify Plate.

S5/S6 closure runs `pnpm brl`, `pnpm --filter www build:registry` on `next`
because AI/toolbar registry source changes, then `pnpm check:plite` and
`pnpm check:plite:browser-matrix`. Public declaration and packed consumer proof
uses the existing `pnpm plite:release:packages` artifact runner when asserting
published imports; it builds/checks locally and grants no release authority.
Physical IME remains a separate capability-specific claim: use a real device
only if that claim is made, and label synthetic composition proof accurately.

S5 also runs the release/docs owners after editing their canonical sources:

```sh
pnpm exec changeset status --since=main
node tooling/scripts/generate-ui-changelog-entries.mjs --write
node tooling/scripts/generate-ui-changelog-entries.mjs --check
pnpm --filter www check:docs
```

The changelog generator test is N/A unless its script, schema or source layout
changes. The implementation updates existing major package changesets rather
than adding a branch-relative migration for next-only names.

Before S1 edits product code, preserve the baseline source graph used by these
disposable runners under the same ignored artifact directory, including the
changed canonical/authored/anchor dependencies and manifests. No new checkout is
needed. During S6, adapt each existing runner's loader to select that frozen
baseline versus unmodified final production imports; do not reapply the candidate
patch to production or silently compare two modes that both import changed
owners. Keep the fixture, budgets, sample count, correctness oracle and retained
failed packets intact. Add a documented `--production` loader switch to those
same task-artifact runners, then run:

```sh
HISTORY_PROOF_PRODUCTION_RUN=final HISTORY_PROOF_PRODUCTION_RELEASE=explicit-release bun docs/plans/artifacts/2026-09-15-history-design/scale-run.ts --production
HISTORY_PROOF_PRODUCTION_RUN=final GROUPING_TIMING=1 HISTORY_PROOF_PRODUCTION=1 bun test ./docs/plans/artifacts/2026-09-15-history-design/grouping-probe.test.ts
```

The publication and AI final runner commands are recorded with their settled
receipts in the Scale contract. `--production`/`HISTORY_PROOF_PRODUCTION` here
are specified S6 harness adaptations, not claims that today's disposable runners
already implement them. Preserve the accepted baseline/target work distinction:
AI's frozen baseline is the pre-adoption sequential action, which is not atomic.
S6 retained the separate atomic correctness proof as well as the cost comparison.

Scale contract:

The frozen contracts are [service](artifacts/2026-09-15-history-design/scale-contract.md),
[grouping](artifacts/2026-09-15-history-design/grouping-contract.md),
[publication](artifacts/2026-09-15-history-design/publication-contract.md) with
its final timing freeze, and [AI](artifacts/2026-09-15-history-design/ai-timing-contract.md).
The design receipt binds the actual source overlays, manifests, commands,
failures and later bounded harness corrections. No threshold is silently relaxed.

| Operation / owner | Size and fan-out | Frozen budget and evidence class | Current result |
| --- | --- | --- | --- |
| Availability and complete replay / history | Retained10/100/1000; skipped0/1/20; text/structural; main/header; undo/redo; obsolete surviving/all-dropped/empty | One surviving head; work bounded by actual dropped heads and queued mappings. Availability p95 <= baseline +0.2ms at100/1000; replay p95 <= baseline×1.2+0.5ms; 50ms absolute unless baseline exceeds it. 5 warmups/25 alternating pairs and one predeclared eligible rerun | Final production passes all 224/224 availability and replay cells, including the eight full-sample depth-1000 structural stress cells and all-dropped cases. Source identity is stable and no row is inconclusive or failed. |
| Grouped native intent / existing merge policy | Retained10/100/1000; ordinary configured idle and 12 composition/policy cases | Complete two-update packet, 5/25 alternating pairs; frozen non-regression limit in grouping contract; constant metadata work | Final production passes all 12 cases and roundtrips plus all three timing tiers. Baseline/production p95 is 0.599/0.488ms, 0.515/0.500ms and 0.554/0.636ms. Source identity is stable; no physical-native latency claim. |
| Accepted publication / existing transaction owners | Retained10/100/1000 batches with N total retained effects; N emitted effects; push A=0, merge A=N affected anchors | Complete update p95 <= baseline×1.2+0.5ms; one existing owner pass/inversion/reduction; explicit A pointer promotions. Noise gate p95−p50 <= max(0.5ms,0.5×p50) | Final production passes all six push/merge comparisons and deterministic work checks with no noisy cohort. The A=1000 merge is 4.308/4.902ms baseline/production p95, within budget; source identity is stable. |
| Atomic AI disposition / authored finish | Width10/100/1000, one proposal decision and accepted output insertion | Complete candidate action <= baseline sequential action×1.2+0.5ms at p95; no extra draft/document applies; frozen paired-noise rule | Final production correctness passes at all widths with one authored update/batch versus two and equal eight draft applications. Every numeric budget passes, but all three widths remain formally inconclusive after the allowed rerun because paired noise is high; no speed claim. Source identity is stable. |
| Plate parameter adapter / installed descriptor | One installed recorder and two scalar parameters per accepted operation | No extra recorder, subscription or depth-dependent read; preserve validation and future combined publication proof | Seven adapter checks pass; constant getter work. No separate Plate-latency claim |

Current service and candidate use the same canonical inverse/mapping owner.
Availability returns a boolean, and ordinary replay returns a small discriminated
result, so no full-history payload is needed by controls. Explicit codec payloads
are measured in the service packet and remain an intentional full inspection.
The native change removes two React clock calls per two-update operation; it
adds two fixed intent checks. History retains bounded immutable branches, with
no new cache, index, backend, global subscription or scheduler. Mounted replay
reuses existing subscriptions and queue cancellation.

[Service sampling amendment](artifacts/2026-09-15-history-design/scale-sampling-amendment.md):
the original 1000-depth/20-structural-mapping baseline takes approximately 9–10s
per operation. Before any target timing in those eight cells, the lead bounded
baseline sampling to three fresh pairs, retained five target warmups plus 25
additional target calls, and required target max against baseline min with the
same numeric thresholds. Success is a cost-bound design comparison, never an
original-packet p95 pass. Already measured cells and their retry allowances are
unchanged. The override expires at S6: production p95 claims require the original
full packet. No permanent performance exception or looser target budget exists.

Cold observations, raw pairs, nearest-rank percentiles, sample/warmup counts,
host/runtime identity, serialized payload bytes and deterministic counters live
in the owner receipts. Cold is explicitly fresh-state/process-first as that
runner defines it, not a physical cold browser or zero-JIT claim. Do not report
p99 from 25 samples. Synthetic fixtures contain no SQL, credentials, headers,
tenants or real user content. Database concurrency, queries and pagination are
N/A; no database work exists in these owners. The production detector is the
existing deterministic/Benchmark proof lane, not new runtime telemetry.

S6 implemented the exact production-loader adaptation and commands above. It preserves
frozen baseline modules and compares final production imports with the same
cohorts/budgets/oracles. Publication uses the final timing launcher with a distinct
production output identity; AI uses the corrected forward-only launcher with a
production loader. Final exact command names and dispositions are bound in the
consolidated proof receipt. Integrated owner tests, packed artifacts and the
managed browser matrix cover the final implementation; physical-device IME
behavior remains outside the claim.

Conditional evidence:

- High-risk scenarios: skipped foreign structural edits erase the next head;
  inversion or authored rejection leaves half an operation; merged persistent
  anchors restore the wrong caret; two same-root mounts steal focus; a long
  composition fragments; asynchronous AI cancellation rejects a proposal before
  discovering an invalid replacement. Each has an owning gate above.
- External research: N/A. This is adoption of a live local audit with executable
  counterexamples, not an external library recommendation or state-of-the-art
  claim. No outside code, tests or fixtures were copied.
- Issue/PR provenance: N/A. User-selected ledger feature, no issue or PR request.
- Browser and native proof belong to Verify Plate; Benchmark owns final matched
  runtime packets; Plate Docs owns public MDX and examples. No release, Git
  publication or physical-device claim is authorized by this design request.
- Database/query/pagination/tenant telemetry: N/A; these operations use an
  in-process editor model. Synthetic fixture content and source hashes contain
  no user content or protected identifiers. No new runtime telemetry is needed;
  existing bounded regression/benchmark owners detect this change.
- Doctrine repair belongs to S5 under Maintain Workflow, after actual API
  adoption. The source Best API behavior/ownership rule requires document
  mutations to pass through `editor.update`; the selected service already
  satisfies that law. Correct actual stale history examples/type assertions,
  and clarify complete-service versus tx composition only where teaching is
  ambiguous. Inspect affected Plite/Plate, plugin and UI teaching without
  assuming that every file needs a change or weakening the canonical-update law.
  Record the smallest durable publication/grouping law in `docs/vision/plite.md`
  only where taste changed. Append the required Plate Next doctrine version,
  preserve existing immutable versions/attestations, regenerate with
  `pnpm install`, and prove source/generated mirrors. Generated skills remain
  generated output; the source rule and immutable doctrine version own the law.

Findings:

- The public tx surface promises unsupported composition; a new service spelling
  without atomic publication would preserve a deeper correctness defect.
- Plate's factory-extension pattern can install two history recorders. The
  configuration adapter must join the default descriptor, not extend another
  initialized history implementation.
- Batch object identity and toolbar render state are too short-lived to own
  replay. Private logical identity and live mounted execution solve different
  jobs; neither needs another public noun.
- AI cancellation is the only discovered production mixed replay/edit consumer.
  Its exact authored decision plus accepted suffix can commit once without
  replaying history or overwriting foreign content.

Decisions and tradeoffs:

- Break tx replay and duplicate array readers rather than preserve an unsafe
  compatibility language. Retain raw history, Plate distribution, atomic restore,
  authored compensation and mounted focus because each has an independent job.
- Presence reads stay cheap and honest; conflicts remain an action outcome.
- Inline AI proposal mode changes visibility/input semantics; undo of a rejected
  persistent proposal intentionally restores it. This is explicit product
  behavior, not hidden branch manipulation.
- Managed browser and emitted-package proof exercise the final implementation.
  Disposable source prototypes remain selection evidence rather than release
  certification.

Review fixes:

- Replaced the assumption that current AI preview cancellation is sufficient
  with a concrete detached/authored ownership split and atomic suffix proof.
- Corrected the prior audit's alleged exact AI batch guard; it is only a marked
  head plus any marked node.
- Added canonical preparation after reproducing document publication without
  an inverse batch. Rejected a first candidate that lost authored selection and
  deleted-range recovery.
- Added Plate core capability mirrors and descriptor configuration after the
  raw-only inference and max-depth-only probes missed duplicate recording.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Compile specimen nested `this` and overbroad inherited test include | 2 | Use named HKT result alias and exact matching include | Candidate and focused baseline have the same two existing source diagnostics; no specimen-specific error |
| Plate fixture used obsolete paragraph name; cap-only check hid duplicate observers | 2 | Use live schema and assert exact batch count after two edits | Current duplicate recorder reproduced; seven adapter checks pass |
| Initial publication reorder omitted authored/anchor capture | 1 candidate | Stage existing owner data rather than add another history observer | Failure retained; staged follow-up restores selected caret/recovery laws |
| AI suffix tried a projected-draft restoration helper in accepted editing | 1 candidate | Reuse canonical builder and existing suffix capture | Six candidate fixtures pass including final-guard rollback |
| Grouping/scale/publication fixture and measurement attempts | Recorded in owner receipts | Preserve invalid packets; fix fixture/coordination once according to frozen contracts | Only valid matched packets count; no green-by-retry or hidden failure |

Verification evidence:

- Focused Plite history, core and authored tests/typechecks pass; the Plite lint
  pass includes the final transaction-error cleanup.
- `pnpm check:plite` passes 96 typecheck tasks, 157 package-test tasks, 256
  tooling contracts, 25 benchmark contracts, public type builds and Chromium
  with 786 passing and 8 skipped tests.
- `pnpm plite:release:packages` passes four packed packages, 89 public subpaths,
  NodeNext/Bundler declarations, 84 Node imports, 45 React-free headless paths,
  one DOM-free SSR path, DCE and 42 optional-peer closure checks.
- The final browser matrix passes Chromium 786/8, Firefox 675/119, mobile
  Chromium 373/421, WebKit 696/98 and mobile WebKit 2/0 (pass/skip).
- Final source-stable grouping and publication packets pass. AI correctness and
  numeric budgets pass, while the frozen paired-noise rule retains a formal
  inconclusive result and therefore no speed claim. The service result and exact
  identities are recorded in the production receipt.
- Barrels, generated registry/changelog, current docs, owning changesets,
  doctrine v200, source/generated workflow mirrors and the ledger validate.

Final closure:

- Ownership: Plite owns model replay/publication/grouping; the existing mounted
  runtime owns input/focus; Plate owns descriptor configuration and product AI.
- Public breaks: service replay; head availability; cut array readers and
  discard; complete AI action services. Keep transaction grouping and restore.
- Adoption: all ten audit units, both facades, native/external/chrome routes,
  combobox, actual AI actions, Yjs/authored/persistence contracts, current docs
  and generated output use or teach the adopted owners.
- Proof: final source, native/browser, type/artifact and frozen-budget evidence
  is source-bound in the consolidated production receipt.
- Order: S1 publication, S2 atomic AI, S3 API cut, S4 native adoption, S5 public
  teaching/output and S6 integrated proof all completed. No publication occurred.
- User-visible consequence: inline generation enters persistent authored review
  mode and proposal rejection is reversible. Replay is explicit, availability is
  cheap, and mounted/native paths share one owner.

Timeline:

- 2026-09-15T17:28:26.077Z Plite Plan created.
- 2026-09-15T19:05:40.479Z Final source/link/ledger evidence passed after the
  last caller, release-artifact, cross-root and benchmark-disposition audit.
- 2026-09-16 S1-S6 implementation, public adoption, package/browser verification,
  production packets, doctrine repair and ledger reconciliation completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Verified implementation closeout |
| Where am I going? | No remaining history-owned implementation step; publication is separate |
| What is the goal? | Adopt and prove explicit history replay and one grouping authority across all ten audit units |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:

- Shared-host timing packets prove only the frozen budgets and correctness
  contracts. AI timing remains formally inconclusive under the noise rule, so
  this work makes no speed claim.
- Managed browser coverage exercises native ordering and mounted replay, but no
  physical-device IME claim is made.
- Publication and release remain outside this task.
