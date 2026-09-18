# External text: ordered canonical feedback

Status: Implemented. Scope-owned package, browser-matrix and scale proof passes;
repository-wide browser closure remains partial because unrelated committed
selection tests fail before the matrix can complete.

Objective:

Implement the design/adoption plan requested after the
[external-text audit](../research/decisions/external-text-ownership.md): delete
deferred canonical feedback, choose its correct publication boundary, and
complete implementation and proof. The audit's 11-unit inventory remains the
scope; authored behavior supplies integration evidence, not another feature.

Completion threshold:

Adopted source with falsified alternatives, bounded correctness/scale evidence,
package and native integration proof, current teaching and explicit proof
limits. Publication remains outside this request.

Verification surface:

The real CodeMirror adapter, mounted Plite external-text runtime, existing
adapter and Plite contract suites, managed product browser owners, and a paired
Chromium comparison built directly from workspace sources.

Constraints:

Plite owns canonical text, selection, authored semantics and history. Each
adapter owns its input DOM, local representation and resources. Preserve the
inferred slot/config shape, exactly-one-Text grammar, named roots, native/model
selection modes, read-only state, composition ordering and view retirement.
An observed version must describe the local state used by the next action.
Compatibility does not protect an inferior target; retained contracts must
still earn their separate jobs.

Boundaries:

Implementation, teaching, doctrine and proof in this authorized checkout on
`next`. No Git publication, authored redesign, new plugin, session manager,
protocol channel or benchmark framework. The authored owner received one
integration fix so an empty composition epoch publishes its changed view-policy
identity. Source dependencies were inspected locally; no third-party
implementation was copied into product files.

Blocked condition:

There is no unresolved external-text decision. Scope-owned proof passes. The
repository-wide `pnpm check:plite` closure remains red only in its Chromium step:
the committed huge-document manual DOM-selection setup stays at `[0,0]`, and two
plaintext native line-boundary cases stay at offset 16 after handle preparation.
Neither path mounts an external text view. This plan explicitly forbids an
unrelated test rewrite, so ledger proof remains partial rather than hiding or
absorbing those failures. Physical IME access remains unavailable.

Work Checklist:

- [x] Reuse the audit's owners/consumers and challenge its provisional target.
- [x] Compare current scheduling, synchronous listener feedback and the dispatch boundary using observable correction/callback behavior.
- [x] Reconcile the authored failure against live source and replay its owner.
- [x] Freeze and execute correctness/scale probes; preserve rejected and inconclusive evidence.
- [x] Select the target, deletion scope, adoption sequence, package/native checks and doctrine work.
- [x] Review the final plan, reconcile ledger state, and validate links and source identities.
- [x] Implement monotonic runtime delivery and ordered guarded CodeMirror publication.
- [x] Update public teaching, durable doctrine, Plate Next version and generated mirrors.
- [x] Pass focused package checks, scope-owned browser matrices and adopted-source scale replay.
- [x] Run the strict repository closure gate and preserve its unrelated selection failures without expanding this scope.
- [x] Reconcile adoption and partial proof in the external-text ledger.

## Decision

Delete the adapter's canonical feedback queue and rejection-reset queue. Publish
local edits after CodeMirror's existing `dispatchTransactions` callback has
applied its transaction batch and finished notifying observers. Apply canonical
feedback synchronously through transactions with `filter: false`.

One private synchronous-update guard runs at both CodeMirror reentry points while
`EditorView.update` is delivering the current batch. It rejects a nested
CodeMirror dispatch before view mutation and rejects a canonical `view.update`
before the adapter advances its snapshot. ExternalTextRuntime records callback
failure revisions so an older outer delivery cannot clear a nested failure or
overwrite newer state. It attempts one synchronous reset to the latest canonical
snapshot; a repeated failure leaves the view invalid and subsequent actions
stale. The adapter guard and runtime recovery store no pending transaction.
This is the evidenced conflict rule. The old `dispatchingToPlite`,
`pendingReset`, queued `apply` closure and `scheduleReset` have none in the target.

The public API retains its call shape. No new `flush`, acknowledgement token,
mode, editor escape, subscription or factory is introduced. The changes are a
CodeMirror adapter algorithm, monotonic ExternalTextRuntime delivery, and
precise lifecycle teaching.

| Counterfactual | Decision |
| --- | --- |
| Keep/configure the current owner | Reject. Extensions cannot repair the adapter's captured canonical updates replayed out of order. |
| Synchronous feedback inside the current update listener | Reject. A later observer sees corrected `agood` and then the earlier `abad`. Passing final-text assertions hides this reversal. |
| Return canonical state from `actions.dispatch` instead of calling `view.update` | Reject for this scope. A second delivery path changes every adapter but does not solve CodeMirror's observer sequencing by itself. The raw textarea already applies the existing feedback contract synchronously. |
| Add a session/acknowledgement/transaction manager | Reject. It duplicates the existing actions, mounted lifetime and commit fence. |
| Merge Plite runtime, CodeMirror or copied UI | Reject. Canonical history, foreign DOM/parser ownership and optional visual defaults are independent current jobs. Native and CodeMirror rendering each retain users. |
| Keep the runtime unchanged | Reject. A listener mutation during canonical correction makes the nested adapter update fail, then the older successful delivery clears `invalid` and overwrites runtime state. The reproduced result is canonical `Ragood`, displayed `agood`. |
| Block all nested runtime delivery | Reject. Runtime callbacks can synchronously cause legitimate nested delivery, including focus refresh. A blanket callback guard conflates failure with successful advancement and can discard the newer state. Track actual callback failures per entry and preserve a successful nested delivery. |
| Queue recursive listener edits | Reject. It creates another replay owner and coordinate/lifetime policy for a callback job that transaction filters and ordinary commands already express. Fail before the nested view or adapter snapshot mutates. If Plite already committed, canonical state wins and the outer prediction resets. |
| Existing dispatch boundary plus adapter guard and monotonic runtime delivery | Select. Preserves chronological observation, original change coordinates and canonical authority; passes the bounded probe and full external-text contract suite. |

### Public behavior and inferred API

Existing setup remains:

```tsx
const adapter = createCodeMirrorAdapter({ extensions, loadLanguage });

// Within the existing code-block render callback:
props.slots.externalText({
  adapter,
  ariaLabel: 'Code block',
  config: { language: props.element.language },
});
```

The implementation must preserve inference from the existing slot and adapter;
this illustrative call is not a new exported type or integration wrapper.

The behavior contract is precise:

- `view.update` applies its exact patches/reset before returning. Actions may
  deliver this feedback synchronously. The next action uses the applied version.
- `changes: []` acknowledges; `null` resets; a nonempty list uses before
  coordinates. Do not add a whole-string diff to the incremental path.
- CodeMirror extension listeners observe the local prediction followed by any
  canonical correction. They must not synchronously mutate CodeMirror or Plite
  from the callback. A direct nested CodeMirror dispatch fails through
  CodeMirror's existing exception sink. If the callback instead commits Plite,
  the external-text lifecycle sink receives the rejected adapter-update error;
  canonical Plite state wins. During prediction, the outer local action resets
  as stale. During canonical feedback, the runtime detects the nested callback
  failure and resets again before an older delivery can overwrite newer state.
  Use transaction filters to shape the current local transaction and commands
  outside notification to initiate later edits.
- Local CodeMirror transactions still run local filters. Adapter-authored text,
  selection, reset, language/config and decoration transactions bypass filters;
  a local extension must not veto canonical state.
- Rejected edits restore the latest canonical snapshot before dispatch returns.
  A thrown canonical transaction retains the runtime's refresh-and-rethrow
  behavior. Programmatic dispatch receives the error after restoration, rather
  than relying on the former bridge listener to route it to the exception sink.

## Runtime implementation

Owners: [createCodeMirrorAdapter.ts](../../packages/platejs/src/code-block/codemirror/createCodeMirrorAdapter.ts)
and the narrow delivery/failure path in
[external-text-runtime.ts](../../packages/plitejs/src/react/editable/external-text-runtime.ts).
The runtime keeps its commit fence, origin acknowledgement, authored
invalidation and action validation. Only monotonic callback delivery changes.

1. First harden `ExternalTextRuntime.deliver`. Track a private per-entry callback
   failure revision and a bounded recovery flag. Capture the entry state and
   failure revision before invoking `view.update`. After a successful outer
   callback, never install its older state if a nested successful delivery has
   already advanced `entry.state`. If a nested callback failed, synchronously
   refresh once from the latest binding and skip the older assignment. A second
   failure during recovery leaves `invalid` set and returns; do not loop or queue.
   Increment the revision in the existing lifecycle-error catch so reporting,
   counters and failure isolation stay centralized.
2. Move bridge publication from `EditorView.updateListener` into the constructor's
   inferred `dispatchTransactions(transactions, target)` callback. Use one
   private guard/assertion at both dispatch entry and the returned adapter
   `update` entry. Reject before `target.update` or `current = next`, respectively.
   Compose the ordered batch's ChangeSets in
   the starting document's coordinates and capture its final state/selection.
   Apply `target.update(transactions)` under the guard with `try/finally`; then
   publish one semantic action. Adapter-annotated transactions still update the
   view and observers, but never echo into Plite.
3. Use the actual batch and CodeMirror types. Inline the bridge when readable;
   retain a private helper only if it clarifies a real second use. Do not copy
   the disposable candidate's synthetic `Pick<ViewUpdate, ...>` object into the
   public surface, add casts, or annotate an inferable callback parameter.
   Preserve empty batches, explicit selection-only actions and intent ordering.
4. Apply canonical transactions synchronously. Remove `dispatchingToPlite`, its
   `try/finally`, the queued `apply` wrapper and the `pendingReset`/`scheduleReset`
   state. Call the existing reset helper directly on rejection. Keep its latest
   snapshot and destroyed-view check; stale views cannot resurrect themselves.
5. Set `filter: false` at every adapter-annotated dispatch, including
   `writeSelection`, reset, ordinary update and language installation. Preserve
   `appliedByAdapter` to prevent echo. Do not disable filtering for user input.
6. Preserve `compositionGeneration`, `pendingCompositionEnd`, completion ordering,
   history boundaries, boundary navigation, model-selection paint, async language
   generation/disposal and the bounded initial parse. Composition-end scheduling
   serves a native event-ordering job and is outside the deleted feedback queue.
   Preserve the current platform-specific redo bindings (`mac: Mod-Shift-z`,
   `linux: Ctrl-Shift-z`) from the overlapping source change. The synchronous
   target supersedes that change's `current !== next` stale-closure guard because
   the closure itself is deleted; do not revert its keymap fix with a stale patch.

The guarded candidate is a disposable source transform, not a production patch.
A clean implementation should contain the algorithm above and no transform
infrastructure or obsolete flags.

## Evidence and frozen scale contract

### Adopted-source outcome

The production owners implement the selected two-owner target. The runtime
preserves a newer successful nested delivery, detects nested callback failure,
performs at most one synchronous canonical recovery, and cannot revive a
removed owner. The CodeMirror adapter applies transaction batches before one
semantic publication, bypasses local filters for canonical transactions,
rejects recursive mutation at both reentry points, and has no canonical
feedback/reset queue. A legitimate in-flight focus refresh may advance only the
adapter snapshot when text, config, decorations, read-only state, paint and
native selection already match; it performs no view mutation or deferred work.

The adopted source passes the following exact owners:

- Plite React partition: **88 files / 1,278 tests**; typecheck and lint pass.
- Plite external-text contract: **62/62**.
- Plate CodeMirror partition: **19/19 tests / 57 assertions**; typecheck and
  lint pass.
- Plite external-text browser matrix: Chromium **23/23**, Firefox **23/23**,
  WebKit **23/23**, mobile **21 passed / 2 intentional skips**.
- Authored external/CodeMirror browser matrix: Chromium **7/7**, Firefox and
  WebKit **5 passed / 2 intentional skips** each, mobile **2 passed / 5
  intentional skips**.
- www CodeMirror and mixed-view Chromium owners: **8/8**, including 10k-line,
  IME-event, composition-key, selection, native-command and shared-view cases.
- `pnpm check:plite:dev`: passed. In strict mode, all 96 typecheck tasks, 157
  package-test tasks, 256 Node contracts, 25 Bun contracts, package builds and
  public declarations pass before the unrelated Chromium selection failure.

The fresh [adopted comparison](artifacts/2026-09-15-external-text-plan/scale-adopted.json)
uses the retained baseline snapshots and actual current owners in one source
graph. It records 394 stable inputs, both bundle hashes, 16 cells, 480 measured
operations and 160 warmups. Every correctness check passes; there are no page
errors, noise flags, relative regressions or absolute-budget failures. Adopted
feedback queues zero microtasks while the baseline queues one.

| Cohort | Baseline settled p95, packets 0 / 1 | Adopted settled p95, packets 0 / 1 |
| --- | --- | --- |
| Normal | 1.9 / 1.6 ms | 1.6 / 1.5 ms |
| Large | 2.9 / 2.9 ms | 2.7 / 2.9 ms |
| Fan-out | 3.2 / 2.9 ms | 2.9 / 3.2 ms |
| Stress | 20.6 / 16.7 ms | 16.2 / 16.0 ms |

These results verify the external-text target on managed desktop engines and
the repository's mobile viewport. They do not certify physical IME hardware,
assistive technology, keyboard-to-paint latency or the unrelated repository
selection cases named in the blocked condition.

Verification evidence:

[The artifact receipt](artifacts/2026-09-15-external-text-plan/proof.md) indexes
commands, failed candidates and provenance. The audit's original `Ragood` versus
`agoodd` reproduction remains intact. The adapter-only guard was still wrong
when reentry occurred during canonical feedback: canonical `Ragood`, displayed
`agood`. Final two-owner candidate: **23 focused tests passed, 0 failed, 61
assertions**, including the eleven existing adapter tests, real mounted correction,
observer ordering, local-filter isolation, immediate rejection, batch coordinate
composition, error restoration, direct recursive-dispatch rejection, and a
pair of mounted canonical-reentry cases proving prediction-time and
feedback-time convergence. A generic runtime case proves an older outer
delivery cannot overwrite a newer successful nested delivery. The candidate
runtime also passes the complete
Plite external-text contract suite: **58/58** under its owning Vitest runner.

The live Plite external-text suite passes **58/58**. Its authored fixture already
used Alice for the deletion and Bob for the later independent insertion when
this planning task inspected it. This task did not make that change. The earlier
57/58 audit snapshot is preserved. A selection captured before another edit to
the same authored contribution is correctly stale; do not weaken authored
revision/head validation to satisfy the older expectation.

The final [Chromium report](artifacts/2026-09-15-external-text-plan/scale-two-owner.json)
passes the predeclared owner-cost gate. It captures 400 inputs, exact bundle
hashes, host identity, raw samples and zero source drift during execution.
There were 16 cells, 480 measured operations and 160 warmups. Every measured
operation ended with identical canonical text in all mounted views. Candidate
feedback queued zero microtasks; baseline feedback queued one. Observable view
updates remained two for one view and five for four views: this removes delayed
coordination, not the necessary corrective transaction.

| Cohort | Initial UTF-16 units / views | Baseline settled p95, packets 0 / 1 | Two-owner candidate p95, packets 0 / 1 |
| --- | --- | --- | --- |
| Normal | 1,000 / 1 | 1.8 / 1.8 ms | 1.9 / 1.7 ms |
| Large | 100,000 / 1 | 3.1 / 3.1 ms | 3.2 / 3.1 ms |
| Fan-out | 100,000 / 4 | 3.1 / 3.1 ms | 3.2 / 3.0 ms |
| Stress | 1,000,000 / 1 | 16.7 / 17.7 ms | 17.3 / 17.1 ms |

This is programmatic edit-to-publication and settled-turn owner work in
source-built production Chromium, not keyboard-to-paint latency. Every sample
appends a locally predicted suffix that a real Plite plugin corrects. It does
not measure initial mount, syntax-language loading, scrolling, full feature
extensions or physical IME. Do not claim a general speedup from these timings.

Keep the original frozen contract for adoption: 10 warmups, 30 samples per cell,
two packets with opposite baseline/candidate order; p50/p95/max and raw samples,
no p99 claim. Relative rejection requires both >25% and >2 ms regression against
the matching baseline p95. Absolute settled p95 budgets are 50 ms for
normal/large/fan-out and 100 ms for stress. The existing noise rule is p95 >1.6×p50
and spread >4 ms. Noisy or absolute-budget cells are inconclusive and do not
pass acceptance. Correctness failures reject a target regardless of speed.

Retain all runs: the first unguarded scale attempt was inconclusive because one
baseline packet was noisy; the filter/reset refinement passed, then the newly
proven recursive-listener failure justified the guarded candidate and its fresh
comparison. The later canonical-feedback reentry failure required monotonic
runtime delivery and another fresh comparison under identical budgets. No
unchanged-target retries were used to turn noise green. The final timing path
does not exercise either reentry recovery; the mounted diagnostics do.

The original measured bundle bytes were not archived. A rebuild from matching
inputs produced different bundle bytes, so no byte-identical cached replay is
claimed. Hash-checked baseline snapshots for the
[adapter](artifacts/2026-09-15-external-text-plan/baseline-adapter.ts.txt) and
[runtime](artifacts/2026-09-15-external-text-plan/baseline-runtime.ts.txt) are
preserved. For adoption, derive a fresh paired runner from the retained
fixture/runner: build both snapshots and both adopted owners against the same
current source graph, record both bundles, and measure both in the same run.
Do not compare a newly built product only with these historical timings or
silently overwrite this report. Unrelated source drift must be disclosed.

## Adoption sequence and exit criteria

These execution units are complete for the external-text scope.

| Unit | Owner and deliverable | Required exit |
| --- | --- | --- |
| 1. Monotonic runtime delivery | Plite external-text runtime: per-entry callback-failure revision, older-delivery suppression and one bounded synchronous recovery. | A focused generic runtime test proves nested success cannot be overwritten and nested failure refreshes latest canonical state; 58-test external-text suite, React partition types and lint pass. |
| 2. Ordered adapter | CodeMirror adapter: dispatch boundary, two-entry guard, synchronous canonical/filter/reset behavior and queue deletion. Preserve concurrent platform redo bindings. | Named adapter and mounted integration diagnostics pass on ordinary product source without preload; CodeMirror partition tests, types and lint pass. |
| 3. Contract teaching | External-text JSDoc/guide plus CodeMirror options documentation; clarify synchronous feedback, monotonic delivery, filter ownership, listener rule and error propagation. | Examples use the inferred existing API, lifecycle wording matches behavior, source teaching and generated mirrors agree. |
| 4. Native integration | Existing raw-textarea, CodeMirror-only, mixed-view and authored browser owners. Fix only failures caused by this target. | Selected managed Chromium/browser suites pass on verified source; selection/history/composition and lifecycle invariants survive. Record any genuine device limit separately. |
| 5. Settled proof | Fresh baseline-versus-adopted comparison under the frozen owner contract; focused existing large-code product cases. | Correctness, source identity, noise and regression gates pass. Update this plan and external-text ledger to adopted/verified only for the completed claim. |

The adopted tests promote only diagnostics that cover a named costly gap:
mounted correction plus
another same-turn update, chronological observation plus direct recursive
rejection, canonical reentry during prediction and canonical feedback, canonical
filtering/immediate rejection, batch coordinates and reset-on-error.
Combine fixtures where the behavior remains clear; do not automatically copy
all artifact tests or preserve redundant final-value assertions. Reuse existing
composition, selection, history, disposal, language and multi-view coverage.
No tests for the absence of deleted variable names.

Package iteration commands, from the repository root:

```sh
pnpm --filter plitejs test:partition:react
pnpm --filter plitejs typecheck:partition:react
pnpm --filter plitejs lint:partition:react
pnpm --filter platejs test:partition:code-block-codemirror
pnpm --filter platejs typecheck:partition:code-block-codemirror
pnpm --filter platejs lint:partition:code-block-codemirror
```

Plite integration, from `packages/plitejs`:

```sh
bun run test:react test/react/external-text-contract.test.tsx
```

Browser owners, from the repository root:

```sh
pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/external-text.test.ts
pnpm --filter plite test:plite-browser:chromium tests/plite-browser/authored-changes.spec.ts -g 'external|CodeMirror'
node apps/plite/scripts/build-browser-if-stale.mjs
pnpm --filter www test:www-browser:chromium tests/browser/code-block-codemirror.spec.ts tests/browser/code-block-views.spec.ts
```

Managed browser commands ran sequentially. Verify Plate owns final runner
selection and serving-source identity. The Plite script has build preflight.
The explicit freshness check before www prepares its imported
`@platejs/test/playwright` artifact only when needed. The www config starts
`dev:plite` and permits server
reuse; bind a reused server to this checkout or run an identified fresh instance.
A passing route against an unknown existing server is insufficient. Retain the
selected source manifest, results and relevant failure artifacts. Native input,
IME behavior and app-level large-code checks are not replaced by the standalone
owner probe. During Plite integration use `pnpm check:plite:dev`; the planned
public Plite contract teaching then requires the strict handoff lane
`pnpm check:plite` and closure matrix `pnpm check:plite:browser-matrix`.
Run these at settled closure, not after each adapter iteration. The browser
matrix includes WebKit and mobile viewports; it does not certify physical IME.
No unrelated test rewrite follows from this plan.

The feature-selected matrix completed across Chromium, Firefox, WebKit and the
mobile project. The strict lane passed every package/type/contract/build owner
and then stopped on the unrelated huge-document Chromium selection assertion.
An exact diagnostic also reproduces two committed plaintext line-boundary
selection failures. The unfiltered full matrix was therefore not promoted as a
pass. Those failures remain outside this plan under the explicit scope rule.

### Doctrine and scope accounting

Update [external-text.ts](../../packages/plitejs/src/react/external-text.ts),
[the external-text guide](../../content/docs/(guides)/external-text.mdx), and
[CodeMirror's documented options](../../packages/platejs/src/code-block/codemirror/createCodeMirrorAdapter.ts)
for the lifecycle clarification. Inspect the code-block guide for affected
extension advice. Keep public docs as a current reference without migration or
changelog phrasing.

The ownership law is already present in
[Best API's source rule](../../.agents/rules/best-api.mdc) and
[Plite Vision](../vision/plite.md). During implementation, apply Best API's
doctrine-repair method to the reusable lifecycle clarification: repair only
stale relevant source teaching, update the smallest Vision owner if its durable
law needs this precision, append the required Plate Next doctrine version for
changed source sets, regenerate with `pnpm install`, and audit mirrors. Preserve
history and package attestations. Do not edit generated skills directly or add
a CodeMirror-specific implementation algorithm to generic agent doctrine.

No package export move, peer change, schema change or copied UI rewrite is
needed. Run barrel/registry generation only if the actual adoption changes their
inputs, following `next` rules. Keep ledger scope `external-text`; do not absorb
code, native or authored redesign into this repair.

Open risks:

Synchronous feedback puts correction cost on the dispatch stack; the bounded
probe clears the chosen budgets but does not establish physical input latency.
Extension listeners that synchronously mutate either owner receive a clear
error through the owner that rejects reentry; that is an intentional contract
restriction, with transaction filters and ordinary commands retaining their
jobs. A Plite commit made before adapter reentry remains canonical. The runtime
must suppress an older delivery after nested failure; one failed recovery leaves
the view invalid rather than looping. Programmatic action errors propagate differently
because the bridge leaves the update-listener exception sink. Native composition
and error/lifecycle integration still require adopted-source proof. The shared
checkout may change; reuse evidence only while its recorded inputs match.

Closeout evidence: all 394 adopted comparison inputs still matched, and the
doctrine validator accepts Plate Next version 199. The ledger records
external-text adoption as `adopted` and proof as `partial`: scope-owned proof is
complete, while the required unfiltered browser closure is honestly red. No
unrelated review or proof status is advanced.

Next action:

No external-text implementation work remains. Repair the separately owned
native selection failures before claiming repository-wide Plite browser
closure; rerun `pnpm check:plite` and `pnpm check:plite:browser-matrix` there.
