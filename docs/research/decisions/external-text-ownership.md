---
title: External text ownership
type: decision
status: accepted
updated: 2026-09-15
review_scope: external-text
current_review: 2026-09-15-external-text-ordered-feedback
review_history:
  - ../review-records/2026-09-15-external-text-ordered-feedback.json
source_refs:
  - ../../../packages/plitejs/src/react/external-text.ts
  - ../../../packages/plitejs/src/react/editable/external-text-runtime.ts
  - ../../../packages/platejs/src/code-block/codemirror/createCodeMirrorAdapter.ts
related:
  - ../reviews.md#external-text
  - code-text-ownership.md
---

# External text ownership

**Canonical feedback is synchronous and ordered at CodeMirror's dispatch
boundary; external-text delivery is monotonic under callback failure.**
The public slot and narrow versioned protocol survive this review. A mounted
reproduction leaves CodeMirror displaying `agoodd` while Plite's canonical text
is `Ragood`. Changing public names, exposing the editor to adapters, or adding
another text store would leave the demonstrated ordering problem intact.

Status: Product target adopted. Scope-owned package, browser-matrix and scale
proof passes. Repository-wide browser closure remains partial because committed
huge-document and plaintext selection tests fail outside this scope. The
original audit record is immutable; implementation evidence belongs to the Task
plan and its receipt.

## Design follow-up

The [executed design plan](../../plans/2026-09-15-external-text-ordered-feedback.md)
uses CodeMirror's existing `dispatchTransactions` boundary. Apply the local
batch, finish observer notification, then publish one composed canonical action.
Delete queued canonical feedback and rejection resets. Canonical transactions
bypass local filters and apply synchronously. Keep the public slot/protocol.

The audit's listener-only candidate was insufficient: later observers saw the
correction before the prediction. A subsequent dispatch-boundary candidate also
needed filter bypass, synchronous rejection reset, and a guard against recursive
listener dispatch. The guard runs before nested view mutation and before an
adapter update advances its snapshot. If a listener already committed Plite,
canonical state wins and the outer local prediction resets as stale. A harsher
case exposed one more owner: when the mutation occurs while canonical feedback
is already being delivered, the nested adapter failure can be cleared by the
older outer delivery. ExternalTextRuntime therefore needs a per-view callback
failure revision and one bounded synchronous refresh so an older delivery never
overwrites newer canonical state. Neither owner stores queued transactions.
Transaction filters and normal commands retain their editing jobs. The callback
restriction and programmatic exception propagation require explicit lifecycle
documentation during adoption.

The adopted source passes 19 CodeMirror tests / 57 assertions, the 62-test
external-text contract suite, the 88-file / 1,278-test React partition, 8 www
CodeMirror/mixed-view cases and the selected Plite browser owners across
Chromium, Firefox, WebKit and mobile. The fresh paired Chromium probe passes the
frozen comparison across 1,000 / 100,000 / 1,000,000 code units and four shared
views: 480 measured operations, 394 stable input snapshots, no adopted feedback
microtasks, and no correctness, page, noise or regression failure. The strict
repository gate passes packages, types, contracts, builds and public
declarations before stopping on unrelated native selection tests. Physical IME,
assistive technology and keyboard-to-paint latency remain outside the claim.

See the [evidence receipt](../../plans/artifacts/2026-09-15-external-text-plan/proof.md)
for rejected candidates, the earlier inconclusive scale packet and replay
limits. The following audit sections retain their audit-time observations;
the plan resolves their provisional sequencing and authored-fixture questions.

## Required behavior and surviving owners

The job is to edit one canonical Text through a foreign input engine while
preserving shared document changes, directed selection, history, authored
intent, mounted-view permissions and independent view lifetimes. A native
sibling, another external view, or an accepted/proposed authored view must see
the appropriate canonical projection. A local prediction cannot overwrite a
later accepted update.

From scratch, this needs one document/transaction owner and a mounted adapter
that exchanges ordered text changes and selection with that owner. Plite owns
schema validation, canonical changes, shared history and authored semantics;
its mounted runtime owns focus, read-only state, DOM coverage and retirement.
CodeMirror owns its input DOM, local text representation, parser and native
commands. Its private text tree is a necessary rendering representation, not
an independently saved document or undo authority.

The current normal call already expresses that division:

```tsx
import { createCodeMirrorAdapter } from 'platejs/code-block/codemirror';

const adapter = createCodeMirrorAdapter();

// Inside the existing element renderer; config infers from the adapter.
props.slots.externalText({
  adapter,
  ariaLabel: 'Code block',
  config: { language: props.element.language },
});
```

Real customization is the copied component's `extensions` and `loadLanguage`,
and the authored example's standard keymap. Neither requires a new plugin or
public editor handle. Exactly-one-Text grammar, one projection per mounted
element, directed UTF-16 offsets and version checks have independent jobs.
Rich children, arbitrary roots and native full-DOM rendering cannot safely be
flattened into this protocol merely to shorten its surface.

## Decisive finding

`createCodeMirrorAdapter.ts:287` calls `actions.dispatch` from its CodeMirror
update listener. Plite may synchronously correct the transaction and deliver
`update({ changes: null, state })`. The adapter advances `current` immediately
at line 499 but queues its actual CodeMirror transaction at line 594. Another
canonical update can therefore run against an older local string, before the
queued replacement uses its captured coordinates.

The exact sequence is: local `a` → `abad`; Plite corrects that to `agood`; a
second canonical update prepends `R`. Plite ends at `Ragood`, but the delayed
replacement runs over `Rabad` and leaves `agoodd`. This is demonstrated both
with a protocol host and with an actual mounted Plite editor and correction
plugin. Canonical storage remains correct in these probes; subsequent edits
based on the wrong displayed text are a regression risk, not a separately
demonstrated loss of canonical data.

The installed `@codemirror/view` 6.41.0 returns its update state to idle before
calling update listeners. A direct corrective dispatch from that listener
passes. An in-memory candidate replacing only the queued-apply branch with
`apply()` passes all three diagnostics and the ten existing adapter tests.
This establishes a concrete path using the existing public contract. It does
not certify nested listeners, arbitrary extension composition, physical IME,
or performance. Source and retained outputs are in the
[audit artifacts](../../plans/artifacts/2026-09-15-external-text-review/).

## Design lanes

| Lane | Verdict and material reason |
| --- | --- |
| Keep/configure everything | Loses: presentation extensions cannot repair captured canonical updates applied out of order inside the package adapter. |
| Change the existing API | A proposed `dispatch` result carrying the canonical reply instead of reentering `view.update` is the strongest breaking alternative. It could simplify publication ordering for every adapter, but the raw textarea already applies feedback synchronously and the candidate fixes the reproduced defect without a second delivery channel. No independent caller need currently justifies that protocol break. |
| Add a primitive | Stop: a generic transaction escape, text-session manager, acknowledgement store or adapter subscription layer adds authority and lifecycle work. Existing actions and the shared commit fence express the current job. |
| Delete/merge/inline | Pursue deleting queued canonical-update replay and its `dispatchingToPlite` coordination in the CodeMirror owner. Review the separate rejection-reset path together with it. Do not indiscriminately remove composition-end scheduling, which has a distinct native event-ordering job. Merging the public adapter/view/actions contracts merely hides real direction and lifetime boundaries. |
| Move ownership | Keep model/history in Plite, native input/parser in CodeMirror, and visual defaults in copied UI. An ordered CodeMirror dispatch boundary is a candidate place for publication. Moving editor-wide selection, history or an arbitrary editor handle into the adapter would expand its authority without removing a current job. |
| Replace architecture | Stop: independently saved CodeMirror documents or undo stacks duplicate canonical state. Universal native rendering removes optional code-engine features; universal CodeMirror rendering loses the distinct full-DOM job. Replacing ExternalTextRuntime with a generic DOM input engine still needs foreign-host arbitration, coverage and retirement. No replacement earns a new runtime owner. |

Proposed ownership flow, not a new API:

```text
CodeMirror edit → adapter → Plite transaction/corrections
                         → ordered canonical reply applied to CodeMirror
                         → next adapter edit observes the applied state
```

At audit time, the first design question was whether synchronous feedback within
the listener or publication from CodeMirror's `dispatchTransactions` boundary
best preserved that order. The follow-up plan above resolves the bounded
correctness/scale comparison; adopted-source native proof was still required.

## Complete bounded audit

Expected ledger units: **11**. Reviewed: **11**. Excluded within that set: **0**.
Unreviewed or disposition-unresolved units: **0**. The three Pursue rows are
one adapter repair and its existing proof owners, not three feature projects.

| Ledger unit | Disposition | Evidence and next owner |
| --- | --- | --- |
| `plitejs/react/external-text` | Stop API replacement | Ten public types and six actions cover exact changes, state, selection, rejection, lifecycle and inferred config. Public type contracts were inspected; keep this vocabulary. |
| `plitejs/react/editable/external-text-binding` | Stop owner replacement | Schema and current child shape both require exactly one Text. Snapshot/key cache holds canonical facts; mounted read-only state is added by the runtime. |
| `plitejs/react/editable/external-text-runtime` | Stop architecture replacement | Shared commit fence, precise changed keys, origin acknowledgement, correction resets, authored-view invalidation, history and retirement have concrete consumers. Keep the authority split; this is not a performance certification. |
| `platejs/code-block/codemirror` | Pursue | Confirmed deferred-feedback ordering defect; synchronous candidate passes focused probes. Task owns sequencing design and repair. |
| `export/platejs/./code-block/codemirror` | Stop packaging change | One optional subpath exports the adapter; required CodeMirror peers are optional at the package root. Runtime peer imports stay in this entrypoint. |
| `ui/code-block-codemirror` | Stop new abstraction | Copied component owns styles, command bindings and language loading; stable adapter plus inferred slot is sufficient. |
| `example/plite/external-text` | Stop protocol expansion | Textarea applies feedback synchronously and demonstrates local input/clipboard, named roots, read-only state and multiple views. Its whole-value input diff and limited range paint are explicit demo limitations. |
| `example/registry/code-block-codemirror-demo` | Stop composition redesign | External-only composition omits the native syntax provider and installs the copied renderer through the existing code-block plugin. |
| `example/registry/code-block-views-demo` | Stop shared-view redesign | Native/external views share one editor; native syntax and neutral decorations have distinct retained jobs. |
| `browser/code-block-codemirror` | Pursue scoped proof | Existing input, selection, composition and large-code assertions are relevant adoption gates; replay against settled ordering changes through Task/Verify Plate. No browser run was made here. |
| `browser/code-block-views` | Pursue scoped proof | Existing mixed-view edits, history, remote composition, language and annotation checks are the browser owner for the repair. No fresh pass claimed. |

Supporting inspection also covers the authored example's textarea/CodeMirror
switch and native markup fallback, the raw external-text browser suite, public
inference tests, lazy element slots, mounted registration, foreign-event guard,
commit fence, DOM coverage and the authored decision's stale-selection check.
Authored behavior is related evidence, not a merged feature scope. The inspection
was sequential; no independent reviewer was available in this runtime.

## Proof and prior-review relation

- Current adapter suite: **10 passed**. The audit's three diagnostics on
  unmodified product source: **1 passed, 2 failed**, both exposing the same
  ordering defect. The in-memory candidate plus adapter suite: **13 passed**.
- Audit-time Plite external-text suite: **57 passed, 1 failed** out of 58. The
  failure is at `source.update.authored.decide` after a later proposal edit,
  using a selection captured before that edit; expected `applied`, received
  `stale`. Earlier external edits and projected sibling assertions pass.
  `inspectAuthoredSelection` checks revision and heads. This establishes a
  proof failure; it does not establish that stale-decision rejection is wrong.
  Reconcile the test's expected contribution boundaries with authored semantics
  before changing either the test or runtime.
- No browser, physical device, full package typecheck, release, or performance
  replay. Focused runtime evidence does not certify native input or large-code
  behavior. The candidate is an audit-only transform, not adopted source.
- The September 4 code review's one-Text and narrow-adapter direction is
  reaffirmed. Its old Lowlight transport, unguarded composition keys and missing
  model-selection paint are not copied into this review: current source owns
  parsing locally, guards composition keys and paints model intersections.
  Its timings, and September 5's native-rendering plateau, are historical.
  The queued-feedback defect is new evidence in the first dedicated
  `external-text` review. Existing `native` Stop reasoning also remains valid.

No external-text implementation owner remains. The neutral Plite protocol keeps
its current public shape. The separately owned native selection failures must be
repaired before the repository-wide strict/browser-matrix closure can be
promoted from partial proof.

The doctrine follow-up is complete: synchronous feedback/ordering, filter
authority and the lifecycle callback contract are current in source teaching,
Best API doctrine, Plite Vision and Plate Next version 199. Generated mirrors
were regenerated through `pnpm install` and validated through their source
owners.

## Audit acceptance

- [x] Prior decisions recovered and current owners/consumers inspected.
- [x] All 11 units have dispositions and supporting consumer coverage.
- [x] All material design lanes compared; strongest deletion and breaking alternative identified.
- [x] Decisive ordering claim reproduced; failure and candidate evidence retained.
- [x] One verdict and one next owner selected with explicit proof limits.
- [x] Immutable record written and current ledger rendered and checked: 805 features, 62 scopes and 65 records. The external-text record's source matches. An unrelated performance-census change during closeout required refreshing inventory observations; no unrelated verdict or proof was advanced.
