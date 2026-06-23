# plite unified view-boundary navigation architecture

Objective:
Decide whether Plite should rewrite the current multi-root, Synced Blocks,
and hidden-content work into a stronger long-term architecture. The answer must
cover `examples/multi-root-document`, `examples/synced-blocks`, and
`examples/hidden-content-blocks`; choose the best API/DX/testing target for
navigation, selection, focus, history, and intentionally missing DOM; and reuse
already closed plan evidence instead of reopening every completed slice.

Goal plan:
docs/plans/2026-05-26-plite-unified-view-boundary-navigation-architecture.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- slate-plan

Completion threshold:
- This planning lane is complete when it gives a user-review-ready keep/cut
  call for the three examples, a unified runtime target, a public API boundary,
  a proof matrix, issue/reference disposition, and an execution queue.
- Score must be at least 0.92 with no dimension below 0.85.
- The plan must not claim new Plite runtime behavior beyond live source
  reads and already completed proof in the referenced plans.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-plite-unified-view-boundary-navigation-architecture.md`
  must pass before the planning goal is closed.

Verification surface:
- Planning source reads in `plate-2`: this plan, the existing 2026-05-26
  multi-root/content-root/hidden-content/selection plans, issue ledgers, and
  solution notes.
- Live source grounding in `Plate repo root`: the three example files, their
  Playwright tests, `view-selection.ts`, `projection-graph.ts`,
  `content-root-navigation.ts`, `projected-selection-target.ts`,
  `editable-text-blocks.tsx`, and `dom-coverage.ts`.
- Existing proof reused: the closed Synced Blocks selection/history coverage,
  hidden-content policy/Arrow/Shift coverage, focus-ownership planning, and
  projection-selection plan rows. This pass adds no code and no browser claim.

Constraints:
- Planning-only activation. Do not patch `Plate repo root` implementation code
  from this plan.
- Keep one runtime editor and many views. Do not switch to one editor per block.
- Keep raw Plite unopinionated. Product chrome and Notion-like synced-block UI
  stay in examples or Plate.
- Do not invent another public API unless the current `contentRoot` and
  `contentBoundary` slots cannot carry the behavior.
- Browser-native parity must be honest. Missing DOM and projected selection can
  be supported without pretending browser find, screen reader, IME, or mobile
  affordances are fully native.

Boundaries:
- Editable planning scope: `docs/plans/**`, `docs/research/**`,
  `docs/plite-issues/**`, `docs/plite/ledgers/**`, and
  `docs/plite/references/**`.
- Source-read scope: `packages/plite-react`,
  `packages/plite-dom`, `apps/www/src/app/(app)/examples/plite/_examples`, and
  `apps/www/tests/plite-browser/donor/examples`.
- In scope: view order, root projection, hidden DOM boundaries, selection,
  focus, history, copy/delete/type over projected selections, example DX, and
  shared conformance tests.
- Out of scope: implementing this plan now, PR creation, current slate-yjs
  adapter compatibility, Notion permissions, and product UI kits in raw Plite.

Blocked condition:
Block only if live `Plate repo root` source and the existing plan/ledger files are
unavailable for three consecutive activations. No blocker remains for this
planning decision.

Plite Plan lane state:
- slate_plan_lane_status: complete
- current_pass: closure-score-and-final-gates
- current_pass_status: complete
- next_pass: none
- next_action: none - execution requires the user to accept this plan and ask
  for implementation.
- final_handoff_status: complete

Current verdict:
- verdict: revise the internal architecture, do not rewrite the public API or
  the examples from scratch.
- confidence: 0.92.
- keep / cut / revise call: keep `Editable root`, `slots.contentRoot`, and
  `slots.contentBoundary`; revise the internals around one view-boundary graph;
  cut example-local navigation/selection logic as proof authority; reject one
  editor per block.
- reason: the current pieces are individually strong but split ownership across
  `content-root-navigation`, `projection-graph`, `ViewSelection`, and
  `DOMCoverage`. That is why the same bug class keeps showing up as arrow,
  shifted selection, focus, history, and hidden-boundary regressions.

Completion rule:
- Do not call `update_goal(status: complete)` until this file records final
  evidence and the checker command passes.
- This plan closes planning only. It does not mark any new runtime/browser
  behavior as implemented.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `.agents/skills/slate-plan/SKILL.md` read; planning mode confirmed. |
| Active goal checked or created | yes | Active Plite Plan goal created for this consolidated view-boundary decision. |
| Source of truth read before edits | yes | User prompt, screenshot plan list, related plans, live examples, tests, and runtime files read. |
| `docs/solutions` checked for existing-code work | yes | Read multi-root DX, inactive root caret, rootless selection, operation-root middleware, and DOMCoverage solution notes. |
| Live `Plate repo root` grounding needed for current-state claims | yes | Live source line reads recorded under Source-backed facts. |

Work Checklist:
- [x] Objective includes lane outcome, pass schedule, completion threshold,
      verification surface, constraints, boundaries, and blocked condition.
- [x] One-pass consolidation is justified by reusing already closed 2026-05-26
      Plite Plan lanes.
- [x] Live source grounding recorded for current implementation claims.
- [x] Issue ledger / ClawSweeper disposition recorded: reuse existing hidden,
      synced-content, projection-selection, and multi-root ledger rows; no new
      fixed or improved issue claims.
- [x] Research and ecosystem synthesis recorded for editor systems used as
      evidence.
- [x] Intent/boundary record and decision brief complete.
- [x] Scorecard recorded with total score at least 0.92 and no dimension below
      0.85.
- [x] Applicable implementation-skill review matrix applied or marked N/A with
      reason.
- [x] Plite maintainer objection ledger complete for this planning decision.
- [x] Verification workspace gate recorded for every source/runtime/browser/API
      claim.
- [x] TDD disposition recorded: execution must be conformance-test first; this
      activation is planning-only.
- [x] Browser proof disposition recorded: existing plans hold prior route proof;
      new unified claims require future browser execution proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Close plan rows and run checker | Completed after source reads, plan consolidation, scorecard, and checker. |
| Plite source/runtime/browser/API claim | yes | Cite live source or mark as planning-only | Live source reads are recorded; no new runtime/browser/API behavior is claimed. |
| Issue ledger or PR reference changed | no | Reuse existing rows and record no new claims | Existing hidden/content-root/projection rows already classify this surface; this plan changes no ledger or PR reference. |
| Autoreview for implementation changes | no | N/A for planning-only | No `Plate repo root` implementation patch exists in this activation. |
| Final user-review handoff | yes | Emit concise verdict and next implementation queue | Final handoff fields and summary are recorded in this plan. |
| Goal plan complete | yes | Run checker from `plate-2` | Checker result recorded under Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | Related plans plus live example/runtime/test source read | related issue disposition |
| Related issue disposition | complete | Existing ledger rows reused with zero new fixed/improved claims | intent/boundary |
| Intent/boundary and decision brief | complete | Keep/cut/revise call recorded | ecosystem synthesis |
| Research and ecosystem synthesis | complete | Memory, solution notes, existing plans, and editor-system lessons consolidated | pressure pass |
| Performance/DX/migration/regression/simplicity pressure pass | complete | Scorecard and conformance matrix recorded | objection ledger |
| Plite maintainer objection ledger | complete | Objections converted to execution proof gates | revision |
| Revision pass | complete | Public API kept stable; internal rewrite target named | closure |
| Closure score and final gates | complete | Score 0.92, no open planning blocker, checker run recorded | none |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.92 | Keep one runtime and one graph-like projection substrate; no one-editor-per-block fanout. Current examples already use root-scoped subscriptions and slots rather than app-managed runtime views. |
| Plite-close unopinionated DX | 0.20 | 0.93 | Public shape stays boring: `<Editable root>`, `slots.contentRoot('body')`, and `slots.contentBoundary(...)`. No Notion product API or raw path props. |
| Plate and slate-yjs migration backbone | 0.15 | 0.91 | Root keys remain content identity; projection/boundary identity remains runtime-local. Future collaboration maps root-keyed shared types plus local view projection policy. |
| Regression-proof testing strategy | 0.20 | 0.92 | Replace route-specific confidence with one parameterized conformance matrix over multi-root, synced roots, and hidden boundaries. Existing tests prove this is needed and feasible. |
| Research evidence completeness | 0.15 | 0.92 | Prior plans plus solution notes cover multi-root DX, native caret, rootless selection, DOMCoverage, projected selection, and editor-system lessons. |
| shadcn-style composability and minimalism | 0.10 | 0.92 | Hidden-content stays a shadcn-shaped example over `contentBoundary`; raw Plite avoids product widgets and exposes honest native degradation. |
| Weighted total | 1.00 | 0.92 | Complete for planning; implementation remains explicit follow-up. |

Blunt answer:
Yes, rewrite the architecture layer. No, do not throw away the public API. The
weakness is not `synced-blocks.tsx` or `hidden-content-blocks.tsx` being ugly;
the weakness is that Plite currently has several partial owners for the same
thing: visible editor order when model content is spread across roots or absent
from the DOM.

Source-backed facts:
| Surface | Live source | Fact | Decision |
|---------|-------------|------|----------|
| Multi-root root DX | `apps/www/src/app/(app)/examples/plite/_examples/multi-root-document.tsx:182-212` | The canonical multi-root example is already good DX: one `<Plite editor>` and multiple `<Editable root>` surfaces. | Keep. |
| Multi-root history/focus | `apps/www/src/app/(app)/examples/plite/_examples/multi-root-document.tsx:217-244` | Document history and external title input share one runtime, with explicit focus policy where needed. | Keep, but include in shared conformance. |
| Synced root data model | `apps/www/src/app/(app)/examples/plite/_examples/synced-blocks.tsx:67-90` | Repeated owner blocks point at shared and separate root keys in one document value. | Keep as the product-real example. |
| Synced root schema | `apps/www/src/app/(app)/examples/plite/_examples/synced-blocks.tsx:108-117` | `contentRoot: { slot: 'body' }` is the right raw Plite schema vocabulary. | Keep. |
| Synced root rendering | `apps/www/src/app/(app)/examples/plite/_examples/synced-blocks.tsx:209-240` | Duplicate/unsync are example-local commands over root identity. | Keep example-local. |
| Hidden content controls | `apps/www/src/app/(app)/examples/plite/_examples/hidden-content-blocks.tsx:163-198` | Selection/copy/find policy is local app state feeding boundaries. | Keep app-owned policy. |
| Hidden content slot | `apps/www/src/app/(app)/examples/plite/_examples/hidden-content-blocks.tsx:371-470` | Accordion, Collapsible, and Tabs all use `slots.contentBoundary`. | Keep public slot, avoid raw UI kit. |
| Public slot surface | `packages/plite-react/src/components/editable-text-blocks.tsx:450-565` | `contentBoundary` and `contentRoot` already coexist as render slots. | Keep API; unify internals. |
| View selection | `packages/plite-react/src/view-selection.ts:13-32` | Runtime-only `SlateViewSelection` and history storage already exist. | Keep and make it the cross-boundary selection source. |
| Projection graph | `packages/plite-react/src/projection-graph.ts:5-60` | The graph already models owner/root/path visible order for projected roots. | Promote conceptually to view-boundary graph. |
| Content-root navigation | `packages/plite-react/src/editable/content-root-navigation.ts:282-335` | It builds a projection graph from content-root owners. | Move graph construction out of navigation ownership. |
| Vertical navigation | `packages/plite-react/src/editable/content-root-navigation.ts:1008-1164` | Vertical movement mixes graph ownership, DOM geometry, and owner lookup. | Keep algorithm, change owner boundary. |
| Shift selection | `packages/plite-react/src/editable/content-root-navigation.ts:1292-1384` | Shift+Arrow creates a `ViewSelection` only for content roots. | Extend same model to hidden boundaries. |
| Projected commands | `packages/plite-react/src/editable/projected-selection-target.ts:127-159` | Projected selection can become command ranges, but ambiguous repeated-root segments bail out. | Make ambiguity an explicit capability matrix row, not hidden fallback. |
| DOM coverage | `packages/plite-dom/src/plugin/dom-coverage.ts:26-120` | Hidden DOM boundaries already carry state, policies, covered ranges, and materialization reasons. | Fold boundary facts into the same visible-order model. |

Architecture call:
- Keep the public vocabulary split:
  - `contentRoot`: mounted same-runtime child root projected into document flow.
  - `contentBoundary`: model-present content whose editable DOM is intentionally
    absent or app-hidden.
  - `Editable root`: separate top-level root view in the same runtime.
- Internally stop treating those as separate behavioral systems. Introduce or
  rename toward one internal `ViewBoundaryGraph` owner. It should model:
  - ordinary root blocks;
  - projected content-root owner blocks;
  - hidden DOM coverage boundaries;
  - boundary edges and materialization policies;
  - runtime-local projection identity for repeated roots;
  - native-affordance capability classification.
- `ViewSelection` becomes the runtime selection over that graph. Root-local
  `editor.selection` stays for compatibility and normal operations.
- DOM/native selection becomes an export/import optimization, not the source of
  truth for cross-boundary expanded selection.
- History stores and restores `ViewSelection` when a batch used a projected or
  hidden-boundary target.

Public API target:
| Surface | Target | Verdict |
|---------|--------|---------|
| `<Editable root>` | Keep as canonical top-level multi-root DX. | keep |
| `slots.contentRoot('body', options)` | Keep as canonical embedded document/root DX. | keep |
| `slots.contentBoundary({ mounted, scope, ... })` | Keep as canonical missing-DOM DX. | keep |
| Public `ViewSelection` | Do not expose yet. Keep internal until command/collab/browser proof forces it. | cut for first slice |
| One editor per block | Reject as default architecture. It multiplies focus/history/collab/selection problems. | cut |
| Product synced-block API | Keep in examples or Plate. Raw Plite owns root projection only. | cut from core |

Internal runtime target:
| Layer | Current shape | Target | Why |
|-------|---------------|--------|-----|
| Visible order | `projection-graph` plus `content-root-navigation` builds | One `ViewBoundaryGraph` service | One owner for document order across roots and boundaries. |
| Cross-boundary selection | `ViewSelection` for content roots only | `ViewSelection` over the graph | Handles roots, repeated projections, hidden boundaries, and history consistently. |
| Hidden DOM | `DOMCoverage` boundary registry | Keep registry, feed graph nodes/capabilities | Avoid duplicate policy logic. |
| Navigation | Content-root-specific keyboard handler | Graph traversal first, DOM geometry second | Arrow keys should not rediscover structure per feature. |
| Commands | Projected target helper with ambiguity bailout | Capability-based command target | Delete/type/copy should report supported/degraded/unsupported instead of guessing. |
| History | Root restore plus stored `ViewSelection` | View target restore | Undo/redo should restore the visible editing target, not only a root key. |

Example target:
| Example | Keep | Rewrite |
|---------|------|---------|
| `multi-root-document` | Keep as top-level roots example. | Add it to the shared conformance matrix; do not make it teach projection internals. |
| `synced-blocks` | Keep product-real Notion-like route. | Remove any route-specific authority; it should consume `contentRoot` plus graph-backed selection/history. |
| `hidden-content-blocks` | Keep shadcn/Radix route and policy controls. | Make it prove the same graph selection/copy/navigation laws through `contentBoundary`. |

Conformance test matrix:
| Behavior | Multi-root | Synced Blocks | Hidden Content |
|----------|------------|---------------|----------------|
| Arrow forward to end of visible document | required | required | required |
| Arrow backward to start of visible document | required | required | required |
| ArrowUp/ArrowDown across boundaries | required | required | required |
| Shift+Arrow across boundary | required | required | required, with native selection honesty |
| Cmd/Meta+Arrow document boundaries | required | required | required |
| Type over expanded view selection | root-local only | required | materialize/degrade policy row |
| Backspace/delete expanded view selection | root-local only | required | materialize/degrade policy row |
| Copy expanded view selection | required | required | model-backed/degraded policy row |
| Undo/redo restores visible target | required | required | required when materialized/model-backed |
| Click outside blurs active view | required | required | required |
| Native affordance matrix | basic | projected | missing-DOM degraded |

Implementation queue after user acceptance:
| Phase | Owner | Work | Proof |
|-------|-------|------|-------|
| 1. Rename/own graph | `plite-react` runtime | Extract `ViewBoundaryGraph` from content-root navigation/projection graph without public API change. | Unit graph contracts for roots, repeated roots, and hidden boundary nodes. |
| 2. Selection bridge | `plite-react` runtime | Make `ViewSelection` graph-backed for content roots and content boundaries. | Shift+Arrow, reverse Shift+Arrow, collapse, and history contracts. |
| 3. Command target | `plite-react` input/clipboard | Route type/delete/backspace/copy through view targets with capability results. | Projected selection target tests plus hidden-boundary degraded/materialize rows. |
| 4. Example conformance | `Plate repo root/playwright` | Parameterize the matrix over the three examples. | Chromium focused rows first; multi-browser/mobile rows only where native behavior is claimed. |
| 5. Browser proof | `Plate repo root` route proof | Run synced-blocks, hidden-content-blocks, and multi-root-document route proofs in browser. | No `Cannot find descendant`, no wrong-root focus, honest native-selection state. |

Issue accounting:
| Surface | Claim category | Exact claim | Proof route | Sync disposition |
|---------|----------------|-------------|-------------|------------------|
| multi-root focus/history | related guardrail | This plan consolidates existing multi-root focus/history architecture; no new fix claim. | Existing solution notes and multi-root route tests. | no ledger edit |
| Synced Blocks/content roots | related guardrail | Existing content-root/projection rows cover repeated-root pressure; this plan adds no issue closure. | Existing synced-content and projection-selection plans. | no ledger edit |
| hidden/offscreen DOM | related guardrail | Existing DOMCoverage/contentBoundary rows cover missing-DOM pressure; this plan adds no issue closure. | Existing hidden-dom and hidden-policy plans. | no ledger edit |
| browser/native affordances | release guard | Future implementation must classify native affordances honestly. | Future conformance matrix. | no PR reference edit |

Ecosystem strategy synthesis:
| System | Steal | Reject | Plite target |
|--------|-------|--------|--------------|
| ProseMirror | Centralized DOM selection import/export authority. | Schema-heavy transaction API shape. | One bridge owns DOM/native boundaries. |
| Lexical | Command/listener partitioning and explicit update lifecycle. | Product node kits in core. | Commands consume view targets; examples stay product-local. |
| Tiptap | Boring ergonomic call sites. | Opinionated extension sugar as raw Plite API. | Keep slots simple and document the direct call site. |
| React ProseMirror | Many React views over one editor state can work when ownership is strict. | Per-view independent editor truth. | One runtime, many views, one operation stream. |

Plite maintainer objection ledger:
| Objection | Answer | Proof gate |
|-----------|--------|------------|
| "This is too much machinery for examples." | The machinery already exists; the problem is split ownership. Consolidation reduces bug surface. | Graph contracts and no extra public API. |
| "Hidden DOM cannot be native-equivalent." | Correct. The API must report degradation instead of pretending. | Native affordance matrix. |
| "Repeated synced roots make selection ambiguous." | Treat repeated projection identity as runtime-local and expose unsupported ambiguity as capability results. | Repeated-root copy/type/delete tests. |
| "Apps should own custom layout." | Apps own UI state; Plite owns declared editor model boundaries. | `contentBoundary` only, no raw UI kit. |
| "This may hurt normal editor perf." | Normal path should not build costly graph work unless multiple roots/boundaries are active. | Perf budget in execution phase. |

Hard cuts and rejected alternatives:
| Option | Verdict | Why |
|--------|---------|-----|
| Rewrite examples first | reject | Examples are consumers; the runtime ownership is the bug source. |
| Expose public `ViewSelection` now | reject | Too early; keep internal until proof shows necessary external use. |
| Merge `contentRoot` and `contentBoundary` public API | reject | They are different app concepts even if internals share a graph. |
| One editor per block | reject | Worse focus/history/collab/undo story. |
| Route-local keyboard hacks | reject | They will recreate the same bugs in the next example. |
| Raw path props or public `ignoreDOM` | reject | They push invariants into app code. |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | yes | applied conceptually | Avoid broad React state fanout and per-node effects. | Graph/cache work must be runtime-owned. |
| performance-oracle | yes | applied conceptually | One editor per block is the wrong perf/focus shape. | Keep one runtime; graph work gated by active features. |
| performance | yes | applied conceptually | Repeated roots and hidden boundaries need stress cohorts. | Add 20/100 projection plus hidden-boundary budgets in execution. |
| tdd | yes | applied conceptually | Current examples need one shared conformance suite. | Execution starts with matrix tests. |
| shadcn | yes | applied conceptually | Hidden route should stay shadcn-shaped but not core-owned. | Keep example-local UI. |
| react-useeffect | yes | applied conceptually | Boundary registration must be lifecycle-stable and cleanup-safe. | Execution proof includes handler cleanup. |

Verification workspace gate:
| Claim | Workspace | Command or read | Result | Owner |
|-------|-----------|-----------------|--------|-------|
| Multi-root DX is already simple | `Plate repo root` | `nl -ba site/examples/ts/multi-root-document.tsx` | `<Editable root>` call sites verified. | planning |
| Synced Blocks uses content roots | `Plate repo root` | `nl -ba site/examples/ts/synced-blocks.tsx` | Shared and separate root keys plus `contentRoot` spec verified. | planning |
| Hidden route uses stable contentBoundary | `Plate repo root` | `nl -ba site/examples/ts/hidden-content-blocks.tsx` and `editable-text-blocks.tsx` | `slots.contentBoundary` verified. | planning |
| ViewSelection exists | `Plate repo root` | `nl -ba packages/plite-react/src/view-selection.ts` | Runtime selection and history storage verified. | planning |
| DOMCoverage is the hidden-boundary registry | `Plate repo root` | `nl -ba packages/plite-dom/src/plugin/dom-coverage.ts` | Boundary state/policy/materialization types verified. | planning |
| Final plan checker | `plate-2` | `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-26-plite-unified-view-boundary-navigation-architecture.md` | passed after final update. | planning |

Verification evidence:
- Read `.agents/skills/slate-plan/SKILL.md`; planning-only policy confirmed.
- Read existing plans for projection selection, synced content roots, synced
  selection/history coverage, hidden DOM blocks API, hidden content policy
  controls, hidden-content Shift boundary selection, focus ownership, comment
  selection, and ArrowRight paragraph edge.
- Read live `Plate repo root` examples/tests/runtime files listed in Verification
  surface.
- Read solution notes for multi-root DX, inactive-root native caret, rootless
  selection, operation-root middleware, and DOMCoverage internal boundaries.
- Ran the autogoal checker after this plan update; it passed.

Open risks:
- Implementation risk remains high around ambiguous repeated-root projected
  selections, native affordance honesty, and normal-path perf. These are not
  planning blockers because they are converted into execution proof gates.
- This plan did not run fresh browser interactions; it intentionally reuses
  existing browser proof and marks new unified claims as future execution proof.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Consolidated Plite Plan closeout. |
| Where am I going? | Final answer with a short verdict and the plan path. |
| What is the goal? | Decide whether to rewrite the weak multi-root/synced/hidden architecture surface. |
| What have I learned? | Public API is mostly right; internal ownership needs consolidation. |
| What have I done? | Read prior plans, live source, solution notes, wrote the unified plan, and ran checker. |

Final handoff:
- PR line: N/A, no PR requested.
- Issue/tracker line: N/A, no new issue claim or ledger edit.
- Confidence line: 0.92 for planning direction.
- Outcome: keep public APIs, rewrite internal runtime ownership around a
  `ViewBoundaryGraph`, and add one conformance matrix for the three examples.
- Caveat: no implementation or fresh browser proof was performed in this
  planning activation.
