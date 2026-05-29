# slate-v2-hidden-dom-blocks-api-plan

Objective:
Decide whether Slate v2 has the best long-term API architecture, DX, and
performance shape for model-present content whose DOM is intentionally absent:
shadcn-style accordion, collapsible, tabs, and similar hidden/offscreen editor
blocks.

Goal plan:
docs/plans/2026-05-26-slate-v2-hidden-dom-blocks-api-plan.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- none

Completion threshold:
- Score >= 0.90 and no dimension below 0.85.
- Every pass row is complete or intentionally skipped with evidence.
- Issue/reference sync rows are closed.
- Every Slate v2 behavior/API claim cites live `.tmp/slate-v2` source and the
  relevant `.tmp/slate-v2` command.
- Final handoff is ready for user review.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-hidden-dom-blocks-api-plan.md` passes.

Verification surface:
- Planning source audit in `plate-2`.
- Slate v2 source/test/example reads in `.tmp/slate-v2`.
- Focused Slate React DOM coverage tests in `.tmp/slate-v2/packages/slate-react`.
- Planning closure records issue-ledger sync, current substrate tests, source
  grounding, and browser-proof execution gates. Browser route proof belongs to
  execution because the accepted `contentBoundary` target is not implemented in
  planning mode.

Constraints:
- Planning mode only. Do not patch `.tmp/slate-v2` implementation until the
  user explicitly accepts this plan.
- Raw Slate stays unopinionated. Slate owns the runtime primitive; examples may
  be shadcn-shaped, but Slate should not ship product block kits.
- Do not expose raw `RenderElementProps.path` just to make accordion/tabs easy.
- Missing editable DOM is valid only through a Slate-owned DOM coverage
  boundary. Raw app omissions stay unsupported.

Boundaries:
- Allowed planning edits: `docs/plans/**`, `docs/research/**`,
  `docs/slate-issues/**`, `docs/slate-v2/ledgers/**`,
  `docs/slate-v2/references/**`.
- Live implementation source of truth: `.tmp/slate-v2/packages/slate-dom`,
  `.tmp/slate-v2/packages/slate-react`, `.tmp/slate-v2/packages/slate`, and
  `.tmp/slate-v2/site`.
- Issue source of truth: generated live ledger, manual v2 sync ledger, fork
  dossier, and issue coverage matrix.

Blocked condition:
- Block only after three consecutive activations hit the same missing external
  or user decision and no source/read/review/sync pass remains runnable.

Slate Plan lane state:
- slate_plan_lane_status: complete
- current_pass: closure-score-and-final-gates
- current_pass_status: complete
- next_pass: none
- next_action: none
- final_handoff_status: ready for user review

Current verdict:
- verdict: revise, not replace
- confidence: 0.90
- keep / cut / revise call: keep `DOMCoverage` as the substrate; revise public
  React DX before calling this the best API
- reason: the architecture already breaks the legacy "every node must be in the
  DOM" constraint, but the app-facing surface is still `unstableBoundary`, needs
  manual `boundaryId`, lacks per-boundary materialization, and the example is a
  technical harness instead of a shadcn-first block demo.

Completion rule:
- Goal completion is allowed only after this closure pass records the final
  handoff and `check-complete` passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `.agents/skills/slate-plan/SKILL.md` read before this plan edit |
| Active goal checked or created | yes | `get_goal` returned null; `create_goal` created thread `019e63f8-9985-75c0-ae68-33575e324b41` |
| Source of truth read before edits | yes | live `.tmp/slate-v2` files and prior DOM coverage solution read |
| `docs/solutions` checked for non-trivial existing-code work | yes | `docs/solutions/developer-experience/2026-05-02-slate-dom-incomplete-work-should-start-with-internal-coverage-boundaries.md:23` |
| Live `.tmp/slate-v2` grounding needed for current-state claims | yes | source/test/example pointers below |

Work Checklist:
- [x] Objective includes lane outcome, full pass schedule, one-pass-per-activation policy, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] One-pass-per-activation policy respected for this activation.
- [x] Live source grounding recorded for current implementation claims.
- [x] Issue ledger / ClawSweeper pass applied or skipped with concrete evidence.
- [x] Research and ecosystem synthesis complete for every external system used as evidence.
- [x] Intent/boundary record and decision brief complete.
- [x] Scorecard recorded with evidence; total score >= 0.90 and no dimension below 0.85 before closure.
- [x] Applicable implementation-skill review matrix applied or skipped with concrete reason.
- [x] Slate maintainer objection ledger complete for every breaking/paradigm change.
- [x] Verification workspace gate recorded for current-pass Slate v2 claims.
- [x] TDD acceptance surface complete for target behavior.
- [x] Browser-proof disposition recorded: current substrate claims have focused
  `.tmp/slate-v2` proof; future shadcn route/browser behavior remains an
  execution gate because planning mode cannot implement it.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run closure commands named in this plan | focused Slate React DOM coverage tests passed; focused core migration/collab tests passed; `check-complete` passed |
| Slate v2 behavior/API claim | yes | Record `.tmp/slate-v2` command/proof for every claim | current substrate claims cite live source/tests; accepted future API/browser claims are marked execution gates, not implemented behavior claims |
| Issue ledger or PR reference changed | yes | Sync issue rows when related issue pass changes claims | hidden/offscreen planning sync added to manual sync ledger, issue coverage matrix, fork dossier, and PR reference with zero fixed/improved claims |
| Autoreview for uncommitted implementation changes | N/A now | Planning-only activation | no `.tmp/slate-v2` implementation patch |
| Final user-review handoff | yes | Emit final handoff in this plan and final response | final handoff section is filled and lane state is ready for user review |
| Goal plan complete | yes | Run `check-complete` at closure | final closure run passed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | live source/test/example reads; focused tests passed | related issue discovery |
| Related issue discovery | complete | reused existing ClawSweeper/ledger rows for hidden subtree, islands/content roots, virtualization, structural DOM exclusion, focus controls, and a11y guards; live generated rows read for related current issues | issue-ledger pass |
| Issue-ledger pass | complete | scanned full issue ledger, clusters, test candidates, benchmark candidates, package-impact matrix, requirements, and relevant candidate leaf files; no new fixed/improved claims | intent/boundary pass |
| Intent/boundary and decision brief | complete | decision: public slot should be `slots.contentBoundary`; `DOMCoverage` remains internal; app UI state stays app-owned; materialization must be per-boundary/composable | research refresh |
| Research, ecosystem strategy, live-source refresh | complete | Context7 shadcn and Radix docs refreshed; compiled React/TanStack/editor research reused; live `.tmp/slate-v2` source re-read for current boundary slot, singleton materialize handler, metrics, exports, and debug example call sites | pressure passes |
| Performance/DX/migration/regression/simplicity pressure passes | complete | applied Vercel React, performance, performance-oracle, tdd, shadcn, and react-useeffect lenses; focused DOM coverage tests reran green; pressure result keeps `contentBoundary` but adds hard gates for boundary IDs, handler composition, native degradation, Radix shell mounting, and browser proof | objection ledger |
| Slate maintainer objection ledger | complete | steelman ledger expanded for stable `contentBoundary`, optional boundary IDs, per-boundary materialization, model-present missing DOM, Radix shell examples, native degradation, and no raw path/ignore-DOM escapes; focused DOM coverage tests reran green | high-risk pass |
| High-risk deliberate mode | complete | pre-mortem, expanded proof plan, blast radius, and rollback/hard-cut answer recorded for public slot, handler lifecycle, native degradation, Radix shells, collaboration UI state, and example/docs risks; focused DOM coverage tests reran green | ecosystem maintainer pass |
| Ecosystem maintainer pass | complete | extension/plugin and slate-yjs/collab backbone answers recorded against current Slate v2 extension state/tx namespaces, commit metadata, collab state patches, remote selection stress, history skip/rebase, DOM coverage boundaries, and focused tests | revision pass |
| Revision pass | complete | accepted target shape, execution proof queue, callback payload, scorecard threshold, hard cuts, remaining closure gaps, and formatting cleanup consolidated against live source and focused tests | issue sync accounting |
| Issue sync accounting | complete | manual v2 sync ledger, issue coverage matrix, fork dossier, and PR reference now carry a hidden/offscreen block API planning sync; all rows preserve related/non-claim/release-guard status and add zero fixed/improved claims | closure score and final gates |
| Closure score and final gates | complete | final score is 0.90 with no dimension below 0.85; all pass rows complete; browser proof is explicitly execution-gated; final handoff filled; `check-complete` passed | final handoff |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.90 | hidden 1000-descendant expansion avoids waking siblings in `.tmp/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:754`; hidden model updates avoid visible sibling render at `:834`; revision pass keeps repeated-unit, stress, and handler-lifecycle proof gates as execution blockers |
| Slate-close unopinionated DX | 0.20 | 0.90 | current render props expose `slots.unstableBoundary` at `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:445`; revision pass accepts stable `contentBoundary`, optional `boundaryId`, pathless `scope`, `mounted`, and object-shaped `onMaterialize({ boundary, reason, range })` |
| Plate and slate-yjs migration backbone | 0.15 | 0.90 | ecosystem pass maps `contentBoundary` to Plate/plugin wrappers and keeps collab deterministic through document ops, state patch policy, commit metadata, local UI defaults, and no shared boundary IDs; focused core collab/migration tests passed |
| Regression-proof testing strategy | 0.20 | 0.90 | focused current tests reran green: 2 files, 25 tests; revision pass keeps focused unit, native bridge, stress, browser route, issue-sync, and no-false-claim proof rows as explicit gates |
| Research evidence completeness | 0.15 | 0.90 | Context7 refreshed shadcn/Radix docs; compiled React/TanStack/editor research reused; ecosystem pass read current extension/collab source and collab readiness artifact instead of relying on memory |
| shadcn-style composability and minimalism | 0.10 | 0.90 | public target maps to Root/Trigger/Content without raw path props: trigger stays app UI, `contentBoundary` owns intentionally unmounted editable children, Radix `forceMount` is shell support, and revision pass keeps wrappers example/Plate-owned |

Weighted score:
- 0.90

Revision pass accepted target:
- status: accepted for user review as a planning target; implementation remains
  pending until the user accepts this plan.
- public React API:
  `slots.contentBoundary({ mounted, scope, boundaryId?, selectionPolicy?,
  copyPolicy?, findPolicy?, onMaterialize?, renderPlaceholder?, children })`.
- materialization callback: single object payload,
  `onMaterialize({ boundary, reason, range })`, so future metadata can grow
  without argument-order churn.
- default policy: `boundaryId` is auto-generated from owner runtime identity plus
  normalized scope; explicit `boundaryId` remains a debug/test override.
- selection/copy/find defaults: selection stays boundary/degraded unless the app
  opts into materialization; copy can be model-backed; find is degraded while
  DOM is absent.
- runtime: `DOMCoverage` stays internal; dispatch moves from singleton handler
  to per-boundary/composable materialization while preserving the composition
  guard.
- examples: shadcn-shaped Accordion and Tabs first; Collapsible only if it stays
  a tiny third example over the same primitive. Raw Slate exports no product UI.
- collaboration: boundary IDs and open/tab UI state stay local by default; apps
  may explicitly model shared UI state, while document operations remain shared.
- hard cuts: no raw path props, public `ignoreDOM`, public `ignoreCursor`, public
  `coverageBoundary`, public `HiddenContent`, or raw Radix adapter.
- closure disposition: issue/reference sync and final user-review handoff are
  closed. Browser proof remains an execution gate for the unimplemented
  shadcn/contentBoundary route.

Source-backed architecture north star:
- target shape: `DOMCoverage` remains the internal runtime primitive for
  model-present missing DOM. `slate-react` exposes `slots.contentBoundary` as the
  stable, narrow render slot for intentionally unmounted editable content.
- source evidence: `DOMCoverageBoundary` already carries state, reason,
  selection/copy/find policy, owner path/runtime metadata, and version at
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts:72`.
- rejected drift: do not add public `ignoreDOM`, `ignoreCursor`, raw path props,
  or product-specific Accordion/Tabs APIs to raw Slate.
- migration posture: Plate can wrap the stable slot into branded components;
  slate-yjs/collab keeps document content shared while UI open state is local by
  default unless an app persists it.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| React render slot | Promote `slots.unstableBoundary` to stable `slots.contentBoundary`; make `boundaryId` optional; keep `scope` pathless; add per-boundary `onMaterialize` with an object payload | `<slots.contentBoundary mounted={open} scope={{ type: 'children', from: 1 }} onMaterialize={({ boundary, reason, range }) => setOpen(true)} />` | Existing unstable call sites migrate mechanically; no raw path exposure; `coverage` vocabulary remains internal | current slot type at `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:405`; slots passed to renderers at `:739` | revise |
| Boundary IDs | Auto-generate from owner runtime id plus scope; allow explicit override only for debug/testing | no manual IDs for normal app authors | preserves current explicit IDs in tests/examples | current IDs are manual in example at `.tmp/slate-v2/site/examples/ts/dom-coverage-boundaries.tsx:252` | revise |
| Materialization | Add per-boundary `onMaterialize({ boundary, reason, range })` through a composable handler registry; do not keep only one editor-wide handler | hidden accordion/tabs can open when selection/paste/focus targets hidden content | required before `selectionPolicy: materialize` is sane for app-hidden blocks | current singleton `DOMCoverage.setMaterializeHandler` at `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts:638`; virtualized/staged handlers install at `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:1809` and `:1839` | revise |
| Standard blocks | Keep out of raw package; add shadcn-shaped examples for Accordion and Tabs, maybe Collapsible if it stays tiny | users see real block patterns, not a debug harness | Plate owns polished kits later | current debug example at `.tmp/slate-v2/site/examples/ts/dom-coverage-boundaries.tsx:187` | keep example-only |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| DOM lookup bridge | `slate-dom` `DOMCoverage` | boundary-aware point/range resolution before raw DOM assert | hidden content crash and stale DOM reads | `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts:645` | keep |
| Copy/paste/drag | `slate-react` input strategies plus `slate-dom` clipboard runtime | model-backed serialization when hidden ranges are selected | stale hidden DOM payloads | `.tmp/slate-v2/packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts:219` | keep |
| Selection import/export | `selection-controller` | materialize or model-back boundary selections | invisible caret inside unmounted content | `.tmp/slate-v2/packages/slate-react/src/editable/selection-controller.ts:268` | revise with per-boundary handler |
| DOM strategy metrics | `Editable` metrics | expose mounted/pending/native-complete/degradation counters | false native-surface claims | `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:1972` | keep |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| Accordion body | `Trigger` is `contentEditable={false}`; body uses `contentBoundary` with `mounted=open` and `onMaterialize` | Shell stays mounted; Slate slot owns hidden editable children | closed body must not render descendants | shadcn Accordion docs: Root/Item/Trigger/Content via Context7; Slate hidden descendants not rendered at `.tmp/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:818` | target |
| Tabs panel | active panel mounted; inactive panels register coverage boundaries | tab controls own roving focus; editor selection only enters active panel unless materialized | inactive panels do not mount editable descendants | shadcn Tabs docs: List/Trigger/Content via Context7 | target |
| Collapsible/details | same primitive as Accordion, no separate API | example-local wrapper only | no duplicate runtime path | core already has collapsible-shaped normalization fixtures at `.tmp/slate-v2/packages/slate/test/normalization/text/merge-adjacent-non-selectable-ancestor.ts:36` | target |

Plate migration-backbone target:
| Pressure | Slate substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| shadcn-quality blocks | stable pathless `contentBoundary` slot and per-boundary materialize | Plate can wrap into `<AccordionContent>` / `<TabsContent>` kits | raw Slate should not ship Plate UI or Tailwind classes | current slot hides runtime IDs from call sites at `.tmp/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:407` | good after revise |

slate-yjs migration-backbone target:
| Pressure | Slate substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| hidden content edits and remote updates | model is authoritative even when DOM absent | document ops sync normally; open/active tab state is local UI by default, optionally app-persisted | no raw Slate shared UI-state protocol in this plan | hidden model update stays out of DOM/render at `.tmp/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:890` | needs policy row |

Intent / boundary record:
- intent: make model-present missing DOM a first-class editor contract. Slate
  should no longer require every model node to be mounted, but it must never let
  apps silently omit editable DOM without declaring the boundary.
- outcome: app authors can build accordion, tabs, collapsible, and offscreen
  editor blocks without stale DOM lookups, broad sibling rerenders, raw path
  props, or fake native-surface promises.
- in-scope: stable `slots.contentBoundary`, optional `boundaryId`,
  per-boundary/composable materialization, shell-mounted app UI with unmounted
  editable descendants, shadcn-shaped examples, focused tests, metrics, and
  issue accounting.
- out-of-scope: raw Slate Accordion/Tabs components, public `ignoreDOM` or
  `ignoreCursor`, arbitrary app omissions without a Slate boundary, CSS-only
  hiding as an editor contract, whole-editor `display:none` lifecycle closure,
  and browser find/screen-reader parity over content that is not in the DOM.
- authority split:
  - `slate-dom` owns boundary registration, model-to-DOM resolution,
    DOM-to-model recovery, native-surface degradation metadata, and the
    materialization request protocol.
  - `slate-react` owns the public slot, render lifecycle, placeholder shell,
    focus integration, handler composition, and metrics wiring.
  - `slate` owns model content, paths, runtime identity, operations, and
    snapshots; it does not know about Accordion/Tabs open state.
  - apps own open/collapsed/tab state. Slate may request materialization; it
    should not persist product UI state for them.
  - Plate may wrap `contentBoundary` into branded block kits later.
  - slate-yjs/collab syncs document operations; local UI state remains local by
    default unless the app models it explicitly.
- default behavior:
  - selection/focus targeting hidden content asks the owning boundary to
    materialize.
  - copy/paste/drag over hidden model content can stay model-backed without
    forcing the app to mount DOM.
  - an app that refuses to materialize must get honest degradation state, not a
    fake native DOM success path.
- decision boundaries: this plan can choose internal/runtime API shape, public
  slot direction, example scope, and proof gates. User acceptance is required
  before code execution.
- unresolved user-decision points: none blocking. The recommended public name is
  `contentBoundary`; the revision pass fixes the callback payload as
  `{ boundary, reason, range }`.

Decision brief:
- principles: missing DOM must be explicit; raw Slate stays UI-agnostic; app DX
  must be pathless; materialization must be local and composable; native-surface
  degradation must be visible; examples should teach the call site, not hide the
  API behind helper machinery.
- top drivers:
  - correctness of selection, focus, copy, paste, and drag over missing DOM.
  - shadcn-style composition where Trigger/List/Content stay app-owned.
  - large hidden subtree performance with zero hidden descendant render work.
  - Plate/slate-yjs migration where document data stays shared and product UI
    state stays outside raw Slate by default.
  - honest issue accounting: related pressure is not the same as fixed issue
    closure.
- viable options:
  - Keep only `unstableBoundary`: fastest, but bad DX and no app materialization.
  - Promote `slots.contentBoundary` with optional ID and per-boundary
    materialization: best balance.
  - Promote `slots.coverageBoundary`: technically honest, but too internal for
    public React DX.
  - Add a high-level `<HiddenContent>` component: simpler demo, but awkward for
    custom element renderers and too close to a product block API.
  - Add Accordion/Tabs APIs to Slate: attractive demo, wrong package boundary.
  - Add public ignore-cursor/ignore-DOM: easy escape hatch, recreates legacy
    missing-DOM bugs.
- chosen option: `slots.contentBoundary` plus per-boundary materialization,
  backed by internal `DOMCoverage` and shown through shadcn-shaped examples.
- rejected alternatives: product block APIs, raw path props, CSS-only hidden DOM,
  public ignore-cursor/ignore-DOM, public `coverage` naming, and permanent
  `unstableBoundary`.
- consequences: more runtime contract work before public API finalization; better
  long-term adapter story for Plate and custom apps; raw Slate stays small but
  needs strong tests because the primitive is powerful.
- follow-ups: research refresh, browser example proof, collaboration/open-state
  policy review, pressure passes, objection ledger, issue/reference sync.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| `#2072` island/contenteditable boundary | related architecture pressure | hidden blocks strengthen the library-owned boundary story, but do not close the broad Island request | accordion/tabs triggers and covered content are one narrow document-flow island shape | live row at `docs/slate-issues/gitcrawl-live-open-ledger.md:634`; existing matrix rows at `docs/slate-v2/ledgers/issue-coverage-matrix.md:286` | existing 2026-05-24 row covers | related matrix only |
| `#1769` / `#3893` external and non-editable focus | related focus pressure | shadcn-style triggers/native controls need browser proof, but no exact focus closure claim | accordion/tabs triggers are `contentEditable={false}` controls inside editor chrome | live rows at `docs/slate-issues/gitcrawl-live-open-ledger.md:640` and `:466`; matrix row at `docs/slate-v2/ledgers/issue-coverage-matrix.md:299` | existing related rows cover | related matrix only |
| `#5211` hidden whole editor lifecycle | not claimed / stale-candidate | hiding an entire editor and showing it again is adjacent React lifecycle pressure, not a model-present hidden-subtree claim | this plan covers model content hidden by Slate coverage boundaries, not arbitrary display-hidden `Editable` lifecycle | live row at `docs/slate-issues/gitcrawl-live-open-ledger.md:177`; v2 sync at `docs/slate-issues/gitcrawl-v2-sync-ledger.md:706` | existing stale no-claim row covers | no PR claim |
| `#5355` singleton-dom-selection | not claimed | raw missing DOM remains unsupported unless Slate-owned coverage boundary exists | custom `colgroup` / `col` DOM omission is adjacent missing-DOM pressure | current dossier at `docs/slate-v2/ledgers/fork-issue-dossier.md:3601`; live row at `docs/slate-issues/gitcrawl-live-open-ledger.md:161` | existing issue-reviewed/no-claim rows cover | related matrix only |
| `#5924` structural DOM exclusion | not claimed | target is DOM coverage plus mount policy, not public ignore-cursor | same tempting bad API this plan rejects | live row at `docs/slate-issues/gitcrawl-live-open-ledger.md:41`; matrix row at `docs/slate-v2/ledgers/issue-coverage-matrix.md:500` | existing no-claim rows cover | related matrix only |
| `#790` dynamic rendering | related proof-route backlog | hidden/offscreen blocks and virtualization share DOM coverage pressure | any claim needs mount/edit/scroll and native behavior proof | live row at `docs/slate-issues/gitcrawl-live-open-ledger.md:646`; matrix row at `docs/slate-v2/ledgers/issue-coverage-matrix.md:336` | existing proof-route backlog rows cover | related matrix only |
| `#2793` / `#2572` accessibility guardrails | release guard | missing-DOM modes cannot claim screen-reader/native find equivalence without proof | hidden content has native-surface limits | live rows at `docs/slate-issues/gitcrawl-live-open-ledger.md:614` and `:623`; fork row at `docs/slate-v2/ledgers/fork-issue-dossier.md:7708` | existing release-guard rows cover | release guard |
| `#3892` custom editor surface/layout | policy non-claim | generic substrate helps, but product custom editor surfaces stay outside raw Slate closure | hidden tabs/accordion examples are examples, not a custom layout engine API | live row at `docs/slate-issues/gitcrawl-live-open-ledger.md:467`; dossier at `docs/slate-v2/ledgers/fork-issue-dossier.md:5073` | existing policy non-claim rows cover | no PR claim |

Issue-ledger sync status:
- ClawSweeper related-issue pass: complete by reuse, not rerun. Existing
  ClawSweeper/ledger work covers the same touched surface: hidden-subtree DOM
  coverage proof (`docs/plans/2026-05-02-slate-v2-hidden-subtree-first-class-ralplan.md`),
  island/content-root planning (`docs/slate-issues/gitcrawl-v2-sync-ledger.md:171`),
  pagination/virtualization missing-DOM guardrails
  (`docs/plans/2026-05-25-slate-v2-pretext-pagination-virtualization-feedback.md:476`),
  and provider-owned layout fragment reuse
  (`docs/plans/2026-05-26-slate-v2-provider-owned-page-layout-fragments.md:365`).
- generated live gitcrawl rows read: complete for `#5924`, `#5355`, `#5211`,
  `#3893`, `#3892`, `#2072`, `#1769`, `#2793`, `#2572`, and `#790`.
- manual v2 sync ledger update: complete. Added
  `2026-05-26 Hidden/Offscreen Block API Planning Sync` to
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`.
- fork issue dossier update: complete. Added
  `Hidden/Offscreen Block API Surface Review - 2026-05-26` to
  `docs/slate-v2/ledgers/fork-issue-dossier.md`.
- issue coverage matrix update: complete. Added
  `Hidden/Offscreen Block API Planning Sync - 2026-05-26` to
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- PR description sync: complete. Added hidden/offscreen block API planning sync
  to `docs/slate-v2/references/pr-description.md`.
- claim result: zero new `Fixes #...` claims and zero new `Improves #...`
  claims. Related issues remain related, not claimed, stale/no-claim, release
  guard, policy non-claim, or proof-route backlog.
- no generated live ledger edit: `docs/slate-issues/gitcrawl-live-open-ledger.md`
  remains generated input only.

Issue-sync accounting pass:
| Artifact | Sync result | Claim result |
|----------|-------------|--------------|
| `docs/slate-issues/gitcrawl-live-open-ledger.md` | read only; current rows exist for `#5924`, `#5355`, `#5211`, `#3893`, `#3892`, `#2793`, `#2572`, `#2072`, `#1769`, and `#790` | no manual edit |
| `docs/slate-issues/gitcrawl-v2-sync-ledger.md` | added hidden/offscreen planning sync section | zero fixed/improved claims |
| `docs/slate-v2/ledgers/issue-coverage-matrix.md` | added hidden/offscreen planning sync section | zero fixed/improved claims |
| `docs/slate-v2/ledgers/fork-issue-dossier.md` | added hidden/offscreen surface review section | zero fixed/improved claims |
| `docs/slate-v2/references/pr-description.md` | added maintainer-facing summary bullet | zero fixed/improved claims |

Issue-ledger pass notes:
- Files scanned: `docs/slate-issues/open-issues-ledger.md`,
  `docs/slate-issues/gitcrawl-clusters.md`,
  `docs/slate-issues/issue-clusters.md`,
  `docs/slate-issues/test-candidate-map.md`,
  `docs/slate-issues/test-candidate-map/2694-790.md`,
  `docs/slate-issues/test-candidate-map/3313-2733.md`,
  `docs/slate-issues/test-candidate-map/3948-3881.md`,
  `docs/slate-issues/test-candidate-map/5246-5130.md`,
  `docs/slate-issues/test-candidate-map/5402-5250.md`,
  `docs/slate-issues/test-candidate-map/5994-5918.md`,
  `docs/slate-issues/benchmark-candidate-map.md`,
  `docs/slate-issues/package-impact-matrix.md`, and
  `docs/slate-issues/requirements-from-issues.md`.
- Full-corpus clusters confirm the plan's center of gravity: runtime-boundary
  ownership is `407` issues in the package-impact matrix, selection/focus/DOM
  bridge is `172` issues in the cluster map, and React runtime/subscription is
  another `111` issues. Hidden/offscreen blocks belong in `slate-dom` plus
  `slate-react`, backed by core identity/transaction semantics.
- `#2072` remains related architecture pressure, not a closed Island feature.
  The acceptance target is a coherent app-owned boundary with browser proof,
  not a raw Slate `<Island>` product API.
- `#1769` and `#3893` become hard proof routes for shadcn-style triggers and
  native controls: clicking `contentEditable={false}` controls must leave Slate
  focus state honest. `#3893` is `ready-now`; `#1769` is
  `ready-with-minor-setup`.
- `#790` remains benchmark/backlog pressure. Hidden/offscreen blocks share the
  same DOM-coverage policy, but this plan should not claim general
  virtualization until a huge-document fixture compares full render vs staged or
  windowed render with DOM node count and first-edit latency.
- `#5924` remains not claimed. The thread lacks a clean repro and the useful
  extraction is only an advanced-layout capability note; public `ignoreDOM` or
  `ignoreCursor` stays rejected.
- `#5355` remains not claimed. Raw app-rendered `colgroup`/`col` omissions are
  unsupported unless a Slate-owned coverage boundary registers the hidden model
  content.
- `#5211` remains stale/no-claim. Whole-editor hide/show persistence is React
  lifecycle pressure, not the same contract as model-present hidden descendants.
- `#2793` and `#2572` remain release guards/no-claim rows. Hidden DOM modes must
  expose native-surface degradation instead of promising screen-reader or native
  find parity over unmounted content.
- Requirements impact: R6 requires explicit DOM selection/focus ownership; R7
  covers input/focus lifecycle pressure for native controls; R8 supports
  selector-first React rendering for hidden/showing editors; R13 keeps any
  virtualization/perf claim benchmark-driven.
- No ledger file needs a classification edit in this pass. The existing ledgers
  already carry related, not-claimed, release-guard, policy non-claim, and stale
  no-claim rows for this issue surface.

Related issue discovery notes:
- No broad live GitHub issue search was run. The generated live ledger and
  existing ClawSweeper outputs already cover this surface.
- The issue set got wider than the first pass: `#2072`, `#1769`, `#3893`, and
  `#5211` are now explicit because shadcn-style triggers and hidden/show
  lifecycles are real proof pressure.
- No issue is fixed or improved by planning docs alone.
- Execution proof must not auto-close any issue unless the final browser/API
  tests match that issue's exact reproduction.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| shadcn Accordion | Context7 `/shadcn-ui/ui`, Accordion docs | Root/Item/Trigger/Content composition | bloated imperative APIs | composable Trigger/Content mental model | shipping UI kit in Slate | example-local wrappers over `contentBoundary` | accepted |
| shadcn Collapsible | Context7 `/shadcn-ui/ui`, Collapsible docs | Root/Trigger/Content composition | custom collapse API in Slate | same small Trigger/Content shape as Accordion | separate Slate Collapsible primitive | use same `contentBoundary` pattern as Accordion | accepted |
| shadcn Tabs | Context7 `/shadcn-ui/ui`, Tabs docs | List/Trigger/Content with value-controlled active panel | hand-rolled tab state mixed into editor runtime | value/open control shape | inactive editable DOM mounted by default | inactive panels as content boundaries | accepted |
| Radix Content `forceMount` | Context7 `/websites/radix-ui_primitives`, Accordion/Collapsible/Tabs Content API and animation guide | hidden Content is typically removed from React/DOM; `forceMount` gives app-controlled mounting | boundary unregistering when a closed panel unmounts | use `forceMount` or a persistent shell so Slate boundary stays registered | treating `forceMount` as the whole editor solution | shell can stay mounted; `contentBoundary` decides editable descendant mount and materialization | accepted |
| React 19.2 hidden/offscreen posture | compiled research `docs/research/systems/editor-architecture-landscape.md:217` and `docs/research/systems/slate-v2-overlay-architecture.md:63` | hidden stateful panes and non-urgent background UI are first-class React-side primitives | blaming React for all hidden-pane costs | let non-visible UI state remain React-local | assuming React hidden panes solve DOM selection/copy/paste | Slate still owns editor DOM coverage and native degradation | accepted |
| Slate DOM coverage prior decision | `docs/solutions/developer-experience/2026-05-02-slate-dom-incomplete-work-should-start-with-internal-coverage-boundaries.md:137` | internal primitive before public hidden API | fossilized product vocabulary | keep lower-level bridge first | permanent unstable public API | stable slot after proof matrix | agree |
| TanStack/virtualization research | `docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md:160` | external viewport engine, Slate-owned semantics | virtualization owning editor semantics | mount planner separation | letting virtualizer decide Slate behavior | hidden blocks use same DOM coverage policy, not TanStack | agree |

Research/live-source refresh notes:
- shadcn docs confirm the target component grammar is small: Accordion is
  Item/Trigger/Content, Collapsible is Trigger/Content, and Tabs is
  List/Trigger/Content. That supports an example-local wrapper, not raw Slate
  Accordion/Tabs exports.
- Radix docs confirm `Accordion.Content`, `Collapsible.Content`, and
  `Tabs.Content` expose `forceMount`, and the Radix animation guide says hidden
  stateful primitives are typically removed from React and the DOM unless the
  app takes mount control. This is exactly why a Slate hidden-content example
  must keep a shell or forced Content mounted while `contentBoundary` owns the
  editable descendants.
- `forceMount` is useful plumbing, not the architecture. If the entire Radix
  Content subtree unmounts while closed, Slate loses boundary registration.
  Therefore the example must either use Radix `forceMount` or keep a persistent
  non-editable shell outside Radix Content, then pass `mounted={open}` or
  `mounted={active}` to `contentBoundary`.
- Compiled React 19.2 research supports preserved hidden panes and non-urgent
  UI, but it does not remove Slate's responsibility for DOM lookup, selection,
  clipboard, IME, native find, or screen-reader degradation.
- TanStack Virtual research remains relevant only for viewport range planning.
  It confirms Slate should own DOM coverage, materialization, copy/paste,
  selection import/export, IME/mobile guards, and degradation metrics.
- Live source refresh shows `EditableElementSlots.unstableBoundary` is still the
  only public-ish slot, `EditableDOMCoverageBoundaryProps` still requires
  `boundaryId`, `DOMCoverage.materializeBoundary` still uses a single registry
  handler, and `Editable` already exposes `nativeSurfaceComplete` and
  `degradationMode` metrics. No source has drifted into the final
  `contentBoundary` shape yet.
- The current debug example still imports `DOMCoverage` from `slate-dom/internal`
  and uses manual `slots.unstableBoundary` calls. It is useful proof plumbing,
  not final DX.

Pressure pass results:
| Lens | Verdict | Evidence | Required gate |
|------|---------|----------|---------------|
| Performance | keep with hard gates | 1000 hidden descendants stay unrendered while collapsed; visible siblings do not rerender on hidden model updates; huge-document artifacts show low ready-time and bounded DOM counts for staged/virtualized surfaces | cohort rows, repeated-unit budget, DOM/editable descendant counts, no hidden-descendant effects/subscriptions while closed |
| DX | revise before public claim | current public-ish slot is `unstableBoundary`, `boundaryId` is required, and materialization is singleton-owned | stable `slots.contentBoundary`, optional ID, JSDoc, pathless scope, typed `onMaterialize` payload |
| Unopinionated core | keep | shadcn/Radix grammar maps to examples over the primitive; raw Slate does not need Accordion/Tabs exports | product wrappers stay example/Plate-owned |
| Migration | acceptable backbone | model content stays authoritative when DOM is absent; collab readiness artifact shows replay/bookmark substrate is real | no slate-yjs closure claim; document ops shared, open/tab state local unless the app models it |
| Regression | adequate plan, not final proof | focused DOM coverage tests are green; current debug example is not enough | browser route must prove Accordion/Tabs materialization, native degradation, copy/paste, selection, and shell persistence |
| Research | complete for this pass | shadcn/Radix docs refreshed; compiled React/TanStack/editor research reused | no extra external research before objection pass |
| Simplicity | cut product-shaped API | `contentBoundary` is the one public primitive; `DOMCoverage` stays internal | reject public `forceMount`, `coverageBoundary`, `HiddenContent`, raw Radix adapters, raw path props, and multiple materialize APIs |

Pressure-pass gates:
| Gate | Required shape | Why |
|------|----------------|-----|
| Cohorts | normal 0-500 blocks; medium 500-2000; large 2000-10000; stress 10000-50000; pathological tags for hidden depth, Radix shell, collab, IME, tables, and custom renderers | prevents a demo-only win from being mistaken for architecture proof |
| Repeated-unit budget | closed boundary shell: <=1 non-editable shell wrapper, 0 editable descendants, 0 descendant subscriptions/effects/listeners, no sibling renders on hidden model update | the API only wins if hidden panels are cheap while hidden |
| Handler locality | materialization dispatch is per boundary or composable, not one clobbered editor-wide callback | app-hidden, staged, and virtualized boundaries must coexist |
| Native behavior contract | browser find and screen-reader coverage are degraded while DOM is absent; copy/paste and select-all use model-backed paths; IME/materialization is guarded | honest degradation beats fake native parity |
| Radix shell contract | closed Accordion/Collapsible/Tabs content keeps a Slate boundary shell registered while `contentBoundary` owns editable descendant absence | Radix unmounting the whole content subtree would unregister Slate's boundary |
| Issue accounting | no `Fixes` / `Improves` issue claim until exact issue repro browser/API proof exists | related pressure is not issue closure |

TDD acceptance surface:
| Surface | Acceptance test |
|---------|-----------------|
| public slot | `slots.contentBoundary` works for self and child-range scopes; `boundaryId` is optional; explicit IDs remain test/debug escape hatch |
| materialization | app-hidden, staged, and virtualized handlers compose; selection/focus requests materialize the right boundary and call the app callback once |
| composition guard | active IME composition prevents unsafe materialization and preserves current text input |
| shadcn Accordion/Collapsible | closed content keeps a boundary registered, renders zero editable descendants, then materializes and focuses when targeted |
| shadcn Tabs | inactive panels register coverage, keep inactive text out of DOM, and activate the correct tab on materialization |
| native model operations | copy/paste/select-all over hidden model content uses model-backed paths and exposes native-surface degradation honestly |
| performance | 1000 hidden descendants render zero while closed; hidden model updates do not rerender visible siblings; boundary metrics expose DOM/editable counts |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Slate v2 target | Proof route | Owner | Status |
|------------------|-----------------|-----------------|-------------|-------|--------|
| dropped editable descendants | crash or stale DOM lookup | dev warning unless boundary registered | `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:375`; test at `.tmp/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:908` | slate-react | current proof exists |
| hidden copy/paste | stale DOM or empty payload | model-backed serialization/mutation | `.tmp/slate-v2/packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts:219` and `:244` | slate-react | current proof exists |
| large hidden body | hidden descendants still render | zero hidden descendant renders until expanded | `.tmp/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:754` | slate-react | current proof exists |
| app materialization | invisible model selection in hidden content | boundary asks app to mount/open | target per-boundary `onMaterialize` | slate-dom/slate-react | gap |
| shadcn accordion/collapsible shell | Radix Content may unmount while closed | non-editable shell or forced Content remains mounted; editable descendants are owned by `contentBoundary` | Context7 Radix Content `forceMount` docs plus new example/browser contract | slate-react/site | gap |
| shadcn tabs | inactive editable DOM either mounted or unsafe omitted | inactive panels covered and materializable | new example/browser contract; inactive panel shell must not unregister boundary | slate-react/site | gap |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| hidden blocks example | collapse, edit, re-collapse, select hidden, copy hidden | Chromium first | `.tmp/slate-v2/playwright/integration/examples/hidden-content-blocks.test.ts` | no stale DOM; model-backed payload; boundary count visible | planned |
| Radix shell behavior | close Accordion/Collapsible and switch Tabs while boundary stays registered | Chromium first | same route test | shell or forced Content remains mounted; hidden editable descendants absent | planned |
| tabs example | switch tabs, edit inactive model via command, materialize target tab | Chromium first | same route test | inactive text absent from DOM until active; materialization activates the right tab | planned |
| native surface limits | browser find/screen reader over unmounted panels | docs/browser smoke only | route exposes `nativeSurfaceComplete=false` / degradation note | no false equivalence claim | planned |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| current DOM coverage React contracts are green | `.tmp/slate-v2/packages/slate-react` | `bun test:vitest -- dom-coverage-boundary-contract.test.tsx dom-coverage-native-bridge-contract.test.ts` | passed in closure: 2 files, 25 tests, 1.51s | closure pass |
| core migration/collab backbone is green | `.tmp/slate-v2` | `bun test ./packages/slate/test/migration-backbone-contract.ts ./packages/slate/test/collab-document-state-contract.ts ./packages/slate/test/collab-selection-stress-contract.ts` | passed in closure: 9 tests across 3 files, 189ms | closure pass |
| stable slot/per-boundary materialization target | `.tmp/slate-v2` | future focused tests plus browser example | execution gate, not a planning closure claim | execution mode |
| plan artifact completion | `plate-2` | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-hidden-dom-blocks-api-plan.md` | passed | closure pass |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | yes | applied | keep repeated-unit reads local; avoid derived state effects; use stable event callbacks for materialization; defer non-urgent shell UI with React primitives only where useful | app hidden/open state stays app-local; Slate subscriptions stay boundary-scoped |
| performance-oracle | yes | applied | hidden subtree lookup and materialization must be indexed/bounded; no O(hidden descendant count) work while closed except explicit materialization | added cohort and repeated-unit budgets |
| performance | yes | applied | plan needs cohorts, p95/p99-style gates, DOM/memory tags, degradation contract, and native behavior rows before closure | added pressure-pass gates and native behavior contract |
| tdd | yes | applied | tests must target public behavior, not implementation names; browser proof must cover real Accordion/Tabs flows | added TDD acceptance surface |
| shadcn | yes | applied | use Root/Trigger/Content and Tabs List/Trigger/Content composition; do not ship a Slate UI kit | example-local wrappers only |
| react-useeffect | yes | applied | effects may register external DOMCoverage state, but interactions/materialization must not be derived-state effect machinery | per-boundary handler composition becomes execution blocker |

High-risk deliberate mode:
- trigger: the plan changes public React API shape, materialization runtime
  ownership, browser-native behavior claims, example package boundaries, and
  downstream migration posture.
- status: complete for planning; execution proof remains pending.
- current hard fact: live source still has required `boundaryId`, public-ish
  `slots.unstableBoundary`, one editor-wide materialize handler, and a debug
  route built on manual boundary IDs. The plan is still a target, not current
  implementation.

High-risk pre-mortem:
| Failure scenario | Likely cause | Current evidence | Mitigation | Required proof | Status |
|------------------|--------------|------------------|------------|----------------|--------|
| handler clobbering breaks staged/virtualized/app-hidden content | replacing singleton materialization without ownership rules | staged and virtualized surfaces both call `DOMCoverage.setMaterializeHandler` at `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:1814` and `:1844` | registry composes handlers by boundary owner/scope; cleanup is idempotent; handler return value is explicit | unit test with app-hidden boundary plus staged and virtualized handlers mounted together | planned proof |
| auto-generated boundary IDs become unstable across render/reorder | deriving IDs from display text, index, or React key instead of runtime owner and scope | current props require `boundaryId` at `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:405`; debug route manually repeats IDs at `.tmp/slate-v2/site/examples/ts/dom-coverage-boundaries.tsx:252` | generate from owner runtime identity plus normalized scope; explicit override remains for tests/debug | rerender/reorder test proving boundary identity stays stable and duplicate-free | planned proof |
| hidden UI state confuses collaboration and remote selection | app open/tab state is local while remote ops target hidden content | hidden model update tests prove model can change while DOM stays absent; no slate-yjs adapter closure is claimed | document app-local default; optional app-modeled UI state only when product needs shared open/tab state; remote selection materialization is a UI policy, not document data | collab policy row plus fake-adapter test showing document ops sync without shared UI state | planned proof |
| Radix/shadcn Content unmounts the Slate boundary shell | example uses Radix default unmount behavior directly | current debug route keeps manual `slots.unstableBoundary` mounted; Radix Content commonly unmounts hidden content without `forceMount` | example uses persistent non-editable shell or Radix `forceMount`; only editable descendants are omitted by `contentBoundary` | browser test verifies closed Accordion/Tabs keeps boundary registered while editable descendants are absent | planned proof |
| native behavior gets oversold | route/docs imply browser find or screen-reader parity over absent DOM | `DOMCoverageBoundary` has `findPolicy` and `copyPolicy` fields at `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts:81`; absent DOM cannot be native-find equivalent | metrics expose `nativeSurfaceComplete=false` / degradation; docs say model-backed operations are supported, native parity is conditional on mounting | browser route assertion for degradation state plus copy/paste model-backed proof | planned proof |
| performance claim regresses into hidden render work | content wrapper accidentally renders hidden descendants or subscribes per descendant while collapsed | existing test proves 1000 hidden descendants render zero while closed at `.tmp/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:754` | keep closed boundary at shell-level only; no descendant effects/listeners/subscriptions while closed | repeated-unit test and 1000/5000 hidden descendant stress row with DOM/editable descendant counts | planned proof |

Expanded proof plan:
| Proof lane | Required proof | Command / route | Closure bar |
|------------|----------------|-----------------|-------------|
| Unit API | `slots.contentBoundary` supports self and child-range scopes, optional `boundaryId`, explicit debug ID override, and no raw path/runtime ID exposure | `.tmp/slate-v2/packages/slate-react`: targeted Vitest for boundary slot API | public API tests pass |
| Unit runtime | app-hidden, staged, and virtualized materialization handlers compose without clobbering; cleanup removes only the owning handler | `.tmp/slate-v2/packages/slate-react`: materialization registry Vitest | all handler coexistence rows pass |
| Browser | Accordion, Collapsible, and Tabs examples keep non-editable shell mounted while editable descendants are absent, then materialize on selection/focus/copy/paste target | `.tmp/slate-v2`: `playwright test playwright/integration/examples/hidden-content-blocks.test.ts --project=chromium` | route proves no stale DOM crash and correct materialized panel |
| Native parity/degradation | copy/paste/select-all can be model-backed; browser find/screen-reader parity is degraded unless content is mounted | hidden-block browser route plus native bridge unit tests | model-backed operations pass and degradation is visible |
| Stress/perf | hidden body has 0 editable descendants and no hidden descendant renders while closed; expansion wakes only covered content; sibling render budget holds | focused large-boundary Vitest plus huge-document artifact row | repeated-unit budgets and DOM counts recorded |
| Migration | existing `unstableBoundary` call sites have a mechanical rename; manual `boundaryId` becomes optional without breaking explicit tests | package API tests plus example diff review | migration note in plan and docs is concrete |
| Docs/example | first example shows direct `slots.contentBoundary` call site before helper wrappers; shadcn wrappers stay example-local | site example source plus docs/reference row | no raw Slate Accordion/Tabs exports |
| Issue/reference | related issue rows stay non-claim unless exact browser/API proof matches issue repro | issue-sync accounting pass | no false `Fixes` / `Improves` claim |

Blast radius:
| Area | Expected touch | Risk | Guardrail |
|------|----------------|------|-----------|
| `slate-dom` | materialize handler registry or dispatch protocol | broad runtime bridge risk | keep `DOMCoverageBoundary` internal; focused registry tests before public docs |
| `slate-react` | slot rename/wrapper, optional ID generation, handler registration, metrics wiring | React lifecycle/render churn risk | use layout-effect registration only for boundary registry; no per-descendant work while closed |
| `.tmp/slate-v2/site` | hidden content blocks example using shadcn-shaped Accordion/Tabs/Collapsible | example looks like a core UI kit | example-local wrappers, direct raw slot call site first |
| Tests | unit, native bridge, stress, and browser rows | tests can become implementation-coupled | assert public behavior, DOM counts, copy/paste payloads, and registered boundaries |
| Plate/plugin consumers | product block wrappers around `contentBoundary` | wrapper layer becomes compatibility junk drawer | one primitive target; no raw path props or Radix-specific Slate API |
| slate-yjs/collab | local UI state vs shared document ops | remote peers may disagree on open panels | document local default; shared UI only if app models it explicitly |

Rollback / hard-cut answer:
| Decision | If execution proof fails | Hard-cut answer |
|----------|--------------------------|-----------------|
| stable `contentBoundary` | keep `unstableBoundary` internal/experimental and do not publish stable hidden-content API | do not ship raw `ignoreDOM`, raw path props, or product Accordion/Tabs APIs as fallback |
| optional `boundaryId` | keep explicit `boundaryId` for the first public cut if deterministic generation proves flaky | explicit IDs remain debug/test override; no collision-prone auto ID |
| composable materialization | keep singleton handler private to staged/virtualized strategies until ownership proof exists | do not expose app `onMaterialize` without coexistence tests |
| shadcn hidden-block example | keep debug route only if shell persistence cannot be proven | do not pretend Radix default unmounting is safe |
| native degradation | block public docs if degradation cannot be surfaced clearly | no browser find/screen-reader parity claim over absent DOM |

High-risk pass conclusion:
- still worth doing: the old all-nodes-in-DOM constraint blocks real editor
  layouts; the existing DOM coverage substrate already proves model-backed
  lookup/copy/paste and large hidden-range render savings.
- not ready to ship: public API, handler lifecycle, browser example, and native
  degradation proof must land before closure.
- no new blocker: high-risk pass produces stricter proof rows, not a reason to
  replace the architecture.

Ecosystem maintainer pass:
- trigger: public React API, extension/plugin wrapper surface, collaboration
  metadata, local/shared state policy, runtime identity, and document operation
  replay are all in scope.
- status: complete for planning; execution proof remains pending.
- bottom line: the target is viable for Plate/plugin authors and
  slate-yjs/collab maintainers only if raw Slate keeps one narrow primitive,
  keeps UI open/tab state app-owned by default, and treats boundary IDs as local
  runtime/debug identity rather than shared document identity.

Ecosystem maintainer matrix:
| Surface | Extension points affected | Plate/plugin maintainer answer | slate-yjs/collab maintainer answer | Proof required before closure | Verdict |
|---------|---------------------------|--------------------------------|------------------------------------|-------------------------------|---------|
| Stable `slots.contentBoundary` | `slate-react` render slots; no core extension namespace change | Product layers can wrap one pathless primitive into Accordion/Tabs/Collapsible content without wrapping every editor call or leaking raw paths | No document op shape changes; hidden content stays in the model; remote peers can sync content while each app decides mounted/open UI state locally | public slot tests plus hidden-block browser route | keep |
| Optional `boundaryId` | React boundary registration; runtime owner/scope identity | Plate can omit IDs for normal wrappers and pass explicit IDs only for debug/analytics | generated boundary IDs must stay local runtime/debug identity and never enter shared document ops, snapshots, or Yjs payloads | duplicate-free/stable ID tests plus assertion that operations do not serialize boundary IDs | keep |
| Per-boundary/composable materialization | `DOMCoverage` materialize dispatch; `slate-react` handler registration | Plate wrappers can open local product UI from `onMaterialize` without becoming a compatibility layer over staged/virtualized internals | Remote apply remains deterministic because materialization is UI reaction, not a document operation; remote selection may request local materialization but must not sync open state unless app models it | coexistence test for app-hidden + staged + virtualized handlers; fake remote selection/materialization test | keep |
| App-owned open/tab state | app/plugin state outside raw Slate document model by default | Plate owns polished state/control conventions; raw Slate only requests materialization | slate-yjs syncs document content and shared state fields only; open/tab state is local unless app deliberately stores it as shared state | docs policy row plus collab state-patch test proving shared/local fields are filtered | keep |
| Native degradation metrics | `DOMCoverageBoundary` policies and `Editable` DOM strategy metrics | Plate can choose stricter mounted defaults for a11y-sensitive product blocks while still using the primitive | Collab does not depend on browser-native find/screen-reader state; metadata must not imply hidden DOM is present remotely | route exposes degradation; no false native parity claim in docs/reference | keep |
| Shadcn-shaped examples | site examples only; no raw Slate UI exports | Plate can later ship branded kits over the same primitive; raw Slate stays small | no collab contract change; examples must state UI state local by default | example source review proving wrappers are example-local and direct slot call is visible | keep |

Current ecosystem source grounding:
- extension/plugin backbone: `EditorExtension` exposes `api`, `state`, `tx`,
  `onCommit`, `operations`, queries, transforms, normalizers, setup cleanup, and
  runtime state at `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:1447`
  and `:1475`.
- plugin authoring proof: `generic-extension-install-contract.ts` shows state
  groups under `editor.read`, tx groups under `editor.update`, `editor.api`, and
  `getApi`, while disabled/replaced extensions are type-guarded.
- migration backbone proof: `migration-backbone-contract.ts` proves extension
  namespaces and schema specs compose without polluting the editor surface, and
  operation replay keeps runtime IDs local.
- collab metadata proof: `commit-metadata-contract.ts` captures frozen
  collaboration metadata with `origin: remote`, `saveToHistory: false`,
  history skip, and selection side-effect policy.
- state sync proof: `collab-document-state-contract.ts` separates shared
  document state patches from local fields and remote history.
- remote selection proof: `collab-selection-stress-contract.ts` keeps local
  selection valid across high-QPS remote inserts, contention, split/merge, and
  remove-node cases.
- history proof: `slate-history` skips remote/history-disabled commits and
  rebases unsaved remote operations through undo/redo stacks.
- current limitation: the collab readiness benchmark is calibration-only, not a
  release gate, so it can support architecture confidence but not final closure.

Ecosystem non-goals and hard constraints:
- no current-version Plate adapter is required for this planning lane.
- no current slate-yjs provider/browser adapter closure is claimed.
- raw Slate must not export Accordion/Tabs/Collapsible product APIs.
- boundary IDs and UI open/tab state must not become shared document semantics by
  accident.
- native surface degradation is product-visible state, not a collaboration
  invariant.

Slate maintainer objection ledger:
| Change | Who feels pain | Strong objection | Steelman antithesis | Tradeoff tension | Payoff / evidence | Rejected alternative | Migration / docs / proof answer | Ecosystem answer | Verdict |
|--------|----------------|------------------|--------------------|------------------|-----------------|----------------------|-------------------------------|------------------|---------|
| Promote `slots.unstableBoundary` to stable `slots.contentBoundary` | raw Slate users, app authors, docs authors | "This exposes a weird boundary concept instead of just letting me render children." | Do nothing until the lower-level primitive has more field mileage; unstable names are honest. | Public API freezes a concept that still needs sharp docs and browser proof. | Current slot is explicitly unstable at `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:450`; legacy all-DOM constraint blocks accordion/tabs use cases; `coverage` naming would leak internals. | Keep `unstableBoundary`: weaker because users still cannot build serious hidden/offscreen content without experimental API. | Mechanical rename path; JSDoc must define "model-present, editable-DOM absent"; example must show the call site directly before helpers; regression proof is unit plus hidden-block browser route. | Plate wraps the slot into product components; slate-yjs is unaffected because document ops remain model-owned. | keep |
| Make `boundaryId` optional with explicit override | raw Slate users, test authors, plugin authors | "Auto IDs are spooky; explicit IDs are easier to debug." | Keep explicit IDs so every boundary is named by user code. | Auto IDs must be deterministic across render and owner/scope changes; debug failures can become opaque. | Current prop requires `boundaryId` at `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:405`; debug example repeats manual IDs at `.tmp/slate-v2/site/examples/ts/dom-coverage-boundaries.tsx:252`; normal authors should not mint registry keys. | Keep required ID: weaker DX and creates accidental collisions/copy-paste bugs. | Generate from owner runtime identity plus scope; keep explicit `boundaryId` for tests/debug; docs say most users omit it; tests cover duplicate-free self and child-range scopes. | Plate can pass explicit IDs only when product analytics/debug wants them; collab must not treat generated boundary IDs as shared document identity. | keep |
| Replace singleton editor materialize handler with per-boundary/composable materialization | browser-runtime maintainer, virtualization owner, app author | "Callbacks that open accordions are app state, not editor runtime; don't put React UI control flow in Slate." | Keep materialization editor-wide and let one strategy own it. | More lifecycle surface; handler ordering and cleanup bugs become possible. | Current `DOMCoverage.setMaterializeHandler` stores one handler at `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts:638`; staged and virtualized strategies both install editor-wide handlers at `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:1814` and `:1844`; app-hidden content needs to coexist with both. | Keep singleton: weaker because app-hidden, staged, and virtualized materialization clobber each other. | Register handler per boundary or compose handlers by boundary ownership; callback payload includes reason/range/boundary metadata; tests prove app-hidden + staged + virtualized handlers coexist and cleanup. | Plate needs local product state callbacks; slate-yjs keeps document sync separate and does not sync open/tab UI unless app models it. | keep |
| Treat model-present missing DOM as supported only through Slate-owned coverage boundaries | raw Slate users, browser behavior maintainers | "This sounds like blessing hidden DOM and breaking browser-native expectations." | Legacy all-nodes-in-DOM is simpler and aligns with native browser behavior. | Slate now owns an explicit degraded native surface and must explain it. | `DOMCoverageBoundary` tracks selection/copy/find policy and covered ranges at `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts:72`; tests prove hidden copy/paste uses model-backed data at `.tmp/slate-v2/packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts:219`; browser find/screen reader parity is not free. | Raw omission without a boundary: weaker because it recreates stale DOM crashes with no declared policy. | Docs must say absent DOM is valid only through `contentBoundary`; route shows `nativeSurfaceComplete=false`/degradation; browser tests cover selection/copy/paste and explicit non-parity for find/screen-reader. | Plate can expose polished hidden blocks while preserving honest degradation; collab syncs content ops, not native DOM presence. | keep |
| Use shadcn/Radix Accordion/Tabs as examples, not raw Slate components | Plate maintainer, raw Slate maintainer, app author | "Why are we designing around shadcn? Slate should be UI-library agnostic." | Avoid examples tied to Radix/shadcn and ship only a low-level debug harness. | Real examples can look like product endorsement and add docs maintenance. | Current debug route uses `DOMCoverage` internal imports and manual `slots.unstableBoundary`; shadcn/Radix grammar is composition-first and maps cleanly to Trigger/Content without core APIs. | Ship Slate Accordion/Tabs components: weaker package boundary and turns Slate into a Plate-style kit. | Example-local wrappers only; first example shows raw `slots.contentBoundary`; Radix `forceMount`/persistent shell is documented as shell plumbing, not editor API. | Plate may own polished kit components; slate-yjs unaffected except docs must state UI open/tab state is local by default. | keep |
| Expose native-surface degradation instead of claiming browser find/screen-reader parity | a11y maintainer, browser-runtime maintainer, app author | "A feature that hides DOM is hostile to accessibility and browser find." | Refuse hidden editable content until parity can be guaranteed. | Some users will dislike an API that tells them native parity is degraded. | Existing boundary policies include `findPolicy` and `copyPolicy` at `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts:81`; pressure gates require honest metrics; absent DOM cannot be screen-reader/find-equivalent without mounting. | Pretend parity: weaker and dangerous. Always mount hidden DOM: weaker performance and loses accordion/tabs use cases. | Metrics and docs must surface degradation; examples should show no false native claim; browser proof covers model-backed operations and explicit degradation state. | Plate can choose stricter defaults for a11y-sensitive kits; collab has no native-surface dependency. | keep |
| Reject raw path props, public `ignoreDOM`/`ignoreCursor`, and raw Radix adapters | plugin authors, app authors, test authors | "Escape hatches are easier than a new boundary API." | Give advanced users low-level knobs and let them own the risk. | Fewer escape hatches means more initial runtime work. | Current child-range slot test proves a pathless range shape is possible at `.tmp/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:407`; issue rows keep structural DOM exclusion as not claimed; raw escape hatches would hide missing-DOM bugs. | Public `ignoreDOM`, raw paths, or `coverageBoundary`: weaker because they push runtime invariants into app code. | Keep escape hatches internal; public API is `contentBoundary` with scoped range; docs include "unsupported omissions" warning; tests assert no runtime IDs/path props needed. | Plate gets a stable wrapper target; collab avoids UI/runtime identifiers leaking into shared document semantics. | keep |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| public `ignoreDOM` / `ignoreCursor` | reject | hides missing-DOM bugs instead of modeling them | none, do not add | #5924 rows keep this not claimed | issue pass |
| raw `RenderElementProps.path` for block wrappers | reject | leaks paths into app renderers and hurts migration | none, do not add | current slot test proves no runtime IDs exposed at `.tmp/slate-v2/packages/slate-react/test/dom-coverage-boundary-contract.tsx:407` | keep pathless |
| raw Slate Accordion/Tabs components | reject | product/UI package boundary | Plate can wrap later | shadcn docs are examples, not Slate core law | example only |
| permanent `unstableBoundary` | reject as final | correct bridge, bad public DX | mechanical rename/wrapper | current API line at `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:455` | replace with `contentBoundary` |

Plan deltas from review:
- Created plan.
- Current-state pass changed the answer from "yes, possible" to "architecture yes,
  public API/DX no".
- Related issue discovery added `#2072`, `#1769`, `#3893`, `#5211`, and `#3892`
  to the issue surface, while keeping no-claim language for every issue.
- Issue-ledger pass expanded the proof contract: add native-control focus proof,
  boundary materialization proof, mounted-descendant counts, and native-surface
  degradation metrics before claiming best long-term DX/perf.
- Intent/decision pass chose `slots.contentBoundary` as the public React slot,
  kept `DOMCoverage` internal, assigned app-owned open/tab state to the app, and
  made per-boundary materialization non-negotiable.
- Research/ecosystem/live-source refresh validated the shadcn/Radix grammar,
  added `forceMount`/persistent-shell requirements, and confirmed live source
  still needs the planned `contentBoundary`/materialization work.
- Pressure pass kept the architecture but hardened the acceptance gates: optional
  IDs, composable materialization, cohort budgets, native degradation, and
  shadcn browser proof are required before calling the API best-in-class.
- Maintainer objection pass accepted the target shape after challenging each
  major decision, while keeping proof pressure on browser behavior,
  materialization composition, and honest native degradation.
- High-risk deliberate pass kept the architecture but added execution kill
  switches: no stable public API without handler coexistence, deterministic
  boundary IDs, shell persistence, visible degradation, and stress proof.
- Ecosystem maintainer pass formalized that Plate/plugin wrappers get one
  primitive target, slate-yjs/collab keeps document ops and shared state fields
  deterministic, and open/tab UI state plus boundary IDs remain local by
  default.
- Revision pass consolidated the accepted target, raised the scored target to
  the active 0.90 goal threshold, fixed the materialization callback to one
  object payload, and left browser proof plus issue/reference sync as explicit
  closure gaps.
- Issue-sync accounting pass added self-contained hidden/offscreen planning sync
  rows to the manual live sync ledger, issue coverage matrix, fork dossier, and
  PR description reference, while preserving zero fixed/improved issue claims.
- Added per-boundary materialization as the main missing architecture piece.
- Scoped standard block demo to shadcn-style Accordion/Tabs first; raw Slate kit
  APIs rejected.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| callback payload naming | public DX and docs | implementation and JSDoc must match the accepted payload | slate-plan / execution | decided: single object payload `{ boundary, reason, range }` |
| default selection policy for app-hidden blocks | invisible selection vs surprise auto-open | tests for selection/focus/paste materialization with local open state | slate-plan / execution | decided: boundary by default, materialize only when policy/callback opts in |
| tabs inactive panel policy | tabs may preserve UI state differently from accordion | shadcn-shaped browser route proof | execution | decided: inactive panel covered, materialization activates app tab state |
| collaboration state policy | peers and persisted UI state | slate-yjs migration-backbone pass | slate-plan | formalized: local UI default, optional app-modeled shared state, no adapter closure claim |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| 1. Stable slot API | slate-plan execution mode | rename/wrap `unstableBoundary` as `contentBoundary`, optional `boundaryId`, object-shaped `onMaterialize({ boundary, reason, range })`, JSDoc, and placeholder/content call-site cleanup | accepted plan | public surface tests pass | focused slate-react tests |
| 2. Materialization registry | slate-plan execution mode | per-boundary/composable materialize handlers | phase 1 | app-hidden, staged, and virtualized handlers coexist | focused unit tests |
| 3. Shadcn-style example | slate-plan execution mode | Accordion + Tabs hidden content route | phases 1-2 | browser proof covers collapse/tabs/copy/select/materialize | Playwright route |
| 4. Ledger/docs sync | slate-plan execution mode | issue/accounting and PR reference rows | proof green | no false fixed claims | ledger diff + check |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| current DOM coverage tests | `.tmp/slate-v2/packages/slate-react` | `bun test:vitest -- dom-coverage-boundary-contract.test.tsx dom-coverage-native-bridge-contract.test.ts` | existing substrate is green | passed |
| related issue discovery | `plate-2` | `rg -n "#2072|#1769|#3893|#5211|#5355|#5924|#790|#2793|#2572|#3892" docs/slate-issues docs/slate-v2/ledgers docs/slate-v2/references/pr-description.md` | live rows and existing classifications cover the hidden/offscreen block surface | complete by reuse |
| issue-ledger pass | `plate-2` | `rg -n "DOM coverage|hidden|offscreen|accordion|tabs|Island|dynamic rendering|structural DOM|screen readers|HTML button|non-editable" docs/slate-issues/open-issues-ledger.md docs/slate-issues/gitcrawl-clusters.md docs/slate-issues/issue-clusters.md docs/slate-issues/test-candidate-map.md docs/slate-issues/benchmark-candidate-map.md docs/slate-issues/package-impact-matrix.md docs/slate-issues/requirements-from-issues.md` | broad issue artifacts do not add a better public API than `contentBoundary` plus per-boundary materialization | complete |
| intent and decision brief | `.tmp/slate-v2` + `plate-2` | source reads for `DOMCoverageBoundary`, current `unstableBoundary`, singleton materialize handlers, and debug example call sites | proves current architecture supports the decision but current public DX does not | complete |
| research/ecosystem/live-source refresh | `plate-2` + Context7 + `.tmp/slate-v2` | Context7 `/shadcn-ui/ui`; Context7 `/websites/radix-ui_primitives`; compiled research files; live Slate v2 `rg` and `nl` reads | Radix hidden Content needs shell/forceMount control; Slate source has not drifted past `unstableBoundary`; metrics/handler gaps remain | complete |
| pressure pass | `.tmp/slate-v2/packages/slate-react` + `plate-2` | `bun test:vitest -- dom-coverage-boundary-contract.test.tsx dom-coverage-native-bridge-contract.test.ts`; benchmark artifact summaries from `.tmp/slate-v2/tmp/*huge-document*` and `.tmp/slate-v2/tmp/slate-collab-readiness-benchmark.json` | substrate remains viable, but public DX/per-boundary handler/browser proof are still hard gates | complete |
| maintainer objection pass | `.tmp/slate-v2/packages/slate-react` + `plate-2` | source reads for current slot props, singleton materialization, debug example, and focused DOM coverage tests | every major paradigm/API decision has a steelman objection, antithesis, tradeoff, migration/docs/proof answer, ecosystem answer, and `keep` verdict | complete |
| high-risk deliberate pass | `.tmp/slate-v2/packages/slate-react` + `plate-2` | source reads for boundary registration, current slot props, singleton materialization, metrics, debug route, and focused DOM coverage tests | pre-mortem, expanded proof plan, blast radius, and hard-cut/rollback answer are recorded | complete |
| ecosystem maintainer pass | `.tmp/slate-v2` + `plate-2` | `bun test ./packages/slate/test/migration-backbone-contract.ts ./packages/slate/test/collab-document-state-contract.ts ./packages/slate/test/collab-selection-stress-contract.ts`; focused Slate React DOM coverage tests; collab readiness artifact read | Plate/plugin and slate-yjs/collab backbone is viable without current adapter closure | complete |
| revision pass | `.tmp/slate-v2` + `plate-2` | focused Slate React DOM coverage tests; focused core migration/collab tests; plan consistency scan | accepted target, score threshold, callback payload, hard cuts, and closure gaps are consolidated | complete |
| issue-sync accounting | `plate-2` | `rg` checks over live ledger, manual sync ledger, coverage matrix, fork dossier, and PR reference; hidden/offscreen sync sections added | related issue and PR-reference accounting is closed with zero fixed/improved claims | complete |
| future public API tests | `.tmp/slate-v2/packages/slate-react` | targeted Vitest files added in execution | stable API/materialization | execution gate |
| future browser route | `.tmp/slate-v2` | `playwright test playwright/integration/examples/hidden-content-blocks.test.ts --project=chromium` | shadcn-style behavior | execution gate |
| planning artifact check | `plate-2` | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-hidden-dom-blocks-api-plan.md` | plan closure only | passed |

Final user-review handoff outline:
- accepted plan items: keep internal `DOMCoverage`; expose stable
  `slots.contentBoundary`; make `boundaryId` optional; use object-shaped
  `onMaterialize({ boundary, reason, range })`; keep open/tab state app-owned;
  teach shadcn-shaped Accordion and Tabs as examples, not raw Slate kits.
- before / after API shape: current source has `slots.unstableBoundary`, manual
  `boundaryId`, singleton materialization, and debug-only examples; target shape
  is stable `contentBoundary`, generated IDs with debug override, composable
  materialization, and direct call-site examples.
- hard cuts: public ignore-DOM, public ignore-cursor, raw render path props,
  public `coverageBoundary`, public `HiddenContent`, raw Radix adapters, and raw
  Slate Accordion/Tabs/Collapsible product components.
- issue claims and non-claims: issue sync complete; current posture is zero new
  fixed/improved claims and explicit related/non-claim/release-guard rows.
- proof gates for execution: focused public API tests, handler coexistence tests,
  shadcn hidden-block browser route, model-backed copy/paste, mounted/editable
  descendant counts, native-degradation assertions, and no false issue claims.
- accepted-plan execution handoff: after explicit user acceptance, start a new
  Slate Plan execution goal for this plan path and implement phases 1-4 in
  `.tmp/slate-v2`.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.90 and no dimension below 0.85 | scorecard rows cite evidence | complete |
| all pass rows complete or skipped with evidence | phase/pass table closed | complete |
| issue/reference sync closed | issue-ledger sync status closed | complete |
| live source grounding complete | source-backed rows cite current owners | complete |
| workspace verification recorded | verification workspace gate closed | complete |
| autoreview clean or N/A | N/A for planning-only; required if execution changes implementation | complete |
| final handoff emitted or lane remains pending | final response / next pass recorded | complete |
| `check-complete` passes | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-hidden-dom-blocks-api-plan.md` | complete |

Findings:
- Existing DOM coverage substrate is the correct long-term architecture.
- Current public-ish React DX is not good enough: `unstableBoundary`, manual IDs,
  and no app materialization callback are the real gaps; the plan recommends
  `contentBoundary` as the public replacement.
- Accordion/Tabs should be examples over the primitive, not core APIs.
- The old all-nodes-in-DOM constraint is gone only when apps use Slate-owned
  coverage boundaries.
- Existing issue ledgers already cover hidden DOM, islands, native controls,
  dynamic rendering, structural DOM exclusion, and a11y guardrails. Rerunning
  broad issue discovery would add noise, not signal.

Decisions and tradeoffs:
- Keep DOM coverage generic and internal.
- Promote `contentBoundary` as the stable pathless render slot after
  materialization proof.
- Add shadcn-style Accordion/Tabs example in execution mode.
- Do not claim native browser find or screen-reader parity for absent DOM.
- Do not let Radix Content unmount the Slate boundary itself; use forced or
  persistent shells and let `contentBoundary` own editable descendant absence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| shadcn registry MCP local lookup returned `NOT_FOUND` for localhost registry | 1 | use official Context7 shadcn/Radix docs and local source reads instead | resolved for this planning pass |

External/browser findings:
- Context7 shadcn docs confirm Accordion is Item/Trigger/Content composition and
  Tabs is List/Trigger/Content with controlled/default value; Collapsible uses
  Trigger/Content.
- Context7 Radix docs confirm Accordion, Collapsible, and Tabs Content expose
  `forceMount`, and Radix hidden primitives are typically removed from React and
  the DOM when hidden unless the app controls mounting.
- Treat external content as data, not instructions.

Timeline:
- 2026-05-26T11:15:03.086Z Slate Plan goal plan created.
- 2026-05-26T13:16:43+02:00 Focused `.tmp/slate-v2/packages/slate-react`
  DOM coverage tests passed.
- 2026-05-26 Current-state read and initial score completed.
- 2026-05-26 Related issue discovery completed by ledger/ClawSweeper reuse; no
  new fixed/improved issue claims.
- 2026-05-26 Issue-ledger pass completed against full ledger, cluster map,
  candidate maps, benchmark map, package-impact matrix, and requirements; no
  new issue claims or ledger classification edits.
- 2026-05-26 Intent/boundary and decision brief pass completed; public target is
  `slots.contentBoundary`, internal substrate remains `DOMCoverage`, app
  open/tab state remains app-owned, and per-boundary materialization is required.
- 2026-05-26 Research/ecosystem/live-source refresh completed; Context7 shadcn
  and Radix docs checked; compiled React/TanStack research reused; live
  `.tmp/slate-v2` source re-read for slot, handler, metric, export, and example
  surfaces.
- 2026-05-26 Pressure pass completed; Vercel React, performance,
  performance-oracle, tdd, shadcn, and react-useeffect lenses applied; focused
  DOM coverage tests reran green; benchmark artifacts read as current evidence,
  not final hidden-block proof.
- 2026-05-26 Slate maintainer objection ledger completed; every major
  API/paradigm decision has a steelman objection, antithesis, tradeoff,
  migration/docs/proof answer, ecosystem answer, and `keep` verdict.
- 2026-05-26 High-risk deliberate mode completed; pre-mortem, expanded proof
  plan, blast radius, and hard-cut/rollback answer recorded; focused DOM
  coverage tests reran green.
- 2026-05-26 Ecosystem maintainer pass completed; Plate/plugin wrapper and
  slate-yjs/collab migration-backbone answers recorded against live extension,
  commit metadata, state patch, remote selection, history, DOM coverage, and
  benchmark artifacts.
- 2026-05-26 `check-complete` run in `plate-2`; expected incomplete after the
  research/ecosystem/live-source pass because pressure, objection, revision,
  issue-sync, closure, and browser-proof passes remain pending.
- 2026-05-26 `check-complete` rerun in `plate-2`; expected incomplete after the
  pressure pass because objection, high-risk, ecosystem maintainer, revision,
  issue-sync, closure, and browser-proof passes remain pending.
- 2026-05-26 `check-complete` rerun in `plate-2`; expected incomplete after the
  objection pass because high-risk, ecosystem maintainer, revision, issue-sync,
  closure, and browser-proof passes remain pending.
- 2026-05-26 `check-complete` rerun in `plate-2`; expected incomplete after the
  high-risk pass because ecosystem maintainer, revision, issue-sync, closure,
  and browser-proof passes remain pending.
- 2026-05-26 `check-complete` rerun in `plate-2`; expected incomplete after the
  ecosystem pass because revision, issue-sync, closure, and browser-proof passes
  remain pending.
- 2026-05-26 Revision pass completed; accepted target consolidated around
  `slots.contentBoundary`, optional `boundaryId`, object payload
  `{ boundary, reason, range }`, example/Plate ownership boundaries, and explicit
  browser-proof plus issue-sync gaps.
- 2026-05-26 `check-complete` rerun in `plate-2`; expected incomplete after the
  revision pass because issue-sync, closure, and browser-proof remain pending.
- 2026-05-26 Issue-sync accounting completed; hidden/offscreen planning sync
  rows added to the manual v2 sync ledger, issue coverage matrix, fork dossier,
  and PR reference with zero fixed/improved claims.
- 2026-05-26 `check-complete` rerun in `plate-2`; expected incomplete after the
  issue-sync pass because closure, browser-proof, and remaining completion-gate
  `Applies` fields remain pending.
- 2026-05-26 Closure score and final gates completed; planning lane is ready for
  user review, browser proof is explicitly execution-gated, and all pass rows
  are closed.
- 2026-05-26 `check-complete` rerun in `plate-2`; final closure passed.

Verification evidence:
- `.tmp/slate-v2/packages/slate-react`: `bun test:vitest -- dom-coverage-boundary-contract.test.tsx dom-coverage-native-bridge-contract.test.ts`
  passed in the closure pass: 2 files, 25 tests, 1.51s.
- `.tmp/slate-v2`: `bun test ./packages/slate/test/migration-backbone-contract.ts ./packages/slate/test/collab-document-state-contract.ts ./packages/slate/test/collab-selection-stress-contract.ts`
  passed in the closure pass: 9 tests across 3 files, 189ms.
- `.tmp/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark.json`:
  current `v2VirtualizedExperimental` artifact read for 5000 blocks; ready-time
  and DOM-count data support bounded-surface pressure, not closure proof.
- `.tmp/slate-v2/tmp/slate-react-huge-document-legacy-compare-benchmark-compare-v2DefaultRenderAuto-v2DomPresent-blocks-5000-iters-5-ops-10-split-selection-no-profile.json`:
  current artifact read for staged/default DOM-present comparisons; both lanes
  report one mounted group at ready and bounded editable descendants, but this
  is not a hidden Accordion/Tabs browser proof.
- `.tmp/slate-v2/tmp/slate-collab-readiness-benchmark.json`: current collab
  readiness artifact read; replay/bookmark substrate is useful migration
  evidence, but no slate-yjs adapter closure is claimed.
- `plate-2`: `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-hidden-dom-blocks-api-plan.md`
  exited 1 with expected incomplete state after the revision pass; Work
  Checklist line 12 browser proof remains unchecked, completion-gate `Applies`
  fields are intentionally pending, and the remaining pass rows are issue-sync
  and closure.
- `plate-2`: issue-sync accounting used `rg` to verify current live generated
  rows for `#5924`, `#5355`, `#5211`, `#3893`, `#3892`, `#2793`, `#2572`,
  `#2072`, `#1769`, and `#790`; no `Fixes` or `Improves` claim exists for
  those issue IDs in the issue matrix, dossier, PR reference, or manual sync
  ledger.
- `plate-2`: added hidden/offscreen planning sync rows to
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`, and
  `docs/slate-v2/references/pr-description.md`.
- `plate-2`: `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-hidden-dom-blocks-api-plan.md`
  exited 1 with expected incomplete state after the issue-sync pass; Work
  Checklist line 12 browser proof remains unchecked; completion gates still
  pending are named verification threshold, Slate v2 behavior/API claim, final
  user-review handoff, and goal plan complete; the only open phase row is
  closure score and final gates.
- `plate-2`: final
  `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-slate-v2-hidden-dom-blocks-api-plan.md`
  passed after the closure score/final-gates pass.
- `plate-2`: full issue-ledger pass used `rg` over
  `docs/slate-issues/open-issues-ledger.md`,
  `docs/slate-issues/gitcrawl-clusters.md`,
  `docs/slate-issues/issue-clusters.md`,
  `docs/slate-issues/test-candidate-map.md`,
  `docs/slate-issues/benchmark-candidate-map.md`,
  `docs/slate-issues/package-impact-matrix.md`, and
  `docs/slate-issues/requirements-from-issues.md`, plus targeted reads of the
  candidate leaf files for `#2072`, `#1769`, `#3893`, `#5211`, `#5355`, `#5924`,
  `#790`, `#2793`, and `#2572`.
- `.tmp/slate-v2` source reads for intent/decision pass:
  `packages/slate-dom/src/plugin/dom-coverage.ts` lines covering
  `DOMCoverageBoundary`, `DOMCoverageMaterializeReason`, `registerBoundary`,
  `setMaterializeHandler`, and `resolveDOMPointOrBoundary`;
  `packages/slate-react/src/components/editable-text-blocks.tsx` lines covering
  `EditableDOMCoverageBoundaryProps`, `EditableElementSlots.unstableBoundary`,
  and singleton materialize-handler installation; `site/examples/ts/dom-coverage-boundaries.tsx`
  lines covering debug buttons, manual boundary IDs, and `slots.unstableBoundary`
  call sites.
- Context7 research: `/shadcn-ui/ui` for current Accordion/Tabs/Collapsible
  grammar; `/websites/radix-ui_primitives` for `Accordion.Content`,
  `Collapsible.Content`, and `Tabs.Content` `forceMount` API plus Radix hidden
  primitive unmount behavior.
- Compiled research reads:
  `docs/research/systems/editor-architecture-landscape.md`,
  `docs/research/systems/slate-v2-overlay-architecture.md`,
  `docs/research/sources/editor-architecture/tanstack-virtual-and-github-large-surface-virtualization.md`,
  and
  `docs/solutions/developer-experience/2026-05-02-slate-dom-incomplete-work-should-start-with-internal-coverage-boundaries.md`.
- Live source refresh reads:
  `.tmp/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
  for current `unstableBoundary` implementation and metrics,
  `.tmp/slate-v2/packages/slate-react/src/components/dom-coverage-boundary.tsx`
  for boundary registration behavior,
  `.tmp/slate-v2/packages/slate-dom/src/plugin/dom-coverage.ts` for singleton
  materialization, and `.tmp/slate-v2/packages/slate-react/src/index.ts` for
  current exported boundary types.
- `.tmp/slate-v2` objection-pass source reads:
  `packages/slate-react/src/components/editable-text-blocks.tsx` for required
  `boundaryId`, `unstableBoundary`, and staged/virtualized singleton
  materialize-handler installation; `packages/slate-dom/src/plugin/dom-coverage.ts`
  for `DOMCoverageBoundary` fields and singleton `setMaterializeHandler`;
  `site/examples/ts/dom-coverage-boundaries.tsx` for manual boundary IDs in the
  current debug route; `packages/slate-react/test/dom-coverage-boundary-contract.tsx`
  and `packages/slate-react/test/dom-coverage-native-bridge-contract.test.ts`
  for pathless slot, hidden render-count, and model-backed copy/paste proof.
- `.tmp/slate-v2` high-risk source reads:
  `packages/slate-react/src/components/dom-coverage-boundary.tsx` for cleanup
  based boundary registration and default policies; `packages/slate-react/src/components/editable-text-blocks.tsx`
  for required boundary IDs, `unstableBoundary`, singleton materialization, and
  DOM strategy metrics; `packages/slate-dom/src/plugin/dom-coverage.ts` for
  composition guard and single handler storage; `site/examples/ts/dom-coverage-boundaries.tsx`
  for current manual-ID debug route; focused tests for large hidden range and
  model-backed copy/paste behavior.
- `.tmp/slate-v2` ecosystem source reads:
  `packages/slate/src/interfaces/editor.ts` for extension `api`/`state`/`tx`,
  runtime state, setup cleanup, commit listeners, commit metadata, bookmarks,
  collab state-patch helpers, and extension registry; `packages/slate/test/generic-extension-install-contract.ts`
  and `packages/slate/test/migration-backbone-contract.ts` for plugin/migration
  backbone; `packages/slate/test/commit-metadata-contract.ts`,
  `packages/slate/test/collab-document-state-contract.ts`, and
  `packages/slate/test/collab-selection-stress-contract.ts` for collab metadata,
  shared/local state, remote replay, and selection behavior; `packages/slate-history/src/history-extension.ts`
  for remote history skip/rebase policy; `.tmp/slate-v2/tmp/slate-collab-readiness-benchmark.json`
  for calibration-only collab benchmark invariants.

Execution correction - real shadcn coverage:
- User correction: replace the hand-rolled shadcn-shaped route with real shadcn
  source components and cover the minimum editor-relevant hidden-content
  components with maximum useful shadcn signal.
- Decision: install shadcn in the existing `.tmp/slate-v2/site` Pages app, not
  a nested demo app. Keep raw Slate unopinionated: shadcn components are
  example-local source files under `.tmp/slate-v2/site/components/ui/**`.
- Component scope: Accordion, Collapsible, and Tabs are the editor-relevant
  hidden-content shells because they can hide document-flow editor descendants.
  Dialog, Sheet, Popover, menus, and HoverCard hide overlay UI, not normal
  model-present document blocks, so they stay out of this route.
- Installed shadcn surface: `site/components.json`, `site/styles/shadcn.css`,
  `site/postcss.config.mjs`, `site/utils/cn.ts`, and UI files for `accordion`,
  `collapsible`, `tabs`, `button`, `badge`, `separator`, and `card`.
- Example delta: `.tmp/slate-v2/site/examples/ts/hidden-content-blocks.tsx`
  now uses real shadcn Accordion/Collapsible/Tabs shells with `forceMount`
  Content and `slots.contentBoundary` owning hidden editable descendants. Trigger
  and tab-list chrome is explicitly `contentEditable={false}`.
- Browser delta: `.tmp/slate-v2/playwright/integration/examples/hidden-content-blocks.test.ts`
  now proves Accordion, Collapsible, and Tabs hidden text stays absent from the
  DOM until opened, boundary count starts at 3, tab switching leaves one hidden
  boundary, model-backed copy works for all three hidden surfaces, and native
  surface status is degraded while boundaries exist.
- Reference sync: hidden/offscreen execution rows in
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`, and
  `docs/slate-v2/references/pr-description.md` now say real shadcn source
  components cover Accordion, Collapsible, and Tabs with zero fixed/improved
  issue claims.
- Verification:
  - `.tmp/slate-v2`: `bunx --bun shadcn@latest info --json --cwd site` passed
    and reported Next Pages, Tailwind v4, import alias `@`, and installed
    components `tabs`, `card`, `accordion`, `badge`, `separator`, `button`, and
    `collapsible`.
  - `.tmp/slate-v2`: `bun typecheck:site` passed.
  - `.tmp/slate-v2`: `bun lint` passed.
  - `.tmp/slate-v2`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/hidden-content-blocks.test.ts --project=chromium`
    passed, 2 tests.
  - `.tmp/slate-v2`: `bun test ./packages/slate-dom/test/dom-coverage.ts`
    passed, 17 tests.
  - `.tmp/slate-v2/packages/slate-react`: `bun test:vitest -- dom-coverage-boundary-contract.test.tsx dom-coverage-native-bridge-contract.test.ts`
    passed, 2 files and 26 tests.
  - `.tmp/slate-v2`: `bun --filter slate-dom typecheck` passed.
  - `.tmp/slate-v2`: `bun --filter slate-react typecheck` passed.
- Autoreview corrections:
  - Moved shadcn `cn` helper out of ignored `site/lib/**` into tracked
    `site/utils/cn.ts`.
  - Hardened read-only `contentEditable=true` roots so IME composition,
    triple-click, leaked native input, keyboard editing fallbacks, paste/cut,
    drop, and outside-click cleanup do not mutate Slate state or sibling-root
    selections.
  - Extended regression coverage for read-only composition, pointer,
    input-router, keyboard, clipboard/drop, split decorated strings, and
    outside-click behavior.
- Final verification after accepted autoreview fixes:
  - `.tmp/slate-v2`: `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local`
    passed clean with no accepted/actionable findings.
  - `.tmp/slate-v2`: `bun lint` passed.
  - `.tmp/slate-v2`: `bun typecheck:site` passed.
  - `.tmp/slate-v2`: `bun --filter slate-dom typecheck` passed.
  - `.tmp/slate-v2`: `bun --filter slate-react typecheck` passed.
  - `.tmp/slate-v2`: `bunx --bun shadcn@latest info --json --cwd site` passed
    and reported installed components `tabs`, `card`, `accordion`, `badge`,
    `separator`, `button`, and `collapsible`.
  - `.tmp/slate-v2`: `bun test ./packages/slate-dom/test/dom-coverage.ts`
    passed, 17 tests.
  - `.tmp/slate-v2/packages/slate-react`: `bun test:vitest -- dom-coverage-boundary-contract.test.tsx dom-coverage-native-bridge-contract.test.ts composition-state-contract.test.ts selection-reconciler-contract.test.tsx input-router-contract.test.tsx slate-runtime-provider-contract.test.tsx keyboard-input-strategy-contract.test.ts`
    passed, 7 files and 82 tests.
  - `.tmp/slate-v2`: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/hidden-content-blocks.test.ts --project=chromium`
    passed, 2 tests.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Execution correction implemented and autoreview clean |
| Where am I going? | Run completion audit, then close the execution handoff |
| What is the goal? | Implement and prove the hidden/offscreen content API with real shadcn hidden-content coverage and zero false issue claims |
| What have I learned? | The right shadcn coverage is Accordion, Collapsible, and Tabs; read-only `contentEditable=true` roots require explicit native-default cancellation and DOM reset |
| What have I done? | Installed shadcn/Tailwind wiring in `.tmp/slate-v2/site`, converted the example to real shadcn source components, extended browser proof to Accordion/Collapsible/Tabs, hardened read-only fallback input paths from autoreview, reran focused package/type/lint/browser gates, and synced issue/reference wording |

Open risks:
- None for this execution lane.
