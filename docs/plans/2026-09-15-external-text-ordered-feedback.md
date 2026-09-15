# External text: ordered canonical feedback

Status: Design complete — ready for Task implementation. Product repair is unadopted.

Objective:

Complete the design/adoption plan requested after the
[external-text audit](../research/decisions/external-text-ownership.md): delete
deferred canonical feedback, choose its correct publication boundary, and
specify implementation and proof. The audit's 11-unit inventory remains the
scope; authored behavior supplies integration evidence, not another feature.

Completion threshold:

A source-linked target with falsified alternatives, bounded correctness/scale
evidence, an ordered adoption sequence and explicit proof limits. This request
ends at the plan. Product implementation and publication require a subsequent
execution request.

Verification surface:

The real CodeMirror adapter, mounted Plite external-text runtime, existing
adapter and Plite contract suites, disposable diagnostics, and a standalone
Chromium probe built directly from workspace sources. Product browser/native
acceptance is specified below and has not been completed by this planning run.

Constraints:

Plite owns canonical text, selection, authored semantics and history. Each
adapter owns its input DOM, local representation and resources. Preserve the
inferred slot/config shape, exactly-one-Text grammar, named roots, native/model
selection modes, read-only state, composition ordering and view retirement.
An observed version must describe the local state used by the next action.
Compatibility does not protect an inferior target; retained contracts must
still earn their separate jobs.

Boundaries:

Design and disposable artifacts only in this authorized checkout on `next`.
No product edits, Git publication, authored redesign, new plugin, session
manager, protocol channel or benchmark framework. Source dependencies were
inspected locally; no third-party implementation was copied into product files.

Blocked condition:

There is no unresolved decision blocking this design. Adoption cannot claim
completion if a required package/browser check fails, serving-source identity
is unknown, or the frozen comparison is invalidated without a valid replay.
Unavailable physical IME access limits that claim; it does not authorize
inventing device proof or blocking unrelated implementation work.

Work Checklist:

- [x] Reuse the audit's owners/consumers and challenge its provisional target.
- [x] Compare current scheduling, synchronous listener feedback and the dispatch boundary using observable correction/callback behavior.
- [x] Reconcile the authored failure against live source and replay its owner.
- [x] Freeze and execute correctness/scale probes; preserve rejected and inconclusive evidence.
- [x] Select the target, deletion scope, adoption sequence, package/native checks and doctrine work.
- [x] Review the final plan, reconcile ledger state, and validate links and source identities.

## Decision

Delete the adapter's canonical feedback queue and rejection-reset queue. Publish
local edits after CodeMirror's existing `dispatchTransactions` callback has
applied its transaction batch and finished notifying observers. Apply canonical
feedback synchronously through transactions with `filter: false`.

One private synchronous guard rejects recursive dispatch while
`EditorView.update` is delivering the current batch. It prevents a listener
from publishing a second edit ahead of the first; it stores no pending work.
This guard has an evidenced job. The old `dispatchingToPlite`, `pendingReset`,
queued `apply` closure and `scheduleReset` have none in the target.

The public API retains its call shape. No new `flush`, acknowledgement token,
mode, editor escape, subscription or factory is introduced. The changes are a
CodeMirror adapter algorithm and precise lifecycle teaching.

| Counterfactual | Decision |
| --- | --- |
| Keep/configure the current owner | Reject. Extensions cannot repair the adapter's captured canonical updates replayed out of order. |
| Synchronous feedback inside the current update listener | Reject. A later observer sees corrected `agood` and then the earlier `abad`. Passing final-text assertions hides this reversal. |
| Return canonical state from `actions.dispatch` instead of calling `view.update` | Reject for this scope. A second delivery path changes every adapter but does not solve CodeMirror's observer sequencing by itself. The raw textarea already applies the existing feedback contract synchronously. |
| Add a session/acknowledgement/transaction manager | Reject. It duplicates the existing actions, mounted lifetime and commit fence. |
| Merge Plite runtime, CodeMirror or copied UI | Reject. Canonical history, foreign DOM/parser ownership and optional visual defaults are independent current jobs. Native and CodeMirror rendering each retain users. |
| Queue recursive listener edits | Reject. It creates another replay owner and coordinate/lifetime policy for a callback job that transaction filters and ordinary commands already express. Fail before the recursive transaction mutates the view. |
| Existing dispatch boundary plus synchronous feedback and one guard | Select. Preserves chronological observation, original change coordinates and canonical authority; passes the bounded probe. |

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
  canonical correction. They must not synchronously dispatch another transaction
  from the listener. The adapter rejects that attempt; CodeMirror's existing
  exception sink receives the listener error. Use transaction filters to shape
  a local transaction and commands outside notification to initiate edits.
- Local CodeMirror transactions still run local filters. Adapter-authored text,
  selection, reset, language/config and decoration transactions bypass filters;
  a local extension must not veto canonical state.
- Rejected edits restore the latest canonical snapshot before dispatch returns.
  A thrown canonical transaction retains the runtime's refresh-and-rethrow
  behavior. Programmatic dispatch receives the error after restoration, rather
  than relying on the former bridge listener to route it to the exception sink.

## Runtime implementation

Owner: [createCodeMirrorAdapter.ts](../../packages/platejs/src/code-block/codemirror/createCodeMirrorAdapter.ts).
The neutral [external-text runtime](../../packages/plitejs/src/react/editable/external-text-runtime.ts)
keeps its existing commit fence, origin acknowledgement, correction refresh,
authored invalidation and action validation.

1. Move bridge publication from `EditorView.updateListener` into the constructor's
   inferred `dispatchTransactions(transactions, target)` callback. Reject
   recursive entry before mutation. Compose the ordered batch's ChangeSets in
   the starting document's coordinates and capture its final state/selection.
   Apply `target.update(transactions)` under the guard with `try/finally`; then
   publish one semantic action. Adapter-annotated transactions still update the
   view and observers, but never echo into Plite.
2. Use the actual batch and CodeMirror types. Inline the bridge when readable;
   retain a private helper only if it clarifies a real second use. Do not copy
   the disposable candidate's synthetic `Pick<ViewUpdate, ...>` object into the
   public surface, add casts, or annotate an inferable callback parameter.
   Preserve empty batches, explicit selection-only actions and intent ordering.
3. Apply canonical transactions synchronously. Remove `dispatchingToPlite`, its
   `try/finally`, the queued `apply` wrapper and the `pendingReset`/`scheduleReset`
   state. Call the existing reset helper directly on rejection. Keep its latest
   snapshot and destroyed-view check; stale views cannot resurrect themselves.
4. Set `filter: false` at every adapter-annotated dispatch, including
   `writeSelection`, reset, ordinary update and language installation. Preserve
   `appliedByAdapter` to prevent echo. Do not disable filtering for user input.
5. Preserve `compositionGeneration`, `pendingCompositionEnd`, completion ordering,
   history boundaries, boundary navigation, model-selection paint, async language
   generation/disposal and the bounded initial parse. Composition-end scheduling
   serves a native event-ordering job and is outside the deleted feedback queue.

The guarded candidate is a disposable source transform, not a production patch.
A clean implementation should contain the algorithm above and no transform
infrastructure or obsolete flags.

## Evidence and frozen scale contract

Verification evidence:

[The artifact receipt](artifacts/2026-09-15-external-text-plan/proof.md) indexes
commands, failed candidates and provenance. The audit's original `Ragood` versus
`agoodd` reproduction remains intact. Final guarded candidate: **19 passed,
0 failed**, including the ten existing adapter tests, real mounted correction,
observer ordering, local-filter isolation, immediate rejection, batch coordinate
composition, error restoration and recursive-listener rejection.

The live Plite external-text suite passes **58/58**. Its authored fixture already
used Alice for the deletion and Bob for the later independent insertion when
this planning task inspected it. This task did not make that change. The earlier
57/58 audit snapshot is preserved. A selection captured before another edit to
the same authored contribution is correctly stale; do not weaken authored
revision/head validation to satisfy the older expectation.

The final [Chromium report](artifacts/2026-09-15-external-text-plan/scale-guarded.json)
passes the predeclared owner-cost gate. It captures 397 inputs, exact bundle
hashes, host identity, raw samples and zero source drift during execution.
There were 16 cells, 480 measured operations and 160 warmups. Every measured
operation ended with identical canonical text in all mounted views. Candidate
feedback queued zero microtasks; baseline feedback queued one. Observable view
updates remained two for one view and five for four views: this removes delayed
coordination, not the necessary corrective transaction.

| Cohort | Initial UTF-16 units / views | Baseline settled p95, packets 0 / 1 | Guarded candidate p95, packets 0 / 1 |
| --- | --- | --- | --- |
| Normal | 1,000 / 1 | 1.6 / 1.5 ms | 1.5 / 1.7 ms |
| Large | 100,000 / 1 | 2.7 / 2.8 ms | 2.7 / 2.8 ms |
| Fan-out | 100,000 / 4 | 2.9 / 2.8 ms | 2.9 / 3.2 ms |
| Stress | 1,000,000 / 1 | 17.0 / 15.7 ms | 16.1 / 15.8 ms |

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
comparison under identical budgets. No unchanged-target retries were used to
turn noise green. The final timing path does not exercise the guard's rejection;
the dedicated diagnostic does.

The original measured bundle bytes were not archived. A rebuild from matching
inputs produced different bundle bytes, so no byte-identical cached replay is
claimed. A hash-checked [baseline adapter snapshot](artifacts/2026-09-15-external-text-plan/baseline-adapter.ts.txt)
is preserved. For adoption, derive a fresh paired runner from the retained
fixture/runner: build that snapshot and the adopted adapter against the same
current source graph, record both bundles, and measure both in the same run.
Do not compare a newly built product only with these historical timings or
silently overwrite this report. Unrelated source drift must be disclosed.

## Adoption sequence and exit criteria

These are future execution units, not incomplete work within this planning goal.

| Unit | Owner and deliverable | Required exit |
| --- | --- | --- |
| 1. Ordered adapter | CodeMirror adapter only: dispatch boundary, one recursive-dispatch guard, synchronous canonical/filter/reset behavior and queue deletion. | Named correctness diagnostics pass on ordinary product source without the preload; existing partition tests, types and lint pass. |
| 2. Contract teaching | External-text JSDoc/guide plus CodeMirror options documentation; clarify synchronous feedback, filter ownership, listener rule and error propagation. | Examples use the inferred existing API, lifecycle wording matches behavior, source teaching and generated mirrors agree. |
| 3. Native integration | Existing raw-textarea, CodeMirror-only, mixed-view and authored browser owners. Fix only failures caused by this target. | Selected managed Chromium/browser suites pass on verified source; selection/history/composition and lifecycle invariants survive. Record any genuine device limit separately. |
| 4. Settled proof | Fresh baseline-versus-adopted comparison under the frozen owner contract; focused existing large-code product cases. | Correctness, source identity, noise and regression gates pass. Update this plan and external-text ledger to adopted/verified only for the completed claim. |

Promote only diagnostics that cover a named costly gap: mounted correction plus
another same-turn update, chronological observation plus recursive rejection,
canonical filtering/immediate rejection, batch coordinates and reset-on-error.
Combine fixtures where the behavior remains clear; do not automatically copy
all artifact tests or preserve redundant final-value assertions. Reuse existing
composition, selection, history, disposal, language and multi-view coverage.
No tests for the absence of deleted variable names.

Package iteration commands, from the repository root:

```sh
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

Run managed browser commands sequentially. Verify Plate owns final runner
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
Extension listeners that synchronously dispatch will receive a clear error;
that is an intentional contract restriction, with transaction filters and
ordinary commands retaining their jobs. Programmatic error propagation changes
because the bridge leaves the update-listener exception sink. Native composition
and error/lifecycle integration still require adopted-source proof. The shared
checkout may change; reuse evidence only while its recorded inputs match.

Closeout evidence: all 397 final probe inputs still matched, and all 24 checked
local links resolved. The ledger validates 805 features, 62 scopes and 65
immutable records; external-text adoption is `planned`, proof is `partial`.
Inventory observations were refreshed after inspecting concurrent changes with
no feature additions/removals. No unrelated review or proof status was advanced.

Next action:

On an execution request, start unit 1 in this checkout, implement the clean
algorithm, and run its focused source checks. Continue through teaching and
native/scale acceptance before advancing adoption. This planning pass leaves
product source unchanged.
