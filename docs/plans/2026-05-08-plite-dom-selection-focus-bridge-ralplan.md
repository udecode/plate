---
date: 2026-05-08
topic: plite-dom-selection-focus-bridge
status: done
score: 0.94
completion: .tmp/completion-checks/plite-dom-selection-focus-bridge-ralplan.md
current_pass: closure-score-and-final-gates
next_pass: none
---

# Plite DOM Selection, Focus, And Bridge Ralplan

## 1. Current Verdict

Do this lane, but do not repeat the closed DOM selection boundary proof.

`docs/plans/2026-05-06-plite-dom-selection-boundary-proof-ralplan.md`
already closed the first strict boundary pass at `0.96`. It claims exact
browser fixes for the high-confidence rows such as outside-to-inside selection
and parent-to-nested-editor selection. The second DOM selection lane should
start where that plan stops:

- parent/child editor ownership that still lacks exact closure, especially
  `#5947` and `#4842`;
- focus restore and scroll behavior, especially `#5867`, `#5826`, `#5538`,
  `#5568`, `#3497`, `#5537`, `#4961`, and `#3634`;
- shadow DOM event-to-range behavior, especially `#5107`, `#5749`, and `#4337`;
- fail-closed DOM point/range import for foreign, stale, external, or app-owned
  DOM, especially `#5711`, `#3834`, `#3836`, `#3723`, `#4564`, `#4643`, `#4088`,
  `#3918`, and `#4851`;
- custom inline, void, and table selection leftovers, especially `#5806`,
  `#3449`, and `#2558`.

The plan is ready for `ralph`. Pass 12 completed closure scoring. The private
bridge still wins, the execution shape is concrete, and the ledgers match the
claim policy: no new fixed issue claims from this planning pass, #5947 stays
improves-only, and the rest of the DOM/focus surface stays related or not
claimed until exact proof exists.

## 2. Intent And Boundary Record

Intent:

- Turn the remaining selection/focus/DOM bridge pressure into one execution
  plan that does not create hundreds of issue-sized plans.

Desired outcome:

- Plite has explicit runtime ownership for native DOM selection import,
  model selection export, focus/scroll restoration, nested-editor ownership,
  shadow DOM event ranges, and fail-closed DOM point/range conversion.

In scope:

- `plite-dom` DOM point/range conversion, event range resolution, shadow DOM
  roots, nested editor containment, and fail-closed conversion policy.
- `plite-react` selection controller/reconciler behavior, focus state,
  selectionchange ownership, model-vs-DOM selection preference, and scroll
  timing.
- Browser rows copied or adapted from Lexical and ProseMirror where they express
  portable editor behavior.
- Issue-ledger accounting for exact fixed, improved, related, and not-claimed
  rows.

Non-goals:

- No Android/iOS closure without raw device proof.
- No public `normalizePoint` or app-authored DOM selection hook.
- No Plate-owned workaround as the answer.
- No claim that Plite implements Lexical's whole-table selection model unless
  Plite deliberately adds that model.
- No implementation code in this Plite Ralplan pass.

Decision boundaries:

- The plan may choose private runtime structure and test/proof ownership.
- Public API changes are rejected for this lane unless a later browser proof
  shows private ownership cannot express a supported raw-Plite behavior.
- Exact GitHub `Fixes #...` claims require matching Plite proof in
  `/Users/zbeyens/git/plite`.
- Related issues can be grouped by behavior family, not one plan per issue.
- `plite-dom` owns DOM root, target, point, range, shadow, nested-editor, and
  stale/foreign classification.
- `plite-react` owns when a classified DOM selection is imported, when the model
  selection is exported, focus-state timing, scroll timing, and React listener
  lifecycle.
- `slate` core owns logical caret movement and transforms such as soft-break
  vertical navigation unless browser proof shows the model/DOM bridge is the
  actual failure.
- Ecosystem or product models stay outside this lane: Web Components, custom
  table `rowspan` semantics, whole-table multi-cell selection, and structural
  ignore-cursor APIs.

Unresolved user-decision points:

- None. Public API remains unchanged for this plan. A future exact repro may
  reopen that, but this pass found no row that justifies exposing app-authored
  DOM selection policy.

## 3. Decision Brief

Principles:

- One owner per native selection decision.
- Runtime paths fail closed; strict low-level helpers may still throw.
- Browser proof beats confident architecture prose.
- Plite core stays model-first and unopinionated.
- Mobile and IME claims need honest transport, not desktop simulation dressed up
  as device proof.

Top drivers:

- `Selection, Focus, And DOM Bridge` is the biggest issue theme at `172` issues
  in `docs/plite-issues/requirements-from-issues.md:40-42`.
- The requirements file assigns DOM point/path translation, selection bridge,
  shadow DOM, and nested editor DOM boundaries to `plite-dom-v2`, while
  `plite-react-v2` owns lifecycle, focus timing, and React-facing events
  (`docs/plite-issues/requirements-from-issues.md:188-198`).
- Live source already has separate `DOMEditor` conversion primitives and React
  selection controller/reconciler policy; this is a consolidation and proof
  plan, not a blank rewrite.

Viable options:

| Option                                                          | Pros                                                     | Cons                                                             | Verdict               |
| --------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- | --------------------- |
| A. Reopen the closed 2026-05-06 DOM boundary proof              | Uses known path                                          | Wastes time; #4789/#4984 are already exact fixed claims          | reject                |
| B. Add public `normalizePoint` / DOM policy hooks               | Lets apps patch exotic DOM                               | Leaks browser ownership into app code and makes proof impossible | reject                |
| C. Harden private bridge ownership plus focused leftover proofs | Keeps API clean; maps to current owners; issue-proofable | Needs ecosystem synthesis and browser rows before execution      | choose                |
| D. Move DOM selection policy entirely into `plite-react`        | Close to event source                                    | Blurs `plite-dom` ownership and weakens non-React substrate      | reject                |
| E. Copy ProseMirror's view selection model wholesale            | Battle-tested                                            | Too position/schema-view-centric for Plite's node/path model     | partial evidence only |

Chosen option:

- Keep strict helpers in `DOMEditor`, but make runtime event/focus paths consume
  one private result-oriented selection bridge with explicit ownership reasons.
  `plite-react` decides when to import/export/reconcile. `plite-dom` decides how
  DOM points, ranges, roots, and foreign targets are classified.

Pass 4 refinement:

- Do not create a public `normalizePoint`, cursor-exclusion, table-selection, or
  app-authored DOM classifier API.
- Do not move all bridge behavior into `plite-react`; `plite-react` should
  consume classification and make timing/policy decisions.
- Do not hide strict `DOMEditor.toPlitePoint` / `toPliteRange` errors globally;
  only runtime event paths should fail closed.
- Do not treat #5524 as a DOM bridge fix until proof shows native selection
  import/export is the failure rather than core caret movement.
- Do not treat #5550/#5551/#5924 as raw Plite closure targets.

Consequences:

- Most work should be private architecture plus browser/unit proof.
- Public API should stay unchanged unless a leftover issue proves private
  ownership is insufficient.
- Some related issues will remain related, not fixed. That is correct.

Follow-ups:

- Related-issue discovery pass with ClawSweeper.
- Maintainer objection pass against the accepted private bridge.
- Browser proof pass before implementation handoff.

## 4. Confidence Scorecard

| Dimension                                                | Score | Evidence                                                                                                                                                                                                              |
| -------------------------------------------------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |  0.91 | Current runtime already filters selector fanout by commit/runtime facts and throttles selectionchange. Ecosystem pass rejects importing broad ProseMirror/Lexical runtime machinery.                                  |
| Plite-close unopinionated DX                             |  0.91 | Public API remains unchanged; strict helpers stay strict for direct callers, while runtime paths classify and fail closed.                                                                                            |
| Plate and slate-yjs migration backbone                   |  0.85 | Plate/Yjs pressure validates deterministic model `Range                                                                                                                                                               | null` output and focus/null cursor semantics; pass 8 rejects raw DOM range leakage as a migration rollback trigger. |
| Regression-proof testing                                 |  0.95 | Proof ownership is split into vertical TDD rows, browser rows, rollback gates, explicit claim gates, ecosystem keep/defer/reject rows, and concrete `Plate repo root` command groups.                                   |
| Research evidence completeness                           |  0.95 | Added live Plite selection runtime/source, strict DOM helper source, selector fanout, Plate editor shape, Yjs cursor overlays, objection proof anchors, ecosystem maintainer challenge rows, and ledger sync rows. |
| shadcn-style composability and hook/component minimalism |  0.88 | No UI props, component flags, or public bridge hooks are introduced; revision keeps customization at existing extension points and blocks app-authored DOM classifier APIs.                                           |

Total: `0.94`.

Score status: `done`. Closure gates passed at `0.94`.

## 5. Source-Backed Architecture North Star

Current live owners:

| Current owner                      | Evidence                                                                                                                                                             | Current shape                                                                                                                | Initial take                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `plite-dom` strict DOM helpers     | `packages/plite-dom/src/plugin/dom-editor.ts:65-105`                                                                                                   | `findEventRange`, `toDOMPoint`, `toDOMRange`, `toPlitePoint`, and `toPliteRange` are direct capabilities.                    | Keep strict helpers, but do not make runtime paths depend on exceptions.         |
| DOM coverage boundary fallback     | `packages/plite-dom/src/plugin/dom-editor.ts:399-427`                                                                                                  | Non-rendered coverage boundaries can map back to Plite points.                                                               | Reuse as one input to the bridge, not a separate special case in every caller.   |
| Focus restore                      | `packages/plite-dom/src/plugin/dom-editor.ts:627-731`                                                                                                  | `DOMEditor.focus` sets `IS_FOCUSED`, uses `preventScroll: true`, waits for dirty node maps, and retries DOM selection sync.  | This is the right owner, but exact focus/scroll issue rows are still not closed. |
| Selection import/export controller | `packages/plite-react/src/editable/selection-controller.ts:244-285`, `packages/plite-react/src/editable/selection-controller.ts:484-528` | React controller imports DOM selection only when anchor/focus belong to this editor and converts with `suppressThrow: true`. | Good direction; leftover plan should harden ownership reasons and proof.         |
| Selection reconciler               | `packages/plite-react/src/editable/selection-reconciler.ts:177-205`, `packages/plite-react/src/editable/selection-reconciler.ts:870-958` | Native `selectionchange` is attached outside React; export path writes DOM selection and scrolls it into view.               | Keep event ownership; audit scroll/focus cases before claiming.                  |
| Existing contract tests            | `packages/plite-react/test/selection-controller-contract.ts:56-105`, `packages/plite-dom/test/bridge.ts:420-466`                         | Unit tests cover model preference, external selection, decorated slice conversion.                                           | Useful floor, not enough for issue closure.                                      |

Target flow:

```txt
native selection / focus / event range
  -> plite-dom classification
     ok | ignored | repair | stale | foreign | nested-editor | shadow-root | unsupported
  -> slate-react selection controller policy
     import DOM | export model | preserve model | clear | repair | no-op
  -> browser proof row or explicit non-claim
```

## 6. Ecosystem Strategy Synthesis

| System                              | Source read                                                                                                                       | Mechanism                                                                                                                                                         | Steal                                                                                                          | Reject                                                                                       | Plite target                                                                                       | Verdict         |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------- |
| Lexical closure harvest             | `docs/editor-test-harvester/lexical/report.md`                                                                                    | Issue-shaped browser rows with honest transport and explicit skip families.                                                                                       | Browser-regression shape for IME, clipboard, input transport, table containment, DOM repair, and scroll/focus. | Lexical node classes, command registry, Composer identity, private MIME, and product chrome. | Use Lexical as the "how to prove it" model, not the architecture model.                            | agree           |
| Lexical selection/scroll/table rows | `docs/editor-test-harvester/lexical/report.md` matrix rows for `Selection.spec.mjs`, `AutoScroll.spec.mjs`, and table tests       | Real browser selection behavior is tested with user-shaped actions.                                                                                               | Parent/nested ownership, scrollable root/parent caret visibility, table containment descriptions.              | Whole-table selection as a hidden Plite requirement.                                         | Copy containment and scroll proof only; keep table model non-claims explicit.                      | partial         |
| ProseMirror selection tests         | `../prosemirror/view/test/webtest-selection.ts`                                                                                   | DOM selection import/export, coordinate roundtrips, arrow motion through selectable nodes, fallback when `Selection.extend` throws, and BR-hack cursor avoidance. | Exact browser invariant list for bridge, focus, coords, and caret edge cases.                                  | Integer-position document model and view-desc API shape.                                     | Split into Plite DOM bridge rows, React selection-controller rows, and core caret/navigation rows. | agree           |
| ProseMirror composition tests       | `../prosemirror/view/test/webtest-composition.ts`                                                                                 | Composition survives marks, widgets, decoration changes, overlapping external changes, rapid composition, and cross-paragraph edits.                              | Adjacent decorated/mark DOM ownership pressure.                                                                | Treating js/browser composition rows as raw mobile closure for this lane.                    | Route most rows to Mobile/IME; keep decorated/native-selection ownership as bridge pressure.       | partial         |
| ProseMirror node/mark view tests    | `../prosemirror/view/test/webtest-nodeview.ts`, `../prosemirror/view/test/webtest-markview.ts`                                    | Custom rendered DOM uses `contentDOM`, `ignoreMutation`, and lifecycle hooks.                                                                                     | The mutation-ignore/classification idea for app-owned or nested contenteditable DOM.                           | ProseMirror NodeView/MarkView API clone.                                                     | Private `app-owned-dom` and `nested-editor` reasons, not public renderer hooks.                    | partial         |
| ProseMirror view/focus source       | `../prosemirror/view/test/webtest-view.ts`, `../prosemirror/view/src/domobserver.ts`, `../prosemirror/view/src/domcoords.ts`      | Selectionchange suppression, focus-reset restore, scroll-to-selection, and `preventScroll` fallback are view-owned.                                               | Focus/scroll proof and explicit restore policy.                                                                | Browser-specific focus hacks as public Plite API.                                            | `plite-react` decides timing; `plite-dom` supplies classified DOM ranges.                          | agree           |
| Tiptap focus command                | `../tiptap/packages/core/src/commands/focus.ts`                                                                                   | Mobile focuses synchronously, Safari desktop uses `preventScroll`, React async focus uses RAF, and node/cell selection is not silently resolved.                  | Browser-specific timing discipline and "do not resolve unsupported selection kinds while focusing" rule.       | Copying Tiptap command API or ProseMirror selection classes.                                 | Pressure `DOMEditor.focus` and React selection controller, not public APIs.                        | agree           |
| Tiptap readOnly and renderer specs  | `../tiptap/demos/src/GuideContent/ReadOnly/React/index.spec.js`, `../tiptap/packages/vue-3/__tests__/VueMarkViewRenderer.spec.ts` | ReadOnly prevents typing/tab focus; renderer lifecycle survives IME-ish jsdom churn.                                                                              | ReadOnly/focus boundary smoke and renderer crash negative-control.                                             | Calling jsdom renderer composition a mobile/IME proof.                                       | Useful as related regression rows only.                                                            | partial         |
| Tiptap clipboard tests              | `../tiptap/packages/core/src/__tests__/transformPastedHTML.test.ts`                                                               | Transform pipeline order and malformed HTML resilience.                                                                                                           | Clipboard lane backlog.                                                                                        | Pulling clipboard transform policy into DOM selection bridge.                                | Out of scope for this plan except as reject evidence.                                              | reject for lane |

Pass 5 verdict:

- ProseMirror is the strongest reference for this lane. Its selection tests
  should drive DOM import/export, focus/scroll, coords, fallback, and BR-hack
  rows.
- Lexical is still the strongest proof-style reference. Use its browser-first
  regression shape and explicit deferrals.
- Tiptap adds useful focus timing pressure, especially mobile synchronous focus,
  Safari `preventScroll`, and React RAF. It does not justify new public Plite
  API.
- Most IME, clipboard, and table-model rows discovered here should be routed to
  their own lanes unless they directly pressure DOM selection ownership.

### 6a. Exact Tests To Steal Or Reject

| Source                                                                         | Behavior                                                                   | Plite action                                                            | Owner                                | Verification route                                                  |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------- |
| `../prosemirror/view/test/webtest-selection.ts:64`                             | Read native DOM selection into model selection.                            | create/refactor bridge import row                                       | `plite-dom` + `plite-react`          | `bridge.ts` unit plus browser selection-controller proof            |
| `../prosemirror/view/test/webtest-selection.ts:91`                             | Sync model selection back to DOM selection.                                | create/refactor export row                                              | `plite-react`                        | selection reconciler/controller contract plus browser row           |
| `../prosemirror/view/test/webtest-selection.ts:191`                            | Coordinates around line breaks are sensible.                               | defer to coords lane unless DOM point/range proof needs it              | `plite-dom`                          | focused DOM coords unit/browser proof only if touched               |
| `../prosemirror/view/test/webtest-selection.ts:215`                            | Node-boundary coordinate lookup works.                                     | create DOM boundary mapping proof                                       | `plite-dom`                          | `bridge.ts` + browser boundary row                                  |
| `../prosemirror/view/test/webtest-selection.ts:238`                            | `posAtCoords`/`coordsAtPos` roundtrip works on wrapped lines.              | defer unless current Plite coords surface claims parity              | `plite-dom`                          | coords-specific lane if needed                                      |
| `../prosemirror/view/test/webtest-selection.ts:259`                            | Arrow motion goes through selectable inline nodes.                         | route to inline/void caret proof                                        | `slate` core + `plite-react` browser | focused inline browser and core caret fixtures                      |
| `../prosemirror/view/test/webtest-selection.ts:273`                            | Arrow motion goes through selectable block nodes.                          | route to core/navigation unless DOM import fails                        | `slate` core                         | core caret tests plus browser only if needed                        |
| `../prosemirror/view/test/webtest-selection.ts:321`                            | Selection updates even when DOM parameters look unchanged.                 | create reconciler regression row                                        | `plite-react`                        | `selection-reconciler-contract.ts` plus browser selectionchange row |
| `../prosemirror/view/test/webtest-selection.ts:335`                            | Fallback when `Selection.extend` throws.                                   | create browser fallback row or explicit unsupported note                | `plite-react`                        | WebKit/Safari-focused proof when transport is honest                |
| `../prosemirror/view/test/webtest-selection.ts:351`                            | Cursor is not placed after BR hack nodes.                                  | create zero-width/BR bridge row                                         | `plite-dom`                          | `bridge.ts` plus browser richtext row                               |
| `../prosemirror/view/test/webtest-composition.ts:135`                          | Android-style newline after composition.                                   | defer to Mobile/IME                                                     | `plite-browser`/mobile lane          | raw mobile/device or honest browser IME helper                      |
| `../prosemirror/view/test/webtest-composition.ts:158`                          | Composition inside marks.                                                  | defer to Mobile/IME, keep mark DOM ownership pressure                   | IME lane                             | focused IME browser row                                             |
| `../prosemirror/view/test/webtest-composition.ts:227`                          | Composition does not overwrite adjacent widgets.                           | create adjacent-decorated/native-selection ownership row if not covered | `plite-react` + decorations lane     | browser decorated/void row                                          |
| `../prosemirror/view/test/webtest-nodeview.ts:77`                              | `ignoreMutation` is called for rendered DOM.                               | steal private classification pressure only                              | `plite-dom`                          | app-owned/nested contenteditable bridge row                         |
| `../prosemirror/view/test/webtest-view.ts:43`                                  | Scroll-to-selection hook fires when appropriate.                           | focus/scroll proof row                                                  | `plite-react`                        | scrollable root/parent browser proof                                |
| `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1193` | Triple-click last table cell does not select entire document.              | keep current containment proof                                          | `plite-react` example/browser        | focused table containment grep                                      |
| `../lexical/packages/lexical-playground/__tests__/e2e/Selection.spec.mjs:1248` | Drag from table cell outside promotes to whole-table selection in Lexical. | steal negative containment pressure only; defer whole-table semantics   | table model / examples               | containment browser row now; separate table-model plan if accepted  |
| `../lexical/packages/lexical-playground/__tests__/e2e/AutoScroll.spec.mjs:17`  | Caret remains visible while typing in a scrollable editor.                 | create scrollable root/parent focus row                                 | `plite-react`                        | huge-document or stress autoscroll browser grep                     |
| `../tiptap/packages/core/src/commands/focus.ts`                                | iOS/Android direct focus, Safari `preventScroll`, React RAF.               | pressure focus policy, no public API                                    | `plite-dom` + `plite-react`          | browser focus/scroll rows; raw mobile only for mobile claims        |
| `../tiptap/demos/src/GuideContent/ReadOnly/React/index.spec.js`                | ReadOnly prevents typing and tabindex.                                     | optional readOnly boundary smoke                                        | `plite-react`                        | browser readOnly row if current issue needs it                      |
| `../tiptap/packages/vue-3/__tests__/VueMarkViewRenderer.spec.ts`               | Renderer survives IME-ish jsdom churn.                                     | reject as IME proof; use as negative-control only                       | none                                 | none                                                                |
| `../tiptap/packages/core/src/__tests__/transformPastedHTML.test.ts`            | Clipboard transform resilience.                                            | reject for this lane; route to clipboard                                | clipboard lane                       | paste/serialization gates                                           |

### 6b. Ecosystem Maintainer Challenge

Pass 9 verdict:

- ProseMirror stays the strongest behavioral reference, but not an architecture
  template. Steal its selection import/export, focus/scroll, fallback, and BR
  cursor invariants from `../prosemirror/view/test/webtest-selection.ts:64-110`,
  `../prosemirror/view/test/webtest-selection.ts:321-356`, and
  `../prosemirror/view/test/webtest-view.ts:50-58`. Reject integer-position
  assumptions, `docView`/view-desc internals, and direct ports of
  `scrollRectIntoView` or `focusPreventScroll` from
  `../prosemirror/view/src/domcoords.ts:32-140`.
- ProseMirror coordinate rows are not closure blockers for this lane unless the
  implementation edits a public or private Plite coords surface. Otherwise,
  route them to a coords-specific lane.
- ProseMirror `NodeView.ignoreMutation` is only evidence that app-owned DOM
  needs a private classification reason. Do not copy NodeView/MarkView APIs;
  keep Plite renderers and DOM ownership separate
  (`../prosemirror/view/test/webtest-nodeview.ts:77-101`).
- Lexical remains the proof-style source. Steal native browser rows and
  explicit deferrals from `docs/editor-test-harvester/lexical/report.md:120-147`
  and the apply ledger at `docs/editor-test-harvester/lexical/report.md:163-176`.
  Do not steal Lexical's node classes, command registry, Composer model, private
  MIME details, or whole-table selection semantics.
- The Lexical table drag row is narrowed. Current Plite proof should assert
  containment/no document spill; whole-table promotion remains a separate
  table-model decision, not part of this DOM bridge lane.
- Tiptap focus behavior is useful pressure only. Steal the timing distinctions
  from `../tiptap/packages/core/src/commands/focus.ts:44-69` and the unsupported
  selection-kind guard from `../tiptap/packages/core/src/commands/focus.ts:82-86`.
  Do not copy the command API, ProseMirror selection classes, or treat Tiptap
  jsdom renderer churn as mobile/IME proof.

Accepted ecosystem revisions:

- Add no new public API from any ecosystem reference.
- Keep coords rows deferred unless the implementation touches coords.
- Keep table rows containment-only unless the user accepts a separate table
  selection model.
- Keep Mobile/IME rows out unless raw device or honest browser IME transport is
  available.
- During implementation, every external test copied must be rewritten as a
  Plite behavior row with a Plite owner and a `Plate repo root` command.

## 7. Public API Target

Status: `unchanged for this lane`.

- No public `normalizePoint`.
- No public app-authored DOM selection classifier.
- No new renderer props.
- No Plate-specific selection affordance in raw Plite.
- No public ignore-cursor or structural DOM exclusion API for #5924.
- No public Web Component boundary model for #5550.
- No raw Plite table selection model for #2558/#5551.
- Keep strict DOM helpers public/internal as they are unless the next pass proves
  a breaking API is required.

The accepted change is private runtime structure and proof, not public API.

## 8. Internal Runtime Target

Accepted private target:

```ts
type DOMSelectionBridgeResult =
  | { type: "ok"; range: Range | null; reason: "native" | "event-range" }
  | { type: "ignored"; reason: "foreign-target" | "nested-editor" | "readonly" }
  | { type: "repair"; reason: "stale-dom" | "dirty-node-map" | "focus-reset" }
  | { type: "unsupported"; reason: "app-owned-dom" | "raw-device-required" };
```

This is a private proof shape, not a final API proposal.

Runtime rules to prove:

- `toPlitePoint` / `toPliteRange` stay strict low-level helpers.
- Selectionchange, beforeinput target ranges, focus restoration, and
  `findEventRange` consume non-throwing classification in runtime paths.
- Parent editor, nested editor, and shadow root ownership is decided before DOM
  point conversion.
- Focus restoration may preserve model selection, import DOM selection, or clear
  selection, but it must name the reason.
- Scroll happens because the policy says so, not as incidental fallout of focus.

Relationship to current v2 code:

- `DOMEditor.toPlitePoint` and `toPliteRange` already accept `suppressThrow`;
  this plan should centralize when runtime paths use that non-throwing mode.
- `selection-controller.ts` already has explicit import/export execution keyed
  by `EditableSelectionPolicy`.
- `editing-kernel.ts` already names policy kinds such as `import-dom`,
  `export-model`, `preserve-model`, `none`, and `shell`.
- The missing piece is a finite DOM-side classification result that feeds those
  policies without leaking into public app APIs.

## 9. Hook / Component / Render DX Target

- No new app-facing selection props.
- No product toolbar state in raw Plite.
- Renderers should not need to know why a DOM point imported or failed.
- Hooks may expose selection/focus state only if existing external-store
  contracts already justify it.

## 10. Plate Migration Backbone

Plate should benefit from:

- deterministic model selection after native selection import;
- explicit ignored/repair reasons for debugging table, void, and inline UI;
- fewer app workarounds around focus and scroll;
- no dependence on current Plate `editor.api` / `editor.tf` shape.

No Plate adapter work is in scope.

## 11. slate-yjs Migration Backbone

Collab relevance:

- local DOM selection import must become either a deterministic model selection
  or an explicit ignored/repair state;
- remote selection/cursor adapters should never consume raw DOM ranges;
- no Yjs protocol or awareness API is changed by this lane.

This remains a substrate answer, not a slate-yjs integration claim.

## 11a. Owner Split After Intent Pass

| Surface                                        | Owner                       | In this plan?         | Reason                                                                             |
| ---------------------------------------------- | --------------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| DOM point/range/root classification            | `plite-dom`                 | yes                   | Native DOM belongs here before React decides policy.                               |
| Selection import/export timing                 | `plite-react`               | yes                   | React owns listeners, reconciliation, focus, and scroll timing.                    |
| Focus state after button/embedded target moves | `plite-react`               | yes, as related proof | #3893/#3909 pressure is about React focus timing plus DOM target classification.   |
| Soft-break vertical navigation                 | `slate` core                | related only          | #5524 is core caret/navigation unless browser proof shows DOM import/export drift. |
| Inline/void gesture and deletion caret         | `plite-react` + `plite-dom` | yes                   | Browser gesture import plus DOM range classification must agree.                   |
| Web Component selection boundaries             | ecosystem                   | no                    | #5550 needs a support model, not incidental bridge behavior.                       |
| Firefox custom rowspan table selection         | ecosystem/table model       | no                    | #5551 is not raw table containment.                                                |
| Structural ignore-cursor elements              | future API/product model    | no                    | #5924 lacks isolated repro and would require a public model this lane rejects.     |

## 12. Issue-Ledger Accounting

ClawSweeper related-issue pass: `applied`.

Trigger:

- This plan touches issue-facing browser/runtime/focus behavior, so the related
  issue surface was routed before the plan can score ready.

Discovery evidence:

- `gitcrawl --version`: `0.2.1`.
- `gitcrawl doctor --json`: `617` clusters, `659` open threads, `659` total
  threads, archive last synced `2026-05-04T14:58:11.123944Z`, no GitHub token.
- `gitcrawl threads ianstormtaylor/slate --numbers
5947,4842,5867,5826,5538,5568,3497,5171,5107,5711,5806,2558
--include-closed --json`.
- `gitcrawl cluster-detail ianstormtaylor/slate --id 1 --member-limit 20
--body-chars 280 --json`.
- `gitcrawl cluster-detail ianstormtaylor/slate --id 3 --member-limit 20
--body-chars 280 --json`.
- `gitcrawl cluster-detail ianstormtaylor/slate --id 14 --member-limit 20
--body-chars 280 --json`.
- `gitcrawl cluster-detail ianstormtaylor/slate --id 20 --member-limit 20
--body-chars 280 --json`.

ClawSweeper verdict:

- #5947: `Improves`, bucket `v2-dom-selection`; keep `Improves #5947`, exact
  parent/child browser or unit proof required before `Fixes`.
- #4842: `Related`; nested-editor DOM offset/history closure is not exact.
- #5867: `Related`; selected-inline/mention focus restore belongs here, but
  `DOMEditor.focus` exact proof is missing.
- #5826: `Related`; long-editor refocus autoscroll exact proof is missing.
- #5538: `Related`; focus-scroll restoration exact proof is missing.
- #5568: `Related` / `issue-reviewed`; mostly React runtime focus
  initialization, not pure DOM bridge.
- #3497: `Related`; mostly React focus/subscription runtime.
- #5171: `Related`; Firefox unfocused selection update needs a Firefox row.
- #5107: `Related`; shadow DOM `findEventRange` needs an exact shadow row.
- #5711: `Related`; iOS/mobile DOM point crash needs matching mobile proof.
- #5806: `Related`; custom inline gesture selection proof is missing.
- #2558: `Not claimed`; multi-cell table selection requires an explicit table
  selection model.

Already closed floor:

| Issue | Current claim | Evidence                                                                                                     | This plan action                                                                       |
| ----- | ------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| #4789 | Fixes         | `docs/plite/ledgers/issue-coverage-matrix.md:54`, `docs/plite/ledgers/fork-issue-dossier.md:1394-1427` | Keep as regression floor; do not redo.                                                 |
| #4984 | Fixes         | `docs/plite/ledgers/issue-coverage-matrix.md:55`, `docs/plite/ledgers/fork-issue-dossier.md:1506-1538` | Keep as regression floor; only extend if #5947/#4842 need stronger parent/child proof. |

Candidate leftover issue matrix:

| Issue | Cluster                            | Initial claim            | Why                                                                                    | Proof route                                           | Live ledger sync                                   | PR line                               |
| ----- | ---------------------------------- | ------------------------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------- | ------------------------------------- |
| #5947 | nested-editor-and-global-dom-maps  | Improves                 | Current matrix says improves only; exact parent/child `toPlitePoint` proof is missing. | `plite-dom` unit plus nested editor browser row       | coverage matrix and dossier synced                 | `Improves #5947` stays; no fixed line |
| #4842 | nested-editor-and-global-dom-maps  | Related                  | Current dossier says no exact nested offset closure.                                   | nested editor DOM offset browser/unit row             | already synced                                     | related only                          |
| #5867 | focus-restore-selected-mention     | Related                  | Mention-selected focus loses selection.                                                | mentions browser row around `DOMEditor.focus`         | coverage matrix row added; dossier appended        | related only                          |
| #5826 | refocus-autoscroll                 | Related                  | Current matrix says related; exact long editor refocus autoscroll proof is missing.    | Lexical-style scrollable root/parent browser row      | already synced                                     | related only                          |
| #5538 | focus-scroll                       | Related                  | Same focus-scroll family; may share proof with #5826.                                  | focus preventScroll proof                             | coverage matrix row added; dossier appended        | related only                          |
| #5568 | react-focus-initialization         | Related / issue-reviewed | Exact empty-initial-value focus regression is not claimed.                             | React focus contract and browser repro if still valid | coverage already had row; dossier appended         | related only                          |
| #3497 | parent-rerender-focus-loss         | Related                  | Parent rerender/focus churn mostly belongs to React runtime.                           | React runtime plan should own exact closure           | already synced                                     | related only                          |
| #5171 | unfocused-firefox-selection-update | Related                  | Current matrix keeps it related.                                                       | Firefox browser selectionchange row                   | already synced                                     | related only                          |
| #5107 | shadow-dom-find-event-range        | Related                  | Dossier says no exact closure.                                                         | shadow DOM `findEventRange` browser row               | already synced                                     | related only                          |
| #5711 | DOM point crash                    | Related                  | iOS/browser-specific crash cannot close without matching proof.                        | browser/device-specific row or keep related           | already synced                                     | related only                          |
| #5806 | custom-inline-gesture-selection    | Related                  | Exact slide-selection row missing.                                                     | browser gesture row                                   | coverage matrix row added; dossier already had row | related only                          |
| #2558 | table-cell-drag-selection          | Not claimed              | Full table selection model is out of scope for the DOM bridge lane.                    | containment proof only unless model added             | coverage matrix row added; dossier appended        | none; detailed ledger only            |

No new `Fixes #...` lines are legal from this pass.

Issue-ledger full scan: `applied`.

Evidence read:

- `docs/plite-issues/gitcrawl-live-open-ledger.md`
- `docs/plite-issues/gitcrawl-clusters.md`
- `docs/plite-issues/issue-clusters.md`
- `docs/plite-issues/test-candidate-map/`
- `docs/plite-issues/benchmark-candidate-map.md`
- `docs/plite-issues/package-impact-matrix.md`
- `docs/plite-issues/requirements-from-issues.md`
- `docs/plite/ledgers/issue-coverage-matrix.md`
- `docs/plite/ledgers/fork-issue-dossier.md`

Corpus-level verdict:

- the frozen macro taxonomy still makes Selection, Focus, And DOM Bridge the
  largest raw theme at `172` issues;
- package pressure still says `plite-dom-v2` + `plite-react-v2` jointly own
  this lane: DOM point/path translation, native selection bridge, focus timing,
  shadow DOM, nested editor ownership, tables, and inline/void boundaries;
- gitcrawl multi-member clusters already cover the obvious high-signal groups,
  but the singleton ledger and test-candidate maps expose more DOM/focus rows
  than the first ClawSweeper candidate list;
- the benchmark map adds no new DOM-selection benchmark beyond existing
  selection/rerender lanes, so this pass should not invent a perf harness here.

Newly surfaced gaps for focused ClawSweeper:

| Issue or family | Initial route                    | Why this was missed by pass 2                                                                                       | Required next sync                                                 |
| --------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| #5690           | Related                          | Dossier already has `cluster-synced`, but the coverage matrix lacks a row.                                          | Add coverage row or justify matrix-only routing; no `Fixes`.       |
| #5689           | Related                          | Dossier already has `cluster-synced`, but the coverage matrix lacks a row.                                          | Add coverage row or justify matrix-only routing; no `Fixes`.       |
| #4995           | Related                          | Dossier already has scroll-selection policy routing, but the coverage matrix lacks a row.                           | Add coverage row or merge with #5088/#5473 scroll family.          |
| #5632           | Related                          | Test-candidate map marks adjacent inline badge delete caret as `ready-now`; not in the active candidate matrix.     | ClawSweeper issue section plus coverage row if still live-open.    |
| #5559           | Related                          | Test-candidate map marks Shift-click through void selection as `ready-now`; not in the active candidate matrix.     | ClawSweeper issue section plus coverage row if still live-open.    |
| #3909           | Related                          | Nested `contenteditable` target ownership is direct DOM target pressure and matrix-only future proof is too buried. | Promote from matrix-only future proof or keep explicit non-claim.  |
| #3893           | Related                          | HTML button focus state is matrix-only future proof, but this DOM/focus lane is the right owner for exact proof.    | Promote from matrix-only future proof or keep explicit non-claim.  |
| #5550           | Not claimed / ecosystem boundary | Web Components alter DOM ownership; test map marks it not a direct test candidate.                                  | Keep out of PR claims unless a supported boundary model is added.  |
| #5551           | Not claimed / ecosystem boundary | Firefox `rowspan` table selection depends on custom table plugin/browser behavior.                                  | Keep separate from raw table containment and #2558 model decision. |
| #5524           | Related outside current owner    | Vertical navigation across soft breaks is a selection issue, but likely core caret/navigation, not DOM bridge.      | Route to core caret/navigation unless browser proof says DOM.      |
| #5924           | Not claimed                      | Reporter could not isolate repro; advanced structural DOM capability only.                                          | Do not add test or claim without repro.                            |

This pass does not add PR claim text. It adds a focused gap owner before the
plan can move to intent/boundary closure.

Focused ledger-gap ClawSweeper pass: `applied`.

Focused verdict:

| Issue | Verdict                       | Sync result                                                                                                                  |
| ----- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| #5690 | Related                       | Added coverage row and dossier section for inline-boundary double-click/delete; no exact browser closure.                    |
| #5689 | Related                       | Added coverage row and dossier section for triple-click/upward gesture selection; no exact browser closure.                  |
| #4995 | Related                       | Added coverage row and dossier section for scroll-selection customization; React runtime owns exact policy proof.            |
| #5632 | Related                       | Added coverage row and dossier section for adjacent inline badge delete caret; exact browser proof still missing.            |
| #5559 | Related                       | Added coverage row and dossier section for Shift-click through void selection; exact multi-browser proof still missing.      |
| #3909 | Related                       | Promoted from matrix-only future proof to explicit coverage and dossier routing for nested contenteditable target ownership. |
| #3893 | Related                       | Promoted from matrix-only future proof to explicit coverage and dossier routing for HTML button focus state.                 |
| #5550 | Not claimed                   | Added coverage row and dossier section; arbitrary Web Component selection boundaries need a separate support model.          |
| #5551 | Not claimed                   | Added coverage row and dossier section; Firefox rowspan custom table selection stays outside raw containment claims.         |
| #5524 | Related outside current owner | Added coverage row and dossier section; route to core caret/navigation unless DOM proof says otherwise.                      |
| #5924 | Not claimed                   | Added coverage row and dossier section; no isolated repro or public structural cursor-exclusion API.                         |

No new `Fixes #...` lines are legal from this pass.

## 13. Legacy Regression Proof Matrix

| Family                                  | Existing proof                                                              | Missing proof                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Outside selection crossing editor       | #4789 browser row exists.                                                   | none for this plan unless regression guard is moved.                             |
| Parent selection crossing nested editor | #4984 browser row exists.                                                   | #5947/#4842 exact parent/child offset and wrong-editor point ownership.          |
| DOM point strict conversion             | `bridge.ts` covers zero-width and decorated slices.                         | fail-closed app/foreign/stale DOM import with exact issue rows.                  |
| Focus restore                           | `DOMEditor.focus` has preventScroll and retry logic.                        | selected mention focus, long editor refocus, unsupported preventScroll fallback. |
| Shadow DOM                              | shadow routes exist.                                                        | exact `findEventRange` crash row for #5107.                                      |
| Tables                                  | previous table boundary rows exist; Lexical table rows were partly applied. | whole-table drag/range selection intentionally undecided.                        |

## 14. Browser Stress / Parity Strategy

Browser proof should be issue-shaped:

- Chromium: nested editor ownership, custom inline gesture, basic focus restore.
- Firefox: unfocused selectionchange and table multi-range behavior.
- WebKit/Safari: focus/scroll and table/selection edge behavior when Playwright
  transport is honest.
- Raw mobile: only for issue claims explicitly requiring Android/iOS.

Do not mark raw-device issues fixed from Playwright mobile viewport rows.

## 15. Applicable Implementation-Skill Review Matrix

| Skill/pass                  | Status             | Reason                                                                                                                                                        |
| --------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vercel React best practices | applied            | Keep native listeners deduped under the runtime root, keep transient event facts in refs/state objects, and avoid app-facing React state for selectionchange. |
| performance-oracle          | applied            | Selectionchange, focus, scroll, and DOM conversion are hot-path behavior; the private bridge must be finite and cheap.                                        |
| tdd                         | applied            | Implementation should proceed one vertical regression row at a time: failing classifier proof, runtime policy proof, then browser proof.                      |
| editor-test-harvester       | applied            | Lexical closure report is now reused as the test-theft source of truth; ProseMirror and Tiptap rows were manually synthesized for this lane.                  |
| shadcn                      | skipped for pass 6 | No UI component API is proposed. Revisit only if hooks/components change.                                                                                     |
| react-useeffect             | applied            | Effects are legitimate only for external DOM/listener/focus synchronization; selection classification itself should stay event/runtime-owned.                 |

## 15a. Performance, DX, Migration, And Regression Pressure

Performance verdict:

- Do not model the bridge as a fresh object graph on every `selectionchange`.
  The hot path already runs through `createRuntimeSelectionChangeHandler`, which
  throttles native selectionchange at `packages/plite-react/src/editable/runtime-selection-engine.ts:46-108`
  and then calls `applyEditableDOMSelectionChange`.
- Keep the classification reasons finite and primitive. A string enum plus
  existing `Range | null` is enough for traceability; allocation-heavy result
  objects should be reserved for debug/test output if needed.
- Preserve current fanout filters. DOM export is already limited by commit facts
  in `packages/plite-react/src/editable/selection-runtime.ts:99-185`,
  and React selector fanout is runtime-id scoped in
  `packages/plite-react/src/hooks/use-editor-selector.tsx:212-343`.
- Do not add full DOM scans to classification. Current expensive work is
  already explicit: `createFastDOMSelectionRange` only handles same-path text
  and full-document cases before falling back at
  `packages/plite-react/src/editable/selection-controller.ts:169-210`,
  while shell/coverage exports are isolated at
  `packages/plite-react/src/editable/selection-controller.ts:593-676`.
- Keep scroll separate from classification. `scrollSelectionIntoView` should run
  only on model-to-DOM export, as it does at
  `packages/plite-react/src/editable/selection-controller.ts:669`.

React/DX verdict:

- The native `selectionchange` listener belongs behind the runtime root because
  React's `onSelect` is not enough; that is already stated in
  `packages/plite-react/src/editable/selection-reconciler.ts:177-213`.
- The bridge should not create a new public hook. Existing public state should
  stay through selector contracts such as `useEditorSelection` at
  `packages/plite-react/src/hooks/use-editor-selection.tsx:10-15`.
- Effects are acceptable for external synchronization only: cleanup of range
  refs, autofocus, native listener attachment, selector subscription, repair
  runtime, and Android/composition runtime setup in
  `packages/plite-react/src/editable/runtime-root-engine.ts:154-287`.
  Do not move user-event selection decisions into effects.
- `FocusedContext` remains coarse. Do not expand it with bridge reasons; that
  would turn a private runtime fact into app-facing rerender pressure.

Migration verdict:

- Plate currently exposes mutable `editor.selection` and command surfaces
  (`packages/plite/src/interfaces/editor/editor-type.ts:11-37`). Plite does
  not need to preserve that public shape. It needs deterministic model selection
  output that an adapter can read.
- Plate Yjs cursor support currently wraps slate-yjs cursor APIs and sends model
  selections (`packages/yjs/src/lib/withTCursors.ts:12-28`,
  `packages/yjs/src/lib/withPlateYjs.ts:32-63`). The DOM bridge must therefore
  produce stable `Range | null`, not raw DOM ranges.
- Cursor overlays in Plate calculate DOM rects from model ranges
  (`packages/cursor/src/hooks/useCursorOverlayPositions.ts:18-111`). That
  reinforces the rule: DOM selection import/export is local runtime work;
  collaboration and overlay layers consume model ranges after the bridge.
- slate-yjs remote cursors also decorate model ranges and compute overlay
  positions after paint (`../slate-yjs/packages/react/src/hooks/useDecorateRemoteCursors.ts:87-124`,
  `../slate-yjs/packages/react/src/hooks/useRemoteCursorOverlayPositions.tsx:77-143`).
  This lane must not leak browser DOM selection objects into awareness state.

Regression/TDD verdict:

- Start implementation with the smallest failing row. No horizontal "write all
  tests first" sweep.
- First vertical row: classify foreign/stale/app-owned DOM before conversion,
  proving runtime paths do not throw while strict `DOMEditor.toPlitePoint` /
  `toPliteRange` stay strict.
- Second vertical row: selectionchange ownership policy, using
  `packages/plite-react/test/selection-controller-contract.ts` and
  `packages/plite-react/test/selection-runtime-contract.test.ts`.
- Third vertical row: browser proof for one issue-shaped behavior, preferably
  parent/nested editor ownership or focus-scroll. Do not mark any issue fixed
  until the browser row matches the issue.
- Browser proof must keep the previous lessons: selectionchange traceability is
  not programmatic import proof, foreign DOM selections must fail closed before
  import, and Firefox table/multi-range claims need real native selection.

## 16. High-Risk Deliberate-Mode Pre-Mortem

High-risk trigger:

- Native selection import/export, focus timing, scroll behavior, nested-editor
  containment, table containment, browser proof, and issue claims are all
  browser-sensitive runtime behavior. A bad change is user-visible and hard to
  debug.

Blast radius:

| Surface    | In blast radius                                                                                                                                                                                                                                                                                                                                                            | Guardrail                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------- |
| Packages   | `plite-dom`, `plite-react`, `plite-browser` proof helpers                                                                                                                                                                                                                                                                                                                  | No public API change; private runtime bridge only.                                     |
| Files      | `packages/plite-dom/src/plugin/dom-editor.ts`, `packages/plite-react/src/editable/runtime-selection-engine.ts`, `packages/plite-react/src/editable/selection-controller.ts`, `packages/plite-react/src/editable/selection-reconciler.ts`, `packages/plite-react/src/editable/runtime-root-engine.ts` | Edits later must cite the owner and keep strict helper defaults.                       |
| Consumers  | Raw Plite React apps, Plate adapters, slate-yjs cursor consumers, browser examples                                                                                                                                                                                                                                                                                         | Consumers see model `Range                                                             | null`, not bridge reasons or DOM ranges. |
| Behavior   | Native selectionchange, model-to-DOM selection export, focus restore, scroll-to-selection, nested editor containment, table containment                                                                                                                                                                                                                                    | Each behavior needs focused unit/contract proof plus one issue-shaped browser row.     |
| Docs/tests | Issue coverage matrix, fork dossier, PR reference, browser tests, package contracts                                                                                                                                                                                                                                                                                        | No `Fixes #...` claim without exact matching proof from `/Users/zbeyens/git/plite`. |

Three-scenario pre-mortem:

1. Strict helper regression:
   - Failure: direct `DOMEditor.toPlitePoint` / `toPliteRange` callers stop
     throwing and bad rendered DOM becomes silent `null`.
   - Current evidence: helper APIs still default through strict behavior
     (`packages/plite-dom/src/plugin/dom-editor.ts:90-104`,
     `packages/plite-dom/src/plugin/dom-editor.ts:300-325`,
     `packages/plite-dom/src/plugin/dom-editor.ts:1520-1542`).
   - Guard: add strict-helper unit proof before runtime fail-closed browser
     proof. Roll back by removing runtime classifier call sites, not by
     weakening strict helpers.
2. Browser event ownership regression:
   - Failure: a delayed `selectionchange` overwrites model-owned text repair or
     a valid user selection cannot import because the runtime stays too
     defensive.
   - Current evidence: selectionchange is throttled and traced in
     `runtime-selection-engine.ts:46-108`; existing contracts cover native,
     repair-induced, and programmatic origins in
     `selection-controller-contract.ts:56-260` and selection export policy in
     `selection-runtime-contract.test.ts:42-260`.
   - Guard: classifier rows must prove positive import and negative ignore
     cases. Browser proof must assert model text, DOM text, DOM selection,
     follow-up typing, and kernel trace.
3. Product semantics leak:
   - Failure: copying Lexical table behavior turns raw Plite into a hidden
     whole-table selection model, or focus-scroll work steals app scroll
     customization.
   - Current evidence: current table rows prove containment/triple-click only
     (`apps/www/tests/plite-browser/donor/examples/tables.test.ts:129-179`);
     `scrollSelectionIntoView` remains injected at
     `selection-controller.ts:593-676`.
   - Guard: whole-table selection stays out of this lane; scroll fixes must keep
     the callback extension point and pass scrollable-root/parent browser rows.

Expanded proof plan:

| Layer              | Required proof                                                                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Unit               | `plite-dom` strict helper throws by default; runtime classifier returns finite primitive reasons for foreign, stale, app-owned, nested, and shadow-root selections.                 |
| Runtime contract   | `selection-controller-contract.ts` proves import/ignore/export transitions, repair-induced model ownership, and no public hook/API expansion.                                       |
| Browser            | Richtext outside-to-inside, editable-void parent/nested, selected mention focus, scrollable long editor/root, table containment/triple-click/drag, and shadow DOM event range rows. |
| Migration/adoption | Plate/Yjs/cursor overlays consume model `Range                                                                                                                                      | null`; no raw DOM ranges or bridge reasons cross adapters. |
| Docs/examples      | Coverage matrix and fork dossier classify each issue as `Fixes`, `Improves`, `Related`, or `Not claimed`; PR reference carries exact claim counts only.                             |
| Performance        | Selectionchange hot path keeps throttle/debounce, finite primitive classification, no broad DOM scan, no per-event rich result objects.                                             |
| Mobile/device      | Android/iOS rows remain related unless `bun test:mobile-device-proof:raw` has real device artifacts.                                                                                |

Rollback/remediation:

- If strict helper proof fails, drop the runtime bridge edit and restore direct
  helper throws first.
- If positive DOM import regresses toolbar, paste, or mouse selection, split the
  classifier into narrower ownership reasons instead of globally ignoring DOM
  selection.
- If focus-scroll proof needs app-specific behavior, keep the existing
  `scrollSelectionIntoView` extension point and downgrade exact issue closure.
- If table proof requires whole-table range semantics, move that to a separate
  table-model plan and keep this lane containment-only.

High-risk verdict:

- Keep the plan. Revise nothing public. The execution lane should start with
  strict-helper and runtime-contract TDD, then one issue-shaped browser proof.
  Do not batch broad browser rows before the first positive and negative
  ownership pair is green.

## 17. Hard Cuts And Rejected Alternatives

- No one plan per issue or cluster.
- No public `normalizePoint`.
- No "catch all DOMEditor errors and ignore" patch.
- No Plate workaround as core architecture.
- No whole-table selection model unless a separate public model decision says
  Plite owns it.
- No raw mobile fixed claims without raw mobile proof.

## 18. Plite Maintainer Objection Ledger

| Objection                                                     | Strongest fair version                                                                                            | Tradeoff accepted                                                                                                            | Why the plan still wins                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Proof required                                                                                                                                            | Verdict                               |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| "This hides useful DOM conversion errors."                    | If every failed conversion turns into `null`, maintainers lose the stack traces that explain bad renderer output. | Runtime code gets a two-mode policy instead of one simple converter call.                                                    | Keep strict helper behavior for direct callers: `DOMEditor.toPlitePoint` / `toPliteRange` default `suppressThrow` to `false` (`packages/plite-dom/src/plugin/dom-editor.ts:90-104`, `packages/plite-dom/src/plugin/dom-editor.ts:300-325`, `packages/plite-dom/src/plugin/dom-editor.ts:1520-1542`). Only runtime import paths use `suppressThrow: true` after ownership checks (`packages/plite-react/src/editable/selection-controller.ts:267-280`, `packages/plite-react/src/editable/selection-controller.ts:515-528`). | Unit row proves direct strict conversion still throws, while runtime selectionchange ignores foreign/stale/app-owned ranges without crashing.             | keep with revision                    |
| "Focus/scroll is browser-specific and should stay app-owned." | Apps may need custom scroll containers, portals, or virtualized layouts; core should not steal scroll policy.     | The runtime must respect the existing `scrollSelectionIntoView` extension point instead of inventing hidden scroll behavior. | Selection export already separates runtime DOM range materialization from the injected scroll callback (`packages/plite-react/src/editable/selection-controller.ts:593-676`). Focus/listener wiring already lives in the runtime root (`packages/plite-react/src/editable/runtime-root-engine.ts:205-287`). The plan keeps app scroll customization, but prevents apps from patching internal import/export ownership.                                                                                                                                                | Browser row for scrollable root/parent plus one selected-inline/mention focus row; no fixed claim if the proof only passes with app-specific scroll code. | keep with boundary                    |
| "Nested editors are edge-case app structure."                 | Nested editors can be produced by examples/plugins, not raw core; maybe the app should keep them sane.            | Ownership rules must handle nested editors even when exact issue closure remains related/improves rather than fixed.         | Live `DOMEditor.toPlitePoint` already has nested-editor/void awareness (`packages/plite-dom/src/plugin/dom-editor.ts:1043-1060`). The coverage ledger already has exact fixed parent-to-nested proof for #4984 and keeps #5947/#4842 narrower (`docs/plite/ledgers/issue-coverage-matrix.md:54-55`, `docs/plite/ledgers/issue-coverage-matrix.md:124-128`).                                                                                                                                                                                                                   | Focused parent/child browser or unit proof before promoting #5947/#4842 beyond `Improves` / `Related`.                                                    | keep                                  |
| "Table selection is product-specific."                        | Lexical-style whole-table range selection is a table model feature, not a raw DOM bridge feature.                 | Some table rows stay explicitly not claimed, even if browser containment rows are useful.                                    | The plan rejects whole-table selection as a hidden raw Plite requirement. Lexical harvest says Plite added containment/cell triple-click proof but deferred whole-table drag/range until Plite owns that model (`docs/editor-test-harvester/lexical/report.md:163-166`, `docs/editor-test-harvester/lexical/report.md:176`).                                                                                                                                                                                                                                                                   | Table rows may prove containment/no-crash/triple-click boundaries only; #2558-like whole-table selection needs a separate model decision.                 | keep boundary, drop whole-table claim |
| "This belongs in React only."                                 | Native `selectionchange` is attached by React runtime code, so centralizing in `plite-react` may be simpler.      | The split requires a private bridge contract between `plite-dom` classification and `plite-react` timing.                    | React owns listener lifecycle because React `onSelect` is insufficient (`packages/plite-react/src/editable/selection-reconciler.ts:177-213`). `plite-dom` owns root/target/point/range primitives through `DOMEditor` capabilities (`packages/plite-dom/src/plugin/dom-editor.ts:90-104`, `packages/plite-dom/src/plugin/dom-editor.ts:1495-1542`). Keeping both owners avoids making React the only DOM substrate.                                                                                                                                     | Contract tests prove classification happens before React import and no new public hook/API is needed.                                                     | keep                                  |

Accepted revisions from pass 7:

- Runtime fail-closed behavior must be named as runtime-only. Direct
  `DOMEditor` helper calls keep strict failures by default.
- Focus/scroll ownership must preserve `scrollSelectionIntoView` as the app
  extension point.
- Table rows are containment/no-crash only unless a later table-model plan
  explicitly accepts whole-table selection semantics.
- Parent/child and nested-editor claims stay `Improves` / `Related` until exact
  #5947/#4842 proof exists.

## 19. Pass Schedule And Pass-State Ledger

| Pass                                                 | Status   | Evidence added                                                                                                                                                                                                                                                                                         | Plan delta                                                                                                                                                 | Open issues                                                                                                  | Next owner                       |
| ---------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| 1. Current-state read and initial score              | complete | Prior plan, live `plite-dom`/`plite-react` source, ledgers, Lexical and ProseMirror first read                                                                                                                                                                                                         | Created this plan at score `0.59`                                                                                                                          | No issue discovery yet                                                                                       | ClawSweeper                      |
| 2. Related issue discovery pass                      | complete | `gitcrawl threads` for #5947/#4842/#5867/#5826/#5538/#5568/#3497/#5171/#5107/#5711/#5806/#2558; clusters 1/3/14/20; coverage matrix rows; fork dossier append                                                                                                                                          | Routed remaining candidates and raised score to `0.66`                                                                                                     | Full ledger scan still required                                                                              | `plite-ralplan`                  |
| 3. Issue-ledger pass                                 | complete | Full `docs/plite-issues` stack; live ledger, gitcrawl clusters, macro clusters, package impact, requirements, benchmark map, test-candidate maps, current coverage/dossier                                                                                                                             | Found missing singleton/test-candidate rows and raised score to `0.70`                                                                                     | Newly surfaced gaps need focused ClawSweeper sync                                                            | `clawsweeper`                    |
| 3b. Focused ledger-gap ClawSweeper pass              | complete | `gitcrawl threads` for #5690/#5689/#4995/#5632/#5559/#3909/#3893/#5550/#5551/#5524/#5924; coverage matrix rows; fork dossier focused gap section                                                                                                                                                       | Synced related/non-claimed rows and raised score to `0.73`                                                                                                 | Intent/boundary decision brief still pending                                                                 | `plite-ralplan`                  |
| 4. Intent/boundary and decision brief pass           | complete | Live `Plate repo root` DOM editor, selection controller, selection reconciler, and editing-kernel policy owners                                                                                                                                                                                          | Rejected public API expansion, locked owner split, and raised score to `0.78`                                                                              | Ecosystem/test synthesis still pending                                                                       | `plite-ralplan`                  |
| 5. Research and ecosystem synthesis pass             | complete | Lexical harvest report; ProseMirror `webtest-selection`, `webtest-composition`, `webtest-nodeview`, `webtest-markview`, `webtest-view`, view source; Tiptap focus/readOnly/renderer/clipboard tests                                                                                                    | Added ecosystem synthesis and exact steal/reject table; raised score to `0.84`                                                                             | Performance/DX/migration/regression pressure still pending                                                   | `plite-ralplan`                  |
| 6. Performance/DX/migration/regression pressure pass | complete | Live Plite selection runtime, selection export/import, selector fanout, commit metadata, Plate editor shape, Plate Yjs, slate-yjs cursor overlays, performance/react/tdd skill pressure, `docs/solutions/performance-issues/2026-05-08-dom-selection-bridges-must-stay-cheap-on-selectionchange.md` | Added hot-path constraints, React/effect boundaries, migration contract, and vertical TDD proof rows; raised score to `0.88`                               | Maintainer objections still need direct answers                                                              | `steelman-pass` if needed        |
| 7. Maintainer objection ledger                       | complete | `steelman-pass`; strict `DOMEditor` helper source; runtime import/export source; focus/listener runtime source; issue coverage matrix; Lexical harvest table rows                                                                                                                                      | Answered objections, revised strict-vs-runtime failure policy, kept scroll extension boundary, and raised score to `0.90`                                  | High-risk pass still needs to challenge final browser/runtime risk                                           | `high-risk-deliberate-pass`      |
| 8. High-risk deliberate pass                         | complete | `high-risk-deliberate-pass`; live selectionchange runtime; import/export controller; selection runtime/controller contracts; richtext outside-to-inside browser row; editable-void internal/nested rows; table containment rows; Plite scripts                                                      | Added blast radius, three-scenario pre-mortem, expanded proof plan, rollback/remediation rules, and raised score to `0.91`                                 | Ecosystem maintainer pass still needs to challenge copied ProseMirror/Lexical/Tiptap behavior before closure | `plite-ralplan`                  |
| 9. Ecosystem maintainer pass                         | complete | ProseMirror selection/view/nodeview tests and `domcoords` source; Lexical harvester report/apply ledger; Tiptap focus command source                                                                                                                                                                   | Narrowed borrowed behavior, deferred coords unless touched, rejected ProseMirror/Tiptap APIs and Lexical whole-table semantics, and raised score to `0.92` | Revision pass must fold final accepted constraints into implementation phases and closure gates              | `plite-ralplan`                  |
| 10. Revision pass                                    | complete | Live Plite unit/browser proof inventory; current package scripts; accepted ecosystem/high-risk constraints                                                                                                                                                                                          | Rewrote implementation phases, command gates, issue-sync checklist, and final closure gates; raised score to `0.93`                                        | Ledgers and PR reference still need final accounting                                                         | `plite-ralplan`                  |
| 11. Issue sync accounting pass                       | complete | Coverage matrix rows for #5711/#3634/#4961; fork dossier revision accounting section; live ledger and PR reference no-op decisions                                                                                                                                                                     | Synchronized the concrete claim/no-claim map and raised score to `0.94`                                                                                    | Closure score not run; completion file still pending                                                         | `plite-ralplan`                  |
| 12. Closure score and final gates                    | complete | Final scorecard, pass ledger, issue-sync state, implementation phases, and exact `Plate repo root` command gates                                                                                                                                                                                         | Closed the plan at score `0.94`; completion file can flip to `done`                                                                                        | None                                                                                                         | `ralph` execution when requested |

## 20. Plan Deltas From Review

Pass 1 created this plan and deliberately scoped it as the second DOM selection
lane, not the already-closed 2026-05-06 boundary proof.

Pass 2 split the remaining issue surface:

- nested-editor DOM point ownership remains `plite-dom` plus focused
  `plite-react` browser proof;
- focus and scroll rows are shared DOM focus plus React selection timing;
- #3497 and #5568 are mostly React runtime pressure, not pure DOM bridge work;
- #2558 is not claimed without a separate table selection model decision.

Pass 3 proved the first DOM/focus candidate set was not comprehensive enough.
The important additions are #5690/#5689 gesture-selection rows, #4995
scroll-selection customization, #5632/#5559 inline/void selection behavior,
#3909/#3893 focus/target ownership, and #5550/#5551/#5924 non-claim boundary
rows. No new fixed claim is legal; the next owner is a focused ClawSweeper sync
pass.

Pass 3b applied that focused sync. Coverage and dossier now explicitly classify
#5690/#5689/#4995/#5632/#5559/#3909/#3893/#5524 as related pressure and
#5550/#5551/#5924 as not claimed. The next owner is Plite Ralplan intent,
boundary, and decision-brief cleanup.

Pass 4 locked the architecture boundary. The plan keeps public API unchanged,
uses a private DOM classification result as the bridge into current React
selection policy, routes #5524 to core caret/navigation unless DOM proof says
otherwise, and leaves #5550/#5551/#5924 outside raw Plite closure.

Pass 5 completed ecosystem synthesis. The plan now says exactly what to steal:
ProseMirror's DOM selection import/export, fallback, BR-hack, selectionchange,
focus/scroll, and coordinate rows; Lexical's issue-shaped browser proof style;
and Tiptap's focus timing pressure. It also says what not to steal: ProseMirror
NodeView APIs, Tiptap command APIs, Lexical product/editor-state internals,
clipboard rows for this lane, and jsdom composition as mobile/IME proof.

Pass 6 completed performance, React DX, migration, and regression pressure. The
private bridge still wins, but it is constrained: no per-event object churn in
selectionchange, no public hook/API expansion, no raw DOM range leakage to
Plate/Yjs/collaboration, and no issue claim without vertical TDD plus browser
proof. The reusable hot-path rule is captured in
`docs/solutions/performance-issues/2026-05-08-dom-selection-bridges-must-stay-cheap-on-selectionchange.md`.

Pass 7 completed the maintainer objection ledger. The plan keeps the private
bridge, but now explicitly preserves strict `DOMEditor` helper errors for direct
callers, limits fail-closed behavior to runtime event/focus paths, preserves
`scrollSelectionIntoView` as the app extension point, keeps #5947/#4842 below
fixed without exact proof, and rejects whole-table selection as a hidden raw
Plite requirement.

Pass 8 completed high-risk deliberate review. The plan stays alive, but the
implementation blast radius is capped: no public API, no blanket DOM conversion
swallowing, no whole-table selection semantics, no raw mobile claims, and no new
`Fixes #...` line before exact package/browser proof passes in
`/Users/zbeyens/git/plite`. The next pass should challenge the ecosystem
borrowings before revision and issue-sync closure.

Pass 9 completed the ecosystem maintainer challenge. The plan now treats
ProseMirror, Lexical, and Tiptap as behavior/proof references only. It narrows
ProseMirror coords to a deferred coords lane unless touched, keeps Lexical table
rows containment-only, rejects ProseMirror view-desc and Tiptap command APIs,
and keeps jsdom/mobile proof confusion out of this DOM bridge plan.

Pass 10 completed revision. The implementation plan is no longer a loose owner
list: it is a vertical execution map with first proof, browser proof, claim
gate, rollback boundary, and exact `Plate repo root` command groups. The next pass
must sync the issue ledgers and PR reference against that concrete claim map.

Pass 11 completed issue-sync accounting. The issue coverage matrix now routes
#5711, #3634, and #4961 through this DOM selection/focus bridge plan instead of
the Mobile/IME macro plan. The fork dossier records the lane-level claim map:
no new fixed claims, #5947 improves-only, related rows stay related until exact
proof, and table/Web Component/structural cursor rows stay not claimed. The
live gitcrawl ledger is a generated live-field mirror, so it was intentionally
left unchanged. The PR reference was also left unchanged because this pass adds
no fixed issue claim.

Pass 12 completed closure. The score is `0.94`, no scorecard dimension is below
`0.85`, the issue-sync pass is recorded, the public API target is explicit
(`no new public API`), implementation phases have owner/proof/claim gates, and
all Plite behavior proof commands are named with
`/Users/zbeyens/git/plite` as the required workspace.

## 21. Open Questions And What Would Change The Decision

- If implementation cannot keep classification cheap on selectionchange, drop
  structured return objects from the hot path and keep only primitive reason
  codes plus debug-only expansion.
- If maintainer objections prove focus/scroll should remain app-owned, keep
  `scrollSelectionIntoView` as the app extension point and limit runtime changes
  to deterministic selection import/export.
- If React runtime identity owns more focus rows than DOM classification, split
  those rows into the React runtime lane.
- If #5947/#4842 are already covered by live browser rows not seen in pass 1,
  lower the nested-editor phase to ledger/test cleanup only.
- If focus/scroll needs browser fallback beyond `preventScroll`, add a private
  focus-scroll helper; otherwise keep it inside current focus code.
- If Lexical whole-table selection is the only way to satisfy #2558, keep #2558
  related unless the user chooses a table selection model.
- If ProseMirror coordinate rows map to a currently unsupported Plite surface,
  defer them instead of expanding this DOM bridge lane.

## 22. Implementation Phases With Owners

Execution-ready for `ralph`. Each implementation slice must land as a vertical
behavior row: unit/contract proof first, one user-path browser proof second
when the claim is browser-facing, then ledger sync. Expanding the next phase
before the current positive and negative ownership pair is green is busywork.

| Phase                                               | Owner                                                                                     | First proof                                                                                                                                                                                                                                         | Browser proof                                                                                                                                                                                                                                         | Claim gate                                                                                                                                                |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Bridge classifier boundary                       | `plite-dom` strict helpers plus `plite-react` import policy                               | `bridge.ts` strict/default helper behavior and `selection-controller-contract.ts` import/export policy. Direct `DOMEditor` callers keep throw-by-default behavior; runtime paths may use classified fail-closed import only after ownership checks. | None required before phase 2.                                                                                                                                                                                                                         | Architecture only. No issue claim.                                                                                                                        |
| 2. Foreign, stale, and app-owned DOM import         | `plite-dom` classification, consumed by `plite-react` selection controller/reconciler     | `selection-controller-contract.ts:56-260`, `selection-runtime-contract.test.ts:42-354`, `dom-repair-policy-contract.ts:9-36`, and `rendering-strategy-and-scroll.tsx:468-511,725-936` prove import/ignore/repair ownership without public hooks.    | `richtext.test.ts:3267,3366,3431,3496,3597` and `dom-coverage-boundaries.test.ts:181` prove native selection import/repair and covered-range drag behavior.                                                                                           | Claim only exact foreign/stale/app-owned rows with matching browser evidence. Keep #4789/#4984 as prior fixed floor, not this lane's new claim.           |
| 3. Parent and nested editor ownership               | `plite-dom` root/target/point classification plus `plite-react` selection controller      | `bridge.ts` and `selection-controller-contract.ts` add or retain positive nested-editor import and negative cross-editor ignore pairs.                                                                                                              | `editable-voids.test.ts:73,158,226,254,275,330` proves internal-control noise, nested editor focus, nested typing, and parent-to-nested ignore behavior.                                                                                              | #5947/#4842 stay `Improves` or `Related` unless exact repro-matching parent/child proof is added and passes.                                              |
| 4. Focus and scroll restoration                     | `plite-dom` focus helper plus `plite-react` selection export and injected scroll callback | `rendering-strategy-and-scroll.tsx:1157,1633-1655` and `app-owned-customization.tsx:386-399` prove focus shell behavior and `scrollSelectionIntoView` forwarding stays app-owned.                                                                   | `mentions.test.ts:337` covers markable inline/mention keyboard selection; add a dedicated scrollable-root/parent browser row before any exact focus-scroll issue claim. `huge-document.test.ts:21` is only a scale smoke, not scroll proof by itself. | #5867/#5826/#5538/#5568/#3497/#5537/#4961/#3634 need exact browser proof. If the proof only works through app-owned scroll code, downgrade to `Improves`. |
| 5. Shadow DOM event range                           | `plite-dom` root/range resolution, consumed by React runtime                              | `bridge.ts` and `dom-coverage.ts` retain shadow/root conversion coverage; add an event-range contract if the browser row exposes a missing owner.                                                                                                   | `shadow-dom.test.ts:86,93,129,159,199` proves nested shadow rendering, typing, generated gauntlet, model-owned arrow movement, and newline editing.                                                                                                   | #5107 can move to exact only with a matching event-to-range proof; #5749/#4337 stay related unless their exact behavior is covered.                       |
| 6. Inline, void, table, and covered-range leftovers | `plite-react` browser examples; `slate` core only for logical caret movement              | Existing inline/void/table browser tests are the floor. Any core caret failure must move to a core model/navigation slice, not be hidden in DOM import.                                                                                             | `tables.test.ts:129,146` proves containment/triple-click/drag boundaries only. `mentions.test.ts:169-292` is Mobile/IME-adjacent and must not be cited as raw mobile proof in this lane.                                                              | #5806/#3449 may become exact only with matching inline/void proof. #2558 whole-table semantics stay out unless a separate table-model plan accepts them.  |
| 7. Ledger and PR reference sync                     | `plate-2` docs                                                                            | Coverage matrix, fork dossier, live issue ledger, and PR reference all agree on `Fixes`, `Improves`, `Related`, and `Not claimed`.                                                                                                                  | None. This is accounting, not behavior proof.                                                                                                                                                                                                         | No new `Fixes #...` line without the phase command and exact matching browser/unit evidence from `/Users/zbeyens/git/plite`.                           |

Phase rollback rules:

- If phase 1 weakens strict helper failures, stop and restore strict defaults.
- If phase 2 blocks valid user selection import, split the classifier reason
  instead of broadening ignore policy.
- If phase 4 needs app-specific scroll behavior, keep
  `scrollSelectionIntoView` as the only app extension point and downgrade the
  issue claim.
- If phase 6 needs whole-table range semantics, move it to a table-model plan.

## 23. Fast Driver Gates

Planning artifact gates:

```bash
cd /Users/zbeyens/git/plate-2
bun run completion-check -- --file .tmp/completion-checks/plite-dom-selection-focus-bridge-ralplan.md
```

Expected after closure: passes with `status: done`.

Focused Plite gates for later implementation. These must run from
`/Users/zbeyens/git/plite`; the same command text in `plate-2` proves
nothing about Plite behavior.

```bash
cd /Users/zbeyens/git/plite

# Unit/contract floor for phases 1-3.
bun test ./packages/plite-dom/test/bridge.ts ./packages/plite-dom/test/dom-coverage.ts
bun test ./packages/plite-react/test/selection-controller-contract.ts ./packages/plite-react/test/selection-reconciler-contract.ts ./packages/plite-react/test/selection-runtime-contract.test.ts ./packages/plite-react/test/dom-repair-policy-contract.ts

# App-owned scroll and rendering-strategy guard for phases 2 and 4.
bun test ./packages/plite-react/test/rendering-strategy-and-scroll.tsx ./packages/plite-react/test/app-owned-customization.tsx

# Browser rows for native selection import, repair, movement, and triple-click.
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/richtext.test.ts --project=chromium --grep "selectionchange|programmatic DOM selection|repair trace|browser word movement|browser line extension|triple click"

# Browser rows for editable void internal controls and nested editor ownership.
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "outer editor selection|ArrowLeft inside editable void|selectionchange noise|nested editor|parent selection"

# Browser rows for shadow-root range and movement behavior.
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/shadow-dom.test.ts --project=chromium

# Browser rows for containment-only table behavior.
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/tables.test.ts --project=chromium --grep "triple-clicking the last table cell|dragging from a table cell"

# Browser rows for covered-range placeholders and inline mention movement.
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium --grep "native drag selection|model-backed covered ranges"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/mentions.test.ts --project=chromium --grep "arrow keys select mentions"

# Fast repo gate after the touched slice is green.
bun check
```

`bun check:full` is reserved for release-quality browser closure. Raw mobile
claims remain out of this lane unless `bun test:mobile-device-proof:raw` runs
on a real-device lane with artifacts.

## 23b. Issue Sync Accounting Checklist

Pass 11 result:

- `docs/plite-issues/gitcrawl-live-open-ledger.md`: cluster rows reflect this
  lane's exact fixed/improved/related/not-claimed classification.
  No-op: the file is a generated live-field mirror and has no claim columns.
- `docs/plite/ledgers/issue-coverage-matrix.md`: every exact claim appears
  as `Fixes #...`; every pressure row stays under related/improves/not claimed.
  Updated: #5711, #3634, and #4961 now point at this DOM selection/focus plan.
- `docs/plite/ledgers/fork-issue-dossier.md`: one self-contained section
  for each reviewed related issue family, not one giant vague blob.
  Updated: added the revision issue-sync accounting section for this lane.
- `docs/plite/references/pr-description.md`: fixed issue counts, proof
  references, and not-claimed release gates match the coverage matrix.
  No-op: no new fixed issue claims were added by this pass.
- This plan's issue table and phase gates agree with the ledgers. If they do
  not, the ledgers win only after the plan is patched with the reason.
  Done: plan phases match the ledger claim policy.

## 24. Final User-Review Handoff Outline

Execution handoff:

- exact accepted private architecture;
- exact public API changes, ideally none;
- issue matrix with fixed/improved/related/not-claimed rows;
- external tests copied or deliberately rejected;
- implementation phases for `ralph`;
- exact `Plate repo root` verification commands.

## 25. Final Completion Gates

Completion gates met:

- score `>= 0.92`;
- no dimension below `0.85`;
- ClawSweeper related-issue pass complete;
- issue-sync accounting pass complete across live ledger, coverage matrix, fork
  dossier, and PR reference;
- ecosystem strategy complete for Lexical, ProseMirror, and any Tiptap evidence
  used;
- public API target is explicit: no new public API for this lane;
- implementation phases have owner, first proof, browser proof, and claim gate;
- relevant `Plate repo root` commands are named and tied to the phases above;
- final closure pass records the accepted score and flips the completion file
  only when no scheduled pass remains.

## 26. Ralph Execution Ledger

### Slice 1 - Bridge Classifier Boundary - 2026-05-08

Status: complete.

Owner:

- `packages/plite-dom/test/bridge.ts`
- `packages/plite-react/test/selection-controller-contract.ts`

Scope:

- Preserve strict `DOMEditor` helper failures for direct callers.
- Prove runtime import policy can fail closed after ownership checks.
- Do not add public DOM classifier, hook, or API.
- Do not add new `Fixes #...` claims.

Driver gates:

- `bun test ./packages/plite-dom/test/bridge.ts ./packages/plite-dom/test/dom-coverage.ts`
- `bun test ./packages/plite-react/test/selection-controller-contract.ts ./packages/plite-react/test/selection-reconciler-contract.ts ./packages/plite-react/test/selection-runtime-contract.test.ts ./packages/plite-react/test/dom-repair-policy-contract.ts`

Reference docs:

- No issue-claim or PR-reference change expected for phase 1 unless tests expose
  a broader behavior claim.

Result:

- Added Plite proof that empty DOM selections still throw for strict direct
  callers but return `null` with `suppressThrow: true`.
- Patched `DOMEditor.toPliteRange` to honor `suppressThrow` for missing DOM
  endpoints.
- Verified in `Plate repo root`:
  - `bun lint:fix`
  - `bun test ./packages/plite-dom/test/bridge.ts ./packages/plite-dom/test/dom-coverage.ts`
  - `bun test ./packages/plite-react/test/selection-controller-contract.ts ./packages/plite-react/test/selection-reconciler-contract.ts ./packages/plite-react/test/selection-runtime-contract.test.ts ./packages/plite-react/test/dom-repair-policy-contract.ts`
  - `bun check`

### Slice 2 - Fail-Closed DOM Import - 2026-05-08

Status: complete.

Owner:

- `packages/plite-react/src/editable/selection-controller.ts`
- `packages/plite-react/test/selection-controller-contract.ts`

Scope:

- Keep model-owned selection preference when editor-owned DOM endpoints cannot
  resolve to a Plite range.
- Clear model preference only when runtime import can actually import a Plite
  range.
- No public API change and no issue claim promotion.

Driver gates:

- `bun test ./packages/plite-react/test/selection-controller-contract.ts ./packages/plite-react/test/selection-reconciler-contract.ts ./packages/plite-react/test/selection-runtime-contract.test.ts ./packages/plite-react/test/dom-repair-policy-contract.ts`

Result:

- Added controller proof that editor-owned DOM selections with unresolved Plite
  ranges keep model selection preference.
- Patched selection import preparation so native selectionchange only clears
  model preference when the DOM selection is editor-owned and resolves to a
  Plite range.
- Verified in `Plate repo root`:
  - `bun lint:fix`
  - `bun test ./packages/plite-dom/test/bridge.ts ./packages/plite-dom/test/dom-coverage.ts`
  - `bun test ./packages/plite-react/test/selection-controller-contract.ts ./packages/plite-react/test/selection-reconciler-contract.ts ./packages/plite-react/test/selection-runtime-contract.test.ts ./packages/plite-react/test/dom-repair-policy-contract.ts`
  - `bun check`

Reference docs:

- No issue claim, PR reference, coverage matrix, or fork dossier change. This
  slice hardens private runtime policy only.

Next:

- Slice 3: parent and nested editor ownership.
- Keep #5947/#4842 below fixed unless exact repro-matching proof lands.

### Slice 3 - Parent And Nested Editor Ownership - 2026-05-08

Status: complete.

Owner:

- `packages/plite-dom/src/plugin/dom-editor.ts`
- `packages/plite-dom/test/bridge.ts`
- `apps/www/tests/plite-browser/donor/examples/editable-voids.test.ts`

Scope:

- Keep nested editor DOM nodes owned by the nested editor.
- Prevent parent editor `toPliteNode` from returning nested Plite nodes through
  global DOM weak maps.
- Keep #5947/#4842 below fixed unless exact repro-matching proof lands.

Result:

- Added package proof that parent `hasDOMNode` rejects nested editor text,
  nested editor import still works, parent strict import throws, and parent
  suppressed import returns `null`.
- Patched `DOMEditor.toPliteNode` so global DOM-to-Plite weak-map hits are
  accepted only when the DOM node belongs to the current editor root.
- Verified in `Plate repo root`:
  - `bun lint:fix`
  - `bun test ./packages/plite-dom/test/bridge.ts ./packages/plite-dom/test/dom-coverage.ts`
  - `bun test ./packages/plite-react/test/selection-controller-contract.ts ./packages/plite-react/test/selection-reconciler-contract.ts ./packages/plite-react/test/selection-runtime-contract.test.ts ./packages/plite-react/test/dom-repair-policy-contract.ts`
  - `PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "outer editor selection|ArrowLeft inside editable void|selectionchange noise|nested editor|parent selection"`
  - `bun check`

Reference docs:

- No issue claim, PR reference, coverage matrix, or fork dossier change. The
  slice strengthens nested ownership proof but does not exact-close #5947 or
  #4842.

Next:

- Slice 4: focus and scroll restoration.
- Preserve `scrollSelectionIntoView` as the app extension point.

### Slice 4 - Focus And Scroll Restoration - 2026-05-08

Status: complete.

Owner:

- `packages/plite-react/test/rendering-strategy-and-scroll.tsx`
- `packages/plite-react/test/app-owned-customization.tsx`
- `packages/plite-react/test/selection-controller-contract.ts`
- `packages/plite-react/test/selection-runtime-contract.test.ts`

Scope:

- Preserve `scrollSelectionIntoView` as the app-owned extension point.
- Keep focus-scroll issue rows related unless exact browser proof lands.
- Avoid new public DOM/focus API.

Result:

- Verified existing package contracts for scroll forwarding, app-owned
  customization, and selection controller/runtime behavior without code changes.
- Kept #5867/#5826/#5538/#5568/#3497/#5537/#4961 as related/non-claimed rows.
- Verified in `Plate repo root`:
  - `bun test ./packages/plite-react/test/rendering-strategy-and-scroll.tsx ./packages/plite-react/test/app-owned-customization.tsx`
  - `bun test ./packages/plite-react/test/selection-controller-contract.ts ./packages/plite-react/test/selection-runtime-contract.test.ts`

Reference docs:

- No issue claim, PR reference, coverage matrix, or fork dossier change. Phase 4
  proves the extension boundary only.

Next:

- Slice 5: shadow DOM event range proof.
- Keep #5107/#5749/#4337 related unless exact event-to-range proof lands.

### Slice 5 - Shadow DOM Event Range - 2026-05-08

Status: complete.

Owner:

- `apps/www/tests/plite-browser/donor/examples/shadow-dom.test.ts`

Scope:

- Prove existing shadow DOM behavior in the browser.
- Keep #5107/#5749/#4337 related unless exact event-to-range closure proof
  lands.
- Avoid new public DOM classifier or shadow DOM API.

Result:

- Verified nested shadow rendering, nested shadow editing, generated shadow DOM
  typing gauntlet, model-owned ArrowLeft movement, and newline editing rows
  without code changes.
- Kept #5107/#5749/#4337 related.
- Verified in `Plate repo root`:
  - `PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/shadow-dom.test.ts --project=chromium`

Reference docs:

- No issue claim, PR reference, coverage matrix, or fork dossier change. Phase 5
  confirms existing shadow DOM coverage only.

Next:

- Slice 6: inline, void, table, and covered-range leftovers.
- Keep table proof containment-only and reject raw mobile claims.

### Slice 6 - Inline, Void, Table, And Covered-Range Leftovers - 2026-05-08

Status: complete.

Owner:

- `apps/www/tests/plite-browser/donor/examples/tables.test.ts`
- `apps/www/tests/plite-browser/donor/examples/dom-coverage-boundaries.test.ts`
- `apps/www/tests/plite-browser/donor/examples/mentions.test.ts`

Scope:

- Prove containment-only table behavior, covered-range placeholder behavior, and
  inline mention movement.
- Keep whole-table selection and table model semantics out of scope.
- Do not cite mention movement as raw mobile proof.

Result:

- Verified table containment rows: triple-clicking the last table cell selects
  only that cell text, and dragging from a table cell toward trailing text does
  not select the intro paragraph.
- Verified covered-range rows: model-backed covered ranges and native drag
  selection across a boundary placeholder.
- Verified mention atomic arrow-key movement from both sides.
- Verified in `Plate repo root`:
  - `PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/tables.test.ts --project=chromium --grep "triple-clicking the last table cell|dragging from a table cell"`
  - `PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/dom-coverage-boundaries.test.ts --project=chromium --grep "native drag selection|model-backed covered ranges"`
  - `PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/mentions.test.ts --project=chromium --grep "arrow keys select mentions"`

Reference docs:

- No issue claim, PR reference, coverage matrix, or fork dossier change. Phase 6
  is containment and movement proof only.

Next:

- Slice 7: docs/reference sync and final verification.
- Run final `bun check` in `Plate repo root`, then mark this execution lane done if
  no scheduled pass remains.

### Slice 7 - Docs Reference Sync And Final Verification - 2026-05-08

Status: complete.

Owner:

- `docs/plans/2026-05-08-plite-dom-selection-focus-bridge-ralplan.md`
- `.tmp/completion-checks/plite-dom-selection-focus-bridge-ralplan.md`
- `active goal state`
- `Plate repo root`

Scope:

- Sync the execution ledger and completion state with slices 4-6.
- Keep issue claims unchanged because the last slices were proof-only.
- Run the final fast Plite gate from the sibling repo.

Result:

- Synced this plan and completion state with phase 4 focus/scroll, phase 5
  shadow DOM, and phase 6 table/covered-range/mention proof.
- No issue claim, PR reference, coverage matrix, or fork dossier update was
  needed: no new fixed issue claim was added.
- Verified in `Plate repo root`:
  - `bun lint:fix`
  - `bun check`

Final execution result:

- Done. The DOM selection/focus bridge execution lane has no scheduled pass
  remaining.
