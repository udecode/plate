# Slate v2 Focus Ownership Cleanup

Objective:
Close a user-review-ready Slate Plan for Slate v2 read-only/editable focus
ownership in comment mode. First prove the live edit-mode blur bug, then choose
the best long-term architecture/DX target for fixing it without hiding another
runtime hack in an example or React component.

Goal plan:
docs/plans/2026-05-26-slate-v2-focus-ownership-cleanup.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- slate-plan

Completion threshold:
- Score >= 0.92 with no dimension below 0.85.
- Every pass row is complete or intentionally skipped with evidence.
- Related issue and reference ledgers are synchronized for any claimed issue,
  behavior, public API, or non-claim.
- Browser proof exists for the comment-mode focus/blur behavior in the live
  `.tmp/slate-v2` workspace.
- Execution mode, if accepted, starts with a failing Playwright regression for
  edit-mode click -> header click retaining focus.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-focus-ownership-cleanup.md`
  passes before this planning goal can close.

Verification surface:
- Planning artifact: this file plus relevant source/research/issue ledger reads
  in `plate-2`.
- Live bug proof: `http://localhost:3100/examples/comment-mode` through
  Playwright browsers using `.tmp/slate-v2/node_modules`.
- Live source grounding: `.tmp/slate-v2/packages/slate-react/**` and
  `.tmp/slate-v2/playwright/integration/examples/comment-mode.test.ts`.
- Execution proof, after user acceptance: focused comment-mode Playwright test,
  focused `slate-react` typecheck/test, lint fix, then the repo-defined Slate v2
  check gate required by the accepted plan.

Constraints:
- Planning mode only in this activation. No `.tmp/slate-v2` implementation or
  test patches.
- Prefer the long-term runtime ownership fix over a local route/example patch.
- Keep raw Slate unopinionated; Plate owns product-level toolbar APIs.
- Public DX must stay boring: normal editor usage, no special comment-mode
  ceremony unless the behavior truly needs an explicit API.

Boundaries:
- Editable planning scope: `docs/plans/**`, `docs/research/**`,
  `docs/slate-issues/**`, `docs/slate-v2/ledgers/**`,
  `docs/slate-v2/references/**`.
- Source reads are allowed in `.tmp/slate-v2`; implementation writes are not
  allowed until a ready plan is accepted.
- This plan targets `slate-react` focus/selection runtime behavior, not Plate
  comment UI, not Yjs adapter implementation, and not a rewrite of comment
  anchors.

Blocked condition:
- Block only if live browser proof, live source reads, and issue-ledger reads
  become unavailable for three consecutive plan activations. Current lane is
  not blocked.

Slate Plan lane state:
- slate_plan_lane_status: complete
- current_pass: closure-score-and-final-gates
- current_pass_status: complete
- next_pass: none
- next_action: user can accept this plan to start execution mode
- final_handoff_status: complete

Current verdict:
- verdict: current fix is dirty
- confidence: high for bug existence, issue-accounting policy, and behavior
  boundary; high for runtime lifecycle placement, fanout shape, and maintainer
  objection handling; high for high-risk proof boundaries and ecosystem
  maintainer pressure; high for revised architecture direction and final
  planning closure
- keep / cut / revise call: cut the read-only-only document listener from
  `EditableDOMRoot`; replace it with a central focus-boundary runtime owner
- reason: the live edit-mode editor keeps DOM focus after outside header click,
  while the existing patch only handles read-only roots and manually edits DOM
  focus, DOM selection, and model selection from a component effect

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked.
- Do not call `update_goal(status: complete)` until every Slate Plan completion
  gate is satisfied and `check-complete` passes.
- This file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | complete | `.agents/skills/slate-plan/SKILL.md` read; planning mode forbids Slate v2 source/test patches |
| Active goal checked or created | complete | active goal names this focus-ownership cleanup lane and keeps closure pending |
| Source of truth read before edits | complete | live route, `.tmp/slate-v2` source, current plan template, research notes, and issue ledgers read |
| `docs/solutions` checked for existing-code work | complete | focus/selection solution notes from 2026-05-20, 2026-05-21, 2026-05-03, 2026-04-24 read |
| Live `.tmp/slate-v2` grounding needed for current-state claims | complete | browser proof and source line reads recorded below |

Work Checklist:
- [x] Objective includes lane outcome, pass schedule, one-pass-per-activation
      policy, completion threshold, verification surface, constraints,
      boundaries, and blocked condition.
- [x] One-pass-per-activation policy respected: this activation completed only
      closure score and final gates.
- [x] Live source grounding recorded for current implementation claims.
- [x] Issue ledger / ClawSweeper sync applied or skipped with concrete evidence.
- [x] Research and ecosystem synthesis complete for every external system used
      as evidence.
- [x] Intent/boundary record and decision brief complete.
- [x] Scorecard recorded with evidence; numeric threshold met and final gates
      closed.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [x] Slate maintainer objection ledger complete for the runtime ownership
      change.
- [x] Verification workspace gate recorded for the live bug claim.
- [x] TDD used for behavior/proof changes in execution mode, or marked N/A:
      N/A for planning-only; execution entry still requires a failing
      Playwright row before the runtime fix.
- [x] Browser proof captured for the first browser-surface claim.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Close remaining plan passes and run `check-complete` | score is 0.92, every dimension is at least 0.91, all pass rows are complete, and the checker is the final command for this closure pass |
| Slate v2 source/runtime/browser claim | yes | Record live `.tmp/slate-v2` source and browser proof | current-state and research rows record live browser/source proof; no implementation proof is claimed in planning mode |
| Issue ledger or PR reference changed | complete | Sync ledger/reference rows after revision pass | `gitcrawl-v2-sync-ledger.md`, `issue-coverage-matrix.md`, `fork-issue-dossier.md`, and `pr-description.md` all preserve zero new fixed/improved claims |
| Autoreview for uncommitted implementation changes | N/A | N/A for planning-only; required in execution mode if code changes | no `.tmp/slate-v2` implementation patch exists in this planning lane |
| Final user-review handoff | yes | Emit final handoff only after closure pass | final handoff outline and accepted-plan execution entry are recorded below |
| Goal plan complete | yes | Run `check-complete` | `[autogoal] complete: docs/plans/2026-05-26-slate-v2-focus-ownership-cleanup.md` |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | live bug proof, source ownership read, dirty verdict, initial score | related issue discovery |
| Related issue discovery | complete | ledger/cache-first classification: direct rows #3893 and #5004; guardrail fixed rows #4376/#5171; related multi-view row #5537; Android/readOnly row #5034 stays mobile-only | issue-ledger pass |
| Issue-ledger pass | complete | no-new-fix sync added to issue coverage matrix, gitcrawl v2 sync ledger, fork issue dossier, and PR reference | intent/boundary pass |
| Intent/boundary and decision brief | complete | behavior law, ownership boundaries, option rejection, and execution proof contract hardened | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | ProseMirror, Lexical, React 19.2, Tiptap, Yjs, selection-bridge solution note, and current Slate React runtime owners refreshed | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | listener fanout, repeated-unit budget, native behavior proof, public API minimalism, migration backbone, RED test order, and simplicity cuts hardened | objection ledger |
| Slate maintainer objection ledger | complete | strongest objections converted into acceptance conditions: machinery, native focus semantics, selection preservation, multi-root registry, raw Slate scope, command controls, document ownership, performance, read-only selection, and collab/history non-ops | high-risk pass |
| High-risk deliberate mode | complete | pre-mortem expanded into kill switches and exact proof rows for WebKit selection, toolbar command selection, internal controls, multi-root/content-root focus, Shadow DOM/document ownership, IME blur, history/collab non-ops, and test oracle false positives | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | ProseMirror, Lexical, Tiptap, React, Plate, Yjs, and Slate v2 maintainer lenses confirm the same target: one internal DOM/focus runtime owner, no raw-Slate product helper, no history/collab side effects, and conservative content-root claims | revision pass |
| Revision pass | complete | stale pass wording, TDD planning status, target-owner labels, scorecard, and final execution queue normalized without changing the architecture decision | issue sync accounting |
| Issue sync accounting | complete | four accounting artifacts confirm zero new fixed/improved claims, #3893/#5004 remain related proof gates, #4376/#5171 stay exact fixed guardrails, #5034 remains mobile/raw-device only, and #5826/#5538/#5568 statuses are unchanged | closure score and final gates |
| Closure score and final gates | complete | score threshold met, all pass rows closed, issue/reference sync closed, browser/source planning proof recorded, autoreview marked N/A for planning-only, and final handoff entry recorded | final handoff |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.92 | Revision pass locks native runtime ownership: no broad React state/effects, no per-block handlers, and React only projects the final focus state |
| Slate-close unopinionated DX | 0.20 | 0.92 | Public `Editable` stays unchanged; the raw command-preservation contract remains normal DOM `preventDefault` |
| Plate and slate-yjs migration backbone | 0.15 | 0.91 | Plate product helpers and slate-yjs adapters are non-goals; required substrate proof is local-only blur with no ops/history/collab export |
| Regression-proof testing strategy | 0.20 | 0.92 | Revision pass keeps the RED-first execution queue and blocks closure on Add Comment, WebKit/Firefox, counters, follow-up typing, and local-only side effects |
| Research evidence completeness | 0.15 | 0.94 | Current source, issue ledgers, ProseMirror, Lexical, Tiptap, React 19.2, Yjs, Plate, and Slate v2 evidence are aligned |
| shadcn-style composability and minimalism | 0.10 | 0.92 | Generic public helpers, data attrs, and policy objects remain cut; the target must delete the dirty component listener |
| Weighted total | 1.00 | 0.92 | Complete for planning; score threshold, issue-sync, and final gates are closed |

Source-backed architecture north star:
- target shape: one Slate React focus-boundary runtime owner classifies outside
  interactions for all editable roots, read-only and editable, then delegates to
  the same reconciler policy for DOM focus, DOM selection, and model selection.
- source evidence: `EditableDOMRoot` owns a read-only-only document listener at
  `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:349`; runtime
  focus/mouse ownership already flows through
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-focus-mouse-events.ts:27`;
  focus state mutation already lives in
  `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts:227`;
  root runtime/global lifecycle already owns document-level selection/drag
  listeners in `.tmp/slate-v2/packages/slate-react/src/editable/runtime-root-lifecycle.ts:7`;
  `useEditableRootRuntime` wires event runtime plus lifecycle at
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:265`
  and `.tmp/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:331`;
  provider focus subscriptions already project `ReactEditor.isFocused` from
  document `focusin` / `focusout` in
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:613`.
- rejected drift: do not patch comment-mode route blur manually, do not add a
  Plate-style toolbar API to raw Slate, and do not duplicate outside-click logic
  per example.
- migration posture: one runtime editor with many views/content roots remains
  the right backbone for shared focus, selection, history, undo/redo,
  normalization, and collaboration.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| outside click blur | no new public API for the base behavior | clicking page chrome/header blurs any active Slate Editable like a normal editor | behavior fix only; no app migration | live comment-mode bug proves missing default | keep internal |
| external command controls | preserve via standard `onPointerDown={event => event.preventDefault()}` unless issue pass proves a first-class helper is needed | toolbars can keep selection for commands without custom root APIs | existing Slate convention; comment button already uses it | `comment-mode.tsx` Add Comment needs selection retention | keep minimal |
| optional helper | defer `useSlateSelectionGuard` / data attr until evidence proves repeated raw-Slate need | avoid turning raw Slate into Plate UI policy | can add later without breaking behavior | no broad evidence yet | reject for now |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| outside interaction | `EditableDOMRoot` read-only layout effect | focus-boundary controller registered from `useEditableRootRuntime` / root global lifecycle | read-only-only behavior, per-component DOM surgery | `editable.tsx:349-409`, `runtime-root-engine.ts:265-335`, `runtime-root-lifecycle.ts:7-35` | revise |
| focus/blur reconciliation | `selection-reconciler.ts` | expose/internalize a blur-clear action used by native blur and outside interaction | divergent DOM/model selection clearing | `selection-reconciler.ts:227-304` | keep owner |
| mouse/focus event pipeline | `runtime-focus-mouse-events.ts` | classify internal editor root, nested editable/internal control, external command control, and inert outside target | split focus decisions across React effects and handlers | `runtime-focus-mouse-events.ts:27-254`, `input-controller.ts:112-146` | extend |
| global root lifecycle | `runtime-root-lifecycle.ts` plus provider focus subscriptions | document listener registration belongs in runtime/global lifecycle, not `EditableDOMRoot` JSX | duplicated document listeners per component surface | `runtime-root-lifecycle.ts:7-35`, `use-slate-runtime.tsx:613-642` | target owner |
| side-effect policy | commit tags and metadata | focus/DOM-selection/scroll effects are explicit local policy, not accidental focus hacks | collaboration/history focus pollution | `selection-side-effect-policy.ts:15-30`, Yjs research | keep owner |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| `Editable` | unchanged for users | behavior follows DOM editor expectations by default | no app-level listener per example | bug is default editor behavior, not app behavior | keep API |
| comment-mode Add Comment | `onPointerDown(event.preventDefault())` remains acceptable | explicit external command preservation, not blur behavior | no re-render subscription needed | selection button test already depends on preservation | keep |
| runtime focus boundary | internal hook/controller | one owner per document/runtime root group | native listener owns classification; React projects state | research favors centralized DOM bridge ownership; current source already has runtime lifecycle and focus subscriptions | target |

Plate migration-backbone target:
| Pressure | Slate substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| comment UI/toolbars | preserve selection for external commands, blur on inert outside click | Plate can wrap toolbar controls with preventDefault/helper | raw Slate toolbar design system | comment-mode button behavior | keep raw minimal |
| content roots/synced blocks | shared focus/selection/history across root views | Plate renders richer block UI over raw Slate runtime views | one editor per block | multi-root memory/source notes favor one runtime editor | keep one runtime |

slate-yjs migration-backbone target:
| Pressure | Slate substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| remote/local focus | local-only focus boundary decisions, deterministic model ops | adapter ignores local blur/focus side effects while syncing document ops | Yjs adapter in this plan | prior collab-readiness notes require side-effect policy hooks | keep local-only |

Intent / boundary record:
- intent: make Slate React focus/selection behavior feel like a normal editor
  in comment mode and future same-runtime content-root embeddings.
- outcome: a user-review-ready plan that starts execution with a failing
  edit-mode blur test, then fixes ownership centrally without changing public
  `Editable` DX.
- in-scope:
  - inert outside pointer/focus transitions from editable and read-only roots;
  - `document.activeElement`, `ReactEditor.isFocused`, native selection, and
    Slate model-selection policy;
  - external command control selection preservation;
  - internal native controls and nested editables;
  - cross-root/multi-view guardrails for one runtime editor.
- out-of-scope:
  - comment anchor storage, comment body state, or markdown review metadata;
  - Plate toolbar components, product UI helpers, or shadcn command wrappers;
  - Yjs adapter implementation or remote cursor protocol;
  - making ordinary void descendants traversable;
  - Android/raw-device readOnly closure.
- behavior law:
  1. Editable root -> inert page chrome: DOM focus must leave the editor, native
     caret/selection must stop presenting as editor-owned, `ReactEditor.isFocused`
     must become false, and editable model selection must remain inactive but
     restorable unless a later explicit policy says otherwise.
  2. Read-only root -> inert page chrome: DOM focus must leave the root and
     read-only presentation/native selection may clear, but this cannot weaken
     editable blur/refocus preservation guaranteed by #4376/#5171.
  3. Editor root -> external command control: `event.defaultPrevented` remains
     the default raw-Slate preservation contract; commands may keep the editor
     selection without a new public Slate toolbar API.
  4. Editor root -> internal native control/nested editable: target
     classification must use existing internal-control policy and must not steal
     native focus or import the wrong selection.
  5. Same-runtime content roots: focus changes are local browser side effects,
     not document operations; history, selection restore, and collaboration
     substrate stay in one runtime editor.
- decision boundaries:
  - raw Slate owns default browser-editor focus correctness;
  - `slate-react` owns focus timing, React event lifecycle, and runtime
    document listeners;
  - `slate-dom` owns DOM point/path translation and low-level selection bridge
    mechanics when needed;
  - Plate owns opinionated controls, styling, and product selection helpers;
  - examples teach the raw contract, not workaround ownership.
- unresolved user-decision points: none.

Decision brief:
- principles:
  - browser truth beats React focus flags;
  - one owner for DOM focus/selection transitions;
  - default editor behavior must not require example code;
  - editable blur preserves model selection unless an explicit transaction
    policy says otherwise;
  - public API stays small until repeated raw-Slate evidence demands otherwise.
- top drivers:
  - live comment-mode activeElement bug;
  - `#3893` / `#5004` focus-state proof gates;
  - `#4376` / `#5171` model-selection guardrails;
  - multi-root/content-root one-runtime direction;
  - command controls must keep selection without turning raw Slate into Plate.
- viable options:
  1. Keep read-only-only patch and add another editable component-level patch.
  2. Move outside-click handling into a centralized Slate React focus-boundary
     runtime controller, using existing selection reconciler/internal-target
     policy.
  3. Expose a new public toolbar/focus API now.
  4. Push it into comment-mode example code.
- chosen option: option 2.
- why it wins: it fixes read-only and editable through one owner, respects the
  existing runtime event/reconciler architecture, keeps `Editable` API boring,
  and gives future content roots the same focus boundary instead of another
  app-owned workaround.
- rejected alternatives:
  - option 1 keeps the dirty split and duplicates document listeners;
  - option 3 leaks product toolbar policy into raw Slate before evidence proves
    a public primitive is needed;
  - option 4 treats a package behavior bug as an example bug.
- consequences: execution must touch runtime focus ownership and tests, not only
  the comment-mode example. It must preserve #4376/#5171 and Add Comment
  selection behavior while fixing editable outside blur.
- follow-ups: run final issue/reference sync accounting, then closure score and
  final gates.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| #3893 | direct related, no fixed claim yet | clicking ordinary external UI must update Slate focus state | exact title is HTML button focus state; current live bug is header click, so button proof is still needed before closure | comment-mode header proof plus ordinary button proof | synced in coverage matrix, gitcrawl ledger, fork dossier, PR reference | related text only |
| #5004 | direct related, no fixed claim yet | focus lifecycle must not stay true or fire when it should not | issue is spurious focus semantics; current bug is stale focus after outside click | focus/blur event counter proof plus activeElement proof | synced in coverage matrix, gitcrawl ledger, fork dossier, PR reference | related text only |
| #4376 / cluster 20 | fixed guardrail, must not regress | WebKit blur/refocus must preserve inactive model selection and follow-up typing | central outside-click code can accidentally clear model selection | rerun existing WebKit document-state proof plus comment-mode follow-up typing | synced as unchanged fixed guardrail | no new claim line |
| #5171 / cluster 20 | fixed guardrail, must not regress | Firefox unfocused editor updates must not import external selection | outside interaction code can accidentally conflate external DOM selection with editor model selection | rerun existing Firefox document-state proof after centralization | synced as unchanged fixed guardrail | no new claim line |
| #5537 / cluster 7 | related multi-view pressure, no fixed claim yet | multi-editor/programmatic focus needs view-local focus/input proof | content roots and comment-mode both expose focus ownership pressure | later multi-root/content-root focus proof | synced as related multi-view pressure | related text only |
| #5034 | adjacent mobile/readOnly, no claim | Android readOnly selection-null stays mobile/IME proof, not this web outside-click closure | this plan touches readOnly selection presentation but has no raw-device Android proof | leave to mobile/device lane; do not claim | synced as mobile/readOnly unchanged | none |
| #5826/#5538/#5568 | adjacent focus/scroll/initialization guardrails | focus-boundary work must not restore stale selection or scroll unexpectedly | same runtime area, different exact repros | existing huge-document/focus contract proof plus targeted rows if touched | synced as preserved statuses | none unless behavior changes |

Issue-ledger sync status:
- ClawSweeper related-issue discovery: complete, ledger/cache-first; no broad live GitHub search used
- generated live gitcrawl rows read: complete for #3893, #5004, #5034, #5171, #5537, #4376 and clusters 7/20
- manual v2 sync ledger update: complete; `docs/slate-issues/gitcrawl-v2-sync-ledger.md` records this plan as no new fixed/improved claims
- fork issue dossier update: complete; `docs/slate-v2/ledgers/fork-issue-dossier.md` records the surface review
- issue coverage matrix update: complete; `docs/slate-v2/ledgers/issue-coverage-matrix.md` records related/non-claim policy
- PR description sync: complete; `docs/slate-v2/references/pr-description.md` records zero new fixed/improved claims
- final accounting pass: complete; the revised plan adds no claim-changing
  behavior, API, source, or proof beyond the already-synced focus-boundary
  planning target.

Final issue/reference sync accounting:
| Artifact | Evidence read | Accounting result |
|----------|---------------|-------------------|
| `docs/slate-issues/gitcrawl-v2-sync-ledger.md` | comment-mode focus-boundary planning sync states zero fixed/improved claims and lists #3893, #5004, #4376/#5171, #5537, #5034, and #5826/#5538/#5568 policy | no edit needed |
| `docs/slate-v2/ledgers/issue-coverage-matrix.md` | focus cleanup planning section says no fixed/improved claims, #3893/#5004 are related, #4376/#5171 stay exact guardrails, #5034 remains mobile-only, and focus/scroll statuses are preserved | no edit needed |
| `docs/slate-v2/ledgers/fork-issue-dossier.md` | fork dossier section mirrors the same decisions and explicitly says PR counts stay unchanged | no edit needed |
| `docs/slate-v2/references/pr-description.md` | PR description includes the comment-mode planning sync in the no-new-claims summary with `0` new exact fixed/improved claims | no edit needed |

Final accounting verdict:
- new fixed issue claims: `0`
- new improved issue claims: `0`
- direct related rows kept as related: `#3893`, `#5004`
- fixed guardrails kept exact and unchanged: `#4376`, `#5171`
- adjacent/mobile/focus-scroll statuses unchanged: `#5034`, `#5826`,
  `#5538`, `#5568`
- PR fixed/improved counts unchanged.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| ProseMirror | `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md` | one view-owned DOM observer/selection import/export authority | split DOM bridge logic | centralized DOM bridge owner | schema-specific view model or plugin complexity | one focus-boundary runtime owner next to selection import/export | use |
| Lexical | `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md` | update tags encode history, DOM selection, focus, scroll, and collaboration policy | accidental side effects | explicit side-effect metadata | class nodes, `$` helpers, command-heavy app policy | local focus/selection policy path using commit tags/metadata | use selectively |
| React 19.2 | `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md` | React projects external-store state; native hot path stays outside broad renders | effect spaghetti | external-store/runtime boundary | component-owned focus hacks | runtime first, component thin | use |
| Tiptap | `docs/research/entities/tiptap.md` | product-layer focus/menu helpers over ProseMirror primitives | raw engine UI sprawl | product DX pressure only | copying Tiptap focus helpers into raw Slate core | keep raw Slate substrate; Plate can productize helpers | reject as engine owner |
| Yjs bindings | `docs/research/sources/editor-architecture/yjs-collaboration-bindings.md` | collaboration imports carry metadata so remote/local side effects do not steal focus | remote sync polluting local focus/history | local-only side-effect tags and awareness outside document commits | legacy wrapper mutation | focus-boundary decisions stay local browser effects, not document ops | use |
| Slate solution notes | `docs/solutions/performance-issues/2026-05-08-dom-selection-bridges-must-stay-cheap-on-selectionchange.md` | hot DOM selection path stays primitive/private | rich per-event allocations and public classifier leaks | private finite classification, runtime-root listeners | public bridge API | cheap internal focus/selection classifier | use |

Ecosystem maintainer pressure pass:
| Maintainer lens | Would accept | Would reject | Plan consequence | Verdict |
|-----------------|--------------|--------------|------------------|---------|
| ProseMirror maintainer | one view/runtime-owned DOM bridge with transaction/local-state separation | app commands reading DOM selection directly or Slate copying plugin/view complexity | put outside focus boundary beside selection import/export and prove focus blur is not a document operation | passes with constraint |
| Lexical maintainer | update metadata/tags for focus, DOM selection, scroll, composition, history, and collaboration policy | class nodes, `$` helper culture, dispatch-command UI API, or a full DOM reconciler copy | use existing commit metadata vocabulary; do not expose a new public command/focus API | passes with constraint |
| Tiptap maintainer | product wrappers for focus/menu/comment controls at Plate/app level | raw Slate owning toolbar UI policy because one example needs it | keep `preventDefault` as raw contract; let Plate add ergonomic wrappers later if repeated evidence appears | passes |
| React maintainer | a native runtime listener as the external-system boundary and narrow external-store focus projection | component layout-effect spaghetti, per-root React state, or rerendering editor content on document pointerdown | keep listener/controller internal to root runtime/global lifecycle; React only subscribes to final focus state | passes |
| Plate maintainer | default raw Slate correctness plus optional product-layer wrappers later | forcing every Plate plugin/example to carry blur workaround code | fix default blur in `slate-react`; leave Plate API work out of this plan | passes |
| Yjs maintainer | focus/blur as local browser state outside document commits, undo, and remote export | local inert blur producing operations, history entries, awareness churn, focus steal, or scroll on remote import | add execution proof for zero writes/history/collab side effects on inert blur | passes with required proof |
| Slate v2 maintainer | one-runtime/many-views architecture using state/tx and runtime-owned DOM shells | one editor per synced block, route-local workarounds, or raw core product UI | keep synced/content-root claims conservative until same-runtime root proof exists | passes with honesty gate |

Ecosystem pass deltas:
- Keep the controller internal; no new `Editable` prop, data attribute, or
  toolbar helper for default blur.
- Keep issue claims conservative: this plan fixes comment-mode focus ownership
  only after execution proof, not the whole synced-block/content-root story.
- Do not copy Tiptap product helpers into raw Slate. Plate can productize the
  `preventDefault` command-preservation pattern later.
- Do not require a current Plate or slate-yjs adapter before this plan is
  user-review-ready. The required proof is substrate-level: local focus side
  effects do not create document writes, history entries, or collaboration
  exports.
- Add execution proof that inert blur creates zero operations and does not
  pollute history/collaboration before any fixed/improved issue claim.

Revision pass audit:
| Surface | Audit result | Action |
|---------|--------------|--------|
| lane state | previous pass was complete and next runnable pass was revision | moved current pass to `revision-pass`; next pass is issue-sync accounting |
| architecture decision | all pressure passes converge on one internal Slate React runtime owner | no architecture churn; keep central focus-boundary controller |
| public API | no evidence forces a raw-Slate toolbar/helper/data-attr API | keep public `Editable` unchanged and preserve `preventDefault` command contract |
| owner labels | a few rows still carried stale owner wording after the owner was decided | normalized target owner labels without changing scope |
| score threshold | evidence now supports the numeric threshold, but not closure | raised total to 0.92 and kept lane pending because issue-sync/final gates remain open |
| TDD status | planning mode touched no behavior code, but execution must start RED | marked planning TDD N/A while preserving RED-first execution as a hard entry criterion |
| issue claims | no new fixed/improved claim is justified before implementation proof | next pass must confirm ledgers/reference still say no new fixed/improved claims |
| content roots / synced blocks | architecture helps the future story, but proof is not in this plan | keep as migration pressure only; no synced-block fixed claim |

Revised execution queue:
| Order | Step | Must prove | Stop if |
|-------|------|------------|---------|
| 1 | add RED Playwright row for edit-mode click -> header click | current bug fails before runtime code changes | test passes before the fix or checks only `activeElement` |
| 2 | move outside focus boundary into runtime/global lifecycle owner | editable and read-only roots use one internal owner | implementation adds public API, route workaround, or per-root component listener |
| 3 | preserve command/internal-target classification | Add Comment and internal controls keep expected focus/selection behavior | `preventDefault` command path loses selection |
| 4 | prove local-only side effects | no document writes, history pollution, or collaboration export from inert blur | blur creates ops/history/collab effects |
| 5 | remove dirty component path | `EditableDOMRoot` no longer contains read-only-only outside pointer DOM surgery | dirty listener remains as fallback |

Revision pass deltas:
- The architecture decision did not change. The right fix is still a central
  internal runtime owner.
- The score now meets the numeric threshold, but closure is still illegal
  because issue/reference accounting and final gates are open.
- Planning TDD is marked N/A only because no implementation changed; execution
  still starts with a failing browser regression.
- The plan now has one unambiguous next owner: final issue/reference sync
  accounting.

Live source refresh:
| Owner | Current source shape | Plan consequence | Evidence | Verdict |
|-------|----------------------|------------------|----------|---------|
| `EditableDOMRoot` | read-only-only outside pointer listener blurs active child, clears DOM selection, and clears model selection from a layout effect | delete this path during execution; it is the dirty fix | `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:349-409` | cut |
| `useEditableRootRuntime` | composes selection import/export, repair, event runtime, ref binding, event bindings, and global lifecycle | outside focus boundary belongs here or in a small sibling consumed here | `.tmp/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:92-347` | target |
| `runtime-root-lifecycle` | already registers document-level `selectionchange` and drag lifecycle once through root runtime wiring | add outside-focus listener ownership here if the fanout budget is one per runtime/document | `.tmp/slate-v2/packages/slate-react/src/editable/runtime-root-lifecycle.ts:7-35` | target |
| `runtime-focus-mouse-events` | React focus/mouse events already classify focus/mouse intent and delegate to reconciler | outside pointer/focus boundary should share the same classification/reconciler concepts | `.tmp/slate-v2/packages/slate-react/src/editable/runtime-focus-mouse-events.ts:27-254` | extend |
| `input-controller` | internal target classifier already recognizes nested editables and internal native controls | reuse this so void/internal controls do not get treated as inert page chrome | `.tmp/slate-v2/packages/slate-react/src/editable/input-controller.ts:112-146` | reuse |
| `selection-reconciler` | `applyEditableBlur` owns `IS_FOCUSED.delete(editor)` and WebKit DOM-selection cleanup | outside blur must call into this policy rather than duplicating focus mutation | `.tmp/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts:227-304` | reuse |
| provider focus subscription | `useSlateRuntime` listens to document `focusin` / `focusout` and projects `ReactEditor.isFocused` | fixing `IS_FOCUSED` centrally fixes the visible blinking-cursor/stale-focus signal | `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx:613-642` | keep |
| side-effect policy | commit tags/metadata suppress DOM selection, focus, and scroll side effects | collaboration/history-safe local focus behavior already has the right metadata vocabulary | `.tmp/slate-v2/packages/slate-react/src/editable/selection-side-effect-policy.ts:15-30` | keep |

Performance / DX / migration / regression / simplicity pressure pass:
| Lens | Pressure question | Decision | Evidence | Plan delta |
|------|-------------------|----------|----------|------------|
| React/Vercel | Can this avoid component-effect spaghetti and repeated global listeners? | yes only if execution uses one root-runtime document registry/controller, not a listener in `EditableDOMRoot` or every example | `client-event-listeners`, `effect-subscription-budget`, `runtime-root-lifecycle.ts:7-35` | listener owner is root runtime/global lifecycle |
| performance-oracle | What is the complexity of outside pointer/focus classification? | target O(1) active-root classification plus DOM `closest`/containment checks; no scan over all document blocks | live source has root refs and internal target classifiers | pressure pass forbids all-root scanning in hot pointer/focus path |
| performance | What is the repeated unit and budget? | repeated block/leaf budget is zero new DOM nodes, zero new handlers, zero effects, zero subscriptions; root/view mount adds one registry entry | repeated-unit and event-delegation rules | root registry size is tracked, not block count |
| React 19.2 | Which primitive applies? | external-store projection already exists; visible typing/selection/focus stays urgent; `Activity`/transition/deferred UI are not the editor body fix | React 19 runtime proof and `useSlateRuntime` focus subscription | no React concurrency feature is used as a blur fix |
| DX | Does app code need ceremony? | no public API for default blur; only external command controls keep using normal `event.preventDefault()` | behavior law and comment-mode Add Comment pressure | no `SelectionGuard`, no data attr, no Plate-style helper in raw Slate |
| migration | Does this help content roots/synced blocks? | yes: one runtime editor, many views, shared history/selection; focus side effects are local browser state | memory lines for one-runtime architecture and source root runtime | one-editor-per-block remains rejected |
| regression | What must tests prove first? | RED edit-mode header blur test, then read-only Add Comment, read-only blur, follow-up typing/refocus, focus event counters, WebKit/Firefox guardrails | #3893/#5004/#4376/#5171 ledger rows | execution test order is fixed |
| simplicity | Is this overbuilt? | acceptable only as a tiny internal controller with a registry and calls into existing policy; reject generic public policy objects and route-local helpers | code-simplicity lens and live dirty component effect | implementation phase must remove more code than it adds to `EditableDOMRoot` |

Runtime fanout budget:
| Budget | Target | Reject | Proof owner |
|--------|--------|--------|-------------|
| document listeners | one listener family per document/runtime group for outside pointer/focus boundary | one listener per `EditableDOMRoot`, per comment route, or per block/content root | source review plus listener-count assertion if feasible |
| repeated block/leaf unit | zero new handlers, effects, subscriptions, DOM nodes, or React state reads | any block renderer participating in blur ownership | code review and browser stress proof |
| root/view unit | one registry entry on mount/unmount, storing root element, editor/view owner, readOnly mode, and reconciler callback | broad React store subscription or snapshot read on every pointerdown | focused source review |
| hot outside pointer path | cheap defaultPrevented check, target-inside-current-root check, internal-control/nested-editor check, then inert outside transition | all-root DOM scan, rich allocated result objects, imported foreign DOM selection | Playwright plus targeted unit/contract tests |
| React projection | only focused/focusVersion changes when focus ownership changes | rerendering editor content or comment UI on every document pointerdown | React Performance Tracks if suspicious |

Native behavior and regression proof contract:
| Behavior | Required state after execution | Proof route | Status |
|----------|-------------------------------|-------------|--------|
| editable outside click | activeElement leaves `#comment-mode-document`; `ReactEditor.isFocused` false; follow-up typing ignored until refocus | new RED Playwright row, then GREEN proof in Chromium/Firefox/WebKit | pending execution |
| editable inactive model selection | model selection remains restorable after inert blur unless an explicit commit policy says otherwise | focused browser assertion plus #4376/#5171 guardrail tests | pending execution |
| read-only selection comment | selected read-only text can still click Add Comment and create comment from selection | existing Add Comment Playwright row kept green | covered, must keep |
| read-only outside click | read-only activeElement/native presentation clear without weakening editable model preservation | existing read-only blur test moved from dirty component path to runtime path | covered, must move |
| external command control | `event.defaultPrevented` prevents selection loss for commands; no new toolbar API | Add Comment/button preservation proof | pending execution |
| nested editable/internal control | internal inputs/buttons/nested editables are not treated as inert page chrome | runtime/input-controller tests plus void/internal-control browser row if touched | pending execution |
| focus events | #3893/#5004 style focus lifecycle changes fire once and end in the right state | event-counter/assertion row in comment-mode or focused runtime test | pending execution |
| collaboration/history | local blur does not create document ops, history entries, or remote-sync side effects | operation/history counter in focused contract or browser debug hook | pending execution |

Simplicity cuts:
| Candidate | Keep / cut | Reason |
|-----------|------------|--------|
| `EditableDOMRoot` read-only outside listener | cut | dirty duplicate owner and misses editable mode |
| comment-mode route workaround | cut | package behavior bug, not app behavior |
| public toolbar/focus helper now | cut | repeated raw-Slate evidence not proven; Plate can productize later |
| generic focus policy object | cut | too much API for a blur boundary; use commit metadata already present |
| internal root focus-boundary controller | keep | single deep internal module hides browser weirdness behind unchanged `Editable` DX |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Slate v2 target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| edit-mode outside click | clicking header/page chrome blurs editor | activeElement leaves `#comment-mode-document`; native selection becomes inactive/empty; model selection preservation follows #4376/#5171 policy | new Playwright test first in execution | slate-react | missing |
| read-only text selection | user can select text and add comment | native selection preserved through Add Comment button | existing Playwright test | slate-react/comment-mode | covered, must keep |
| read-only outside click | outside click blurs read-only root | activeElement leaves `#comment-mode`; native/model selection clear | existing Playwright test | slate-react | covered by dirty fix, must move |
| refocus typing | typing after blur does not mutate editor until user refocuses it | follow-up typing proves focus ownership | new Playwright assertion | slate-react | missing |
| multi-root/content-root | root views behave like one document | cross-root focus and selection do not fork history | later content-root/synced-block proof | slate-react | pending |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| comment-mode edit root | click editor, click header | Chromium, Firefox, WebKit | live Playwright script against localhost:3100 | currently fails: activeElement remains `comment-mode-document` | reproduced |
| comment-mode read-only root | select text, Add Comment | Chromium, Firefox, WebKit | existing Playwright test | selection preserved and comment added | covered |
| outside inert click | click header/body after editor focus | Chromium, Firefox, WebKit | new RED test in execution | editor not focused, follow-up typing ignored | pending |
| toolbar command | click preserved external command | Chromium, Firefox, WebKit | existing/new Playwright proof | command sees selection | pending |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| edit-mode comment editor keeps focus after header click | `.tmp/slate-v2` live app via localhost:3100 | node_repl Playwright script loading `@playwright/test` from `.tmp/slate-v2/node_modules` | Chromium, Firefox, WebKit all left `document.activeElement.id === "comment-mode-document"` after header click | current-state pass |
| read-only outside-click handling is read-only-only | `.tmp/slate-v2` source | `nl -ba .tmp/slate-v2/packages/slate-react/src/components/editable.tsx | sed -n '349,409p'` | listener returns unless `readOnly` and manually blurs/clears selection | current-state pass |
| focus/blur already has runtime owner | `.tmp/slate-v2` source | `nl -ba .tmp/slate-v2/packages/slate-react/src/editable/runtime-focus-mouse-events.ts | sed -n '27,254p'` | focus/mouse runtime delegates to reconciler | current-state pass |
| root runtime already wires event and global lifecycle owners | `.tmp/slate-v2` source | `nl -ba .tmp/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts | sed -n '92,347p'` | event runtime, selection import/export, repair, and `useEditableRootGlobalLifecycle` are composed in one root runtime | research/source pass |
| global lifecycle is existing document-listener owner | `.tmp/slate-v2` source | `nl -ba .tmp/slate-v2/packages/slate-react/src/editable/runtime-root-lifecycle.ts | sed -n '1,35p'` | document `selectionchange` and drag lifecycle registration already belongs outside JSX | research/source pass |
| provider focus state is projected from document focus events | `.tmp/slate-v2` source | `nl -ba .tmp/slate-v2/packages/slate-react/src/hooks/use-slate-runtime.tsx | sed -n '613,642p'` | `focusin` / `focusout` update `ReactEditor.isFocused` projections and versions | research/source pass |
| internal target classifier exists | `.tmp/slate-v2` source | `nl -ba .tmp/slate-v2/packages/slate-react/src/editable/input-controller.ts | sed -n '112,146p'` | nested editables and internal native controls can be reused instead of reclassified ad hoc | research/source pass |
| comment-mode existing proof surface | `.tmp/slate-v2` source/tests | `nl -ba .tmp/slate-v2/playwright/integration/examples/comment-mode.test.ts | sed -n '1,228p'` | read-only pointer selection/Add Comment, read-only outside blur, document/comment/read-only write counters already exist | high-risk pass |
| editable blur guardrail proof surface | `.tmp/slate-v2` tests | `nl -ba .tmp/slate-v2/playwright/integration/examples/document-state.test.ts | sed -n '59,140p'` | focused editor blur preserves model selection and unfocused updates do not import external selection | high-risk pass |
| content-root/multi-root guardrail proof surface | `.tmp/slate-v2` tests | `nl -ba .tmp/slate-v2/packages/slate-react/test/content-root-navigation-contract.test.ts | sed -n '157,351p'` and `nl -ba .tmp/slate-v2/playwright/integration/examples/multi-root-document.test.ts | sed -n '141,280p'` | same-runtime content-root navigation and multi-root undo/follow-up typing are existing guardrails | high-risk pass |
| IME blur guardrail proof surface | `.tmp/slate-v2` tests | `nl -ba .tmp/slate-v2/playwright/integration/examples/placeholder.test.ts | sed -n '100,159p'` | blur fires while IME composition is active | high-risk pass |

Autoreview workspace gate:
| Reviewed patch owner | Cwd | Command | Result | Notes |
|----------------------|-----|---------|--------|-------|
| none in this activation | N/A | N/A | N/A | planning-only; execution mode must run local autoreview if it patches `.tmp/slate-v2` |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | yes | applied | `client-event-listeners`, rerender, and transient-value rules reject repeated global listeners and state-driven focus effects | one root-runtime document registry/controller |
| performance-oracle | yes | applied | hot path must be bounded and primitive; no all-block or all-root scan on pointer/focus | O(1) active-root classification target |
| performance | yes | applied | repeated-unit, event-delegation, effect-subscription, INP, memory/DOM, React 19 runtime, and native-behavior proof rows apply | budget and native proof tables added |
| tdd | yes | applied for planning, pending execution | execution must start with one failing browser test, not bulk imagined tests | RED edit-mode blur row named first |
| shadcn | partial | applied as negative lens | raw Slate should not expose design-system-specific controls | no public toolbar API, helper, or data attr yet |
| react-useeffect | yes | applied | browser subscriptions are valid effects, but interaction logic does not belong in component layout effects | move native ownership out of component into runtime lifecycle |
| code-simplicity-reviewer | yes | applied | the fix is acceptable only if it deletes the dirty component listener and avoids a generic public policy surface | tiny internal controller; implementation should net-remove `EditableDOMRoot` complexity |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| WebKit selection clearing regresses | moving read-only logic from component to runtime | ghost selection or lost selection | preserve WebKit DOM-presentation cleanup while keeping editable model selection inactive/restorable | `document-state.test.ts:59-96`, WebKit comment-mode edit/read-only rows | accepted proof |
| Firefox unfocused import regresses | outside focus transition touches selection import | external input selection gets imported into the unfocused editor | keep unfocused DOM selection import fail-closed | `document-state.test.ts:98-140` and existing Firefox row | accepted proof |
| toolbar selection breaks | outside-click controller treats command buttons as inert outside | Add Comment loses selection | honor `event.defaultPrevented`/preserve contract before inert outside classification | `comment-mode.test.ts:58-97`, `comment-mode.test.ts:135-228` | accepted proof |
| internal controls break | nested editable/void/input target misclassified | clicking void/internal controls blurs root or imports wrong selection | reuse `isInteractiveInternalTarget` / `isNativeInternalControlTarget`; add focused row if touched | `input-controller.ts:112-173`, targeted runtime test | accepted proof |
| multi-root focus forks | controller only handles one root | content roots fight over focus/selection/history | register per document/runtime group and keep claim scoped to comment-mode unless same-runtime root proof passes | `content-root-navigation-contract.test.ts:157-351`, `multi-root-document.test.ts:141-280` | accepted proof |
| Shadow DOM or owner document mismatch | controller binds to global `document` or wrong root | iframe/shadow/portal editors leak listeners or miss blur | bind through owner document/window from root runtime lifecycle | `runtime-root-lifecycle.ts:7-35` | accepted proof |
| IME/composition blur regresses | outside focus logic runs while composition is active | composition blur event does not fire, duplicate fires, or text commit is swallowed | keep IME blur row separate from pointer blur and do not short-circuit native blur events | `placeholder.test.ts:100-159` | accepted proof |
| history/collab pollution | inert blur clears model selection through `editor.update` | undo stack, document writes, or remote export changes from a local focus side effect | inert editable blur must avoid document ops; read-only command proof keeps `read-only-writes` at `0` | `comment-mode.test.ts:94-96`, `comment-mode.tsx:720-760`, side-effect policy | accepted proof |
| false positive browser test | test only checks activeElement or only checks selection text | bug appears fixed while follow-up typing/history still broken | assert activeElement, `ReactEditor.isFocused` signal if exposed, native selection, model selection, write counters, and follow-up typing | new RED row must fail before code and pass after runtime fix | accepted proof |

High-risk kill switches:
| Kill switch | Required response |
|-------------|-------------------|
| implementation requires a new public `Editable` prop, toolbar helper, or data attr to fix default blur | stop execution and revise plan; default blur must stay internal |
| editable outside click can pass only by clearing editable model selection | stop and redesign; this violates #4376/#5171 preservation |
| Add Comment loses selected read-only text after controller move | stop and fix command-preservation classification before claiming progress |
| inert blur creates document operations, increments comment-mode document writes, or changes history/collab export | stop and make focus transition local-only |
| controller needs all-block/all-root DOM scanning on pointerdown | stop and redesign registry; hot path must stay bounded |
| same-runtime content roots fail basic focus/history after controller move | do not claim content-root/synced-block readiness; keep claim limited or fix with separate proof |
| WebKit/Firefox guardrails fail after the runtime move | stop and fix before any issue/reference sync promotion |
| RED test does not fail before implementation | rewrite the test; it is not proving the reported bug |

Slate maintainer objection ledger:
| Change | Objection | Tradeoff | Evidence | Migration/docs/proof answer | Verdict |
|--------|-----------|----------|----------|-----------------------------|---------|
| central outside-interaction runtime owner | "This is too much machinery for blur." | small internal machinery replaces duplicated read-only/editable hacks | live editable bug plus `EditableDOMRoot` read-only-only listener | acceptable only as a tiny internal controller that deletes the component listener and keeps public API unchanged | accepted with constraint |
| pointer/focus boundary | "Slate should wait for native blur, not synthesize focus state from pointerdown." | native blur is ideal, but the browser-visible bug proves it is not firing the state change Slate needs | live route leaves `document.activeElement.id === "comment-mode-document"` after header click | controller must model inert outside interaction as local focus-boundary state, not as a document operation or fake user callback | answered |
| editable model selection | "Clearing selection on outside click will regress #4376/#5171." | native presentation should stop, model selection should remain inactive/restorable for editable roots | #4376/#5171 guardrail rows and memory proof say follow-up typing / unfocused update matter | execution must assert focus false and follow-up typing ignored without blanket editable model-selection clearing | accepted condition |
| read-only presentation | "Read-only selection and Add Comment already had bugs; don't break selection again." | read-only text selection is a user feature, not an editor-owned caret | current Add Comment proof and read-only outside-click coverage | selection-preserving command row must remain green; inert outside click can clear presentation only after command controls opt out with `preventDefault` | accepted condition |
| document/runtime registry | "A document-level registry can mis-own multi-root/content-root focus." | one runtime registry is the only shape that scales to same-document content roots | root runtime/global lifecycle source and one-runtime architecture guidance | registry entries must be root/view-scoped, cleaned on unmount, and tested with same-runtime roots before any content-root fixed claim | accepted condition |
| raw Slate public API | "Apps still need to remember `preventDefault`; maybe add `SelectionGuard`." | adding a toolbar helper now would make raw Slate own product UI policy | Tiptap classified as product layer; Plate owns opinionated controls | keep `preventDefault` as the raw contract; revisit helper only after repeated raw-Slate issue evidence, not for this bug | reject helper now |
| command/control classification | "External command controls and internal controls are easy to misclassify." | classification is necessary, but should reuse existing internals | `input-controller.ts:112-146` already recognizes nested editables/internal controls | use existing classifier; add proof for Add Comment and internal controls if touched | accepted condition |
| Shadow DOM / document ownership | "A document listener can be wrong for shadow roots, iframes, or portals." | owner document matters; global `document` is too sloppy | `runtime-root-lifecycle.ts` gets document from `ReactEditor.getWindow(editor)` | listener must bind to the root owner's document/window and clean up with root runtime lifecycle | accepted condition |
| performance | "Pointerdown on the whole document is a hot path." | one cheap listener is fine; rich scans are not | performance pass budget and selection bridge note | hot path must early-return on `defaultPrevented` / inside-root targets and avoid all-block/all-root DOM scans | accepted condition |
| history/collaboration | "Blur should not create undo steps or remote sync noise." | focus is local browser state; model changes must stay explicit | Yjs research and selection-side-effect policy | execution must prove no document op/history entry for inert blur, or record a blocker before any collab claim | accepted condition |

Maintainer acceptance conditions:
| Condition | Required proof before execution close | Blocks final handoff if missing |
|-----------|--------------------------------------|-------------------------------|
| no public API expansion | source diff shows `Editable` call sites unchanged for default blur and no new toolbar/helper surface | yes |
| dirty listener removed | `EditableDOMRoot` no longer owns read-only-only outside pointer logic | yes |
| one runtime owner | outside focus-boundary listener is registered by root runtime/global lifecycle or a sibling consumed there | yes |
| cheap classification | no all-block scan, no rich per-event object allocation in the hot path, no repeated block handlers/effects/subscriptions | yes |
| editable blur semantics | activeElement / focus state clear, native presentation stops, editable model selection remains inactive/restorable | yes |
| read-only command selection | read-only selection plus Add Comment remains green across Chromium/Firefox/WebKit | yes |
| focus event correctness | #3893/#5004 style event/focus counters end in the right state | yes |
| guardrail preservation | #4376/#5171 follow-up typing and unfocused selection update proofs stay green | yes |
| local-only side effects | inert blur does not create document ops, history pollution, or collaboration export | yes |
| content-root honesty | do not claim synced/content-root closure until a separate same-runtime root proof exists | yes |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| read-only-only outside listener in `EditableDOMRoot` | cut | fixes one mode and leaves editable root broken | internal only | live bug + source lines | replace in execution |
| comment-mode local blur workaround | reject | treats symptom as example-owned | none | bug is generic editor behavior | do not implement |
| public `SelectionGuard` API now | reject for now | too Plate/product-shaped without repeated raw-Slate evidence | none | one route needs selection preservation | revisit after issue pass |

Plan deltas from review:
- Reclassified the current code as dirty rather than "probably fine after read-only fix."
- Added edit-mode header-click bug proof as the first evidence row.
- Moved target from component effect to central runtime focus-boundary owner.
- Kept public DX minimal; no new user API until evidence proves it.
- Refreshed ecosystem evidence: ProseMirror says one DOM bridge owner, Lexical
  says side effects need tags/metadata, React 19.2 says component effects are
  the wrong hot-path owner, Tiptap stays product-layer only, and Yjs keeps
  focus as local side effect.
- Refreshed live source evidence: the current root runtime already composes the
  event runtime, selection import/export, repair, global lifecycle, internal
  target classifier, provider focus projection, and side-effect policy needed
  for the central owner.
- Applied pressure lenses: listener fanout must be one root-runtime document
  registry/controller; repeated block/leaf budget stays zero; native behavior
  proof is mandatory; public DX stays unchanged; the implementation should
  delete the dirty component listener instead of adding another layer.
- Closed maintainer objections by converting pushback into acceptance
  conditions: tiny internal owner, no public API, editable selection
  preservation, read-only command selection, document/window ownership,
  cheap classification, local-only side effects, and no content-root fixed
  claim without separate proof.
- Added high-risk kill switches so execution must stop or narrow claims if the
  fix requires public API, clears editable model selection, breaks Add Comment,
  creates document/history/collab side effects, scans all roots, regresses
  WebKit/Firefox guardrails, or writes a RED test that does not fail first.
- Added ecosystem maintainer pressure: ProseMirror and Lexical accept the
  internal runtime-owner target, React rejects component/effect ownership,
  Tiptap and Plate keep product helpers out of raw Slate, Yjs requires local-only
  blur proof, and Slate v2 keeps synced/content-root claims conservative.
- Completed revision pass: kept the architecture unchanged, normalized stale
  target-owner wording, marked TDD N/A for planning-only while preserving RED
  execution, raised the score to 0.92, and made final issue/reference sync
  accounting the next owner.
- Completed issue-sync accounting: verified the gitcrawl sync ledger, issue
  coverage matrix, fork issue dossier, and PR description already match the
  revised plan with `0` new fixed claims and `0` new improved claims.
- Completed closure score/final gates: score threshold, pass closure,
  planning-only source/browser proof, issue/reference sync, final handoff, and
  `check-complete` gate are all satisfied for planning mode.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| should outside interaction clear model selection for editable roots or only clear focus/native selection? | Slate may need inactive selection for toolbar/state after blur | #4376/#5171 fixed claims require inactive model selection preservation; comment-mode execution should assert DOM focus/native selection clear without blanket model-selection loss | related issue pass | answered: preserve editable model selection by default |
| should preservation be only `preventDefault` or also a data attr/helper? | affects raw-Slate DX | #3893 supports default focus-state correctness; no ledger evidence yet forces a public helper for command controls | issue-ledger pass | default to `preventDefault`; helper still rejected |
| should document listener be per document, per runtime, or per root group? | affects performance and multi-root correctness | `runtime-root-lifecycle`, provider focus listeners, Vercel listener rules, and performance budget favor one document/runtime registry rather than per component | pressure pass | answered for plan: one root-runtime document registry/controller |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| RED browser test | slate-plan execution mode | add edit-mode click -> header click focus regression in `comment-mode.test.ts` | user accepts ready plan | test fails before runtime fix | focused Playwright grep |
| runtime controller | slate-plan execution mode | add a tiny internal focus-boundary controller registered from root runtime/global lifecycle; use O(1) active-root classification and existing reconciler/internal-target policy | RED test exists | read-only and editable outside clicks pass; no all-root scan or component-level listener remains | Chromium/Firefox/WebKit |
| preservation contract | slate-plan execution mode | keep Add Comment/external command selection preservation | controller passes inert outside tests | selection command tests still pass | existing Add Comment test |
| cleanup | slate-plan execution mode | remove component-level read-only listener and redundant imports | behavior green | no dirty duplicate path remains | typecheck/lint |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | `rg -n "slate_plan_lane_status: complete|current_pass: closure-score-and-final-gates|final_handoff_status: complete|Goal plan complete|Weighted total" docs/plans/2026-05-26-slate-v2-focus-ownership-cleanup.md` | closure score and final gates captured | complete |
| Slate v2 behavior check | .tmp/slate-v2 | focused Playwright comment-mode grep after execution | runtime/API/browser behavior | pending |

Final user-review handoff:
- accepted plan items: central runtime focus-boundary owner, no new public API
  yet, test-first execution.
- before / after API shape: public `Editable` unchanged; internal focus owner
  moves from component read-only effect to runtime controller.
- hard cuts: remove read-only-only document listener from `EditableDOMRoot`.
- issue claims and non-claims: no issue fixed/improved claim from this planning
  lane; #3893/#5004 stay related, #4376/#5171 stay exact guardrails, and
  PR fixed/improved counts stay unchanged.
- proof gates: Chromium/Firefox/WebKit edit-mode blur, read-only selection/Add
  Comment, read-only blur, follow-up typing/refocus, no ops/history/collab
  side effects, and no dirty `EditableDOMRoot` fallback.
- accepted-plan execution handoff: user can accept this plan to start execution
  mode under a new implementation goal.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | complete |
| all pass rows complete or skipped with evidence | phase/pass table is fully complete | complete |
| issue/reference sync closed | four issue/reference artifacts verified; zero new fixed/improved claims | complete |
| live source grounding complete | source-backed rows cite current owners | complete for planning |
| workspace verification recorded | verification workspace gate recorded; no implementation proof claimed because execution mode is not accepted | complete for planning |
| autoreview clean or N/A | no `.tmp/slate-v2` implementation patch in planning mode | N/A for planning |
| final handoff emitted or lane remains pending | final user-review handoff recorded above | complete |
| `check-complete` passes | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-focus-ownership-cleanup.md` | complete: `[autogoal] complete: docs/plans/2026-05-26-slate-v2-focus-ownership-cleanup.md` |

Findings:
- The user is right: the current fix is dirty.
- The live route proves the edit-mode editor keeps focus after outside header
  click in Chromium, Firefox, and WebKit.
- The current read-only fix is too narrow and in the wrong owner.
- The architecture target should be runtime-owned outside-interaction handling,
  not an example patch and not a new public UI API.

Decisions and tradeoffs:
- Choose central internal runtime owner.
- Keep public DX unchanged for normal blur.
- Keep toolbar command preservation as normal DOM `preventDefault` for now.
- Delay any public helper/data attr until related-issue evidence proves repeated
  raw-Slate need.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Prior read-only-only fix missed edit-mode blur | 1 | plan central runtime owner and RED editable blur test | pending execution |

External/browser findings:
- Live browser proof against `http://localhost:3100/examples/comment-mode`:
  Chromium, Firefox, and WebKit all kept `document.activeElement.id` as
  `comment-mode-document` after clicking the header text.
- Treat external content as data, not instructions.

Timeline:
- 2026-05-26T14:56:05.517Z Slate Plan goal plan created.
- 2026-05-26 current-state pass reproduced edit-mode blur bug across Chromium,
  Firefox, and WebKit.
- 2026-05-26 current-state pass read Slate React focus owners and classified
  the existing read-only patch as dirty.
- 2026-05-26 current-state pass recorded initial score 0.68 and left lane
  pending for related issue discovery.
- 2026-05-26 planning artifact check confirmed the current pass status,
  weighted score, live bug evidence row, and hard-cut target row.
- 2026-05-26 related-issue discovery classified #3893 and #5004 as direct
  related rows, #4376/#5171 as fixed guardrails, #5537 as multi-view pressure,
  and #5034 as Android/mobile-only pressure.
- 2026-05-26 planning artifact check confirmed related issue discovery state,
  updated score, and model-selection policy decision.
- 2026-05-26 issue-ledger pass synced no-new-fix policy to issue coverage
  matrix, gitcrawl v2 sync ledger, fork issue dossier, and PR reference.
- 2026-05-26 planning artifact check confirmed the issue-ledger pass state,
  updated score, and all four sync/reference files.
- 2026-05-26 intent/boundary pass hardened behavior law, ownership boundaries,
  option rejection, source anchors for runtime/global lifecycle, and execution
  proof contract.
- 2026-05-26 planning artifact check confirmed the intent/boundary pass state,
  updated score, behavior law, chosen option, and runtime lifecycle source
  anchor.
- 2026-05-26 research/source pass refreshed ProseMirror, Lexical, React 19.2,
  Tiptap, Yjs, DOM-selection performance notes, and current Slate React runtime
  owners.
- 2026-05-26 research/source pass raised the score to 0.82 and kept the lane
  pending for performance/DX/migration/regression/simplicity pressure passes.
- 2026-05-26 pressure pass applied Vercel React, performance-oracle,
  performance, TDD, shadcn-negative, react-useeffect, and code-simplicity
  lenses.
- 2026-05-26 pressure pass chose one root-runtime document registry/controller,
  added runtime fanout and native behavior proof budgets, raised the score to
  0.86, and kept the lane pending for the Slate maintainer objection ledger.
- 2026-05-26 maintainer objection pass converted the strongest objections into
  blocking acceptance conditions, raised the score to 0.88, and kept the lane
  pending for high-risk deliberate mode.
- 2026-05-26 high-risk deliberate pass grounded proof rows in current
  comment-mode, document-state, content-root, multi-root, and IME tests; added
  kill switches; raised the score to 0.90; and kept the lane pending for
  ecosystem maintainer pressure.
- 2026-05-26 ecosystem maintainer pass checked the target against ProseMirror,
  Lexical, Tiptap, React, Plate, Yjs, and Slate v2 pressure; raised the score
  to 0.91; and kept the lane pending for revision pass.
- 2026-05-26 revision pass normalized the plan without changing the target,
  marked TDD N/A for planning-only, raised the score to 0.92, and kept the
  lane pending for final issue/reference sync accounting.
- 2026-05-26 issue-sync accounting verified gitcrawl sync ledger, issue
  coverage matrix, fork issue dossier, and PR description; confirmed zero new
  fixed/improved claims; and kept the lane pending for closure score/final
  gates.
- 2026-05-26 closure score/final gates closed the planning lane, recorded the
  final user-review handoff, and passed `check-complete`.

Verification evidence:
- Playwright live proof:
  - after edit click: `activeId: "comment-mode-document"`;
  - after header click: `activeId: "comment-mode-document"`;
  - repeated in Chromium, Firefox, and WebKit.
- Source proof:
  - `editable.tsx:349-409` holds a read-only-only outside pointer listener.
  - `runtime-focus-mouse-events.ts:27-254` already owns runtime focus/mouse
    routing.
  - `selection-reconciler.ts:227-304` already owns blur/focus state mutation.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure score and final gates complete |
| Where am I going? | Waiting for user acceptance to start execution mode |
| What is the goal? | User-review-ready cleanup plan for Slate React focus ownership |
| What have I learned? | The current fix is dirty; raw Slate owns default focus correctness; Plate owns product controls; editable model selection must survive blur; component-level outside listeners are the wrong owner; performance only works with one root-runtime document registry/controller; ecosystem pressure agrees if blur stays local-only and public API stays untouched; the architecture target is stable; issue counts stay unchanged |
| What have I done? | Proved the bug, read the owners, wrote the cleanup target, classified/synced issues, hardened the behavior/ownership decision, refreshed ecosystem/live-source evidence, applied pressure budgets, closed maintainer objections, added kill switches, completed ecosystem maintainer pressure, closed revision pass, verified final issue/reference sync accounting, and closed final planning gates |

Open risks:
- Model-selection clearing semantics for read-only presentation still need exact
  execution proof so they do not violate #4376/#5171 editable preservation.
- External command preservation must not regress Add Comment selection.
- Multi-root/content-root focus behavior needs a later proof lane after this
  comment-mode cleanup target is accepted.
- Planning risk is closed. Remaining risk belongs to execution mode and must be
  handled under a new implementation goal after user acceptance.
