# Slate v2 void roots and editable islands

Objective:
Close the Slate v2 long-term void/root/editable-island architecture plan for
user review. The plan must choose the best durable split between default
atomic voids, root-backed editable islands with shared Slate state, navigation
across editor-only rooted content, and the possible separate node type for an
island that contains only an editor. Complete the scheduled Slate Plan passes
one activation at a time: current-state read and initial score; related issue
discovery; issue-ledger pass; intent/boundary and decision brief; research /
ecosystem / live-source refresh; performance, DX, unopinionated-core,
migration, regression, research, and simplicity pressure passes; Slate
maintainer objection ledger; high-risk deliberate mode; ecosystem maintainer
pass; revision pass; issue sync accounting; closure score and final gates.

Goal plan:
docs/plans/2026-05-25-slate-v2-void-roots-and-editable-islands.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- none

Completion threshold:
- Slate Plan closure is legal only when score >= 0.92, no dimension is below
  0.85, every pass row is complete or intentionally skipped with evidence,
  issue/reference sync rows are closed, final handoff is emitted, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-slate-v2-void-roots-and-editable-islands.md`
  passes.
- Planning closeout is user-review-ready only. Implementation waits for later
  explicit user acceptance and a second `slate-plan` invocation naming this
  plan.

Verification surface:
- Planning-only checks run in `plate-2`.
- Every Slate v2 source/runtime/browser/API claim must cite the live
  `.tmp/slate-v2` workspace source or command evidence.
- Issue claims must be verified from `docs/slate-issues/**`,
  `docs/slate-v2/ledgers/**`, and `docs/slate-v2/references/**`.
- Browser and package proof for new behavior is an execution gate, not a pass-1
  planning claim.

Constraints:
- Planning mode may edit only `docs/plans/**`, `docs/research/**`,
  `docs/slate-issues/**`, `docs/slate-v2/ledgers/**`, and
  `docs/slate-v2/references/**`.
- Do not patch `.tmp/slate-v2` implementation in planning mode.
- Keep raw Slate unopinionated. Plate/app code owns product widgets, forms,
  labels, validation, layout, and shadcn-style component polish.
- Do not widen `renderVoid` with path/actions/children/focus prop bags.
- Do not hide a top-level root ordering migration inside this island/void lane.

Boundaries:
- In scope: default void semantics, editable-island semantics, child-root
  lifecycle, root-backed editor-only content, arrow/navigation policy,
  selection/focus/history/clipboard/delete/move semantics, example DX,
  migration backbone, issue accounting, and proof gates.
- Non-goals: current-version Plate adapters, current-version slate-yjs
  adapters, raw Slate form-builder APIs, rich content as normal void element
  descendants, automatic roots for every void, and implementation before user
  acceptance.
- Decision boundary: Slate Plan may choose the target architecture/API and
  proof gates; user review is required before implementation.

Blocked condition:
- Block only if the live `.tmp/slate-v2` workspace or required issue ledgers are
  unavailable after three consecutive attempts and no alternate
  source-grounding, research, ledger, or plan-hardening move remains runnable.

Slate Plan lane state:
- slate_plan_lane_status: complete
- current_pass: closure-score-final-gates
- current_pass_status: complete
- next_pass: none
- next_action: none
- final_handoff_status: complete

Current verdict:
- verdict: ready for user review. The accepted long-term shape is stable:
  default voids stay atomic, `editable-island` handles mixed native/app-control
  islands, editor-only rooted flow uses planned object-only
  `contentRoot: { slot: string }`, root lifecycle authoring gets public
  `tx.roots.create/replace/delete`, and React gets a small
  `useSlateContentRoot` helper over `useSlateChildRoot` +
  `useSlateRootChrome`. No boolean/string `contentRoot` shorthand, no built-in
  editable node type, no new void kind, no current slate-yjs support claim, and
  no new fixed/improved issue claim.
- confidence: 0.92
- keep / cut / revise call: revise the previous "editable-island only" answer
  into a three-surface split:
  1. keep default `void` atomic, legacy-like, and not navigable through content;
  2. keep `editable-island` for mixed native/app controls plus optional rich
     same-runtime child roots;
  3. add a separate editor-only rooted-content surface for the case where the
     element is just an editor and should navigate like document blocks.
- reason: live Slate v2 source already proves `editable-island` is a distinct
  void kind, same-runtime child roots work in the example/tests, root-scoped
  views/selectors exist, and root lifecycle metadata is transaction-owned. The
  pressure pass rejects default root creation for every void, one editor per
  block, raw `replace_children` authoring, and product-form APIs in raw Slate.
  The maintainer objection pass keeps that target but makes the API discipline
  explicit: the new surface must not be another void kind, must not be a
  built-in node type, must not claim slate-yjs support early, and must earn
  cross-root navigation through high-risk proof. The high-risk pass keeps the
  plan honest: existing child-root browser proof is an isolation floor, not
  sibling-flow proof, and current slate-yjs is still a single-`sharedRoot`
  adapter. The ecosystem maintainer pass makes the final architectural steal
  explicit: host shell plus editor-owned content hole, root-scoped subscription,
  and policy hooks without adopting another editor's engine shape. The revision
  pass freezes the concrete public shape; the issue-sync accounting pass
  confirms every claim artifact uses that frozen shape as planned architecture
  only. The closure pass verified the score, pass table, proof gates, issue
  sync, handoff, and remaining implementation boundaries.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked.
- Do not call `update_goal(status: complete)` while any pass row is pending,
  in progress, revised, or blocked with a runnable next move.
- The current activation completed only the closure score and final gates pass.
  All earlier pass rows were already complete before this activation started.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | User invoked `slate-plan` with a new long-term void/root/navigation prompt. |
| Active goal checked or created | yes | `get_goal` returned no active goal; `create_goal` created the Slate Plan lane objective for this pass schedule. |
| Source of truth read before edits | yes | Generated this plan from `docs/plans/templates/slate-plan.md`; read live `.tmp/slate-v2` source/tests and relevant issue/research entrypoints before writing pass 1. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: planning-only | This activation does not patch implementation code. |
| Live `.tmp/slate-v2` grounding needed for current-state claims | yes | Current-state claims cite exact live source/test rows below. |

Work Checklist:
- [x] Objective includes lane outcome, full pass schedule, one-pass-per-
      activation policy, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] One-pass-per-activation policy respected for this activation.
- [x] Live source grounding recorded for pass-1 current implementation claims.
- [x] Related issue discovery / ClawSweeper input pass applied with concrete
      evidence.
- [x] Final issue-ledger accounting pass closed with concrete
      evidence.
- [x] Intent/boundary record and decision brief complete.
- [x] Research and ecosystem synthesis complete for every external system used
      as evidence.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [x] Slate maintainer objection ledger complete for every breaking/paradigm
      change.
- [x] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85 before closure.
- [x] Verification workspace gate recorded for every Slate v2 source, runtime,
      browser, package, public API, or issue-fix claim.
- [x] TDD used for behavior/proof changes with a sane test surface, or marked
      N/A with reason.
- [x] Browser proof captured for browser-surface claims, or marked N/A with
      reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run closure/final gates only after all scheduled passes close. | Closure pass started after pass 11 was complete; final score is 0.92 with no dimension below 0.90; all pass rows are complete. |
| Slate v2 source, runtime, browser, package, public API, or issue-fix claim | yes | Record live `.tmp/slate-v2` command/proof or mark as planning-only with reason. | pass-1 source reads recorded below; no implementation claim made |
| Issue ledger or PR reference changed | yes | Sync the relevant ledger/reference row or record why no sync applies. | 2026-05-25 planning delta appended to `docs/slate-issues/gitcrawl-v2-sync-ledger.md`, `docs/slate-v2/ledgers/fork-issue-dossier.md`, and `docs/slate-v2/ledgers/issue-coverage-matrix.md`; `docs/slate-v2/references/pr-description.md` has a non-claim planning summary; pass 11 re-synced all four artifacts to name object-only `contentRoot` with `{ slot: string }` as planned architecture only and verified the unique fixed issue ID set still matches between the matrix and PR reference |
| Autoreview for uncommitted implementation changes | no | Record N/A for planning-only/no local patch. | N/A for this activation |
| Final user-review handoff | yes | Emit final handoff only after closure gates. | Final handoff outline is recorded below and the final response must include the Done Handoff. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-slate-v2-void-roots-and-editable-islands.md`. | Final checker passed in the closure pass; command and result are recorded under Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | Live source/test reads for editable-voids, child-root hooks, root chrome, void behavior, positions, root lifecycle ops, same-runtime child-root Playwright rows, issue/research ledgers; initial score 0.72. | related issue discovery |
| Related issue discovery | complete | Read durable issue ledgers, live generated rows, clusters, requirements, and candidate maps for default void atomicity, child-root islands, editor-only rooted-flow navigation, delete/selection/focus/clipboard/mobile guardrails; appended 2026-05-25 planning deltas to sync ledger, fork dossier, and coverage matrix. | issue-ledger pass |
| Issue-ledger pass | complete | Finalized claim stance: no new fixed/improved claims; default void traversal stays a non-claim; editor-only rooted flow is related architecture pressure only; existing fixed floors #3991, #4301, #4984, and #4806 stay unchanged. Added non-claim PR summary and restored existing #4806 to the coverage matrix top fixed list. | intent/boundary pass |
| Intent/boundary and decision brief | complete | Selected the durable decision: default voids are atomic, `editable-island` is the mixed native/app-control island, and editor-only rooted content is a separate document-flow projection surface. One-editor-per-block was compared and rejected for this lane because shared selection/history/collab/clipboard should stay one-runtime, many-root. | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | React external-store source supports root-scoped subscriptions; Lexical nested composer source warns against independent nested-editor inheritance/collab/copy-paste assumptions; ProseMirror/Tiptap node-view source validates host shell plus editor-owned content hole; current Plate source shows product-widget pressure; slate-yjs source shows single-`sharedRoot` assumptions that require root-qualified collaboration design. | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | Pressure result: keep the three-surface split, but make the new surface a root-content spec axis for app-defined elements rather than a hardcoded "editable node type" or another void kind. Require public root lifecycle helpers, root-scoped selector budgets, root-qualified collaboration, default-void regression rows, and minimal editor-only React helper DX. | objection ledger |
| Slate maintainer objection ledger | complete | Objections narrowed but did not overturn the target: default void traversal remains rejected, `editable-island` remains mixed-control only, one-editor-per-block remains rejected for this lane, `contentRoot` is the best vocabulary direction for editor-only rooted flow, tx root helpers are required, renderers stay content-only, and slate-yjs support stays a gated migration claim. | high-risk pass |
| High-risk deliberate mode | complete | Pre-mortem expanded into release gates for `contentRoot` API shape, default void semantics, root lifecycle, cross-root caret projection, `insertBreak`/split, delete/backspace, clipboard/drop/copy, history/collab, native controls/mobile, repeated-root performance, and render API discipline. Existing browser/source rows are treated as isolation/lifecycle floors, not editor-only sibling-flow proof. | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | Ecosystem pressure confirmed the split. React supports root-scoped external-store subscriptions; ProseMirror and Tiptap validate the shell/content-hole pattern; Lexical validates isolation/keyboard policy but makes independent nested editors expensive; Plate proves product UI belongs above raw Slate; slate-yjs proves root-qualified collaboration remains a migration gate. | revision pass |
| Revision pass | complete | Froze the target API and behavior law: `contentRoot: { slot: string }` on `EditorElementSpec`, persisted root id in `element.childRoots[slot]`, `tx.roots.create/replace/delete` for explicit root lifecycle, `useSlateContentRoot` as the minimal React helper, boundary navigation rules for arrows/Enter/delete, and no new fixed/improved issue claims until implementation proof. | issue sync accounting |
| Issue sync accounting | complete | Re-synced the frozen revision wording across the manual v2 sync ledger, fork issue dossier, issue coverage matrix, and PR reference: all four artifacts name object-only `contentRoot: { slot: string }` as planned architecture only, preserve the no-new-fixed/no-new-improved stance, and keep existing fixed issue IDs unchanged. | closure score and final gates |
| Closure score and final gates | complete | Closure audit verified the score threshold, all scheduled pass rows, issue/reference sync, planning-only workspace gate, TDD/browser N/A reasons, final handoff, reboot status, and open risks. | final handoff |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.92 | Revision pass keeps the frozen API on the existing root-scoped subscription path: `contentRoot` declares schema/navigation, while `useSlateContentRoot` composes existing root hooks instead of effect-created roots. Evidence: `useSlateViewState(root)` gates by affected root at `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:639`; `useSlateRootEditor(root)` already creates a root view editor at `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:712`; selector fanout can target runtime ids at `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:246`. |
| Slate-close unopinionated DX | 0.20 | 0.93 | Revision freezes a clear, agent-readable API: object-only `contentRoot: { slot: string }`, root id stored in `element.childRoots[slot]`, and `tx.roots.create/replace/delete` instead of operation replay. Evidence: current `EditorElementSpec` lacks the field at `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:507`; current `useSlateChildRoot` already treats `childRoots[slot]` as the persisted contract at `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-child-root.ts:37`; current example still leaks raw `replace_children` at `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:239`. |
| Plate and slate-yjs migration backbone | 0.15 | 0.90 | Revision keeps migration honest: Plate gets small raw primitives to wrap; slate-yjs remains a future root-qualified adapter job. Evidence: root lifecycle metadata exists on `replace_children` at `.tmp/slate-v2/packages/slate/src/interfaces/operation.ts:124`; root lifecycle defaults infer presence at `.tmp/slate-v2/packages/slate/src/core/public-state.ts:765`; current slate-yjs has one `sharedRoot: Y.XmlText` at `../slate-yjs/packages/core/src/plugins/withYjs.ts:29`. |
| Regression-proof testing strategy | 0.20 | 0.92 | Revision turns vague "like sibling blocks" into explicit proof rules: generic cross-root ranges still reject, only the `contentRoot` projection bridge crosses roots, Enter splits child content except at defined boundaries, and owner/root lifecycle is tested through delete/copy/move/undo. Evidence: positions skip atom/readOnly nodes at `.tmp/slate-v2/packages/slate/src/editor/positions.ts:43`; cross-root reads reject ambiguous roots at `.tmp/slate-v2/packages/slate/test/editor-runtime-view-contract.ts:436`; bookmarks reject multi-root ranges at `.tmp/slate-v2/packages/slate/src/editor/bookmark.ts:236`. |
| Research evidence completeness | 0.15 | 0.93 | The plan now has current source, issue accounting, ecosystem synthesis, pressure review, maintainer objections, high-risk proof gates, ecosystem maintainer pass, frozen API/navigation revision, issue sync accounting, and closure gates. Implementation proof is explicitly deferred to a later accepted execution lane. |
| shadcn-style composability and minimalism | 0.10 | 0.92 | Revision keeps raw Slate minimal: no built-in editable node type, no renderer prop bag, no product UI, one hook helper over root primitives. Evidence: renderers stay content-only at `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx:919`; `useSlateRootChrome` already returns a small chrome prop bag at `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-root-chrome.ts:26`; Plate owns product UI at `../plate/apps/www/src/registry/examples/editable-voids-demo.tsx:9`. |

Weighted score after pass 12: 0.92.

Source-backed architecture north star:
- target shape: split the model into atomic voids, mixed editable islands, and
  editor-only rooted content.
- source evidence: current Slate v2 already distinguishes `void` from `atom`:
  `editable-island` is a void kind, but `create-editor` makes `atom` true for
  normal voids and false for editable islands at
  `.tmp/slate-v2/packages/slate/src/create-editor.ts:309`.
- rejected drift: do not redefine default voids as traversable content; do not
  use void element `children` for rich island content; do not use a mixed
  native-control island as the only answer for editor-only rooted flow content.
- migration posture: keep existing void behavior by default; migrate rich
  same-runtime island examples to child roots; add an editor-only rooted
  surface only if it gives cleaner navigation and DX than overloading
  `editable-island`.

Current-state source facts:
| Surface | Current source | Fact | Plan implication |
|---------|----------------|------|------------------|
| Default void behavior | `.tmp/slate-v2/packages/slate/src/create-editor.ts:172` | `block`, `inline`, `markable-inline`, and `editable-island` are all void kinds. | Void remains the compatibility umbrella. |
| Atom split | `.tmp/slate-v2/packages/slate/src/create-editor.ts:317` | `editable-island` is detected separately; `atom` is true for voids except editable islands. | Current source already wants "void" and "atomic" to be separable. |
| Public void kind | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:481` | `EditorElementVoidKind` includes `editable-island`. | Do not invent a stale "editable void" name without a migration reason. |
| Current example root data | `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:71` | Initial value stores `roots` with a child body root and `main`. | Same-runtime root storage is already demonstrated. |
| Element-owned child root | `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:40` | `createEditableVoid` persists `childRoots: { body: bodyRoot }`. | Stable root id is currently app-authored. |
| Child root rendering | `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:183` | `EditableVoid` calls `useSlateChildRoot`, `useSlateRootChrome`, then renders `<Editable root={bodyRoot}>`. | The render shape is architecturally right but call-site plumbing is noisy. |
| Bad insertion DX | `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:239` | New child root creation uses raw `tx.operations.replay([{ type: 'replace_children', root: bodyRoot, ... }])`. | Need public root/child-root creation transform before claiming best DX. |
| Child-root helper | `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-child-root.ts:44` | `useSlateChildRoot(element, slot)` resolves persisted `childRoots[slot]` or runtime-id fallback. | Good primitive; needs lifecycle/API pressure. |
| Root chrome | `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-root-chrome.ts:26` | Root chrome targets a root view editor and root interaction controller. | Mixed island and editor-only rooted surfaces should reuse root activation mechanics. |
| Content-only `renderVoid` | `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx:919` | Contract asserts void renderers receive only `element`, not path/actions/children/focus. | Keep runtime wiring in hooks/components, not render props. |
| Same-runtime child-root contract | `.tmp/slate-v2/packages/slate-react/test/slate-runtime-provider-contract.test.tsx:107` | Contract renders child root content and updates it through `useSlateRootEditor(root)`. | Shared-state root model is proven at unit level. |
| Root creation op today | `.tmp/slate-v2/packages/slate/test/rooted-operation-contract.ts:394` | Creating an explicit child root is currently expressed as root-level `replace_children`. | Current low-level op exists; public transform is missing. |
| Positions policy | `.tmp/slate-v2/packages/slate/src/editor/positions.ts:43` | Positions skip atom/readOnly ancestors unless `voids: true`. | Editor-only rooted-flow navigation should be explicit and not rely on default void traversal. |
| Editable-island positions | `.tmp/slate-v2/packages/slate/test/query-contract.ts:2361` | `editable-island` positions traverse its normal children because it is not atom. | This only covers same-tree children, not child-root-as-sibling navigation. |
| Browser proof: restore root | `.tmp/slate-v2/playwright/integration/examples/editable-voids.test.ts:80` | Redo restores an inserted editable void child root after undo. | Good floor for root lifecycle; still not enough for editor-only flow navigation. |
| Browser proof: child edit | `.tmp/slate-v2/playwright/integration/examples/editable-voids.test.ts:324` | Same-runtime child root can be edited. | Mixed island child-root baseline exists. |
| Browser proof: child focus | `.tmp/slate-v2/playwright/integration/examples/editable-voids.test.ts:347` | Child root keeps focus/caret usable. | Root chrome/selection baseline exists. |
| Browser proof: paste/drop | `.tmp/slate-v2/playwright/integration/examples/editable-voids.test.ts:502` and `:561` | Paste/drop inside child root does not steal outer selection. | Clipboard/drop lanes already have child-root pressure. |
| Browser proof: cross-root selection | `.tmp/slate-v2/playwright/integration/examples/editable-voids.test.ts:637` | Parent selection crossing into child root is ignored. | Current policy is isolation, not sibling-block traversal. |

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| Default atomic voids | Keep `void: 'block'`, `void: 'inline'`, and `void: 'markable-inline'` atomic by default. | Existing void users keep legacy-like behavior. | No migration required for ordinary embeds/images/mentions. | Atom split in `.tmp/slate-v2/packages/slate/src/create-editor.ts:317`. | keep |
| Mixed editable island | Keep `void: 'editable-island'` for app/native controls plus optional child roots. | Use native controls and/or child root inside a runtime-owned void shell. It is an island, not a document-flow projection. | Existing current example shape survives; DX still needs public root creation helper. | `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:183`. | keep |
| Editor-only rooted content | Add object-only `contentRoot: { slot: string }` to app-defined `EditorElementSpec`. Do not add boolean/string shorthand, another `void` kind, or a built-in editable node type. | Author declares one editor-owned content root slot and renders that root as projected document flow. | Avoids changing default voids and avoids overloading mixed islands. Parent-flow order comes from the owner element path, not ordered `roots`; the persisted root id lives on `element.childRoots[slot]`. | gap: `EditorElementSpec` has no root-content field at `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:507`; `useSlateChildRoot` already treats `childRoots[slot]` as persisted at `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-child-root.ts:37`. | frozen target |
| Root creation transform | Add public `tx.roots.create(root, children)`, `tx.roots.replace(root, children)`, and `tx.roots.delete(root)` helpers. | Avoid raw `replace_children` in examples; create root and insert owner in one transaction. | Low-level op remains; helpers wrap root-level `replace_children` and root lifecycle remains operation-visible. | Current raw replay at `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:239`; root presence metadata at `.tmp/slate-v2/packages/slate/test/rooted-operation-contract.ts:394`. | frozen target |
| Render contract | Keep `renderVoid` content-only. | Runtime helpers/hooks own root wiring. | Avoids renderer subscription/API bloat. | `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx:956`. | keep |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Root lifecycle | `slate` operations/runtime | Child-root create/delete/restore must be transaction-owned and history/collab-visible; public helpers should wrap the low-level operation. | Effect-created orphan roots, stale descendant paths, and undo crashes. | Root creation currently uses `replace_children` and records root presence in `.tmp/slate-v2/packages/slate/test/rooted-operation-contract.ts:394`; inversion preserves root presence at `.tmp/slate-v2/packages/slate/src/interfaces/operation.ts:500`. | keep/gate |
| Navigation | `slate` position/caret model plus `slate-react` root views | Default void navigation remains atomic; editor-only rooted elements get a flow navigation bridge across parent root and child root boundaries. | Making mixed native-control islands pretend to be normal blocks. | Positions skip atoms at `.tmp/slate-v2/packages/slate/src/editor/positions.ts:43`; current cross-root browser policy ignores parent selection crossing child root at `.tmp/slate-v2/playwright/integration/examples/editable-voids.test.ts:637`. | add target |
| Root chrome/focus | `slate-react` root interaction controller | Reuse root chrome for both mixed islands and editor-only rooted elements; native controls remain native-owned. | Parent editor stealing focus from input or child root. | `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-root-chrome.ts:26`; root chrome tests at `.tmp/slate-v2/packages/slate-react/test/use-slate-root-chrome.test.tsx:34`. | keep |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| Mixed island | `const bodyRoot = useSlateChildRoot(element, 'body')`; `<Editable root={bodyRoot} />` when rich content exists | Native controls and rich root can coexist inside island shell. | Do not create child roots for native controls that do not need rich text. | Current example uses this shape at `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:183`. | keep/revise |
| Editor-only rooted element | `const { chrome, root } = useSlateContentRoot(element)`; render `<div {...chrome.props}><Editable root={root} /></div>` | The node is editor content, not app/native UI. The helper is just `useSlateChildRoot` + `useSlateRootChrome` + spec slot resolution. | Root-scoped subscriptions only; no parent render-prop path subscriptions. | gap: no current helper; current root chrome and root editor hooks are the raw pieces at `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-root-chrome.ts:26` and `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:712`. | frozen target |
| Root creation | `tx.roots.create(bodyRoot, createEmptyBody()); tx.nodes.insert(createCard(bodyRoot))` | Example shows actual API at the call site. | One transaction should create root and insert owner. | Current raw replay at `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:239`; root lifecycle defaults at `.tmp/slate-v2/packages/slate/src/core/public-state.ts:765`. | frozen target |

Revision-pass frozen API surface:

```ts
export type EditorElementContentRootSpec = {
  /**
   * Slot key on `element.childRoots` that stores the projected content root.
   *
   * The slot is schema vocabulary. The actual `RootKey` is document data:
   * `element.childRoots[slot]`.
   */
  slot: string
}

export type EditorElementSpec = {
  contentRoot?: EditorElementContentRootSpec
  type: string
  void?: EditorElementVoidKind
  // existing fields unchanged
}

export type EditorTransactionRootsApi<V extends Value = Value> = {
  create: (root: RootKey, children: V) => void
  delete: (root: RootKey) => void
  replace: (root: RootKey, children: V) => void
}
```

Revision-pass API rules:
- `contentRoot` is object-only. No `true` shorthand, no string shorthand, and no
  implicit default slot in the schema field. Agents should see `slot` in the
  type.
- `contentRoot` is not a void kind. Ordinary `void: 'block' | 'inline' |
  'markable-inline'` stays atomic; `void: 'editable-island'` stays the
  mixed-control island.
- `contentRoot.slot` points to `element.childRoots[slot]`. The spec never stores
  root ids.
- `tx.roots.create` throws or fails loudly when the root already exists;
  `tx.roots.replace` requires an existing root; `tx.roots.delete` must not delete
  `main` and records `rootIsPresent: false` through operation lifecycle.
- `useSlateContentRoot(element, options?)` is the only new React helper target.
  It resolves the content-root slot from schema or `options.slot`, delegates to
  `useSlateChildRoot`, and returns `{ chrome, root }` using
  `useSlateRootChrome`.

Revision-pass keyboard/navigation law:
| Boundary | Rule | Proof owner |
|----------|------|-------------|
| Arrow into content root | At the owner element's before/after edge, arrow movement may project into the first/last valid point of `element.childRoots[slot]`. | core caret + browser |
| Arrow out of content root | At child-root start/end, arrow movement may project to before/after the owner element in the parent root. | core caret + browser |
| Generic ranges | Arbitrary ranges spanning different roots remain invalid; bookmarks and text reads keep throwing outside the projection bridge. | core range/bookmark |
| Enter inside content root | Splits inside the child root. | core transform + browser |
| Enter at child-root boundary | Only the boundary bridge may insert a parent-root sibling before/after the owner element. | core transform + browser |
| Backspace/Delete inside content root | Deletes inside the child root unless at a defined boundary. | core transform + browser |
| Backspace/Delete at boundary | Deletes/selects the owner element and removes/remaps the owned root in the same transaction. | delete/history/collab |
| Copy/cut/move owner element | Carries or remaps the owned root payload with the owner element; no parent-root paste may silently drop the child root. | clipboard/collab |

Plate migration-backbone target:
| Pressure | Slate substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Product widgets in islands | Atomic mixed island plus optional child root/state fields. | Plate wraps controls, labels, validation, menus, and plugin options over raw root primitive. | Raw Slate form-builder. | Current Plate editable-void example uses `Input`, `Label`, `RadioGroup`, and a nested `Plate` editor inside an `isVoid` element at `../plate/apps/www/src/registry/examples/editable-voids-demo.tsx:16` and `:31`. | keep raw Slate primitive only |
| Editor-only nested flow content | Rooted editable element with flow navigation. | Plate can expose callout/card/details-like editor-only blocks without nested editor split-brain. | Current Plate adapter support. | Current Plate example proves product demand for mixed islands, not raw Slate proof for editor-only rooted flow. Slate v2 child roots are the substrate owner. | target separate surface |

slate-yjs migration-backbone target:
| Pressure | Slate substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Child root lifecycle | Root create/delete/restore/remap must be deterministic and operation-visible. | yjs can map parent element identity plus root slot to remote root payloads. | Current slate-yjs adapter support. | Current `withYjs` binds a single `sharedRoot: Y.XmlText` and observes/applies operations through it at `../slate-yjs/packages/core/src/plugins/withYjs.ts:29` and `:209`. | migration gap |
| Editor-only rooted flow navigation | Cross-root caret movement must not create ambiguous remote selections. | Remote selections need root-qualified points or a projection policy. | Solving all collab UX in planning. | Current range conversion uses `(sharedRoot, slateRoot, range)` and cursor reads call `relativeRangeToSlateRange(editor.sharedRoot, editor, ...)` at `../slate-yjs/packages/core/src/utils/position.ts:257` and `../slate-yjs/packages/react/src/utils/getCursorRange.ts:32`. | require root-qualified selection design |

Intent / boundary record:
- intent: choose the durable long-term Slate v2 model for voids and root-backed
  editable content now that multi-root support exists and editable voids can be
  same-runtime instead of nested independent editors.
- outcome: a Slate user can keep ordinary voids atomic, build mixed interactive
  islands with shared child roots, and build editor-only root-backed content
  whose keyboard navigation feels like document blocks.
- in-scope: source-grounded API/runtime target, issue mapping, decision
  boundaries, proof gates, root lifecycle, navigation semantics, and migration
  backbone.
- non-goals: implementation, product UI, current-version adapters, rich content
  under normal void `children`, automatic roots for every void, one-editor-per-
  block as the default substrate, and broad top-level root ordering redesign.
- decision boundaries: this plan may choose target surfaces and proof gates;
  user review is required before execution. Future implementation must still
  prove final naming and public API shape.
- explicit semantic boundary: `void` means atomic by default. A root-backed
  element can share state without being a default traversable void.
- explicit navigation boundary: mixed native-control islands are isolated;
  editor-only rooted content is the only surface allowed to project child-root
  blocks into parent-flow navigation.
- explicit ordering boundary: keyed `roots` remain storage identity. The parent
  element path owns document-flow placement for editor-only rooted content; this
  lane must not smuggle in ordered top-level roots.
- unresolved user-decision points: none for the architecture. User review is
  still required before implementation.

Decision brief:
- principles: default voids stay atomic; editor-only content should not pretend
  to be app/native UI; app/native controls should not pretend to be document
  text; render callbacks render content only; root lifecycle is transaction-
  owned; cross-root navigation needs explicit proof.
- top drivers: user wants legacy void semantics plus root-backed shared state
  plus natural navigation; current source already separates `void` and `atom`;
  current examples prove same-runtime child roots inside mixed islands; browser
  tests prove isolation but not sibling-block navigation.
- viable options:
  - Option A: one overloaded `editable-island` type for mixed controls and
    editor-only rooted content. Pro: fewer names. Con: native-control and
    editor-flow navigation policies conflict.
  - Option B: three-surface split. Pro: preserves voids, keeps mixed islands
    honest, gives editor-only root content a clean navigation contract, and
    matches the current one-runtime, many-root direction. Con: adds one public
    concept.
  - Option C: make void children/root content navigable by default. Pro:
    simplest mental model in the narrow case. Con: breaks the definition of
    void and reopens spacer/selection bugs.
  - Option D: one editor per block/root. Pro: natural React containment and
    local block isolation. Con: cross-selection, history, clipboard, undo/redo,
    focus, normalization, and collaboration would need a second editor-
    federation layer. That fights the user's shared-state requirement and the
    current one-editor/many-root implementation.
- chosen option: Option B.
- rejected alternatives: C is rejected because it changes what a void is. A is
  rejected as the default target because the mixed native-control case and pure
  editor-flow case need different focus/navigation contracts. D is rejected for
  this lane because it makes "children as sibling blocks" harder, not easier,
  once shared selection/history/collab matter.
- consequences: need public root lifecycle helpers, object-only `contentRoot`
  with `{ slot: string }`, a minimal `useSlateContentRoot` helper, cross-root
  caret/navigation tests,
  delete/undo/clipboard/collab lifecycle proof.
- follow-ups: maintainer objection ledger, high-risk proof hardening,
  ecosystem maintainer pass, revision pass, and final issue/reference sync.

Decision law:
| Question | Decision | Why | Evidence |
|----------|----------|-----|----------|
| Are default voids root-backed/traversable? | No. Default voids stay atomic and legacy-like. | The user explicitly wants voids "like before"; current `positions` skips atom/readOnly ancestors unless `voids: true`; issue guardrails make traversal risky. | `.tmp/slate-v2/packages/slate/src/editor/positions.ts:43`; issue-ledger pass. |
| Is `editable-island` the editor-only flow surface? | No, not by default. | The current example mixes inputs/radio controls and child editor content; that is an island, not pure document flow. | `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:183`. |
| Should editor-only rooted content be another void kind? | No. Add `contentRoot: { slot: string }` on app-defined element specs. | Void kind already carries legacy atomic meaning; editor-only rooted content should be document-flow content with root-qualified storage. Object shape keeps the slot visible to humans and agents. | `.tmp/slate-v2/packages/slate/src/create-editor.ts:317`; `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:481`; `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:507`. |
| Does this require ordered `roots`? | No for this lane. | Flow order comes from the owner element's path in the parent root; keyed roots remain stable identity storage. | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:89`; `.tmp/slate-v2/packages/slate/src/core/public-state.ts:604`. |
| Should one-editor-per-block be the long-term substrate? | No for raw Slate default. | It creates a federation problem for exactly the shared selection/history/collab behavior this lane needs. Keep one editor/runtime with many root views. | Current multi-root value and root view source; memory prior root-shape comparison. |

Pressure pass decision matrix:
| Pressure | Keep / revise / cut | Decision | Evidence | Proof / follow-up |
|----------|---------------------|----------|----------|-------------------|
| Performance | keep with constraints | One runtime with many root views remains the target. Rooted content must be opt-in, not automatic per void/block, and selectors must be root/runtime scoped. | `useSlateViewState(root)` gates with `isRootAffected` at `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:639`; selector fanout can target runtime ids at `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:246`. | Execution must add repeated-root cohorts and interaction p95/p99 rows before perf claims. |
| DX | revise narrower | Do not create a built-in "editable node type". Add a root-content spec axis for app-defined element types, plus a tiny editor-only React helper. | `EditorElementSpec` currently has no root-content field at `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:507`; current raw insert leaks `replace_children` at `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:239`. | Objection pass must settle final vocabulary; execution must add public tx root helpers. |
| Migration | keep gated | Plate migrates to raw primitives; slate-yjs needs root-qualified shared types or slot mapping before any multi-root collab claim. | Root lifecycle metadata exists at `.tmp/slate-v2/packages/slate/test/rooted-operation-contract.ts:394`; current slate-yjs is single `sharedRoot` at `../slate-yjs/packages/core/src/plugins/withYjs.ts:29`. | Do not claim current slate-yjs support. |
| Regression | gate hard | Default voids stay atomic; editor-only rooted flow gets new keyboard/navigation behavior only behind the new root-content axis. | `positions` skips atom/readOnly ancestors unless `voids: true` at `.tmp/slate-v2/packages/slate/src/editor/positions.ts:43`; cross-root reads/bookmarks reject ambiguous roots at `.tmp/slate-v2/packages/slate/test/editor-runtime-view-contract.ts:436` and `.tmp/slate-v2/packages/slate/src/editor/bookmark.ts:244`. | New rows: arrow into/out, Enter/Split, Backspace/Delete, undo/redo, paste/drop, select-all. |
| Simplicity | keep stricter | Keep `renderVoid` content-only and keep mixed islands separate from rooted document flow. | `renderVoid` content-only contract in `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx:919`; `editable-island` atom split in `.tmp/slate-v2/packages/slate/src/create-editor.ts:317`. | No path/action/focus prop bags in renderers. |

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| #5212 | related/planned example candidate | Editable void example accuracy remains directly related, but the live example has moved from nested independent editor to same-runtime child roots. | Current example still exposes raw root creation and does not teach editor-only rooted flow. | Example/API/browser proof before any fixed/improved claim. | 2026-05-25 delta appended | related matrix only unless implementation proves it |
| #2072 | related architecture target strengthened | The island request splits into two library surfaces: mixed editable island for app/native controls, and editor-only rooted flow for pure editor content. | One overloaded island type makes native-control focus and sibling-block navigation fight each other. | Decision brief, API proof, browser navigation proof. | 2026-05-25 delta appended | related matrix only |
| #3482, #3367 | related model-shape pressure | Void children/arbitrary void text pressure reinforces keeping default voids atomic and using child roots/rooted elements instead. | User explicitly wants voids "like before" plus root-backed content. | Core model and browser proof. | 2026-05-25 delta appended | related matrix only |
| #3435, #3884, #4301 | arrow/Enter/void-selection guardrails | Editor-only rooted flow must define arrow/Enter behavior without changing selected-void behavior. | "Children as sibling blocks" is a navigation promise, not a void redefinition. | Core positions/ranges plus browser keyboard proof. | 2026-05-25 delta appended | related matrix only |
| #3991, #3868, #5582, #5477, #4896, #4350, #4328, #5630 | void delete/selection guardrails | New root-backed surfaces must not regress void delete, selection, range delete, select-all paste, or root restore behavior. | Child-root lifecycle raises delete/undo/remap risk. | Core + browser tests before any issue status changes. | 2026-05-25 delta appended | related matrix only |
| #4984, #4842, #3909 | nested/contenteditable ownership guardrails | Same-runtime child roots must preserve nested-editor crash fixes and avoid DOM point/offset split-brain. | Child roots are the replacement for nested independent editors, not a broader closure claim. | Existing fixed row plus targeted DOM bridge/browser proof. | 2026-05-25 delta appended | preserve existing PR claim only for #4984 |
| #4806, #4802, #4104, #3926, #4888, #4623 | clipboard/drop/move guardrails | Copy, paste, cut, drop, and move semantics remain adjacent proof pressure. | Root-backed elements need explicit root payload/remap serialization. | Browser clipboard/drop and operation lifecycle proof. | 2026-05-25 delta appended | existing #4806 claim unchanged only |
| #5183, #5391, #5559, #4839, #5087, #5411, #3611 | inline/mobile/spacer/cursor guardrails | These remain adjacent pressure, not fixed by editor-only rooted flow. | Cross-root navigation must not widen inline-void/mobile/spacer claims. | Browser/mobile/IME/selection proof if touched. | 2026-05-25 delta appended | related matrix only |
| #1769, #3893 | external/native focus pressure | Mixed islands retain native focus ownership; editor-only rooted flow must not import external/native selection into the parent editor. | Native controls and child editors need different policies. | Focus/selection browser rows. | 2026-05-25 delta appended | related matrix only |

Issue-ledger sync status:
- ClawSweeper related-issue pass: complete for the changed prompt using durable
  ledgers and live generated rows; no live GitHub write/read was needed.
- final issue-ledger pass: complete. The current plan adds no fixed issue
  claims and no improved issue claims. It preserves existing fixed floors
  `#3991`, `#4301`, `#4984`, and `#4806` only where already proven.
- generated live gitcrawl rows read: `#5212`, `#2072`, `#3482`, `#3367`,
  `#3435`, `#3884`, `#3991`, `#4301`, `#3868`, `#5582`, `#5477`,
  `#4896`, `#4350`, `#4328`, `#5630`, `#4984`, `#4842`, `#3909`,
  `#4806`, `#4802`, `#4104`, `#3926`, `#4888`, `#4623`, `#5183`,
  `#5391`, `#5559`, `#4839`, `#5087`, `#5411`, `#3611`, `#1769`,
  and `#3893`, plus clusters 12, 17, and 21.
- manual v2 sync ledger update: appended
  `2026-05-25 Void Roots / Editor-only Rooted Flow Planning Delta` to
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`.
- fork issue dossier update: appended
  `Void Roots / Editor-only Rooted Flow Surface Review - 2026-05-25` to
  `docs/slate-v2/ledgers/fork-issue-dossier.md`.
- issue coverage matrix update: appended
  `Void Roots / Editor-only Rooted Flow Planning Delta - 2026-05-25` to
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- issue coverage matrix top fixed list: restored existing `#4806` fixed claim
  to the top fixed-issue list because the detailed matrix row and PR reference
  already claimed it. This is sync repair, not a new claim.
- PR description sync: pass 2 left the PR reference unchanged; pass 3 added a
  non-claim planning-summary bullet for the 2026-05-25 void roots/editor-only
  rooted-flow delta. Fixed/improved issue claim count remains unchanged.
- issue-sync accounting pass: complete. The sync ledger, fork dossier, coverage
  matrix, and PR reference now all describe object-only `contentRoot` with
  `{ slot: string }` as planned architecture only. No artifact claims current
  implementation support, no fixed/improved issue claim was added, and the
  unique fixed issue ID set remains unchanged between the coverage matrix and
  PR reference.

Final issue-claim stance:
| Bucket | Issues | Claim stance | Release/proof consequence |
|--------|--------|--------------|---------------------------|
| Existing fixed floors preserved | `#3991`, `#4301`, `#4984`, `#4806` | Keep exact existing fixed claims only. | Future root-backed work must keep these tests/proofs green; this plan does not broaden them. |
| Direct architecture pressure | `#2072`, `#5212`, `#3482`, `#3367` | Related only. | Use these to justify the three-surface split and example/root-creation DX; no auto-close. |
| Navigation/Enter pressure | `#3435`, `#3884`, `#4301` | Related guardrails, with existing `#4301` fixed floor preserved. | Editor-only rooted flow needs new arrow/Enter proof; default selected-void behavior must not change. |
| Delete/selection lifecycle pressure | `#3991`, `#3868`, `#5582`, `#5477`, `#4896`, `#4350`, `#4328`, `#5630` | Related guardrails, with existing `#3991` fixed floor preserved. | Root create/delete/restore/remap must be tested before any new issue status changes. |
| Nested/contenteditable ownership | `#4984`, `#4842`, `#3909` | Related guardrails, with existing `#4984` fixed floor preserved. | Same-runtime child roots must avoid nested-editor split-brain; exact offset/CodeMirror closure is not claimed. |
| Clipboard/drop/move pressure | `#4806`, `#4802`, `#4104`, `#3926`, `#4888`, `#4623` | Related guardrails, with existing `#4806` fixed floor preserved. | Root payload serialization and remap policy need explicit proof. |
| Inline/mobile/spacer/cursor/focus pressure | `#5183`, `#5391`, `#5559`, `#4839`, `#5087`, `#5411`, `#3611`, `#1769`, `#3893` | Related only. | Do not widen mobile, IME, spacer, cursor, or native-focus claims without targeted browser/device proof. |

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| React external store / concurrent rendering | `../react/packages/use-subscription/src/useSubscription.js:10`; `../react/packages/use-subscription/src/__tests__/useSubscription-test.js:593` | `useSyncExternalStore` gives concurrent-safe subscriptions when the subscribe/getSnapshot pair is stable. | React tearing and parent rerender pressure from whole-editor state reads. | Root-scoped selector hooks and memoized subscription params for root views/chrome. | Making React own core selection, position, or root lifecycle semantics. | One Slate runtime owns state/tx/navigation; React consumes root-scoped snapshots. | adopt |
| Lexical decorator/nested editor | `../lexical/packages/lexical/src/nodes/LexicalDecoratorNode.ts:30`; `../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx:33`; `../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx:80`; `../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx:185` | Decorator nodes expose isolation/inline/keyboard-selectable policy; nested composers require explicit editor creation, plugin registration, collab readiness, editable syncing, and namespace/copy-paste care. | Independent nested-editor split-brain. | Policy bits: isolated, inline, keyboard-selectable; lifecycle warnings for nested editors. | Nested independent editor as the default answer for editable void/root content. | Same-runtime child roots and editor-only rooted flow, not nested editor federation. | steal policy, reject substrate |
| ProseMirror node views | `../prosemirror-view/src/viewdesc.ts:31`; `../prosemirror-view/src/viewdesc.ts:71`; `../prosemirror-view/src/viewdesc.ts:993`; `../prosemirror-commands/src/commands.ts:68`; `../prosemirror-commands/src/commands.ts:138` | NodeView has an outer `dom` and optional `contentDOM`; the view owns child rendering through `contentDOM`; commands treat atoms/selectable nodes and isolating boundaries explicitly. | Mixing app shell DOM with editor-owned content without a clear boundary. | Host shell plus editor-owned content hole; explicit atom/select/isolate navigation policy. | Integer-position model and schema-first engine shape as Slate public API. | Rooted-content host element with a child-root content hole and explicit cross-root caret bridge. | adopt mechanism |
| Tiptap React NodeView / extension DX | `../tiptap/packages/react/src/ReactNodeViewRenderer.tsx:93`; `../tiptap/packages/react/src/ReactNodeViewRenderer.tsx:168`; `../tiptap/packages/extension-details/src/content/details-content.ts:55`; `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md:41` | React NodeViewRenderer mounts a React shell and appends a content DOM target; extension DX packages commands, shortcuts, UI, and selector guidance. | Boilerplate-heavy authoring and transaction-wide React rerenders. | Component wrapper/content split and product-DX ergonomics as a benchmark. | ProseMirror leakage, mandatory command chains, or product UI in raw Slate. | Minimal raw Slate rooted-content helper plus Plate-level product wrappers. | adopt DX benchmark |
| Current Plate editable void example | `../plate/apps/www/src/registry/examples/editable-voids-demo.tsx:16`; `../plate/apps/www/src/registry/examples/editable-voids-demo.tsx:31`; `../plate/apps/www/src/registry/examples/editable-voids-demo.tsx:70` | Plate's legacy example models editable voids as product UI: inputs, labels, radio controls, and a nested Plate editor inside a void component. | Raw Slate becoming a form-builder or shadcn clone. | Product pressure: mixed native/app controls are real and need a stable island primitive. | Baking labels, validation, layout, or current Plate adapter behavior into Slate core. | Raw Slate owns the mixed-island/root primitives; Plate owns rich product components. | use as pressure only |
| slate-yjs current substrate | `../slate-yjs/packages/core/src/plugins/withYjs.ts:29`; `../slate-yjs/packages/core/src/plugins/withYjs.ts:209`; `../slate-yjs/packages/core/src/utils/position.ts:10`; `../slate-yjs/packages/core/src/utils/position.ts:257`; `../slate-yjs/packages/react/src/utils/getCursorRange.ts:32` | Current adapter has one `sharedRoot: Y.XmlText`; ops, stored positions, cursors, history, and relative ranges map through that shared root. | Ambiguous remote selections and orphan child-root payloads. | Deterministic root lifecycle and root-qualified position pressure. | Claiming current slate-yjs already supports multi-root child roots. | Root create/delete/remap must be op-visible; collaboration needs root-qualified shared types or root-slot mapping. | migration gap identified |

Ecosystem maintainer pass:
| Maintainer lens | What survives | What gets stolen | What stays rejected | Evidence | Revision consequence |
|-----------------|---------------|------------------|---------------------|----------|----------------------|
| React maintainer | One runtime/many root views stays the right React shape. | Stable external-store subscription, root/runtime-scoped selectors, deferred non-urgent selectors. | React effects/state as root lifecycle or navigation source. | `../react/packages/use-subscription/src/useSubscription.js:10`; `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:639`; `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:246`. | Revision must keep `contentRoot` wiring on selector hooks, not effect-created roots. |
| ProseMirror maintainer | Shell plus editor-owned content hole is the right mental model. | `dom`/`contentDOM`, explicit `setSelection`, `stopEvent`, and `ignoreMutation` ownership. | Integer positions, schema-first public API, or ProseMirror-style node-view complexity. | `../prosemirror-view/src/viewdesc.ts:31`; `../prosemirror-view/src/viewdesc.ts:71`; `../prosemirror-view/src/viewdesc.ts:700`; `../prosemirror-view/src/viewdesc.ts:1017`. | Revision should define `contentRoot` as Slate's content-hole axis, not a new void kind. |
| Tiptap maintainer | The public example should look like a wrapper plus a content slot. | `NodeViewWrapper`/`NodeViewContent`-style DX and product-level composability. | Mandatory chain command style, ProseMirror leakage, and product UI in raw Slate. | `../tiptap/packages/react/src/ReactNodeViewRenderer.tsx:78`; `../tiptap/packages/react/src/ReactNodeViewRenderer.tsx:158`; `../tiptap/packages/react/src/ReactNodeViewRenderer.tsx:205`. | Revision should make the editor-only helper boring and obvious at the call site. |
| Lexical maintainer | Policy bits are useful; independent nested editors are the wrong substrate for this lane. | Isolation, inline, and keyboard-selectable vocabulary; explicit collab readiness pressure. | Nested independent editors as default for rooted content. | `../lexical/packages/lexical/src/nodes/LexicalDecoratorNode.ts:34`; `../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx:80`; `../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx:118`; `../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx:185`. | Revision must compare one-editor-per-block only as rejected architecture, not as hidden fallback. |
| Plate maintainer | Mixed editable islands are real product demand. | Product pressure for native controls plus rich editor content. | Baking `Input`, `Label`, `RadioGroup`, validation, or layout into Slate core. | `../plate/apps/www/src/registry/examples/editable-voids-demo.tsx:16`; `../plate/apps/www/src/registry/examples/editable-voids-demo.tsx:31`; `../plate/apps/www/src/registry/examples/editable-voids-demo.tsx:70`. | Revision should keep raw Slate primitives small and leave registry UX to Plate. |
| slate-yjs maintainer | Root lifecycle must be op-visible before collaboration claims. | Root-qualified shared type / root-slot mapping pressure. | "Works with slate-yjs today" language. | `../slate-yjs/packages/core/src/plugins/withYjs.ts:29`; `../slate-yjs/packages/core/src/plugins/withYjs.ts:209`; `../slate-yjs/packages/core/src/plugins/withYjs.ts:257`; `../slate-yjs/packages/core/src/utils/position.ts:257`. | Revision should keep slate-yjs in migration backbone, not current support. |

Ecosystem maintainer verdict:
- steal ProseMirror/Tiptap's content-hole discipline, not their engine shape.
- steal Lexical's policy vocabulary and nested-editor caution, not nested
  editors.
- steal React's external-store contract, not React-owned editor semantics.
- treat Plate as product pressure and slate-yjs as migration pressure.
- keep the Slate answer unopinionated: app-defined element spec plus root slot,
  public tx root helpers, root-scoped selectors, and explicit boundary tests.

Legacy regression proof matrix:
| Regression class | Legacy behavior | Slate v2 target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| Default void atomicity | Voids behave as one parent-flow unit. | Preserve for `void: 'block'`, `inline`, and `markable-inline`. | Core query/navigation tests and browser rows. | execution | pending |
| Mixed island child root | Same-runtime child root edits without stealing parent selection. | Preserve current proof. | Existing editable-voids Playwright rows. | execution | partially covered |
| Editor-only rooted flow navigation | No current proof. | Arrow/enter/delete navigation crosses parent/root boundary like adjacent blocks. | New core caret model and Playwright rows. | execution | pending |
| Delete/undo root lifecycle | Child root restored after undo/redo. | Preserve and extend to editor-only rooted element. | Existing redo child-root row plus new unit/browser rows. | execution | partially covered |
| Clipboard/drop | Child-root paste/drop stays in child root; parent selection stable. | Preserve for mixed islands; define flow-root payload policy. | Existing paste/drop rows plus new serialization tests. | execution | partially covered |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| Default void | Arrow/delete/insertBreak around block and inline voids. | Chromium, Firefox, WebKit/mobile where relevant. | Existing + new focused Playwright rows. | Void remains atomic. | pending |
| Mixed island | Native input, child root edit, paste/drop, cross-root selection. | Existing route `editable-voids`. | Existing `playwright/integration/examples/editable-voids.test.ts`; rerun in execution. | No outer selection corruption. | partially covered |
| Editor-only rooted element | Arrow into/out of child root, Enter/Split, Backspace/Delete, undo/redo. | New route or expanded editable-voids route. | New browser rows. | Feels like sibling block navigation while retaining root identity. | pending |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Current editable-voids example uses child roots but raw root creation. | `.tmp/slate-v2` | `nl -ba site/examples/ts/editable-voids.tsx \| sed -n '1,285p'` | Observed `childRoots`, `useSlateChildRoot`, `useSlateRootChrome`, `<Editable root={bodyRoot}>`, and raw `replace_children` replay. | pass 1 complete |
| Current core separates void from atom for editable islands. | `.tmp/slate-v2` | `nl -ba packages/slate/src/create-editor.ts \| sed -n '160,185p;300,335p'` | Observed `editable-island` void kind and `atom = spec.atom === true || (voidNode && !editableIsland)`. | pass 1 complete |
| Current renderVoid is content-only. | `.tmp/slate-v2` | `nl -ba packages/slate-react/test/surface-contract.tsx \| sed -n '910,1030p'` | Observed assertions that `path`, `target`, `actions`, `selected`, `focused`, `children`, and `attributes` are absent. | pass 1 complete |
| Current child-root browser proof exists. | `.tmp/slate-v2` | `nl -ba playwright/integration/examples/editable-voids.test.ts \| sed -n '60,120p;300,370p;390,430p;490,665p'` | Observed undo/redo restore, child-root edit/focus, paste/drop, and cross-root selection rows. | pass 1 complete |
| Editor-only rooted flow navigation exists. | `.tmp/slate-v2` | `rg -n "editor-only|rooted" ...` via source search | No current API/proof owner found in pass 1. | gap, next passes |
| Related issue discovery for void roots/editor-only flow. | `plate-2` | `rg`/`sed` reads across `docs/slate-issues/**` and `docs/slate-v2/ledgers/**` | Existing 2026-05-24 editable-island rows were relevant but stale for this prompt: the live example now uses child roots, while editor-only rooted-flow navigation remains unplanned implementation work. | pass 2 complete |
| Issue-ledger planning delta. | `plate-2` | manual update to sync ledger, fork dossier, and coverage matrix | Added 2026-05-25 related-issue deltas with no new fixed/improved claims. | pass 2 complete |
| Final issue-ledger stance. | `plate-2` | `sed`/`rg` reads of PR reference, coverage matrix, fork dossier, and sync ledger | No new fixed/improved claims; PR reference got a non-claim planning bullet; coverage matrix top fixed list restored existing `#4806` to match the detailed row and PR reference. | pass 3 complete |
| Intent/boundary and decision brief. | `.tmp/slate-v2` + `plate-2` | live `nl`/`rg` source reads for void behavior, child roots, keyed roots, positions, and transaction/root state; plan patch only | Selected three-surface split and rejected default traversable voids, one overloaded `editable-island`, and one-editor-per-block as the default substrate for this lane. | pass 4 complete |
| React external-store pressure. | local `../react` + `plate-2` | `nl -ba ../react/packages/use-subscription/src/useSubscription.js \| sed -n '1,45p'`; transition test read | Observed `useSyncExternalStore` subscription API and tearing-avoidance transition test, supporting root-scoped selector hooks with stable subscriptions. | pass 5 complete |
| Lexical nested-editor pressure. | local `../lexical` + `plate-2` | `nl -ba ../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx \| sed -n '30,90p;180,210p'`; DecoratorNode read | Observed non-inherited plugins/registrations, unsafe `initialNodes`, namespace/copy-paste warning, collab readiness, editable syncing, and DecoratorNode policy hooks. | pass 5 complete |
| ProseMirror/Tiptap host-content-hole pressure. | local `../prosemirror*`, `../tiptap` + `plate-2` | `nl` reads for `NodeView`, commands, `ReactNodeViewRenderer`, and details/mention extensions | Observed outer `dom` plus optional `contentDOM`, atom/selectable/isolating command behavior, and Tiptap React wrapper/contentDOM DX. | pass 5 complete |
| Plate migration pressure. | local `../plate` + `plate-2` | `nl -ba ../plate/apps/www/src/registry/examples/editable-voids-demo.tsx \| sed -n '1,180p'` | Observed current Plate editable void as product UI with native controls and a nested Plate editor, so raw Slate should provide primitives instead of app/form APIs. | pass 5 complete |
| slate-yjs collaboration pressure. | local `../slate-yjs` + `plate-2` | `rg -n "sharedRoot|relativeRangeToSlateRange|slateRangeToRelativeRange|withYjs|YjsEditor" ../slate-yjs/packages`; focused `nl` reads | Observed single `sharedRoot: Y.XmlText` assumptions across ops, stored positions, cursors, history, and relative range conversion. | pass 5 complete |
| Pressure pass root lifecycle/source shape. | `.tmp/slate-v2` + `plate-2` | `rg -n "rootWasPresent\|rootIsPresent\|replace_children\|childRoots\|createRoot\|roots" .tmp/slate-v2/...`; focused `nl` reads | Observed root presence metadata, root lifecycle defaults, root-scoped selection, root view selectors, and the absence of a root-content spec axis/public tx root helper. | pass 6 complete |
| Pressure pass skill review. | `plate-2` | read `vercel-react-best-practices`, `performance-oracle`, `performance`, `tdd`, `shadcn`, and `react-useeffect` skill summaries | Applied the relevant performance, React subscription/effect, testing, and composition lenses to the plan without running implementation code. | pass 6 complete |
| Maintainer objection ledger. | `.tmp/slate-v2` + `../slate-yjs` + memory + `plate-2` | focused `nl` reads for void behavior, schema spec, root lifecycle defaults, positions, root view selection, child-root hooks, renderVoid contract, current example DX, and slate-yjs `sharedRoot` | Resolved objections into explicit keep/reject/gate rows: `contentRoot` direction survives, default void traversal stays rejected, `editable-island` remains mixed-control only, one-editor-per-block stays out of raw Slate default, tx root helpers are justified, and collab remains gated. | pass 7 complete |
| High-risk deliberate-mode source/proof map. | `.tmp/slate-v2` + `../slate-yjs` | focused `nl`/`rg` reads for editable-voids browser rows, collab-history runtime contract, root lifecycle defaults, root-aware selector hooks, cross-root read/bookmark rejection, `positions`, current `EditorElementSpec`, current raw `replace_children` example, and slate-yjs `sharedRoot` | Converted remaining implementation risk into explicit execution gates for API shape, root lifecycle, navigation, `insertBreak`, delete, clipboard, collab, mobile/native focus, repeated-root performance, and render API minimalism. | pass 8 complete |
| Ecosystem maintainer pass source refresh. | `.tmp/slate-v2` + `../react` + `../prosemirror-view` + `../tiptap` + `../lexical` + `../plate` + `../slate-yjs` + `plate-2` | focused `nl`/`rg` reads for React `useSyncExternalStore` subscription, Slate root/runtime selectors, ProseMirror `dom`/`contentDOM`, Tiptap React node-view content slot, Lexical nested-composer and DecoratorNode policy, Plate editable-void product UI, slate-yjs `sharedRoot`, and compiled research index/log/pages | Confirmed what to steal/reject from each ecosystem: content-hole discipline, root-scoped subscriptions, policy hooks, product pressure, and root-qualified collab pressure; no implementation claim made. | pass 9 complete |
| Revision pass API freeze. | `.tmp/slate-v2` + memory + `plate-2` | focused `nl`/`rg` reads for `EditorElementSpec`, current transaction groups, `replace_children` lifecycle metadata/defaults, `useSlateChildRoot`, root chrome/root editor hooks, current raw example insertion, range/bookmark rejection, and one-runtime memory context | Froze exact planned API: object-only `contentRoot: { slot: string }`, `tx.roots.create/replace/delete`, `useSlateContentRoot`, boundary navigation law, and no-current-implementation/no-new-issue-claim wording. | pass 10 complete |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | yes | applied | Relevant rules are rerender/deferred selectors, primitive deps, no effect-derived state, and avoiding broad subscriptions. Current source already uses selector hooks and root/runtime fanout; execution must preserve that. | Added root/runtime-scoped selector budget and rejected auto-root-per-void/block. |
| performance-oracle | yes | applied | Repeated rooted elements can become O(roots * mounted nodes) if selection, indexes, or subscriptions fan out globally. Transaction snapshots already build root indexes only when needed, but execution needs 10x/100x/1000x root/document projections. | Added cohort/repeated-root proof gates and kept migration score below closure. |
| performance | yes | applied | Generic "fast enough" is bullshit here. The plan needs normal/large/stress cohorts, repeated-unit subscription/handler budgets, interaction p95/p99 rows, memory/DOM tags, and native-behavior degradation rows. | Added pressure pass proof rows and blocked perf claims until browser/trace proof in execution. |
| tdd | yes | applied as execution rule | Planning mode does not write tests, but the behavior change needs vertical red/green slices: public root helper, default void atomicity, root-content arrow navigation, delete/undo, paste/drop, and selection-root mismatch. | Added test-first execution proof surfaces; no implementation test was run in planning mode. |
| shadcn | yes as composition lens | applied as scope guard | shadcn-style composition means using small composable primitives, not shipping forms/layout/product UI in raw Slate. Plate owns inputs, labels, radios, validation, menus, and registry polish. | Rooted-content helper stays minimal; mixed islands remain app/Plate-owned UI. |
| react-useeffect | yes | applied | Root lifecycle must stay transaction-owned and subscriptions should use external-store style hooks. Effect-created roots would create orphan/undo/collab bugs. | Public tx root helpers are required; no effect-owned root creation or derived root state. |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| `contentRoot` API shape ambiguity | New spec axis on app-defined elements. | API becomes either too vague (`true`) or too product-shaped, and agents cannot infer the right call-site. | Revision pass must choose an exact TS shape: root slot, optional navigation policy, and no built-in node type. | API/type tests, docs/example call site, public export review. | gate named |
| Void semantics drift | New navigable root-backed content. | Existing void users get non-atomic selection/navigation. | Keep default `void` atomic; make editor-only rooted flow a separate `contentRoot` opt-in. | Core/browser void regression rows around `positions` and `create-editor` atom policy. | gate named |
| Root lifecycle/orphan roots | Root-backed element creation, deletion, move, copy, undo, redo. | Root values detach from owner elements, duplicate, or disappear after undo/collab. | Public `tx.roots.*` helpers wrap `replace_children` with `rootWasPresent`/`rootIsPresent`; owner insert/delete happens in the same transaction. | `rooted-operation-contract`, undo/redo browser rows, delete/move/copy serialization rows. | gate named |
| Cross-root caret ambiguity | Arrow navigation into/out of editor-only rooted content. | Selection jumps into the wrong root or creates arbitrary cross-root ranges. | Only the `contentRoot` projection bridge may cross the boundary; generic cross-root reads/bookmarks stay rejected. | Core caret tests plus Playwright arrow/focus rows. | gate named |
| `insertBreak`/split boundary | Enter at start/end/inside the projected child root. | Text moves to the wrong paragraph/root, like the earlier `a`/`b` split bug shape. | Inside child root splits child content; boundary Enter exits or inserts a parent sibling only at explicit edges. | Core transform tests plus browser rows for custom-placeholder/rooted-content examples. | gate named |
| Delete/backspace/selected void regression | Backspace/Delete near owner element or inside child root. | Deletes root payload without owner, owner without root, or regresses selected void behavior. | Couple owner deletion/remap to root lifecycle operations and keep default selected-void tests. | `delete-contract`, `rooted-operation-contract`, browser delete/backspace rows. | gate named |
| Clipboard/copy/paste/drop payload | Copy/cut/move root-backed owner, or paste/drop inside child root. | Root payload omitted, duplicated, or pasted into parent root. | Serialize/remap root payloads for owner moves; keep child-root paste/drop isolated. | Existing editable-voids paste/drop rows plus new copy/cut/select-all rows. | gate named |
| History/collab divergence | Remote import, undo/redo root create/delete, slate-yjs adapter work. | Peers diverge or history stores a root path that cannot replay. | Root-qualified operations stay the substrate; do not claim slate-yjs until mapper/shared-type design exists. | Existing collab-history rows plus future slate-yjs adapter tests. | gate named |
| Native controls/mobile focus | Mixed island controls near child roots and editor-only roots. | Parent editor steals focus/selection, or desktop-only behavior is mistaken for mobile proof. | Keep mixed island native-control isolation separate from editor-only rooted flow; require mobile rows before browser claims. | Existing input/gauntlet rows plus mobile-specific rooted-content rows. | gate named |
| Repeated-root performance | Many root-backed elements mounted in one editor. | Selector/root-index fanout becomes O(roots * mounted nodes), memory grows, or focus handlers thrash. | Opt-in roots only, root/runtime selector subscriptions, repeated-root cohorts, no one-root-per-block default. | Runtime selector tests, repeated-root benchmarks, browser trace p95/p99 rows. | gate named |
| Render/API bloat | Improving DX by widening render props. | `renderVoid` grows path/action/focus/root helper bags and becomes the API dump. | Keep renderers content-only; put root wiring in hooks/helpers/components. | `surface-contract.tsx` renderVoid tests and helper API review. | gate named |

High-risk execution proof gates:
| Gate | cwd | Command / proof route | Must prove | Status |
|------|-----|-----------------------|------------|--------|
| API/type gate | `.tmp/slate-v2` | Focused public API/type tests around `EditorElementSpec`, `tx.roots.*`, and root lifecycle contracts. | `contentRoot` shape is typed, documented, and examples do not use raw operation replay. | execution |
| Core navigation gate | `.tmp/slate-v2` | Focused tests in `editor-runtime-view-contract`, `query-contract`, and new rooted-content caret/position rows. | Cross-root navigation is only legal through the projection bridge; generic cross-root reads/bookmarks still reject. | execution |
| Delete/history/collab local gate | `.tmp/slate-v2` | Focused `delete-contract`, `rooted-operation-contract`, and `collab-history-runtime-contract` rows. | Owner/root lifecycle, undo/redo, remote import, and selection root replay remain deterministic. | execution |
| React/runtime gate | `.tmp/slate-v2` | Focused `slate-runtime-provider-contract`, `use-slate-root-chrome`, `use-editor-selector`, and `surface-contract` rows. | Root views stay root-scoped, render props stay narrow, and repeated-root fanout is bounded. | execution |
| Browser gate | `.tmp/slate-v2` | Existing `editable-voids` Playwright route plus new rooted-content/custom-placeholder rows for arrows, Enter, delete, copy/cut/paste/drop, undo/redo, and mobile where relevant. | Mixed islands keep isolation and editor-only roots feel like sibling block flow. | execution |
| Full closure gate | `.tmp/slate-v2` | `bun check:full` before any release-quality browser/collab claim. | Fast unit/API/browser gates compose into the release-proof suite. | execution |

Slate maintainer objection ledger:
| Change | Objection | Tradeoff | Evidence | Migration/docs/proof answer | Verdict |
|--------|-----------|----------|----------|-----------------------------|---------|
| Add editor-only rooted content surface | "This is another concept on top of voids and editable islands." | More API vocabulary. | Mixed islands have native controls and rich roots in the same shell at `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:183`; editor-only document flow needs different navigation. | Do not add a built-in node type. Use a `contentRoot`-style element spec axis for app-defined elements and a small helper for the pure editor case. | survives, narrowed |
| Keep default void atomic | "Why not just make voids root-backed and traversable by default?" | Users must opt into rooted content. | Current schema makes normal voids atoms and excludes `editable-island` from atom default at `.tmp/slate-v2/packages/slate/src/create-editor.ts:317`; positions stop at atom/readOnly unless `voids: true` at `.tmp/slate-v2/packages/slate/src/editor/positions.ts:43`. | Preserve old void meaning. Rooted flow is explicit opt-in, not a silent behavior change for embeds/images/mentions. | accepted |
| Do not use one overloaded `editable-island` | "A separate root-content axis feels like bikeshedding; why not `editable-island` with a flag?" | One fewer public concept, but one concept would carry two incompatible focus/navigation contracts. | Current `editable-island` is a void kind at `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:481`; the current example includes inputs/radios plus child rich content. | Keep `editable-island` for mixed app/native controls. Use `contentRoot` only when the element's interactive content is editor flow. | accepted |
| Reject one-editor-per-block as this lane's substrate | "Independent editors would be simpler React containment and natural nesting." | Local containment looks simpler, but cross-selection/history/collab/clipboard become federation problems. | Current runtime already switches root views in one editor at `.tmp/slate-v2/packages/slate/test/editor-runtime-view-contract.ts:1643`; memory says one-editor-per-block must be treated as a serious comparison target. | Keep one runtime with many root views; high-risk pass must still prove root-boundary navigation and collaboration payloads. | rejected for raw Slate default |
| Add public tx root helpers | "A `tx.roots.*` API is extra API surface for something operations already do." | Slight API growth. | Current example leaks raw `tx.operations.replay([{ type: 'replace_children', root }])` at `.tmp/slate-v2/site/examples/ts/editable-voids.tsx:239`; root lifecycle defaults already exist at `.tmp/slate-v2/packages/slate/src/core/public-state.ts:765`. | Public helper is justified because root creation must be transaction-owned and examples should not teach operation replay for normal authoring. | accepted |
| Keep renderers content-only | "Why not pass path/actions/root helpers into `renderVoid` so users can wire this easily?" | Hooks/components require an extra call. | `renderVoid` contract excludes `path` at `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx:919`; memory records that child-root composition belongs in hooks, not widened renderer props. | Keep renderer payload small; provide hooks/helpers for root wiring. | accepted |
| Rooted navigation projection | "Projected child-root blocks could make selection rules spooky and hard to debug." | The feature needs explicit root-boundary rules. | Cross-root reads currently throw for ambiguous ranges at `.tmp/slate-v2/packages/slate/test/editor-runtime-view-contract.ts:436`; bookmarks also reject multi-root ranges. | High-risk pass must specify exact arrow/Enter/Delete/select-all rules and keep current cross-root rejection unless the root-content projection owns the bridge. | survives, gated |
| slate-yjs migration | "This plan creates data model work that current slate-yjs cannot represent." | True; collab support is not free. | Current slate-yjs editor stores one `sharedRoot: Y.XmlText` and observes it at `../slate-yjs/packages/core/src/plugins/withYjs.ts:29` and `:209`. | Treat slate-yjs as migration pressure, not current support. Require root-qualified shared types or root-slot mapping before any collab claim. | survives, gated |
| Ordered roots | "If child roots navigate like siblings, roots probably need ordered storage." | Ordered roots might be needed for top-level multi-root documents, but not for owner-element flow. | Current `initialValue.roots` is a keyed record and `childRoots[slot]` is the persisted element contract. | Flow order comes from the owner element path; keyed root ids stay storage identity. Ordered top-level roots remain a different lane. | rejected for this lane |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| Make default voids traversable/root-backed | reject in pass 1 | Violates "voids like before" and risks legacy void regressions. | none | `positions` atom policy and issue guardrails. | Revalidate in maintainer pass. |
| Use normal void `children` for rich content | reject in pass 1 | Reopens parent-selection/delete/normalization ambiguity. | none | User wants roots/shared state, and current example uses `childRoots`; pass 5 ProseMirror/Tiptap evidence favors explicit content holes over ambiguous void children. | Maintainer objection pass accepted the rejection. |
| One overloaded `editable-island` for all cases | reject as default target in pass 4 | Mixed native controls and editor-only flow navigation want different focus/navigation policies. | add one public root-content concept | Current source supports mixed islands; no flow navigation proof; pass 6 pressure kept the separate root-content target. | Maintainer objection pass accepted the split. |
| One editor per block/root as raw Slate default | reject for this lane in pass 4 | It creates a federation layer for shared selection/history/collab/clipboard exactly where the user wants shared state. | none for this lane | Current source already uses keyed roots in one editor/runtime; pass 5 Lexical evidence confirms independent nested editors are expensive. | Maintainer objection pass rejected it for raw Slate default; revisit only if high-risk proof collapses. |
| Raw `replace_children` in examples | reject | Bad DX; leaks operation internals. | add helper | Current example line 239; pass 6 narrowed this to public `tx.roots.*`-style helpers. | Execution API pass. |

Plan deltas from review:
- Created this new `slate-plan` template plan for the changed prompt instead of
  reusing the completed 2026-05-24 plan unchanged.
- Updated the north star from "editable-island plus child root" to a stricter
  split: default atomic void, mixed editable island, and editor-only rooted
  element for sibling-block navigation.
- Recorded that the live example has moved beyond the stale nested-editor
  claim: it now uses same-runtime child roots, but still has poor insertion DX
  through raw `replace_children`.
- Lowered confidence to 0.72 because the new editor-only rooted-flow decision
  has not yet passed issue, research, migration, objection, or proof gates.
- Pass 2 updated confidence to 0.73 after bounded issue discovery. The decisive
  issue signal is that #2072/#3367/#3482 support a split surface, while
  #3435/#3884/#4301/#3991/#5630 and nested/contenteditable rows make default
  void traversal a bad long-term move.
- Pass 2 corrected the stale 2026-05-24 ledger premise: the live canonical
  example now uses same-runtime child roots, so the remaining DX problem is raw
  root creation plus missing editor-only rooted-flow navigation.
- Pass 3 finalized issue accounting: the plan now treats editor-only rooted
  flow as related architecture pressure only, keeps default void traversal a
  non-claim, preserves existing fixed floors #3991/#4301/#4984/#4806, and
  records the proof consequences per issue bucket.
- Pass 3 updated PR/reference sync without inflating claims: added one
  non-claim PR summary bullet for the 2026-05-25 planning delta and restored
  existing #4806 to the coverage matrix top fixed list because it already
  existed in the detailed matrix and PR reference.
- Pass 4 hardened the intent/boundary and decision brief: selected the
  three-surface split as the planning target, rejected one overloaded
  `editable-island` as the default answer, rejected one-editor-per-block for
  this lane, and clarified that editor-only rooted content should use a
  root-content/navigation axis rather than another `void` kind.
- Pass 5 refreshed ecosystem/live-source evidence: React supports root-scoped
  external-store subscriptions; Lexical warns against independent nested-editor
  inheritance/collab/copy-paste assumptions; ProseMirror/Tiptap validate the
  host-shell plus editor-owned-content-hole mechanism; Plate confirms mixed
  app-control island pressure; slate-yjs confirms that current collaboration
  assumptions are single-root and must become root-qualified before any
  multi-root collab claim.
- Pass 6 pressure-tested the decision: kept one-runtime/many-root with
  root/runtime-scoped selector budgets, rejected auto-root-per-void/block,
  rejected a hardcoded "editable node type", narrowed the target to a
  root-content spec axis plus a small editor-only helper, required public
  `tx.roots.*`-style helpers, and kept migration/research below closure until
  maintainer objections and high-risk proof rows close.
- Pass 7 ran the maintainer objection ledger. The objections did not overturn
  the architecture, but they removed the vague "editor-only node type" phrasing:
  the target is a `contentRoot`-style spec axis for app-defined elements, public
  tx root lifecycle helpers, and a minimal React helper. Claims remain gated for
  high-risk browser/navigation/collab proof.
- Pass 8 ran high-risk deliberate mode. The architecture still stands, but the
  plan now names the hard gates: root lifecycle, `contentRoot` API shape,
  projected caret movement, `insertBreak`, delete/backspace, clipboard/drop,
  history/collab, mobile/native focus, repeated-root performance, and render API
  minimalism. Existing editable-voids proof is only an isolation/lifecycle floor,
  not sibling-flow proof.
- Pass 9 ran the ecosystem maintainer pass. It confirms the long-term target:
  steal ProseMirror/Tiptap's shell plus editor-owned content hole, React's
  external-store selector discipline, and Lexical's isolation/keyboard policy
  vocabulary; reject nested independent editors, ProseMirror/Tiptap engine
  leakage, product UI in raw Slate, and any current slate-yjs support claim.
- Pass 10 ran the revision pass. It froze the target shape as object-only
  `contentRoot: { slot: string }`, persisted root ids in
  `element.childRoots[slot]`, public `tx.roots.create/replace/delete`, and a
  minimal `useSlateContentRoot` helper. It also froze boundary navigation rules
  and kept all related issues as no-new-fixed-claim until implementation proof.
- Pass 11 ran issue-sync accounting against the frozen revision. It updated the
  manual sync ledger, fork dossier, issue coverage matrix, and PR reference so
  each artifact names `contentRoot: { slot: string }` only as planned
  architecture. Unique fixed issue IDs still match between the coverage matrix
  and PR reference; the 2026-05-25 delta adds zero fixed and zero improved
  claims.
- Pass 12 ran closure score and final gates. It closed the lane at score 0.92,
  verified every pass row is complete, marked TDD/browser proof as
  planning-only N/A with execution gates named, recorded final handoff/reboot
  status/open risks, and left no runnable planning pass.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| What exact TS shape should the `contentRoot` axis use? | Vocabulary direction is selected, but execution still needs a concrete spec shape such as boolean, slot name, or object config. | Revision froze object-only `contentRoot: { slot: string }`. | slate-plan | resolved; proof pending |
| What exact keyboard navigation should cross parent root and child root? | "Like sibling blocks" must become concrete caret/selection rules. | Revision froze arrow/Enter/delete boundary law; browser/core proof remains execution work. | slate-plan | resolved; proof pending |
| How are child roots copied, moved, deleted, and remapped? | Collab/history/clipboard correctness depends on lifecycle policy. | Revision froze `tx.roots.*` lifecycle policy and owner-root payload proof owners. | slate-plan | resolved; proof pending |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| Planning passes | slate-plan | Complete research, issue, decision, objection, and proof plan. | active goal and this plan | user-review-ready plan | planning checks |
| Public API/lifecycle execution | future slate-plan execution | Root creation helper and/or editor-only rooted element substrate. | user accepts final plan | focused unit/API tests pass | `.tmp/slate-v2` focused tests |
| React/browser execution | future slate-plan execution | Root chrome, navigation bridge, example DX, Playwright rows. | substrate merged | browser proof green | `.tmp/slate-v2` Playwright |
| Ledger/reference sync | future slate-plan execution | Issue coverage and PR reference updates. | proof results known | claims conservative/current | ledger checks |

Fast driver gates:
| Gate | cwd | Command | Status |
|------|-----|---------|--------|
| template scratchpad creation | `plate-2` | `node .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs --template slate-plan --title "Slate v2 void roots and editable islands"` | complete |
| pass-1 live source reads | `.tmp/slate-v2` | `rg`/`nl` reads recorded in verification gate | complete |
| pass-1 planning artifact check | `plate-2` | `sed -n '1,260p' docs/plans/2026-05-25-slate-v2-void-roots-and-editable-islands.md` and `sed -n '260,620p' docs/plans/2026-05-25-slate-v2-void-roots-and-editable-islands.md` | complete |
| pass-2 issue discovery reads | `plate-2` | `rg`/`sed` reads across `docs/slate-issues/gitcrawl-live-open-ledger.md`, `docs/slate-issues/gitcrawl-clusters.md`, `docs/slate-issues/requirements-from-issues.md`, `docs/slate-issues/test-candidate-map/**`, `docs/slate-v2/ledgers/fork-issue-dossier.md`, and `docs/slate-v2/ledgers/issue-coverage-matrix.md` | complete |
| pass-2 ledger planning delta | `plate-2` | 2026-05-25 sections appended to sync ledger, fork dossier, and coverage matrix | complete |
| pass-3 issue-ledger finalization | `plate-2` | `sed`/`rg` reads and targeted updates to plan, PR reference, and issue coverage matrix | complete |
| pass-4 intent/boundary decision brief | `plate-2` + `.tmp/slate-v2` | live source reads plus decision-law plan update | complete |
| pass-5 research ecosystem refresh | `plate-2` + local sibling repos | focused `nl`/`rg` reads across `../react`, `../lexical`, `../prosemirror*`, `../tiptap`, `../plate`, and `../slate-yjs`; synthesis recorded in this plan | complete |
| pass-6 pressure pass | `plate-2` + `.tmp/slate-v2` + local skills | focused source reads for root lifecycle, selectors, schema spec shape, root helper gaps, plus skill review matrix | complete |
| pass-7 maintainer objection ledger | `plate-2` + `.tmp/slate-v2` + `../slate-yjs` + memory | focused source reads plus objection ledger update | complete |
| pass-8 high-risk deliberate mode | `plate-2` + `.tmp/slate-v2` + `../slate-yjs` | focused source reads plus high-risk pre-mortem and execution proof gate update | complete |
| pass-9 ecosystem maintainer pass | `plate-2` + `.tmp/slate-v2` + local sibling repos | focused source reads plus ecosystem maintainer decision update | complete |
| pass-10 revision pass | `plate-2` + `.tmp/slate-v2` + memory | focused source reads for current spec/tx/root helpers, exact API freeze, navigation law, score delta, and open-question resolution | complete |
| pass-11 issue-sync accounting | `plate-2` | `rg`/`sed` reads of the 2026-05-25 rows in `docs/slate-issues/gitcrawl-v2-sync-ledger.md`, `docs/slate-v2/ledgers/fork-issue-dossier.md`, `docs/slate-v2/ledgers/issue-coverage-matrix.md`, and `docs/slate-v2/references/pr-description.md`; unique `Fixes #` ID comparison between matrix and PR reference | complete |
| pass-12 closure audit | `plate-2` + `.tmp/slate-v2` | `rg`/`sed` reads of this plan, issue/reference artifacts, memory context, and `.tmp/slate-v2` target API gap search | complete |
| closure checker | `plate-2` | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-slate-v2-void-roots-and-editable-islands.md` | complete; final checker passed |

Final user-review handoff outline:
- accepted plan items:
  - default `void` remains atomic and legacy-like;
  - `editable-island` remains the mixed native/app-control island surface with
    optional same-runtime child roots;
  - editor-only rooted flow uses planned object-only
    `contentRoot: { slot: string }` on app-defined element specs;
  - root lifecycle authoring should use public `tx.roots.create`,
    `tx.roots.replace`, and `tx.roots.delete`;
  - React DX should expose `useSlateContentRoot(element, options?)` as a small
    helper over `useSlateChildRoot` and `useSlateRootChrome`.
- before / after API shape:
  - before: same-runtime child roots exist, but the example still leaks raw
    root-level `replace_children` replay and there is no editor-only rooted-flow
    schema axis;
  - after target: root ids persist in `element.childRoots[slot]`, the schema
    names the content slot through `contentRoot: { slot: string }`, and public
    tx/root helpers own create/replace/delete.
- hard cuts:
  - no traversable default voids;
  - no rich content under normal void `children`;
  - no one overloaded `editable-island` contract for both native controls and
    pure editor flow;
  - no one-editor-per-block default substrate for raw Slate;
  - no widened `renderVoid` prop bag.
- issue claims and non-claims:
  - no new fixed issue claims;
  - no new improved issue claims;
  - existing fixed floors `#3991`, `#4301`, `#4984`, and `#4806` stay exact;
  - `#2072`, `#5212`, `#3482`, `#3367`, navigation/delete/clipboard/mobile,
    and focus rows stay related/proof-gate pressure.
- proof gates:
  - API/type tests for `EditorElementSpec.contentRoot` and `tx.roots.*`;
  - core navigation tests for the projection bridge while generic cross-root
    ranges still reject;
  - root lifecycle delete/history/collab tests;
  - React runtime/root-selector tests;
  - browser rows for arrows, Enter, delete, copy/cut/paste/drop, undo/redo, and
    mobile where relevant;
  - `bun check:full` before release-quality browser/collab claims.
- accepted-plan execution handoff:
  - implementation starts only after explicit user acceptance and a new
    execution-shaped `slate-plan` invocation naming this plan.

Final completion gates:
| Gate | Status | Evidence |
|------|--------|----------|
| score >= 0.92 and no dimension below 0.85 | pass | Final score 0.92; lowest dimension is 0.90. |
| all pass rows complete or skipped with evidence | pass | Phase/pass table rows 1-12 are complete. |
| issue/reference sync closed | pass | Pass 11 synced manual ledger, fork dossier, coverage matrix, and PR reference; no new fixed/improved claim. |
| live source grounding complete | pass | Source-backed rows cite `.tmp/slate-v2` owners and final closure search confirms `contentRoot`, `useSlateContentRoot`, and `tx.roots` are not current implementation. |
| workspace verification recorded | pass | Planning-only verification evidence is recorded below; Slate v2 behavior proof remains execution-gated. |
| TDD/browser proof | pass | N/A for planning-only closeout; execution gates name the required unit/browser proof before implementation or issue claims. |
| autoreview clean or N/A | pass | N/A: planning-only lane changed docs/ledger/reference artifacts, not `.tmp/slate-v2` implementation. |
| final handoff emitted | pass | Final handoff outline is recorded in this plan and will be summarized in the final response. |
| no runnable planning work remains | pass | `next_pass: none`, `next_action: none`, and all scheduled Slate Plan passes are complete. |
| `check-complete` passes | pass | Final checker passed; command and result are recorded in Verification evidence. |

Verification evidence:
- Active goal: `get_goal` returned the matching Slate Plan objective for this
  long-term void/editable-island architecture lane.
- Skill gate: `.agents/skills/slate-plan/SKILL.md` was read in this closure
  pass; closure is legal only because rows 1-11 were already complete before
  this activation.
- Memory grounding: `MEMORY.md:543-579` confirmed same-runtime child-root
  contracts, content-only `renderVoid`, root lifecycle metadata, and the
  one-runtime-editor comparison caveat; live source rows in this plan remain
  authoritative for current API claims.
- Planned-only API gap: in `.tmp/slate-v2`,
  `rg -n 'contentRoot|useSlateContentRoot|tx\.roots' packages/slate packages/slate-react site/examples/ts/editable-voids.tsx`
  returned no matches, confirming the frozen API is a plan target, not current
  implementation.
- Issue claim parity: in `plate-2`,
  `comm -3 <(rg -o '^- Fixes #[0-9]+' docs/slate-v2/ledgers/issue-coverage-matrix.md | sed 's/.*#//' | sort -n | uniq) <(rg -o '^- Fixes #[0-9]+' docs/slate-v2/references/pr-description.md | sed 's/.*#//' | sort -n | uniq)`
  returned no output, confirming the fixed issue ID set matches between the
  coverage matrix and PR reference.
- Issue/reference wording: `rg` over the sync ledger, fork dossier, coverage
  matrix, and PR reference found the planned `contentRoot` wording and the
  explicit `0` new fixed/improved claim summary.
- Final checker: `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-slate-v2-void-roots-and-editable-islands.md`
  returned `[autogoal] complete:
  docs/plans/2026-05-25-slate-v2-void-roots-and-editable-islands.md`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Slate Plan closure is complete for the void roots / editable islands architecture lane. |
| Where am I going? | User review only; implementation requires a later explicit execution invocation naming this plan. |
| What is the goal? | Close a user-review-ready plan for default atomic voids, shared-state child roots, editor-only rooted flow navigation, issue accounting, proof gates, and final handoff. |
| What have I learned? | Best long-term split is atomic default voids, mixed `editable-island`, and planned object-only `contentRoot: { slot: string }` for pure editor-flow child roots; one runtime/many roots stays the raw Slate substrate. |
| What have I done? | Completed current-state, issue discovery, issue-ledger, intent/decision, research/ecosystem, pressure, objection, high-risk, ecosystem maintainer, revision, issue-sync, and closure passes. |

Open risks:
- Execution now has proof for `contentRoot`, `tx.roots.*`,
  `useSlateContentRoot`, cross-root keyboard projection in the editable-voids
  route, same-runtime child-root mouse/input/paste/drop isolation, and the
  package/site gates listed below.
- Remaining unclaimed surfaces are owner/root payload copy/cut/move remap,
  slate-yjs mapping, repeated-root performance, mobile/raw-device behavior, and
  `bun check:full` release-quality closure.
- slate-yjs support remains a migration gate, not a current support claim.
- These are execution risks, not open planning blockers; no runnable planning
  pass remains.

Execution state:
- execution_lane_status: complete
- current_execution_slice: browser-navigation-and-final-proof
- current_execution_slice_status: complete
- next_execution_slice: none
- next_execution_action: none; remaining surfaces above are explicitly
  unclaimed release/future-proof gates, not blockers for this accepted goal.

Execution slice 1 summary:
- `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`: added
  `EditorElementContentRootSpec`, `EditorElementSpec.contentRoot`, and
  `EditorTransactionRootsApi`.
- `.tmp/slate-v2/packages/slate/src/core/public-state.ts`: added
  `tx.roots.create/replace/delete` over root-level `replace_children` with
  explicit `rootWasPresent` / `rootIsPresent` metadata and main-root guards.
- `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-content-root.ts`:
  added `useSlateContentRoot(element, options?)` over schema
  `contentRoot.slot`, `useSlateChildRoot`, and `useSlateRootChrome`.
- `.tmp/slate-v2/site/examples/ts/editable-voids.tsx`: replaced raw
  `tx.operations.replay([{ type: 'replace_children', ... }])` root creation
  with `tx.roots.create`.
- Issue/reference sync updated the manual v2 sync ledger, fork dossier, issue
  coverage matrix, and PR reference. New fixed/improved issue claims remain
  `0`.

Execution slice 1 verification:
- `.tmp/slate-v2`: `bun test ./packages/slate/test/rooted-operation-contract.ts ./packages/slate/test/public-element-void-kind-contract.ts`
  passed, 24 tests.
- `.tmp/slate-v2`: `bun --filter ./packages/slate-react test:vitest -- slate-runtime-provider-contract`
  passed, 35 tests.
- `.tmp/slate-v2`: `bun --filter ./packages/slate typecheck` passed.
- `.tmp/slate-v2`: `bun --filter ./packages/slate-react typecheck` passed.
- `.tmp/slate-v2`: `bun typecheck:site` passed.
- `.tmp/slate-v2`: `bun lint` passed after targeted Biome formatting.

Execution slice 2 summary:
- `.tmp/slate-v2/packages/slate-react/src/editable/content-root-navigation.ts`:
  added the content-root boundary bridge for ArrowLeft/ArrowRight,
  Backspace/Delete, and Enter-owner activation.
- `.tmp/slate-v2/packages/slate-react/src/editable/*`: routed nested editable
  keyboard, beforeinput/input, focus, selectionchange, composition marks, and
  root interaction through the owning mounted root instead of the containing
  editor when selection belongs to a child root.
- `.tmp/slate-v2/packages/slate-react/src/components/slate-void-shell.tsx`:
  kept void chrome `contentEditable={false}` by default; nested `<Editable>`
  roots are the only editable content inside the shell.
- `.tmp/slate-v2/site/examples/ts/editable-voids.tsx`: added an editor-only
  `editable-section` content-root example alongside the mixed native-control
  `editable-void` island.
- `.tmp/slate-v2/packages/slate-browser/src/playwright/index.ts`: made
  `clickTextOffset` scroll targets into view and click text-end offsets inside
  the target glyph to avoid Chrome resolving exact leaf boundaries into the
  next leaf.
- `.tmp/slate-v2/packages/slate-layout/src/index.ts`: fixed page-break snapshot
  writes blocking fresh Next builds by using a compact document key and ignoring
  self-authored page-break field updates.
- `.tmp/slate-v2/packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts`:
  fixed the local page-virtualization review finding by disabling top-level row
  measurement when the virtualizer index space is page items.
- `.tmp/slate-v2/.changeset/**`: added patch changesets for `slate`,
  `slate-react`, and `slate-layout`.
- Issue/reference sync updated the manual v2 sync ledger, fork dossier, issue
  coverage matrix, and PR reference. New fixed/improved issue claims remain
  `0`.

Execution slice 2 verification:
- `.tmp/slate-v2`: `bun --filter ./packages/slate-react test:vitest -- selection-controller-contract keyboard-input-strategy-contract content-root-navigation-contract surface-contract root-interaction-resolver slate-runtime-provider-contract`
  passed, 99 tests.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/rooted-operation-contract.ts ./packages/slate/test/public-element-void-kind-contract.ts`
  passed, 24 tests.
- `.tmp/slate-v2`: `bun --filter ./packages/slate-layout test` passed, 29
  tests.
- `.tmp/slate-v2`: `bun --filter ./packages/slate-react test:vitest -- dom-strategy-page-virtualization dom-strategy-and-scroll`
  passed, 38 tests.
- `.tmp/slate-v2`: `bun --filter ./packages/slate typecheck`,
  `bun --filter ./packages/slate-react typecheck`,
  `bun --filter ./packages/slate-browser typecheck`,
  `bun --filter ./packages/slate-layout typecheck`, and `bun typecheck:site`
  passed.
- `.tmp/slate-v2`: `bun lint` passed.
- `.tmp/slate-v2`: `bun --filter ./packages/slate build`,
  `bun --filter ./packages/slate-react build`,
  `bun --filter ./packages/slate-browser build`, and
  `bun --filter ./packages/slate-layout build` passed.
- `.tmp/slate-v2`: `PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/editable-voids.test.ts --project=chromium`
  passed, 17 tests, with a fresh Next build.
- `.tmp/slate-v2`: `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local`
  passed on rerun with no accepted/actionable findings.

Execution closeout:
- Keyboard projection and browser proof for the accepted editable-voids /
  editor-only content-root slice are complete.
- Root payload copy/cut/move remap, slate-yjs mapping, repeated-root perf,
  mobile/raw-device proof, and `bun check:full` remain unclaimed future gates.
- The execution goal may be closed after the plan checker passes.
