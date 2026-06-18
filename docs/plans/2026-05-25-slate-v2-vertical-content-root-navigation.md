# Slate v2 vertical content-root navigation

Objective:
Close the Slate Plan for vertical `ArrowUp` / `ArrowDown` navigation across
same-runtime content roots such as editable void child roots. The plan is a
delta over the already-closed void/root and mouse-unfocus work: it must not
re-litigate default void atomicity, child-root persistence, horizontal
left/right boundary navigation, or mouse unfocus. It must decide the best
long-term architecture for geometry-aware vertical movement, prove perf cost is
bounded with and without content-root nodes, and define implementation/test
gates for a later accepted execution pass.

Goal plan:
docs/plans/2026-05-25-slate-v2-vertical-content-root-navigation.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- none

Completion threshold:
- Planning closure is legal only when score >= 0.92, no dimension is below
  0.85, every scheduled pass row is complete or intentionally skipped with
  evidence, related vertical-navigation issue rows are classified, reference
  sync is current, final handoff is emitted, and
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-slate-v2-vertical-content-root-navigation.md`
  passes.
- This activation closes pass 12: closure score and final gates. Passes 1
  through 11 are already complete.
- Implementation originally waited for explicit user acceptance. The accepted
  execution pass is complete and recorded in the execution addendum.

Verification surface:
- Planning-only checks run in `plate-2`.
- Current behavior claims cite live `Plate repo root` source/tests.
- Accepted implementation proof ran from `Plate repo root` and includes focused
  Playwright vertical navigation rows, the full editable-voids Chromium route,
  relevant Slate React unit/type/lint gates, build because browser proof
  consumes package `dist`, and autoreview for non-trivial uncommitted
  implementation changes.

Constraints:
- Planning mode did not patch `Plate repo root`; the implementation patch landed
  only after explicit user acceptance.
- Preserve default void semantics as already accepted: default voids remain
  atomic.
- Preserve the existing `contentRoot: { slot: 'body' }` opt-in and
  same-runtime child-root model.
- Keep raw Slate unopinionated: no Plate-style product widget API, no form
  controls in core, no public knob unless the proof shows one is needed.
- Do not make normal editors pay DOM geometry cost when they have no mounted
  content roots or when the key is not plain `ArrowUp` / `ArrowDown`.

Boundaries:
- In scope: vertical keyboard movement across same-runtime content roots,
  visual-line boundary detection, caret rectangle/x-preservation, adjacent
  root candidate lookup, fallback behavior, Playwright proof, perf guardrails,
  and issue classification for vertical-navigation-related rows.
- Reused from previous plans: default void vs editable-island split,
  child-root persistence via `childRoots[slot]`, horizontal left/right entry and
  exit, mouse unfocus from child root to parent root, and full editable-voids
  route proof.
- Non-goals: mobile/raw-device proof in planning mode, one-editor-per-block,
  current slate-yjs adapter implementation, default void traversal, and
  implementation before user review.
- Allowed edit scope in planning mode: `docs/plans/**`,
  `docs/research/**`, `docs/slate-issues/**`,
  `docs/slate-v2/ledgers/**`, and `docs/slate-v2/references/**`.

Blocked condition:
Blocked only if the live `Plate repo root` source or issue ledgers are
unavailable after repeated attempts and no source-grounding, issue
classification, research, or plan-hardening move remains runnable.

Slate Plan lane state:
- slate_plan_lane_status: complete
- current_pass: Accepted execution closeout
- current_pass_status: complete
- next_pass: none
- next_action: none; accepted execution is implemented and verified.
- final_handoff_status: complete

Current verdict:
- verdict: revise/extend current content-root navigation with a vertical
  geometry bridge, not with block-order reuse of the horizontal code.
- confidence: 0.93 after closure/final gates
- keep / cut / revise call: keep `contentRoot`; revise navigation internals to
  add a lazy vertical axis; cut any public API knob until proof shows it is
  needed.
- reason: live source proves horizontal content-root navigation is model/order
  based and already covered. Plain up/down is currently native vertical
  selection sync, and browser-native vertical movement does not reliably cross
  separate `contenteditable` roots. ProseMirror and Lexical both confirm that
  visual movement needs view/caret geometry owned by the editor runtime, while
  Tiptap and Plate belong above raw Slate as product-DX wrappers. Pressure review
  also found a real current hot-path smell: `getContentRootNavigationTarget`
  computes owners before classifying the key. The maintainer objection pass does
  not overturn the target, but makes the acceptance bar stricter: normal in-root
  vertical movement remains native, default voids stay atomic, `contentRoot` is
  the opt-in document-flow contract, vertical geometry is adjacent-boundary-only,
  and current slate-yjs collaboration support is explicitly not claimed. The
  high-risk pass keeps that target but hardens the execution contract: classify
  before scans, require a mounted adjacent root before layout reads, never fake
  vertical movement with document-order jumps, skip stale native-selection sync
  after handled vertical transfers, and keep mobile/raw-device behavior outside
  the claim. The ecosystem maintainer pass confirms this is the right steal/cut
  line: steal ProseMirror-style view geometry, Lexical-style caret probing, and
  Tiptap/Plate wrapper ergonomics; reject nested independent editors, product
  widget APIs in core, React render-time layout, and current slate-yjs support
  claims. The revision pass freezes the user-review spec: one internal vertical
  bridge over existing `contentRoot`, no new public API, no default void
  traversal, no fake document-order fallback, no current collaboration/mobile
  overclaim, and no implementation before explicit acceptance. The issue-sync
  pass propagated that frozen wording across the manual v2 sync ledger, fork
  issue dossier, issue coverage matrix, and PR reference without adding fixed
  or improved issue claims. The closure pass confirms every scheduled pass row
  is complete, the score threshold is met with no dimension below 0.85,
  issue/reference sync is current, the final handoff is emitted, and the plan
  checker passes.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked.
- Do not call `update_goal(status: complete)` while any pass row is pending,
  in progress, revise, or blocked with a runnable next move.
- The current activation completed the closure/final-gates pass. The active
  goal may be marked complete only after the checker passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | User invoked `slate-plan`; skill read from `.agents/skills/slate-plan/SKILL.md`. |
| Active goal checked or created | yes | Initial pass created the Slate Plan lane; closure pass `get_goal` returned the matching active goal. |
| Source of truth read before edits | yes | Active goal asks to close the vertical content-root navigation plan one pass at a time, reusing already-covered child-root/mouse proof. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: planning-only pass; live source and existing plans are stronger evidence. |
| Live `Plate repo root` grounding needed for current-state claims | yes | Source/test reads recorded in current-state evidence below. |

Work Checklist:
- [x] Objective includes lane outcome, full pass schedule, one-pass-per-
      activation policy, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] One-pass-per-activation policy respected for this activation.
- [x] Live source grounding recorded for every current implementation claim in
      pass 1.
- [x] Related issue discovery classified live/open rows, coverage rows, fork
      dossier rows, sync-ledger rows, test-candidate rows, and PR-reference
      rows for the vertical content-root surface.
- [x] Issue ledger / ClawSweeper pass applied with concrete evidence in
      `docs/slate-issues/gitcrawl-v2-sync-ledger.md`,
      `docs/slate-v2/ledgers/fork-issue-dossier.md`,
      `docs/slate-v2/ledgers/issue-coverage-matrix.md`, and
      `docs/slate-v2/references/pr-description.md`.
- [x] Intent/boundary record and decision brief complete for the vertical
      content-root plan.
- [x] Research and ecosystem synthesis complete for every external system used
      as evidence, or marked N/A with reason.
- [x] Scorecard recorded with evidence; total score >= 0.92 and no dimension
      below 0.85 before closure.
- [x] Applicable implementation-skill review matrix applied or skipped with
      concrete reason.
- [x] Slate maintainer objection ledger complete for every breaking/paradigm
      change, or marked N/A with reason.
- [x] High-risk deliberate mode complete with every critical execution failure
      either turned into a proof gate or explicitly out of scope.
- [x] Ecosystem maintainer pass complete for every external system used as
      architecture evidence.
- [x] Revision pass complete with the user-review architecture spec frozen and
      stale/contradictory planning wording removed.
- [x] Issue sync accounting complete across manual sync ledger, fork dossier,
      issue coverage matrix, and PR reference.
- [x] Closure score and final gates complete: all pass rows complete, score
      threshold met, issue/reference sync audited, final handoff emitted, and
      plan checker passed.
- [x] Verification workspace gate recorded for pass-1 Slate v2 current-state
      source claims.
- [x] TDD used for behavior/proof changes with a sane test surface, or marked
      N/A with reason.
- [x] Browser proof captured for browser-surface claims, or marked N/A with
      reason.
- [x] Accepted execution completed in `Plate repo root` with red-first focused
      Playwright coverage for vertical editable-void child-root navigation.
- [x] Cheap action classification, mounted-adjacent-root geometry, stale native
      vertical sync suppression, and no-content-root no-scan proof implemented.
- [x] Full editable-voids Chromium route, relevant Slate React unit/type/lint
      gates, Biome, and `slate-react` build passed after implementation.
- [x] Autoreview ran on `Plate repo root` local changes; one unrelated page
      virtualization correctness finding was accepted and fixed, then the
      review reran clean.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run all scheduled planning passes, accepted execution gates, and final checker | complete; pass table has no pending rows, score is 0.93, execution gates passed, and checker passed after the execution addendum |
| Slate v2 source, runtime, browser, package, public API, or issue-fix claim | yes | Record live `Plate repo root` command/proof or source pointer | complete; accepted execution addendum records source/test ownership and live commands |
| Issue ledger or PR reference changed | yes | Sync relevant ledger/reference rows or record no-change reason | complete for planning issue sync; execution adds no new fixed/improved issue claim, so no ledger/reference change is required |
| Autoreview for uncommitted implementation changes | yes | Run autoreview against `Plate repo root` local changes and resolve accepted findings | complete; first run found a page-virtualization index bug, it was fixed, and rerun reported no accepted/actionable findings |
| Final user-review handoff | yes | Emit final handoff or keep pending with next pass | complete; final handoff recorded below |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-slate-v2-vertical-content-root-navigation.md` | complete; checker passed after the execution addendum |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | Live source/test reads; previous-plan reuse matrix; initial score 0.76 | related issue discovery |
| Related issue discovery | complete | Live gitcrawl row read plus coverage/fork/sync/test-candidate/PR-reference accounting for #5524, #6034, #5212, and #2072; score 0.78 | issue-ledger pass |
| Issue-ledger pass | complete | No-claim sync written to gitcrawl v2 sync ledger, fork issue dossier, issue coverage matrix, and PR reference; #5524/#6034/#5212/#2072 scope preserved | intent/boundary pass |
| Intent/boundary and decision brief | complete | Decision hardened: owner element order, keyed root storage, existing `contentRoot` slot metadata, and one-runtime/many-root stay; vertical is a lazy view/runtime bridge with no new public prop | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | React 19.2 external-store research plus local React hook source; ProseMirror view geometry and `endOfTextblock`; Lexical caret/decorator/nested-editor policy; Tiptap extension/keyboard/NodeView DX; Plate editable-void example; slate-yjs single-`sharedRoot` limitation | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | Pressure review applied React/performance/TDD/simplicity lenses; current source confirms owner scan happens before key classification and vertical remains native-only; targeted bridge/kernel unit gates passed | objection ledger |
| Slate maintainer objection ledger | complete | Maintainer objections answered for browser-owned vertical layout, DOM-geometry cost, default void semantics, public API shape, nested editors, collaboration, mouse/horizontal regressions, issue claims, and root ordering | high-risk pass |
| High-risk deliberate mode | complete | Closed the risk ledger for layout thrash, fake vertical jumps, native-sync races after handled transfers, unmounted root targets, child-root regressions, mobile overclaims, and slate-yjs collaboration overclaims; score 0.91 | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | React, ProseMirror, Lexical, Tiptap, Plate, and slate-yjs source rechecked against the high-risk execution contract; score 0.92 | revision pass |
| Revision pass | complete | Frozen user-review architecture spec: one lazy vertical `contentRoot` bridge, existing focus transfer, cheap action gate, mounted-adjacent-root geometry only, no public prop, no default void traversal, no fake fallback, and no current mobile/collaboration claim; score 0.93 | issue sync accounting |
| Issue sync accounting | complete | Revision wording synced across `docs/slate-issues/gitcrawl-v2-sync-ledger.md`, `docs/slate-v2/ledgers/fork-issue-dossier.md`, `docs/slate-v2/ledgers/issue-coverage-matrix.md`, and `docs/slate-v2/references/pr-description.md`; no new fixed/improved claims | closure score and final gates |
| Closure score and final gates | complete | Closure audit verified score threshold, no dimension below 0.85, all pass rows complete, issue/reference sync current, planning-only workspace boundary intact, final handoff emitted, and checker passed. | final handoff |
| Accepted execution pass | complete | Implemented the vertical `contentRoot` geometry bridge, perf guard, stale native vertical sync suppression, Playwright proof, review fix, package rebuild, and final checker. | goal closeout |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.93 | Revision freezes event/runtime-owned geometry only: React external-store/root selectors stay for subscriptions, no render/effect geometry state, no broad transition-wrapped editor operation path, and no delayed native-selection sync after handled transfers. |
| Slate-close unopinionated DX | 0.20 | 0.93 | The user-review spec keeps `contentRoot: { slot }` as the only public contract; all vertical policy stays internal until browser proof demonstrates real app divergence. |
| Plate and slate-yjs migration backbone | 0.15 | 0.91 | Plate gets the same raw primitive to wrap; slate-yjs remains explicitly future root-qualified adapter work; the revision refuses to smuggle collaboration support into a local selection/focus plan. |
| Regression-proof testing strategy | 0.20 | 0.93 | Revision turns the plan into executable proof law: red-first same-x Playwright rows, no-content-root no-scan/no-layout proof, stale native-sync guard, full editable-voids route, and issue-claim containment. |
| Research evidence completeness | 0.15 | 0.94 | Current-pass evidence rechecked React hooks/startTransition, ProseMirror coordinates/endOfTextblock, Lexical caret/nested composer, Tiptap extension/NodeView DX, Plate editable voids, slate-yjs cursor/shared-root paths, and live Slate v2 bridge/runtime source. |
| shadcn-style composability and minimalism | 0.10 | 0.93 | The revised spec is the minimal composable shape: one bridge, bounded helpers, existing hook/root API, no copied editor framework model, no new provider, no product UI, no nested editor default. |

Weighted score after pass 12: 0.93.

User-review architecture spec:
- authoritative decision: implement vertical content-root navigation as an
  internal Slate React/runtime bridge over the existing `contentRoot: { slot }`
  contract. The detailed tables below are evidence; this section is the short
  spec to review.
- public API: no new prop, no new editable-node type, no widening of
  `renderVoid`, no ordered `roots` array for child-flow order. Existing
  schema-declared content roots gain vertical document-flow behavior after
  implementation proof.
- behavior law: normal in-root `ArrowUp` / `ArrowDown` stays browser-native.
  Slate intercepts only collapsed plain vertical arrows at a visual content-root
  boundary with a mounted adjacent root. The target point is geometry-resolved
  near the same x. If geometry cannot resolve, fall back to native/no-op, never
  to a document-order start/end jump.
- runtime law: classify the content-root navigation action before owner scans;
  inspect only the current owner and adjacent mounted root; read DOM geometry
  only after that candidate exists; reuse `applyContentRootNavigation` for
  rooted selection/focus transfer; prevent the delayed native vertical sync from
  overwriting handled root transfers.
- compatibility law: default voids stay atomic; horizontal child-root
  navigation and mouse unfocus are proof floors; root key order remains storage
  identity while owner path defines projected document flow; vertical movement
  is local selection/focus only and emits no document operation.
- execution proof law: start with red Playwright rows for parent-to-child,
  child-to-parent-above, child-to-parent-below, wrapped-line, and empty-block
  cases; add no-content-root no-scan/no-layout proof; run the full
  editable-voids Chromium route; keep #5524 related/non-claim and #6034 exact.
- explicit non-claims: mobile/raw-device, IME/composition, structural DOM
  exclusion, Web Component selection, table-selection semantics, current
  slate-yjs collaboration support, one-editor-per-block, and independent nested
  editor default.

Revision contradiction audit:
| Check | Result |
|-------|--------|
| Public API | Single answer remains: `contentRoot: { slot }`; no public vertical navigation prop. |
| Void semantics | Single answer remains: default voids atomic; only schema-declared content roots get projected document-flow navigation. |
| Root ordering | Single answer remains: owner element path defines child-flow adjacency; `roots` record order is not document flow. |
| Fallback policy | Single answer remains: geometry/no-op/native fallback; no start/end document-order vertical jump. |
| Collaboration | Single answer remains: current slate-yjs support is not claimed; future root-qualified adapter lane required. |
| Browser scope | Single answer remains: desktop Chromium-first proof; mobile/raw-device and IME are non-claims. |
| Prior proof floors | Horizontal child-root navigation and mouse unfocus stay required floors, not work to re-litigate. |

Previous-plan coverage to reuse:
| Covered surface | Source plan | Reuse decision |
|-----------------|-------------|----------------|
| Default voids remain atomic; editor-only rooted flow is a separate content-root surface | `docs/plans/2026-05-25-slate-v2-void-roots-and-editable-islands.md` | Reuse. This plan does not re-open default void traversal or one-editor-per-block. |
| Horizontal entry/exit across editable void child roots | `docs/plans/2026-05-25-slate-v2-editable-void-keyboard-click-navigation.md` | Reuse. `ArrowLeft` / `ArrowRight` proof is the baseline, not the target. |
| Mouse click outside focused child root unfocuses to parent | `docs/plans/2026-05-25-slate-v2-editable-void-mouse-unfocus.md` | Reuse. Mouse focus ownership is closed; vertical keyboard navigation must not regress it. |
| Same-runtime child roots and `childRoots[slot]` persistence | closed editable-islands execution memory and void-root plan | Reuse. Vertical navigation should work over the existing root model. |

Related issue discovery pass:
| Issue / cluster | Live source | Current status | Classification for this plan | Ledger/reference decision |
|-----------------|-------------|----------------|------------------------------|---------------------------|
| `#5524` Down arrow does not update selection even if cursor moves | `docs/slate-issues/gitcrawl-live-open-ledger.md:114`; `docs/slate-issues/test-candidate-map/5558-5480.md:121`; `docs/slate-v2/ledgers/fork-issue-dossier.md:1533`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:414`; `docs/slate-issues/gitcrawl-v2-sync-ledger.md:531`; `docs/slate-issues/gitcrawl-v2-sync-ledger.md:36` | open singleton; issue-reviewed / related; ready-with-minor-setup soft-break vertical test candidate | directly related symptom family, but not a content-root claim. It is soft-break model-selection/caret-line sync first, not same-runtime root crossing. | issue-ledger pass records related/no-claim; PR remains unchanged except the zero-claim planning bullet. |
| `#6034` table last-node ArrowDown | `docs/slate-issues/gitcrawl-live-open-ledger.md:20`; `docs/slate-issues/test-candidate-map/6038-6007.md:47`; `docs/slate-v2/ledgers/fork-issue-dossier.md:423`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:49`; `docs/slate-v2/references/pr-description.md:99` | existing `Fixes #6034` exact table-edge claim | regression guardrail only. Do not broaden a table boundary fix into content-root vertical navigation. | issue-ledger pass preserves the fixed claim as exact and adds no new `#6034` claim. |
| `#5212` editable void example accuracy | `docs/slate-issues/gitcrawl-live-open-ledger.md:176`; `docs/slate-issues/test-candidate-map/5246-5130.md:75`; `docs/slate-issues/requirements-from-issues.md:398`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:97`; `docs/slate-issues/gitcrawl-v2-sync-ledger.md:38` | related/planned example and DX candidate; not fixed/improved | reused substrate. Vertical navigation would make the existing content-root example better, but the issue remains docs/example accuracy rather than an exact runtime bug claim. | issue-ledger pass preserves no fixed/improved claim. |
| `#2072` Island component | `docs/slate-issues/gitcrawl-live-open-ledger.md:634`; `docs/slate-issues/test-candidate-map/2694-790.md:241`; `docs/slate-issues/open-issues-dossiers/2694-790.md:973`; `docs/slate-issues/open-issues-ledger.md:1150`; `docs/slate-issues/gitcrawl-v2-sync-ledger.md:39` | cluster-synced / related architecture pressure | reused architecture pressure. The vertical bridge completes expected document-flow behavior for the already-accepted same-runtime root direction, but does not close the original island request. | issue-ledger pass records the vertical delta without exact closure. |
| `#5924`, `#5550`, `#5551`, structural/WebComponent/table-selection rows | `docs/slate-v2/ledgers/issue-coverage-matrix.md:391`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:394` | not claimed | intentionally excluded. These ask for structural DOM exclusion, encapsulated DOM boundaries, or table-selection semantics, not same-runtime content-root vertical movement. | no ledger change unless the issue-ledger pass adds an explicit excluded set. |

ClawSweeper surface decision:
- The previous void-root/content-root ClawSweeper pass is sufficient for
  `#5212` and `#2072`; do not rerun broad void-root discovery for those.
- It is not sufficient for `#5524` because `#5524` is vertical caret/selection
  pressure, not island API pressure.
- `#6034` stays an exact fixed table-boundary floor. This plan must not dilute
  it into a general ArrowDown claim.
- No broad live GitHub discovery is warranted. Ledger/cache-first discovery is
  enough for this pass because all candidate rows are already present in live
  gitcrawl, sync ledger, coverage matrix, fork dossier, and test-candidate maps.

Issue-ledger pass evidence:
| Artifact | Status | Evidence |
|----------|--------|----------|
| `docs/slate-issues/gitcrawl-v2-sync-ledger.md` | updated | Added `2026-05-25 Vertical ContentRoot Navigation Planning Sync` with no fixed/improved claims and explicit `#5524`, `#6034`, `#5212`, `#2072`, `#5924`, `#5550`, and `#5551` classifications. |
| `docs/slate-v2/ledgers/fork-issue-dossier.md` | updated | Added `Vertical ContentRoot Keyboard Navigation Surface Review - 2026-05-25` as fork-local comment replacement with PR-description text set to no new claims. |
| `docs/slate-v2/ledgers/issue-coverage-matrix.md` | updated | Added `Vertical ContentRoot Navigation Planning Sync - 2026-05-25` under issue coverage with related/not-claimed rows and unchanged `#6034` fixed floor. |
| `docs/slate-v2/references/pr-description.md` | updated | Added a concise PR-reference bullet: `contentRoot` stays the public surface; #6034 remains exact; #5524 stays related/unclaimed; #5212/#2072 accounting is reused. |

Intent/boundary pass evidence:
| Surface | Evidence | Boundary decision |
|---------|----------|-------------------|
| Root storage | `packages/slate/src/interfaces/editor.ts:87`; `packages/slate/src/interfaces/editor.ts:89`; `packages/slate/src/interfaces/editor.ts:101` | Root identity stays keyed. Do not introduce ordered `roots` storage for this lane. Flow order is derived from the owner element path in the parent root. |
| Root lifecycle | `packages/slate/src/interfaces/editor.ts:249` | Existing `tx.roots.create/delete/replace` remains the lifecycle substrate. Vertical navigation does not need a new root data model. |
| Content-root schema | `packages/slate/src/interfaces/editor.ts:513`; `packages/slate/src/interfaces/editor.ts:523` | `contentRoot: { slot }` is the public schema vocabulary. The actual root id stays document data at `element.childRoots[slot]`. |
| Content-root hook DX | `packages/slate-react/src/hooks/use-slate-content-root.ts:12`; `packages/slate-react/src/hooks/use-slate-content-root.ts:25`; `packages/slate-react/src/hooks/use-slate-content-root.ts:47` | `useSlateContentRoot` is the example-facing controller; it already throws when no slot exists, so apps should not pass ad hoc vertical-navigation policy. |
| Child-root persistence | `packages/slate-react/src/hooks/use-slate-child-root.ts:37`; `packages/slate-react/src/hooks/use-slate-child-root.ts:59` | Explicit `childRoots[slot]` is the persistence contract; runtime-id fallback is ephemeral only. |
| Current example | `apps/www/src/app/(app)/examples/slate/_examples/editable-voids.tsx:137`; `apps/www/src/app/(app)/examples/slate/_examples/editable-voids.tsx:227`; `apps/www/src/app/(app)/examples/slate/_examples/editable-voids.tsx:243` | Both editor-only and mixed island examples can use the same content-root substrate without adding a built-in editable node type. |
| Current navigation bridge | `packages/slate-react/src/editable/content-root-navigation.ts:141`; `packages/slate-react/src/editable/content-root-navigation.ts:328`; `packages/slate-react/src/editable/content-root-navigation.ts:464` | Reuse owner discovery and target/focus transfer. Add only the missing vertical geometry resolver. |
| Previous proof floors | `docs/plans/2026-05-25-slate-v2-editable-void-keyboard-click-navigation.md:123`; `docs/plans/2026-05-25-slate-v2-editable-void-mouse-unfocus.md:102`; `docs/plans/2026-05-25-slate-v2-void-roots-and-editable-islands.md:178` | Horizontal entry/exit, mouse unfocus, and three-surface void/root split are closed floors. This plan must build over them, not re-open them. |

Current-state source evidence:
| Surface | Current owner | Fact | Plan implication |
|---------|---------------|------|------------------|
| Content-root discovery | `packages/slate-react/src/editable/content-root-navigation.ts:141` | `findContentRootOwners` scans schema `contentRoot?.slot` and `childRoots[slot]`. | Vertical navigation should reuse the same owner graph, not invent another node type. |
| Horizontal direction gate | `packages/slate-react/src/editable/content-root-navigation.ts:328` | `getDocumentDirection` handles `moveBackward`, `moveForward`, delete backward, and delete forward. | Plain up/down is absent from the content-root bridge today. |
| Entry/exit target application | `packages/slate-react/src/editable/content-root-navigation.ts:464` | `applyContentRootNavigation` sets a rooted range and focuses the target root editor. | Vertical bridge should feed this same target/focus path after geometry resolution. |
| Hotkey mapping | `packages/slate-dom/src/utils/hotkeys.ts:18` | `moveBackward` and `moveForward` are left/right; plain up/down are only `compose` keys, while line movement maps to option-up/down on Apple. | Treating up/down as `moveForward`/`moveBackward` would be wrong. |
| Caret movement | `packages/slate-react/src/editable/caret-engine.ts:45` | Programmatic line movement is for platform line hotkeys, not plain ArrowUp/ArrowDown. | The vertical plan must not hijack existing line-unit commands. |
| Native vertical sync | `packages/slate-react/src/editable/runtime-keyboard-events.ts:65` | Plain ArrowUp/ArrowDown native selection movement is synced after the browser moves. | Current architecture trusts native layout inside one editable root; cross-root support needs an extra boundary bridge. |
| Existing horizontal proof | `apps/www/tests/slate-browser/donor/examples/editable-voids.test.ts:689` | Browser row proves ArrowRight into child root, ArrowLeft out, and ArrowRight from child end to next parent block. | Keep this contract unchanged and add vertical rows beside it. |
| Existing mouse proof | `apps/www/tests/slate-browser/donor/examples/editable-voids.test.ts:759` | Browser row proves click outside focused child root transfers focus/selection to parent. | Vertical implementation must not reopen mouse ownership. |
| Example schema | `apps/www/src/app/(app)/examples/slate/_examples/editable-voids.tsx:137` | Both `editable-section` and `editable-void` declare `contentRoot: { slot: 'body' }`. | Vertical proof can target the existing example without new public example API. |

Source-backed architecture north star:
- target shape: add a vertical content-root navigation bridge that is lazy,
  geometry-aware, and scoped to content-root adjacency.
- source evidence: current bridge already knows model ownership and root focus
  transfer; it only lacks vertical visual boundary/caret geometry.
- rejected drift: do not map ArrowUp/Down to document-order start/end jumps;
  do not scan every root or call layout APIs on every keydown; do not add a
  public prop until an implementation proof shows apps need policy override.
- migration posture: all existing `contentRoot` users get vertical document-flow
  semantics once proven; default voids stay atomic.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| `contentRoot` vertical behavior | no new public API initially; `contentRoot` means horizontal and vertical document-flow navigation where browser geometry permits | app declares `contentRoot: { slot: 'body' }` once | existing `contentRoot` users gain better keyboard behavior; default voids unchanged | source rows above | keep/revise |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| vertical key gate | `runtime-keyboard-events` / `keyboard-input-strategy` / `content-root-navigation` | detect plain ArrowUp/Down only when content-root owners exist and selection is at a visual first/last line | global DOM geometry on every key | current native vertical sync at runtime-keyboard-events lines 65-72 | revise |
| geometry resolver | new internal helper or content-root-navigation submodule | read current caret rect and desired x, resolve nearest point in adjacent root at same x/y | fake block-order jumps | content-root target path currently model-only | add |
| root candidate lookup | content-root owner graph + mounted root editors | inspect current root owner and adjacent root only | DOM-wide root scans | findContentRootOwners current model scan | revise |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| example schema | keep `contentRoot: { slot: 'body' }` | no extra prop in `<Editable>` | no render-time geometry | editable-voids example lines 137-150 | keep |
| root chrome/mouse | keep existing focus ownership | vertical nav must compose with mouse unfocus | no new handler per app | mouse plan and test lines 759+ | keep |

Plate migration-backbone target:
| Pressure | Slate substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| product editors inside cards/void-like shells need arrow navigation that feels like document flow | `contentRoot` vertical bridge over same runtime roots | Plate wraps raw `contentRoot` in product components | Plate-specific cards/forms in Slate core | Plate editable-void example confirms product pressure while keeping raw Slate primitive | revision frozen; issue-sync pass pending |

slate-yjs migration-backbone target:
| Pressure | Slate substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| vertical movement changes selection only, not document operations | root-qualified selection target remains deterministic | later adapter treats root-qualified selections as local awareness/cursor state | current slate-yjs support claim | current adapter reads/writes a single `sharedRoot`, so multi-root collaboration remains future work | revision frozen; future adapter lane only |

Intent / boundary record:
- intent: make schema-declared same-runtime content roots feel like document-flow
  siblings for plain vertical keyboard movement while preserving their root
  identity, shared history, and focus ownership.
- outcome: from the last visual line before an owner element, plain
  `ArrowDown` can enter the owned child root at the nearest same-x caret point;
  from the first visual line inside a child root, plain `ArrowUp` can return to
  the parent flow; from the last visual line inside a child root, plain
  `ArrowDown` can continue to the next parent-flow caret point. Normal in-root
  vertical movement remains browser-native.
- in-scope: desktop browser keyboard behavior, mounted same-runtime root views,
  owner-element adjacency, visual first/last-line detection, desired-x
  preservation, fallback/no-op policy, no-content-root fast path, horizontal and
  mouse regression floors, and Playwright proof.
- non-goals: default void descendant traversal, rich content under normal void
  `children`, form/native-control focus policy, mobile/raw-device claims,
  IME/composition policy, structural DOM exclusion, Web Component selection
  boundaries, custom table-selection semantics, ordered top-level root storage,
  one-editor-per-block, independent nested editors, current slate-yjs adapter
  support, and implementation before user review.
- decision boundaries: this planning lane may freeze internal architecture and
  proof gates only. It may not claim issue fixes, change public API, or patch
  `Plate repo root` implementation until the user accepts the ready plan and
  invokes execution. Execution may change internals behind `contentRoot`; public
  API change requires a later proof that the existing slot/root contract cannot
  express the behavior.
- unresolved user-decision points: none for planning. A public policy escape
  hatch is deliberately rejected for now; revisit only if browser proof finds
  real app-level policy conflicts.

Decision brief:
- principles:
  - `contentRoot` means projected document-flow root, not a new void kind.
  - Plain up/down is visual movement; preserve x-coordinate when possible.
  - Normal editors, non-boundary keydowns, and editors without mounted content
    roots pay no geometry tax.
  - Runtime owns root focus/selection transfer; examples do not patch it.
  - Owner element path defines flow order. Root key order is storage identity,
    not document navigation order.
  - Root-qualified selection is local view state. Vertical navigation must not
    emit document operations or mutate root payloads.
  - Tests prove browser behavior, not just model helper output.
- top drivers:
  - visual fidelity across separate contenteditable roots;
  - hot-path perf with no content roots;
  - regression resistance for mouse/horizontal navigation already fixed.
  - one-runtime selection/history/collab coherence;
  - keeping raw Slate unopinionated enough for Plate/product wrappers.
- viable options:
  - geometry-aware vertical bridge: chosen. It matches user-visible vertical
    movement and can be guarded behind content-root ownership and boundary keys.
  - model-order start/end jump: rejected. It looks simple but breaks wrapped
    lines and same-x expectations; it would feel broken in real editors.
  - native-only sync: rejected as current incomplete behavior. Native movement
    inside one editable is right, but it cannot reliably cross separate
    contenteditable roots.
  - ordered roots array: rejected for this lane. Root storage order is not the
    same as parent document flow; `childRoots[slot]` plus owner path already
    gives the ordering needed for projected child content.
  - app-level keyboard handlers: rejected. It fixes one example and leaves every
    raw Slate content-root consumer with duplicate edge logic.
  - public `verticalNavigation` prop: rejected for now. It is API clutter before
    proof of real policy divergence.
  - one-editor-per-block: rejected for this lane after treating it as real. It
    makes cross-selection, undo/redo, normalization, collaboration, and focus
    ownership harder than one runtime with many root views.
- chosen option: geometry-aware vertical bridge with lazy candidate checks,
  owner-graph lookup, existing target/focus transfer, and no new public API.
- invalidated alternatives: model-order jump, native-only sync, ordered root
  storage for child-flow order, app-level handlers, public prop first,
  independent nested editors, one-editor-per-block as default substrate.
- consequences: implementation needs DOM caret geometry helpers, boundary-line
  detection, desired-x preservation, fallback policy, Playwright coverage, and
  explicit no-content-root performance proof. Mobile proof remains separate.
- follow-ups: issue sync accounting, closure/final gates, then user review.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| #5524 vertical navigation across soft breaks | related/non-claim | Not claimed; route to core caret/navigation unless future proof shows a DOM bridge failure | Same ArrowDown symptom family, but soft-break model-selection sync is not same-runtime root crossing | `docs/slate-issues/test-candidate-map/5558-5480.md:121`; `docs/slate-v2/ledgers/fork-issue-dossier.md:54`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:95`; `docs/slate-issues/gitcrawl-v2-sync-ledger.md:36` | synced | unchanged |
| #6034 table last-node ArrowDown | fixed floor / no broaden | Existing `Fixes #6034` claim remains exact; this plan adds no claim | Table edge ArrowDown proof is valuable regression context but not content-root navigation | `docs/slate-v2/ledgers/fork-issue-dossier.md:55`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:96`; `docs/slate-v2/references/pr-description.md:80` | synced | unchanged except zero-claim planning bullet |
| #5212 editable void example accuracy | reused related substrate | No fixed/improved claim | Vertical navigation improves the example only after execution proof; baseline classification already covered by void-root pass | `docs/slate-issues/gitcrawl-v2-sync-ledger.md:38`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:97` | synced | unchanged except zero-claim planning bullet |
| #2072 Island component | reused architecture pressure | No exact closure claim | Vertical bridge completes a slice of same-runtime root behavior but not the whole island request | `docs/slate-issues/gitcrawl-v2-sync-ledger.md:39`; `docs/slate-v2/ledgers/issue-coverage-matrix.md:98` | synced | unchanged except zero-claim planning bullet |

Issue-ledger sync status:
- ClawSweeper related-issue discovery: complete for candidate selection.
- generated live gitcrawl rows read: complete for #5524, #6034, #5212, and #2072.
- manual v2 sync ledger update: complete for issue-ledger pass.
- fork issue dossier update: complete for issue-ledger pass.
- issue coverage matrix update: complete for issue-ledger pass.
- PR description sync: complete for issue-ledger pass; no new fixed/improved claims.

Research/live-source refresh evidence:
| Artifact | Evidence | Plan use |
|----------|----------|----------|
| React 19.2 research | `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md:31`; `docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md:57`; `../react/packages/react/src/ReactHooks.js:188` | React is the subscription/scheduling layer, not the geometry engine. |
| ProseMirror view geometry | `../prosemirror-view/src/index.ts:373`; `../prosemirror-view/src/index.ts:383`; `../prosemirror-view/src/index.ts:432`; `../prosemirror-view/src/domcoords.ts:275`; `../prosemirror-view/src/domcoords.ts:348`; `../prosemirror-view/src/domcoords.ts:439`; `../prosemirror-view/src/domcoords.ts:512`; `../prosemirror-commands/src/commands.ts:15`; `../prosemirror-commands/src/commands.ts:161` | View/runtime owns DOM geometry, point-at-coords, coords-at-point, and vertical boundary detection. |
| Lexical caret and nested-editor policy | `../lexical/packages/shared/src/caretFromPoint.ts:9`; `../lexical/packages/lexical-selection/src/range-selection.ts:462`; `../lexical/packages/lexical-selection/src/range-selection.ts:503`; `../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx:33`; `../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx:52`; `../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx:83` | Steal caret helpers and policy isolation; do not make independent nested editors the default raw Slate answer. |
| Tiptap extension/Product DX | `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md:27`; `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md:41`; `../tiptap/packages/core/src/Extension.ts:12`; `../tiptap/packages/extension-code-block/src/code-block.ts:187`; `../tiptap/packages/extension-code-block/src/code-block.ts:202`; `../tiptap/packages/react/src/NodeViewContent.tsx:10` | Keep wrapper-level extension and NodeView-style DX in Plate/product layers. |
| Plate editable-void pressure | `../plate/apps/www/src/registry/examples/editable-voids-demo.tsx:16`; `../plate/apps/www/src/registry/examples/editable-voids-demo.tsx:31`; `../plate/apps/www/src/registry/examples/editable-voids-demo.tsx:37`; `../plate/apps/www/src/registry/examples/editable-voids-demo.tsx:70` | Product widgets, inputs, cards, and nested Plate UI are real pressure, but not raw Slate API. |
| slate-yjs current adapter | `../slate-yjs/packages/core/src/plugins/withYjs.ts:29`; `../slate-yjs/packages/core/src/plugins/withYjs.ts:110`; `../slate-yjs/packages/core/src/plugins/withYjs.ts:156`; `../slate-yjs/packages/core/src/plugins/withYjs.ts:209`; `../slate-yjs/packages/react/src/utils/getCursorRange.ts:23`; `../slate-yjs/packages/react/src/utils/getCursorRange.ts:32` | Current collaboration adapter is single-`sharedRoot`; vertical movement can be local selection, but collaboration claims need root-qualified relative positions later. |

Ecosystem strategy synthesis:
| System | Mechanism | Steal | Reject | Slate target | Verdict |
|--------|-----------|-------|--------|--------------|---------|
| React | `useSyncExternalStore` and React 19.2 scheduling primitives give stable external subscriptions and lower-priority surrounding UI. | Keep root/editor external-store subscriptions and urgent editing work outside broad React churn. | Do not drive DOM geometry from render, effects, or component state. React does not replace editor invalidation. | Vertical geometry runs inside the key/runtime path only after a content-root boundary candidate exists. | accepted |
| ProseMirror | `EditorView` exposes `posAtCoords`, `coordsAtPos`, and `endOfTextblock`; commands ask the view for accurate textblock-boundary knowledge. | Put caret rect, point-at-coords, same-x targeting, and first/last visual-line tests in one Slate React/runtime owner. | Do not copy integer positions, schema-first identity, or NodeView as raw Slate's public node model. | Add a lazy view bridge over Slate roots and reuse existing content-root focus transfer. | accepted |
| Lexical | Caret helpers and decorator selection policy handle browser geometry and atom/decorator edges; nested composers warn about plugin, node, namespace, and copy/paste split-brain. | Steal caret-from-point utility shape and policy isolation for decorator/content-root boundaries. | Reject independent nested editors as the default editable-void answer. | Same runtime, many roots, shared selection/history, and runtime-owned boundary policy. | accepted |
| Tiptap | Extensions package commands, keyboard shortcuts, React node-view content, and product API around ProseMirror. | Steal discoverable extension/wrapper DX for Plate and optional higher-level helpers. | Do not make raw Slate use Tiptap-style chain ceremony or React NodeView wrappers as the core abstraction. | Raw Slate stays primitive; Plate can package the product experience. | accepted |
| Plate | Editable-void example combines a void shell, native inputs, radio UI, and a nested editor. | Use it as the canonical product pressure case and browser-proof route. | Do not add form/card/input APIs to Slate core. | Core only supplies `contentRoot` document-flow navigation; Plate owns product widgets. | accepted |
| slate-yjs | Current adapter stores a single `sharedRoot`, converts points/ranges through that shared root, and caches cursor ranges by `editor.children`. | Treat vertical movement as local selection/focus transfer and document no operation emission. | Do not claim the current adapter has multi-root collaboration semantics. | Future collaboration requires root-qualified relative positions/cursor awareness before any slate-yjs claim. | accepted with migration caveat |

Pressure pass findings:
| Lens | Live pressure evidence | Decision | Execution gate |
|------|------------------------|----------|----------------|
| Performance | `keyboard-input-strategy.ts:341` calls `applyContentRootNavigation` before caret movement; `content-root-navigation.ts:383` exits on non-collapsed selection but `content-root-navigation.ts:389` scans owners before key classification at `content-root-navigation.ts:391` and `content-root-navigation.ts:415`. | Add a cheap `contentRootNavigationAction` classifier before `findContentRootOwners`. No normal key, modifier key, non-boundary vertical key, or editor without content-root action should scan owners or read layout. | Unit contract for no owner scan on unrelated keys plus focused perf/assertion row for ordinary ArrowUp/Down without content roots. |
| Vertical geometry | Plain ArrowUp/Down is currently classified as native vertical layout in `editing-kernel.ts:1126`; sync happens after native movement in `runtime-keyboard-events.ts:65`; `DOMEditor.resolveRangeRect` exists at `dom-editor.ts:1235`, and point-at-event logic already uses `caretRangeFromPoint` / `caretPositionFromPoint` at `dom-editor.ts:752`. | Add a runtime-owned geometry helper that reads current caret rect, preserves desired x, probes only the adjacent mounted target root, and falls back to native/no-op when geometry cannot resolve. | Playwright rows must assert DOM/model selection and approximate same-x movement, not only model start/end points. |
| DX | Schema and hook surface is already minimal: `EditorElementContentRootSpec.slot` at `editor.ts:513`, `useSlateContentRoot` slot resolution at `use-slate-content-root.ts:25`, and `useSlateChildRoot` persisted/fallback contract at `use-slate-child-root.ts:37`. | No public `verticalNavigation` prop. No app-level handler. No new editable-node type just to hide an editor. | Example remains readable with the existing `contentRoot` declaration and root hook. |
| Migration | Root view editors are registered per root in `use-slate-runtime.tsx:361`, resolved by `getMountedViewEditor` at `use-slate-runtime.tsx:386`, and root state subscriptions filter root-affecting operations at `use-slate-runtime.tsx:661`. Current slate-yjs remains single-`sharedRoot`. | Reuse mounted root editor lookup and root-qualified selection. Do not emit document operations for vertical selection transfer. Leave slate-yjs cursor/relative-position work as a future root-qualified adapter lane. | Implementation proof records no root payload mutation and no new current slate-yjs support claim. |
| Regression/TDD | Current unit gates pass: `bun --filter slate-react test:vitest -- content-root-navigation-contract.test.ts` reports 6 passed; `bun test ./packages/slate-react/test/editing-kernel-contract.ts` reports 29 passed. Existing browser source covers horizontal at `editable-voids.test.ts:689` and mouse unfocus at `editable-voids.test.ts:759`; no vertical content-root Playwright row exists. | Execution starts with one red Playwright row, then the smallest helper to make it green, then repeats for the other vertical rows. Existing horizontal/mouse rows are floors. | Required later command: focused editable-voids Chromium grep for vertical rows plus the full editable-voids route before claiming execution complete. |
| Simplicity | Existing owner graph is local and understandable; generalized ordered root storage was rejected. `content-root-navigation.ts` already owns boundary focus transfer via `applyContentRootNavigation` at `content-root-navigation.ts:464`. | Keep the implementation local to the content-root bridge unless reused geometry naturally belongs in `DOMEditor`. Extract only `classifyContentRootNavigationAction` and geometry helpers if reused across parent->child and child->parent flows. | Simplicity review rejects new providers, global registries, public options, or root-order abstractions unless proof shows the current local owner graph cannot work. |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Slate v2 target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| horizontal child-root boundary | N/A same-runtime v2 feature | already passes | editable-voids Playwright row lines 689+ | previous plan | reused |
| mouse unfocus from child root | N/A same-runtime v2 feature | already passes | editable-voids Playwright row lines 759+ | previous plan | reused |
| vertical child-root boundary | browser-native does not cross roots reliably | geometry bridge crosses visual boundary | new Playwright rows | this plan | pending |
| no-content-root perf | normal editors should not pay | key/root fast path avoids geometry | unit/perf instrumentation or focused contract | this plan | pending |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| editable void visible parent to child | caret at last visual line of parent paragraph, `ArrowDown` into child root at same x | Chromium desktop first | red-first focused Playwright grep in `Plate repo root` | child root selection non-null, DOM caret near same x | planned by pressure pass |
| child to parent above | caret at first visual line of child root, `ArrowUp` to parent | Chromium desktop first | red-first focused Playwright | parent selection restored near same x | planned by pressure pass |
| child to parent below | caret at last visual line of child root, `ArrowDown` to next parent block | Chromium desktop first | red-first focused Playwright | parent selection at geometry-resolved point near same x | planned by pressure pass |
| no content roots | ordinary richtext up/down | Chromium desktop first | unit instrumentation plus richtext browser floor if needed | no owner scan, no layout read, no behavior regression | planned by pressure pass |
| existing floors | horizontal child-root boundary and mouse unfocus | Chromium desktop first | full editable-voids route after vertical implementation | existing ArrowLeft/Right and click-outside assertions still pass | planned by pressure pass |

Verification workspace gate:
| Claim | Workspace | Command / source read | Result | Owner |
|-------|-----------|-----------------------|--------|-------|
| current content-root bridge handles horizontal/delete/enter but not plain up/down | `Plate repo root` | `nl -ba packages/slate-react/src/editable/content-root-navigation.ts` | source read; lines 328-357 omit ArrowUp/Down | pass 1 |
| current plain ArrowUp/Down is native vertical selection sync | `Plate repo root` | `nl -ba packages/slate-react/src/editable/runtime-keyboard-events.ts` | source read; lines 65-72 sync after native move | pass 1 |
| current tests cover left/right and mouse but not vertical | `Plate repo root` | `nl -ba playwright/integration/examples/editable-voids.test.ts` | source read; lines 689+ and 759+ prove adjacent coverage | pass 1 |
| current bridge has a pre-classification owner scan | `Plate repo root` | `nl -ba packages/slate-react/src/editable/content-root-navigation.ts` | source read; lines 383-389 show collapsed selection then owner scan before Enter/direction checks | pressure pass |
| mounted root lookup already exists | `Plate repo root` | `nl -ba packages/slate-react/src/hooks/use-slate-runtime.tsx` | source read; lines 361-397 register and resolve mounted root view editors | pressure pass |
| existing bridge/kernel unit floors pass | `Plate repo root` | `bun --filter slate-react test:vitest -- content-root-navigation-contract.test.ts`; `bun test ./packages/slate-react/test/editing-kernel-contract.ts` | 6 Vitest tests passed; 29 Bun tests passed | pressure pass |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | yes | applied in planning pressure pass | Use event-handler runtime logic, external-store/root selectors, and refs for transient geometry. Do not subscribe React components to vertical desired-x or geometry state. | Keep geometry in key/runtime path; no render/effect-owned layout reads. |
| performance-oracle | yes | applied in planning pressure pass | Current bridge scans owners before key classification; vertical geometry would make that unacceptable on normal ArrowUp/Down. | Add cheap action gate before owner scans, adjacent-root lookup only, and layout reads only after boundary candidate. |
| performance | partial | skipped with reason | No implementation benchmark exists yet; p95/p99 rows belong to execution only if source instrumentation shows repeated-root risk. | Pressure pass defines the cost contract; execution decides whether instrumentation is needed. |
| tdd | yes | applied as execution gate | Planning mode has no behavior change. Execution must use one red Playwright row at a time for vertical parent/child flows. | Red-green Playwright-first queue recorded; no test for dead/legacy removal. |
| code-simplicity-reviewer | yes | applied in planning pressure pass | Avoid generalized root graph, public prop, app handlers, nested-editor default, or extra provider state. | Keep changes local; extract only reused action/geometry helpers. |
| shadcn | no | skipped with reason | No UI chrome/component API change proposed; Plate/example product controls stay app-owned. | Raw Slate behavior only. |
| react-useeffect | no | skipped with reason | Proposed implementation is event/runtime-owned. No new effect or listener lifecycle is planned. | Re-open only if execution adds an effect. |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| layout thrash | vertical geometry reads | every ArrowUp/Down forces owner scans or DOM layout across many roots | classify key/action before owner scans, require a mounted adjacent content root, then read only current caret rect and target root geometry | unit no-scan/no-layout contract plus optional instrumentation if execution shows repeated-root cost | closed as execution gate |
| fake navigation feel | model-order fallback overused | caret jumps to start/end instead of preserving the user's visual x | geometry first, same-x target lookup second, fallback to native/no-op when unresolved; never use document-order start/end as a vertical substitute | Playwright x-sensitive rows across parent-to-child, child-to-parent-above, child-to-parent-below, empty block, and wrapped line cases | closed as execution gate |
| native-sync race | handled vertical transfer still leaves `runtime-keyboard-events.ts:65` timeout active for `native-selection-move` | delayed DOM sync may read stale browser selection after Slate already moved focus/selection across roots | execution must skip native vertical sync when content-root navigation handled the event, or tag handled root transfers so the timer syncs the new focused root only | focused unit/runtime assertion plus Playwright row proving selection is not overwritten after the timeout tick | closed as execution gate |
| unmounted target root | owner points at a child root not currently mounted | root-qualified selection updates without a focused DOM editable, or fallback focuses the wrong editor | vertical bridge may target only `getMountedViewEditor(root)` success; unmounted target returns not-handled/native fallback | unit proof for unmounted target plus browser proof with only mounted editable void target | closed as execution gate |
| child-root regression | new vertical handler steals child root/mouse/horizontal behavior | focused child root loses native up/down inside the root, or mouse unfocus/horizontal entry regresses | preserve native in-root vertical movement until boundary detection succeeds; run full editable-voids route and existing horizontal/mouse rows | browser route plus existing rows at `editable-voids.test.ts:689` and `editable-voids.test.ts:759` | closed as execution gate |
| mobile/IME overclaim | desktop geometry proof gets presented as universal behavior | raw-device/mobile or composition behavior is implied without proof | planning and execution claim desktop Chromium first; mobile/raw-device and IME get no support claim unless a later lane adds device proof | final handoff must spell out desktop-only browser proof scope | closed as explicit non-claim |
| collaboration overclaim | root-qualified local selection gets sold as slate-yjs support | remote cursors/relative positions break because current yjs adapter has one shared root | keep vertical movement local selection/focus only; no current slate-yjs support claim | reference `withYjs` single-`sharedRoot` evidence and require future root-qualified relative-position adapter lane | closed as explicit non-claim |

High-risk execution contract:
| Contract | Source pressure | Required execution proof | Closure effect |
|----------|-----------------|--------------------------|----------------|
| Cheap action gate before owner scans | `content-root-navigation.ts:383` reads selection/current root and calls `findContentRootOwners` before Enter/direction classification; `findContentRootOwners` scans every root at `content-root-navigation.ts:141`. | Unit or instrumentation proof that unrelated keys, modified keys, normal ArrowUp/Down in editors without content roots, and unmounted target cases do not scan owners or read layout. | Required before implementation can claim perf safety. |
| Mounted adjacent-root layout only | Mounted view editors are already available through `use-slate-runtime.tsx:386`; DOM geometry helpers exist at `dom-editor.ts:752` and `dom-editor.ts:1235`. | Proof that vertical geometry runs only after a content-root boundary candidate and mounted target root exist. | Keeps normal editors and unmounted roots out of the hot path. |
| No document-order fake fallback | ProseMirror uses view geometry for vertical textblock boundaries at `domcoords.ts:439`; current horizontal bridge is model/order-based. | Playwright assertions include DOM/model selection and approximate same-x checks; unresolved geometry falls back to native/no-op, not start/end jumps. | Prevents a green test that feels wrong in the browser. |
| No stale native sync after handled transfer | `runtime-keyboard-events.ts:65` schedules ArrowUp/Down sync after `applyEditableKeyDown`, and that block currently ignores `keyDownWorkerResult.handled`. | Test proves a handled vertical root transfer is not overwritten by the delayed native-selection sync. | Makes focus/selection ownership deterministic after cross-root movement. |
| Desktop-browser claim only | Existing keyboard proof skips mobile rows at `editable-voids.test.ts:692`, and mouse proof is Chromium-only at `editable-voids.test.ts:762`. | Final proof names Chromium desktop rows; mobile/raw-device/IME remain out of scope. | Prevents release-note/API overclaiming. |

Ecosystem maintainer pass:
| System | What the maintainer would challenge | Steal | Reject / do not claim | Current evidence | Verdict |
|--------|-------------------------------------|-------|------------------------|------------------|---------|
| React 19.2 | "Do not turn keydown geometry into React state churn." | Use `useSyncExternalStore`/selector discipline for root subscriptions and transitions for surrounding UI only. | No render/effect-owned geometry, no React state for desired x, no broad transition-wrapped editor operation stream. | `ReactHooks.js:188` exposes `useSyncExternalStore`; `ReactStartTransition.js:193` warns about broad subscription updates in transitions; Slate root selectors already gate by affected root at `packages/slate-react/src/hooks/use-slate-runtime.tsx:661`. | accepted |
| ProseMirror | "Vertical movement is view geometry, not model order." | Use view-owned coordinate APIs and textblock-boundary geometry as the mental model. | Do not copy ProseMirror integer positions, schema/NodeView model, or command chain into raw Slate. | `EditorView.posAtCoords`, `coordsAtPos`, and `endOfTextblock` live at `../prosemirror-view/src/index.ts:373`, `../prosemirror-view/src/index.ts:383`, and `../prosemirror-view/src/index.ts:432`; vertical detection reads DOM rects at `../prosemirror-view/src/domcoords.ts:439`. | accepted |
| Lexical | "Caret probing is useful; nested editors are not free." | Reuse the tiny `caretRangeFromPoint` / `caretPositionFromPoint` helper shape and keep decorator/content-root policy isolated. | Do not make independent nested editors the default answer; their plugin, node, namespace, copy/paste, editable-state, and collab costs are real. | `caretFromPoint.ts:9` resolves DOM caret positions from coordinates; `LexicalNestedComposer.tsx:33` says nested editors do not inherit plugins/registrations; `LexicalNestedComposer.tsx:52` marks initial node setup unsafe; `LexicalNestedComposer.tsx:83` warns on namespace/copy-paste behavior. | accepted |
| Tiptap | "Great DX belongs in a wrapper, not in the raw editor core." | Steal the extension/wrapper ergonomics for Plate-level helpers and examples. | Do not import Tiptap's chain API, React NodeView shape, or product-command ceremony into raw Slate. | `Extension.create` and `extend` are wrapper-level config at `../tiptap/packages/core/src/Extension.ts:23` and `../tiptap/packages/core/src/Extension.ts:35`; keyboard shortcuts package feature behavior at `../tiptap/packages/extension-code-block/src/code-block.ts:202`; `NodeViewContent` is a React wrapper slot at `../tiptap/packages/react/src/NodeViewContent.tsx:10`. | accepted |
| Plate | "The user-facing editable void is product composition." | Keep Plate as the opinionated wrapper target with input/radio/editor composition. | Do not add form controls, card chrome, or Plate widget APIs to Slate core. | Plate's current demo creates a separate product editor inside a void at `../plate/apps/www/src/registry/examples/editable-voids-demo.tsx:31`; Slate v2's example declares `contentRoot: { slot: 'body' }` at `apps/www/src/app/(app)/examples/slate/_examples/editable-voids.tsx:137` and mounts `<Editable root={bodyRoot}>` at `apps/www/src/app/(app)/examples/slate/_examples/editable-voids.tsx:280`. | accepted |
| slate-yjs | "Do not sell local root movement as collaborative multi-root support." | Use the local operation/focus target as future pressure for root-qualified relative positions. | No current slate-yjs support claim, no remote cursor claim, no current adapter fixture requirement. | `withYjs` stores a single `sharedRoot` at `../slate-yjs/packages/core/src/plugins/withYjs.ts:29`; stored positions convert through that root at `../slate-yjs/packages/core/src/plugins/withYjs.ts:110`; React cursor ranges cache against `editor.children` and `editor.sharedRoot` at `../slate-yjs/packages/react/src/utils/getCursorRange.ts:23`. | accepted with future adapter lane |

Ecosystem synthesis:
- The winning architecture is still a Slate React/runtime bridge, not a model
  rewrite: classify the keyboard action cheaply, locate only mounted adjacent
  content roots, use DOM/view geometry for vertical boundary decisions, and
  apply the existing rooted selection/focus transfer.
- ProseMirror and Lexical justify the geometry mechanism. Tiptap and Plate
  justify keeping product-level ergonomics outside raw Slate. React and
  slate-yjs define hard boundaries: no React stateful geometry path and no
  current collaboration claim.
- No external system argues for a new public `verticalNavigation` prop,
  ordered `roots` array, independent nested editor default, or one-editor-per-
  block architecture for this lane.

Slate maintainer objection ledger:
| Change | Objection | Tradeoff | Evidence | Migration/docs/proof answer | Verdict |
|--------|-----------|----------|----------|-----------------------------|---------|
| Add vertical bridge for content roots | "Up/down is browser layout; Slate should not fake it." | Slate should not own normal in-root visual movement. It must own only the discontinuity it creates by projecting one document flow across separate contenteditable roots. | Plain ArrowUp/Down is currently native sync at `packages/slate-react/src/editable/runtime-keyboard-events.ts:65`; ProseMirror exposes view-owned `coordsAtPos`, `posAtCoords`, and `endOfTextblock` at `../prosemirror-view/src/index.ts:373`, `../prosemirror-view/src/index.ts:383`, and `../prosemirror-view/src/index.ts:432`. | Keep native in-root vertical movement. Intercept only when the caret is at a content-root visual boundary and an adjacent mounted root exists. Prove same-x behavior in browser. | accepted with strict boundary |
| Add DOM geometry to keydown path | "This will be slow and layout-thrashy." | Geometry is expensive if it runs on every ArrowUp/Down or scans all roots. | Current bridge scans owners before key classification at `packages/slate-react/src/editable/content-root-navigation.ts:383`; action classification exists for horizontal/delete/enter at `packages/slate-react/src/editable/content-root-navigation.ts:328` and `packages/slate-react/src/editable/content-root-navigation.ts:360`; mounted root lookup exists at `packages/slate-react/src/hooks/use-slate-runtime.tsx:386`. | Execution must first add a cheap action gate before owner scans, then inspect only current/adjacent roots, then read layout. Add no-content-root no-scan/no-layout proof before closure. | accepted only with perf gate |
| Extend `contentRoot` semantics vertically | "This secretly changes default void semantics." | Default voids must remain atomic. Content-root traversal is a separate opt-in contract. | Current schema has `contentRoot?: EditorElementContentRootSpec` separate from void flags at `packages/slate/src/interfaces/editor.ts:513`; previous void-root plan froze default void atomicity. | No default void descendant traversal. Existing void behavior stays unchanged unless the element spec declares `contentRoot: { slot }`. | accepted |
| Avoid public `verticalNavigation` prop | "Apps may need policy control." | A prop before proof creates API clutter and moves core behavior into examples. | `useSlateContentRoot` already derives the slot from schema at `packages/slate-react/src/hooks/use-slate-content-root.ts:25`; `useSlateChildRoot` already defines persisted vs ephemeral root identity at `packages/slate-react/src/hooks/use-slate-child-root.ts:37`. | Treat vertical document-flow navigation as the meaning of `contentRoot`. Add policy only after browser proof shows real app-level divergence. | accepted; revisit only with evidence |
| Keep one runtime with many root views | "Would independent nested editors or one editor per block be cleaner?" | Independent editors look simpler locally and worse globally: selection, undo, clipboard, collaboration, and focus split. | Memory-backed same-runtime child-root lane says `<Editable root={bodyRoot} />` is the canonical direction; Lexical nested composer warns nested editors do not inherit plugins/registrations at `../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx:33` and has namespace/copy-paste warnings at `../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx:83`. | Keep one runtime editor, many root views. Treat one-editor-per-block as a serious comparison target, but not the default for this lane. | accepted |
| Keep root order out of `roots` storage | "How does vertical navigation know document order if roots are a map?" | Root storage order is identity, not document flow. Flow order for child roots is derived from the owner element path in the parent root. | `EditorDocumentValue.roots` is a record at `packages/slate/src/interfaces/editor.ts:89`; `contentRoot.slot` stores the root key on `element.childRoots[slot]` at `packages/slate/src/interfaces/editor.ts:513`; memory notes call out ordering ownership as an explicit decision. | Do not introduce ordered root storage for vertical navigation. Use owner path and adjacent root lookup. | accepted |
| No current slate-yjs support claim | "Root-qualified selections will break collaboration cursors." | Current yjs adapter cannot honestly prove multi-root selection/cursor semantics. | `YjsEditor` stores one `sharedRoot` at `../slate-yjs/packages/core/src/plugins/withYjs.ts:29`; positions convert through that shared root at `../slate-yjs/packages/core/src/plugins/withYjs.ts:110`; connect observes the same root at `../slate-yjs/packages/core/src/plugins/withYjs.ts:204`. | Vertical movement is local selection/focus transfer only. Future collaboration needs root-qualified relative positions and awareness before any slate-yjs claim. | accepted with explicit non-claim |
| Preserve existing mouse/horizontal floors | "Vertical handling may regress the child-root fixes we already proved." | New vertical code must not steal child-root focus, mouse unfocus, or horizontal entry/exit. | Horizontal proof lives at `apps/www/tests/slate-browser/donor/examples/editable-voids.test.ts:689`; mouse unfocus proof lives at `apps/www/tests/slate-browser/donor/examples/editable-voids.test.ts:759`; current bridge applies rooted selection/focus transfer at `packages/slate-react/src/editable/content-root-navigation.ts:464`. | Execution must run full editable-voids Chromium route after vertical rows. Existing horizontal/mouse tests are floors, not optional adjacent coverage. | accepted |
| Do not broaden issue claims | "This will get sold as fixing all ArrowDown bugs." | Same symptom family does not mean same bug. | Issue accounting keeps `#5524` related/non-claim and `#6034` fixed floor/no-broaden; current vertical plan has no fixed issue claim. | Do not update PR/coverage fixed claims until implementation proof maps exact issue behavior. | accepted |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| map ArrowDown to `moveForward` | reject | document-order jump is not visual vertical navigation | none | hotkeys/source rows show left/right are moveForward/backward | keep rejected |
| public `verticalNavigation` prop now | cut for now | no proof apps need policy; `contentRoot` should carry expected behavior | none | unopinionated DX goal | revisit after proof |
| app-level example handler | reject | fixes one example and misses shared runtime contract | high duplication | previous mouse plan rejected example-only ownership | keep rejected |
| ordered `roots` array for child-flow order | reject for this lane | owner element path defines document flow; root key order is storage identity | none | `EditorDocumentValue.roots` is keyed; `contentRoot.slot` points at `element.childRoots[slot]` | keep top-level root ordering separate |
| root-owner registry before proof | reject for this lane | current local scan is understandable; the real perf bug is doing it before key/action classification | none | pressure pass source read | add cheap key gate first; registry only if execution proves scan cost remains material |
| one-editor-per-block | reject for this lane | cross-selection, undo/redo, normalization, collaboration, and focus stay coherent in one runtime | high | multi-root memory and prior void-root decision brief | keep as comparison target only |
| independent nested editor | reject | recreates split-brain selection/history/collab and misses shared child-root state | high | same-runtime child-root proof floors | keep rejected |

Plan deltas from review:
- Created focused vertical-navigation Slate Plan from template.
- Carried forward closed mouse/horizontal/void-island decisions.
- Narrowed current target to geometry-aware vertical bridge only.
- Recorded initial score 0.76 and next pass `related-issue-discovery`.
- Closed related issue discovery with score 0.78.
- Classified #5524 as related/no-claim, #6034 as fixed-floor/no-broaden,
  #5212 as reused example/DX substrate, and #2072 as reused island architecture
  pressure.
- Closed issue-ledger pass with score 0.79.
- Wrote no-claim sync rows to the manual v2 sync ledger, fork issue dossier,
  issue coverage matrix, and PR reference. The current fixed issue claim count
  is unchanged.
- Closed intent/boundary and decision-brief pass with score 0.81.
- Froze owner-path ordering over ordered root storage, one-runtime/many-root over
  one-editor-per-block, existing `contentRoot` + child-root hooks over a new
  public vertical-navigation API, and geometry-first/no fake document-order
  jumps as the internal behavior law.
- Closed research, ecosystem strategy, and live-source refresh pass with score
  0.84.
- Recorded the concrete steal/reject strategy: steal ProseMirror view-owned
  geometry, Lexical caret/decorator policy isolation, React external-store
  subscription discipline, and Tiptap/Plate wrapper DX; reject independent
  nested editors, product-widget APIs in raw Slate, React render-time geometry,
  and current slate-yjs collaboration claims.
- Closed performance/DX/migration/regression/simplicity pressure pass with
  score 0.87.
- Found one current bridge perf smell that execution should fix before adding
  vertical geometry: `getContentRootNavigationTarget` scans content-root owners
  before classifying the key/action.
- Added the pressure rule that vertical support must first classify a cheap
  content-root navigation action, then scan only when relevant, then read DOM
  geometry only for a mounted adjacent boundary candidate.
- Closed Slate maintainer objection ledger with score 0.89.
- Strengthened acceptance answers for browser-owned vertical layout, hot-path
  geometry cost, default void atomicity, public API restraint, same-runtime
  root views, root ordering ownership, slate-yjs non-claim, existing mouse and
  horizontal floors, and issue-claim boundaries.
- Closed high-risk deliberate mode with score 0.91.
- Added non-negotiable execution gates for cheap action classification before
  owner scans, mounted-adjacent-root-only layout reads, same-x browser proof,
  no document-order fake fallback, no stale native-selection sync after handled
  vertical root transfers, no mobile/raw-device claim, and no current slate-yjs
  collaboration claim.
- Closed ecosystem maintainer pass with score 0.92.
- Confirmed the plan should steal ProseMirror view geometry and Lexical caret
  probing, keep Tiptap/Plate-style ergonomics in wrappers, follow React
  external-store/root subscription discipline, and leave slate-yjs multi-root
  collaboration as a future root-qualified adapter lane.
- Closed revision pass with score 0.93.
- Added the user-review architecture spec and contradiction audit. The short
  spec is now the authoritative architecture summary; the longer pass tables
  remain supporting evidence.
- Closed issue sync accounting with score unchanged at 0.93.
- Synced the frozen revision wording to the manual v2 sync ledger, fork issue
  dossier, issue coverage matrix, and PR reference. New fixed/improved issue
  claims remain `0`; `#6034` stays exact, and `#5524`, `#5212`, and `#2072`
  stay related but unclaimed.
- Closed closure/final-gates pass with score unchanged at 0.93.
- Confirmed every scheduled pass row is complete, no score dimension is below
  0.85, reference and issue sync are current, fixed/improved issue claims remain
  unchanged, and the final user-review handoff is recorded.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Can we reliably detect first/last visual line without expensive layout reads? | Determines perf architecture and proof budget. | prototype/source research and browser test design | execution proof | resolved for planning: yes only after cheap action classification and mounted adjacent-root discovery; perf proof still required in execution |
| Should fallback be start/end or no-op when geometry cannot resolve? | A bad fallback feels worse than native stuck behavior. | Playwright cases for empty blocks/wrapped lines | execution proof | resolved: prefer no-op/native over fake start/end jump when geometry cannot resolve |
| Does IME/mobile need separate policy? | Prevents overclaiming desktop proof. | mobile/raw-device plan, likely later | later lane if needed | resolved for this plan: desktop Chromium proof only; mobile/raw-device and IME are explicit non-claims |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| vertical repro rows | execution mode | add failing Playwright rows for parent<->child up/down | accepted plan | red rows demonstrate current gap | focused Chromium |
| geometry bridge | execution mode | internal vertical resolver and candidate guard | red rows | green focused rows, no horizontal/mouse regression | focused + full editable-voids route |
| perf guard | execution mode | prove no geometry activation without content roots/non-updown | bridge green | unit/instrumentation or test harness proof | relevant package tests |
| closeout | execution mode | type/lint/build/autoreview/changeset if package behavior changes | code done | all gates green | `Plate repo root` gates |

Fast driver gates:
| Gate | Cwd | Command | Status |
|------|-----|---------|--------|
| plan source read | `Plate repo root` | `nl -ba packages/slate-react/src/editable/content-root-navigation.ts` | complete |
| plan source read | `Plate repo root` | `nl -ba packages/slate-react/src/editable/runtime-keyboard-events.ts` | complete |
| plan source read | `Plate repo root` | `nl -ba playwright/integration/examples/editable-voids.test.ts` | complete |
| intent/boundary source read | `Plate repo root` | `nl -ba packages/slate/src/interfaces/editor.ts`; `nl -ba packages/slate-react/src/hooks/use-slate-content-root.ts`; `nl -ba packages/slate-react/src/hooks/use-slate-child-root.ts`; `nl -ba site/examples/ts/editable-voids.tsx` | complete |
| research source read | `plate-2` + sibling repos | `nl -ba docs/research/sources/editor-architecture/react-19-2-external-store-and-background-ui.md`; `nl -ba docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`; `nl -ba docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`; `nl -ba docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md` | complete |
| ecosystem primary-source read | sibling repos | `nl -ba ../react/packages/react/src/ReactHooks.js`; `nl -ba ../prosemirror-view/src/index.ts`; `nl -ba ../prosemirror-view/src/domcoords.ts`; `nl -ba ../prosemirror-commands/src/commands.ts`; `nl -ba ../lexical/packages/shared/src/caretFromPoint.ts`; `nl -ba ../lexical/packages/lexical-selection/src/range-selection.ts`; `nl -ba ../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx`; `nl -ba ../tiptap/packages/extension-code-block/src/code-block.ts`; `nl -ba ../tiptap/packages/core/src/Extension.ts`; `nl -ba ../tiptap/packages/react/src/NodeViewContent.tsx`; `nl -ba ../plate/apps/www/src/registry/examples/editable-voids-demo.tsx`; `nl -ba ../slate-yjs/packages/core/src/plugins/withYjs.ts`; `nl -ba ../slate-yjs/packages/react/src/utils/getCursorRange.ts` | complete |
| pressure source read | `Plate repo root` | `nl -ba packages/slate-react/src/editable/content-root-navigation.ts`; `nl -ba packages/slate-react/src/editable/keyboard-input-strategy.ts`; `nl -ba packages/slate-react/src/editable/runtime-keyboard-events.ts`; `nl -ba packages/slate-react/src/editable/editing-kernel.ts`; `nl -ba packages/slate-dom/src/plugin/dom-editor.ts`; `nl -ba packages/slate-react/src/hooks/use-slate-runtime.tsx`; `nl -ba packages/slate-react/src/hooks/use-slate-content-root.ts`; `nl -ba packages/slate-react/src/hooks/use-slate-child-root.ts`; `nl -ba site/examples/ts/editable-voids.tsx`; `nl -ba playwright/integration/examples/editable-voids.test.ts` | complete |
| pressure unit proof | `Plate repo root` | `bun --filter slate-react test:vitest -- content-root-navigation-contract.test.ts`; `bun test ./packages/slate-react/test/editing-kernel-contract.ts` | complete; 6 Vitest tests passed and 29 Bun tests passed |
| objection source read | `Plate repo root` + sibling repos + prior plans | `nl -ba packages/slate-react/src/editable/content-root-navigation.ts`; `nl -ba packages/slate-react/src/editable/runtime-keyboard-events.ts`; `nl -ba packages/slate-dom/src/plugin/dom-editor.ts`; `nl -ba packages/slate/src/interfaces/editor.ts`; `nl -ba packages/slate-react/src/hooks/use-slate-runtime.tsx`; `nl -ba playwright/integration/examples/editable-voids.test.ts`; `nl -ba ../prosemirror-view/src/index.ts`; `nl -ba ../prosemirror-view/src/domcoords.ts`; `nl -ba ../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx`; `nl -ba ../slate-yjs/packages/core/src/plugins/withYjs.ts`; prior keyboard/mouse/void-root plans | complete |
| high-risk source read | `Plate repo root` for Slate reads; `plate-2` for sibling repo reads | `nl -ba packages/slate-react/src/editable/content-root-navigation.ts`; `nl -ba packages/slate-react/src/editable/keyboard-input-strategy.ts`; `nl -ba packages/slate-react/src/editable/editing-kernel.ts`; `nl -ba packages/slate-react/src/editable/runtime-keyboard-events.ts`; `nl -ba packages/slate-dom/src/plugin/dom-editor.ts`; `nl -ba packages/slate-react/src/hooks/use-slate-runtime.tsx`; `nl -ba playwright/integration/examples/editable-voids.test.ts`; `nl -ba ../prosemirror-view/src/domcoords.ts`; `nl -ba ../prosemirror-view/src/index.ts`; `nl -ba ../lexical/packages/shared/src/caretFromPoint.ts`; `nl -ba ../slate-yjs/packages/core/src/plugins/withYjs.ts` | complete |
| ecosystem maintainer source read | `Plate repo root` for Slate reads; `plate-2` for sibling repo reads | `nl -ba ../react/packages/react/src/ReactHooks.js`; `nl -ba ../react/packages/react/src/ReactStartTransition.js`; `nl -ba ../prosemirror-view/src/index.ts`; `nl -ba ../prosemirror-view/src/domcoords.ts`; `nl -ba ../lexical/packages/shared/src/caretFromPoint.ts`; `nl -ba ../lexical/packages/lexical-react/src/LexicalNestedComposer.tsx`; `nl -ba ../tiptap/packages/core/src/Extension.ts`; `nl -ba ../tiptap/packages/extension-code-block/src/code-block.ts`; `nl -ba ../tiptap/packages/react/src/NodeViewContent.tsx`; `nl -ba ../plate/apps/www/src/registry/examples/editable-voids-demo.tsx`; `nl -ba ../slate-yjs/packages/core/src/plugins/withYjs.ts`; `nl -ba ../slate-yjs/packages/react/src/utils/getCursorRange.ts`; `nl -ba apps/www/src/app/(app)/examples/slate/_examples/editable-voids.tsx`; `nl -ba packages/slate-react/src/editable/content-root-navigation.ts`; `nl -ba packages/slate-react/src/editable/runtime-keyboard-events.ts`; `nl -ba packages/slate-react/src/hooks/use-slate-runtime.tsx`; `nl -ba packages/slate-dom/src/plugin/dom-editor.ts` | complete |
| revision contradiction scan | `plate-2` | `rg -n 'Revision pass\|Issue sync accounting\|final_handoff_status\|Weighted score after pass\|next_pass:\|current_pass:\|verticalNavigation\|document-order\|start/end\|native-selection sync\|mobile/raw-device\|slate-yjs\|one-editor-per-block\|nested independent\|mouse unfocus' docs/plans/2026-05-25-slate-v2-vertical-content-root-navigation.md` | complete; stale status rows fixed and the remaining matches are intentional evidence/non-claim text |
| issue sync source read | `plate-2` | `rg -n 'Vertical ContentRoot\|contentRoot\|#5524\|#6034\|#5212\|#2072\|vertical content-root\|vertical navigation\|ArrowDown\|No new fixed\|Fixes #\|not claimed' docs/slate-issues/gitcrawl-v2-sync-ledger.md docs/slate-v2/ledgers/fork-issue-dossier.md docs/slate-v2/ledgers/issue-coverage-matrix.md docs/slate-v2/references/pr-description.md` | complete |
| issue sync text verification | `plate-2` | `rg -n 'Vertical ContentRoot Navigation Revision Sync\|Vertical content-root revision sync\|New exact fixed or improved claims from that sync: `0`\|#6034.*unchanged\|#5524.*not claimed' docs/slate-issues/gitcrawl-v2-sync-ledger.md docs/slate-v2/ledgers/fork-issue-dossier.md docs/slate-v2/ledgers/issue-coverage-matrix.md docs/slate-v2/references/pr-description.md` | complete |
| fixed claim count verification | `plate-2` | `rg -c "^- Fixes #[0-9]" docs/slate-v2/ledgers/issue-coverage-matrix.md docs/slate-v2/references/pr-description.md` | complete; fixed issue claim count remains 36 in both matrix and PR reference |
| ledger/reference text sync | `plate-2` | `rg -n 'Vertical ContentRoot\|current_pass\|next_pass\|Issue-ledger pass evidence\|New exact fixed or improved claims from that sync' ...` | complete |
| stale next-pass text check | `plate-2` | stale issue-ledger wording grep against active plan | complete; no matches |
| closure status audit | `plate-2` | stale pending/pass-11 grep against active plan | complete; no stale runnable-pass status remains |
| final plan check | `plate-2` | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-slate-v2-vertical-content-root-navigation.md` | complete; checker passed |

Final user-review handoff:
- Decision: implemented an internal vertical `contentRoot` bridge over the
  existing `contentRoot: { slot }` contract.
- Public API: no new prop, no new editable node type, and no ordered roots
  array for child-flow order. Default voids remain atomic.
- Runtime law: classify plain vertical content-root intent before owner scans;
  inspect only the current owner and mounted adjacent root; read geometry only
  after a candidate exists; reuse rooted focus/selection transfer; suppress
  stale native vertical sync after handled root transfers.
- Browser proof completed in execution: red-first same-x Playwright coverage
  for parent-to-child, child-to-parent-above, child-to-parent-below, empty
  block fallback, no-content-root no-scan proof, and the full editable-voids
  Chromium route.
- Issue stance: no new fixed or improved claims; `#6034` stays exact;
  `#5524`, `#5212`, and `#2072` stay related but unclaimed.
- Non-claims: mobile/raw-device, IME/composition, structural DOM exclusion,
  Web Component selection, table-selection semantics, current slate-yjs
  collaboration support, independent nested editors, and one-editor-per-block
  as the default architecture.

Open risks:
- Mobile/raw-device and IME behavior remain explicit non-claims.
- Wrapped-line edge cases beyond the current editable-voids proof may still
  need browser-specific rows if apps report them.
- Current slate-yjs multi-root collaboration remains a future adapter lane.

Verification evidence:
- Live source reads completed for current-state pass.
- Issue-ledger pass text verification completed: vertical sync sections exist
  in the manual v2 sync ledger, fork issue dossier, issue coverage matrix, and
  PR reference; stale issue-ledger `next pass` wording no longer appears in the
  active plan.
- Intent/boundary pass source verification completed against live root storage,
  content-root schema, content-root hooks, child-root persistence, and the
  editable-voids example.
- Research refresh completed against compiled research and local primary
  sources for React, ProseMirror, Lexical, Tiptap, Plate, and slate-yjs.
- Pressure pass completed against live `Plate repo root` bridge, runtime,
  DOM-geometry, root-registration, example, and test sources.
- Targeted pressure gates passed in `Plate repo root`: 6 Vitest
  `content-root-navigation` tests and 29 Bun `editing-kernel` tests.
- Slate maintainer objection ledger completed with live source answers and no
  new implementation, browser, package, PR, or issue-fix claim.
- High-risk deliberate mode completed with live source answers for layout
  thrash, geometry fallback, native-sync races, unmounted roots, child-root
  regression floors, mobile/raw-device scope, and slate-yjs non-claims.
- Ecosystem maintainer pass completed with live source answers for React,
  ProseMirror, Lexical, Tiptap, Plate, slate-yjs, and live Slate v2 bridge
  compatibility.
- Revision pass completed with a frozen user-review architecture spec and
  contradiction audit.
- Issue sync accounting completed across manual v2 sync ledger, fork issue
  dossier, issue coverage matrix, and PR reference; new fixed/improved issue
  claims remain `0`.
- Closure/final gates completed: all scheduled pass rows are complete, score is
  0.93 with every dimension above 0.85, final handoff is emitted, and the plan
  checker passed.
- Accepted execution completed with red-first focused Playwright coverage,
  package/unit gates, Biome, targeted source ESLint, package build, full
  editable-voids Chromium proof, and autoreview.
- The first autoreview pass found one accepted page-virtualization correctness
  issue outside the content-root files. The fix maps retained top-level rows to
  the containing page virtualizer item before using page geometry; autoreview
  then reran clean.
- Execution adds no new fixed/improved issue claim; no issue ledger or PR
  reference sync is required beyond the existing planning no-claim rows.
- Previous mouse/horizontal proof reused from closed plans and live test source.

Accepted execution addendum:
| Gate | Cwd | Command | Result |
|------|-----|---------|--------|
| red focused browser row | `Plate repo root` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/editable-voids.test.ts --project=chromium -g "moves vertically across editable void child-root boundaries"` | failed before implementation because `ArrowDown` from the parent did not focus the child root |
| focused vertical browser row | `Plate repo root` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/editable-voids.test.ts --project=chromium -g "moves vertically across editable void child-root boundaries"` | passed after implementation |
| content-root unit/perf guard | `Plate repo root` | `bun --filter slate-react test:vitest -- content-root-navigation-contract.test.ts` | 8 tests passed |
| editing-kernel regression floor | `Plate repo root` | `bun test ./packages/slate-react/test/editing-kernel-contract.ts` | 29 tests passed, 58 expect calls |
| formatter | `Plate repo root` | `bunx biome check packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts packages/slate-react/src/editable/content-root-navigation.ts packages/slate-react/src/editable/runtime-keyboard-events.ts packages/slate-react/test/content-root-navigation-contract.test.ts playwright/integration/examples/editable-voids.test.ts` | passed |
| targeted source lint | `Plate repo root` | `bun eslint packages/slate-react/src/dom-strategy/use-virtualized-root-plan.ts packages/slate-react/src/editable/content-root-navigation.ts packages/slate-react/src/editable/runtime-keyboard-events.ts packages/slate-react/test/content-root-navigation-contract.test.ts playwright/integration/examples/editable-voids.test.ts` | 0 errors; test files are ignored by local ESLint config |
| package typecheck | `Plate repo root` | `bun --filter slate-react typecheck` | passed |
| browser-consumed package build | `Plate repo root` | `bun --filter slate-react build` | passed |
| full editable-voids route | `Plate repo root` | `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/editable-voids.test.ts --project=chromium` | 21 passed after final rebuild |
| autoreview | `Plate repo root` | `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local` | first run found one accepted page-virtualization P3; rerun reported no accepted/actionable findings |
| final plan check | `plate-2` | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-slate-v2-vertical-content-root-navigation.md` | passed after execution addendum |

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Accepted Slate Plan execution is complete. |
| Where am I going? | Goal closeout. |
| What is the goal? | Ship geometry-aware vertical content-root keyboard navigation without redoing already-closed void/mouse/horizontal work. |
