---
title: Plite view ownership
type: decision
status: proposed
updated: 2026-09-25
review_scope: plite-view
review_history:
  - ../review-records/2026-07-23-api-react.json
  - ../review-records/2026-09-12-react-public-runtime-cut.json
  - ../review-records/2026-09-12-selection-distinct-lifetimes.json
  - ../review-records/2026-09-12-native-input-authority.json
  - ../review-records/2026-09-12-accessibility-owner-boundaries.json
  - ../review-records/2026-09-12-geometry-widget-carrier-cut.json
  - ../review-records/2026-09-25-accessibility-projected-selection-focus.json
  - ../review-records/2026-09-25-accessibility-projected-selection-native-caret.json
source_refs:
  - ../../../packages/plitejs/src/react/components/plite.tsx
  - ../../../packages/plitejs/src/react/hooks/use-plite-runtime.tsx
  - ../../../packages/plitejs/src/react/widget-store.ts
  - ../../../packages/plitejs/src/react/widget-geometry.ts
related:
  - ../reviews.md#plite-view
  - plite-core-ownership.md
  - plate-core-ownership.md
  - ../../plans/2026-09-12-plite-view-design.md
---

# Plite view ownership

**Pursue removing the generic Widget carrier from geometry and the public
React Runtime handle.** Keep selection, native input and accessibility
responsibilities at their existing owners. This is the five-question review of
ledger group `plite-view`, requested after Plate core. The geometry cut has the
largest material benefit: it removes a derived store and protocol between
semantic data and measurement. The React cut removes a second public setup
vocabulary. Both earn detailed design; neither is an accepted replacement
runtime or an implementation plan.

Status: Complete. Expected questions: 5.
Reviewed: 5. Excluded: 0. Unresolved verdicts: 0. Two Pursue, three Stop.
Inspection covers the semantic questions and materially different consumers;
it is not an assertion-level audit of every file in their census buckets.

The required job is to render and edit one document through independently
mounted views, preserving exact selection, root identity, native input,
accessible focus and view-local geometry. Shared roots and independent
documents must remain distinct. Feature reviews such as math and emoji remain
separate, as the user requested.

Acceptance follows [Best API Review](../../../.agents/skills/best-api-review/SKILL.md)
and [Plate routing](../../../.agents/rules/task/references/best-api-review.md):

- [x] Assess React, selection, native input, accessibility and geometry, with
  current owners, materially different consumers and relevant prior history.
- [x] Compare keep/configure, changed API, new primitive, delete/merge/inline,
  ownership moves and replacement architecture; distinguish facts, judgments
  and unmeasured runtime targets.
- [x] Record all five verdicts with source identities and proof limits, update
  the compiled decision and validate the ledger.
- [x] Recommend one next owner for the strongest justified direction.

| Question | Verdict | Decisive finding | Remaining owner |
| --- | --- | --- | --- |
| React integration | Pursue | `RuntimeValue` forwards the editor while `EditorRoot` already hosts ordinary and multiple-root views. The optional editor/root grammar admits combinations rejected at runtime. | Task design/plan |
| Selection and locations | Stop replacement | Static coordinates, directional exact node membership, durable anchors and cross-root view selection have different required semantics. | None |
| Native input | Stop consolidation | Root, React and Android paths arbitrate input and converge on canonical transactions; integrity repair rejects unauthorized DOM changes. | None |
| Accessibility | Stop merging owners | Announcements, exact-view focus and optional product Tab traversal have different lifetimes and policies. | None |
| Geometry | Pursue | Selection, annotation and cursor owners are wrapped in a Widget projection solely to reach resolved data or geometry. | Task design/plan, jointly with React |

## Geometry: delete the intermediary data model

The current [selection hook](../../../packages/plitejs/src/react/hooks/use-selection-geometry.tsx:14)
creates a synthetic singleton Widget and a Widget store before measuring the
selection. [WidgetStore](../../../packages/plitejs/src/react/widget-store.ts:26)
adds identities, target indexing, resolved records, snapshots, subscriptions,
refresh/retry and lifecycle to data owned elsewhere. The
[Yjs adapter](../../../packages/plitejs/src/yjs/react/cursor-widget-store.ts:84)
wraps already-keyed cursor records and labels each remote range as a
`selection` target. The public domain cursor hook then passes that adapter to
geometry. This is redundant derived infrastructure, not a second canonical
selection.

The annotation consumers in
[comment mode](../../../apps/www/src/app/(app)/examples/plite/_examples/comment-mode.tsx:335)
and [persistent anchors](../../../apps/www/src/app/(app)/examples/plite/_examples/persistent-annotation-anchors.tsx:523)
derive Widgets from existing annotation/comment records. Their labels and
diagnostics do not establish a separate semantic Widget authority. The source
census found these direct application store constructions plus selection and
Yjs adapters; it does not prove absence of consumers outside this repository.

The strongest proposed ownership flow is:

```text
canonical selection / annotation / node / keyed cursor
                  ↓
private measurement for the exact mounted Editable
                  ↓
immutable rectangles → copied floating or sidebar UI
```

Remove the public `Widget`/`WidgetTarget`/resolved-snapshot/store protocol and
its domain adapters where this flow subsumes them. Keep semantic annotation
and cursor subscriptions, durable anchors, and ordinary render props. Change
the private geometry input to consume the owning domain's current target and
invalidation. Do not replace the carrier with another public target registry
or ViewManager. The detailed geometry contract and public type names remain
design questions.

| Lane | Judgment |
| --- | --- |
| Keep/configure | Direct domain hooks already hide assembly from ordinary callers, but configuration cannot remove the derived stores they create. |
| Change existing API | Let geometry consume the canonical target and its existing invalidation at the owning domain boundary. This can remove the Widget adapter. |
| Add primitive | A narrower private measurement input may be necessary. Another public store/target DSL has no independent current job. |
| Delete/merge/inline | Delete the Widget carrier; inline ordinary UI descriptor mapping into its existing product consumer. Preserve shared helpers still used by annotations/decorations. |
| Move ownership | Logical data stays with selection, annotation, node identity or cursor cache; coordinates belong to the exact Editable; placement belongs to copied UI. |
| Replace architecture | Replacing DOM measurement, adding global geometry state, or merging all observers is unjustified. Floating UI's popup resize observer and Plite's reference measurement serve different elements. |

The existing [geometry owner](../../../packages/plitejs/src/react/widget-geometry.ts:398)
binds `(store, id, editableRef)` and releases subscriptions after its final
lease. Its coordinator reference-counts observed Editables. The
[floating adapter](../../../apps/www/src/registry/hooks/use-widget-floating.ts:44)
consumes rectangles and observes popup size. Preserve exact-ref resolution,
SSR/null and unmounted targets, multiline and collapsed selection, scrolling,
keyed cursor locality, remount cleanup and hiding before first positioning.

This reopens the
[August decision](../../plans/2026-08-30-cursor-find-overlay-architecture.md:281)
to keep logical Widget as an advanced public owner, while retaining its
exact-view and copied-UI conclusions. The
[historical scale receipt](../../plans/artifacts/transient-projection-scalability/node-benchmark.json)
covers logical Widget work through 10,000 items, omits geometry source, and
captures a different Widget hash. It cannot accept the replacement. Detailed
design must compare current versus direct-domain paths at matched target and
mounted-view counts, including unaffected subscribers, cleanup, measurement
work and correctness. No speed or runtime-topology claim is made here.

## React: one public editor handle

[RuntimeValue and its constructor](../../../packages/plitejs/src/react/hooks/use-plite-runtime.tsx:166)
copy the editor's `api`, `anchor`, `extension`, `install`, reads, updates and
subscriptions into a peer handle. `useRuntime` also switches between creating
that handle and reading context according to its arguments.
[EditorRoot](../../../packages/plitejs/src/react/components/plite.tsx:168)
already installs the private provider for editor-owned usage. The live
multi-root and shared-block examples use this path. The authored-change
example still uses `Runtime` to host multiple projection views; that sharing
job must survive the public wrapper's deletion.

The proposed public simplification removes `Runtime`, `useRuntime`,
`RuntimeValue` and their setup-only types. Use the editor and exact view
identities as the public handles, with one explicit mount grammar under
`EditorRoot`. Preserve independent view identity, root routing, authored
projection/input policy, callback scope and keyed replacement. This does not
select an alternative scheduler or merge private subscriptions.

The ordinary and named-root call below already works today:

```tsx
import { Editable, EditorRoot, useEditor } from 'plitejs/react';

const editor = useEditor(options);
<EditorRoot editor={editor}>
  <Editable />
  <Editable root="notes" />
</EditorRoot>;
```

For independently mounted projections, the proposed ownership flow is
`document editor → exact configured view → EditorRoot → Editable and controls`.
Best API must choose the precise composition syntax. Hiding the wrapper alone
without handling this consumer is incomplete.

| Lane | Judgment |
| --- | --- |
| Keep/configure | Retains two setup vocabularies and runtime-only invalid mount combinations. |
| Change existing API | Make EditorRoot's document/view modes explicit and inferred. Do not retain optional independent props that promise illegal combinations. |
| Add primitive | Core already has `createEditorView`; a public React Runtime/Manager is not a missing capability. |
| Delete/merge/inline | Remove the peer Runtime handle and fold setup into the existing root lifetime. Deleting all context owners instead forces out-of-editor controls and document callbacks to reconstruct scope. |
| Move ownership | Keep shared document authority below React and mounted effects/registration inside React. Plate's passive EditorProvider remains a distinct control-binding job. |
| Replace architecture | A global React store or a document per Editable loses independence or shared-root semantics. A changed private coordination topology remains provisional until measured. |

This supersedes the July React assessment's suggestion of adding another root
component vocabulary. It reaffirms the
[August keyed-lifetime repair](../../plans/2026-08-23-fix-plite-react-provider-lifetime.md)
and the [core decision](plite-core-ownership.md)'s private document/view split;
those decisions did not settle the remaining public React wrapper. Plate's
document-wide callbacks and plugin render contributions are genuine adapter
jobs and are not interchangeable with a root-scoped raw callback.

## Selection: retain distinct semantics

[Text and node selection](../../../packages/plitejs/src/interfaces/selection.ts:10)
encode different intent. Exact directional node membership cannot become one
bounding text range without selecting intervening content. The
[table consumer](../../../packages/platejs/src/features/table/lib/internal/selection.ts:341)
lowers its cell membership to the built-in selection rather than adding a
table selection kind. Singular and plural range reads are projections of that
same state, not separate stores.

[Anchors](../../../packages/plitejs/src/core/anchor.ts:202) add retention,
association, deletion policy, persistence and release to static Path/Point/Range
coordinates. [Async media insertion](../../../packages/platejs/src/features/media/lib/BaseMediaPlugin.ts:178)
needs those guarantees across an awaited URL. Replacing ordinary coordinates
with anchors imposes lifetime management on simple reads; replacing anchors
with coordinates loses rebasing. Node keys alone cannot locate text offsets.

The private [projected view selection](../../../packages/plitejs/src/react/view-selection.ts:254)
retains owner/fragment identity across rendered root occurrences. Its
[target resolver](../../../packages/plitejs/src/react/editable/projected-selection-target.ts:16)
distinguishes retained, ambiguous, stale and writable targets. Folding it into
one serialized document range either loses information or puts a DOM projection
into document truth. A universal selection extension point adds unsupported
kinds and competing state. Changing geometry inputs does not require changing
these selection laws.

Keep/configure wins; changed coordinate syntax, a universal location handle,
deleting anchors or exact membership, moving selection into React, and replacing
the model with DOM ranges all lose these current jobs or relocate required
work. This is an initial ledger assessment. Related August selection decisions
supply context only. Existing mapping/anchor assertions were inspected, not
replayed; no complexity or native parity claim follows.

## Native input and accessibility: retain the existing responsibilities

Native input's strongest cut would absorb router/controller/kernel orchestration
into `DOMInputRuntime`. The
[runtime binding](../../../packages/plitejs/src/react/editable/editable-dom-runtime.ts:449)
already shares that state. [Event arbitration](../../../packages/plitejs/src/react/editable/runtime-input-events.ts:113)
excludes Android from root repair and suppresses React repair after a root claim.
[Accepted native text](../../../packages/plitejs/src/react/editable/dom-repair-queue.ts:299)
uses canonical transactions; the integrity observer restores unauthorized DOM
changes. No competing canonical write owner was established. Changing API or
adding a generic input primitive lacks a current caller benefit. Uniform
model-only handling still needs IME reconciliation; uniform DOM ownership
cannot replace semantic commands and renderer safety. Keep the existing
split, reaffirming 5066's safety-flag cut and the long-IME plan's composition-owned
history decision. Double insertion, lost pending input and split undo remain
critical regression risks, not observed new defects in this assessment.

Accessibility similarly has distinct jobs. Announcements are local ephemeral
commit effects, with application-owned wording and one live region per private
runtime-provider mount; nested roots share that host. Exact-view focus handling
preserves embedded controls and read-only transitions. Optional Tabbable
traversal adds product policy over native Tab and returns focus to editor text.
The kit excludes table/list/code contexts and adjusts conflicting shortcuts.
Deleting Tabbable or moving its policy into Plite would lose or relocate that
job. Merging announcement, focus and traversal lifetimes creates no material
benefit; no new public accessibility primitive is justified. The React cut must
preserve announcement host lifetime rather than globally deduplicating by
document identity. Ambient `document` use in Tabbable is a concrete iframe/shadow
root proof limit, not a supported-environment claim.

The September 25 failed-fix reviews reaffirm this boundary after TaskHub #46
exposed an implementation breach: emptying the browser Selection for an
expanded projected selection can leave an inactive selection while copied UI
still sees stale focus state. The durable target stays private to the exact
mounted Editable. The browser Selection keeps one collapsed writable caret;
projected state owns the expanded semantic range and paint. This removes the
empty-selection focus gap without retaining two expanded highlights or adding
a later focus restore. Inactive-selection paint is loss-of-focus evidence;
selection geometry and floating-toolbar visibility are not focus or input
oracles. Do not add a toolbar-owned focus call, another focus boolean, a public
projected-selection API, or a global `removeAllRanges` interception.

## Evidence limits and next owner

This review used current local source and inspected test assertions, with
bounded native and accessibility/geometry investigations reconciled by the
lead. Model identity: GPT-6 / Codex; historical unknown model identities remain
unknown. No test suite, browser/device session or performance experiment was
run. Stop verdicts reject the assessed replacements; they do not certify every
existing implementation. Adoption and proof states remain unchanged. The
earlier Plate-core execution receipt does not transfer to this review.

Task owns the joint design of direct-domain geometry and the public React mount
contract in the [Plite view design plan](../../plans/2026-09-12-plite-view-design.md).
API, lifetime, adoption and proof decisions stay in that workflow, which applies
Best API and Plite Plan internally. The review's cuts remain candidates until
the plan's evidence accepts their concrete replacement:

```text
$task design plan plite-view: direct-domain geometry and explicit React mounting with exact-view ownership
```

Before accepting changed runtime machinery, run its embedded matched scale
probe. If pursued through implementation, repair stale Widget/Runtime teaching
in Best API, layer planning, relevant Vision, Plate UI/Docs and Plate Next through
the normal doctrine-repair owner. This read-only review records that obligation
without editing normative rules or implementing the recommendation.

All five immutable records were accepted by the ledger helper. The generated
ledger and integrity check pass with 791 source groups, 3,640 files, 62 questions
and 34 historical/current records. These counts describe inventory and history,
not executed behavior coverage.

The subsequent [Task design plan](../../plans/2026-09-12-plite-view-design.md)
resolves both Pursue directions with disposable runtime and scale evidence.
It selects direct-domain geometry and required-editor React roots with independent
mounted views, retaining root/authored props. Product adoption and production
proof remain separate execution work; the review records above stay unchanged.
