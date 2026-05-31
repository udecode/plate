---
description: Review Slate v2 architecture/API plans against React 19.2 runtime performance, Slate-close unopinionated DX, legacy-regression proof, research evidence, and shadcn-style composability; write a scored plan and keep completion pending until every required pass and closure gate is complete.
argument-hint: '[--quick|--standard|--deep] <Slate v2 architecture/API review prompt>'
disable-model-invocation: true
name: slate-plan
metadata:
  skiller:
    source: .agents/rules/slate-plan.mdc
---

# Slate Plan

Handle $ARGUMENTS.

Use this for repeated "harsh honest, absolute best Slate v2 architecture/DX"
review prompts where the failure mode is death by incremental suggestions.

This is a two-phase lane skill.

Planning mode is the default. It creates or updates the execution-grade plan,
scores it, and uses the active goal as the durable lane contract until every
required pass, issue/reference sync gate, verification gate, and closure score
gate is complete. Score is only one input. A high score never permits goal
completion by itself; planning completion means the full pass schedule is
closed and the plan is ready for user review.

Execution mode starts only after the user explicitly accepts a ready plan and
invokes `slate-plan` again for that plan. Execution mode creates or continues a
new goal for the accepted plan's implementation target and then executes the
next plan owner with fresh verification evidence. Do not use the planning goal
as the execution goal. The user-review boundary is real.

## Use When

- Reviewing Slate v2 architecture, public API, hooks, runtime boundaries, or
  render contracts.
- Executing a user-accepted Slate Plan against the live `.tmp/slate-v2`
  workspace after a second explicit invocation names the accepted plan.
- The user asks whether the plan is the absolute best shape for:
  - React 19.2 runtime performance
  - unopinionated Slate-close DX
  - Plate and slate-yjs migration
  - regression-proof browser behavior
  - Lexical / ProseMirror / Tiptap evidence
  - shadcn-style composability and minimal props
- The user says repeated review keeps producing more suggestions and wants a
  methodical plan-confidence gate.

## Do Not Use When

- The user asks for a narrow bug fix or browser repro.
- The user asks for a normal code review of a diff.
- The request has no plan and no architecture/API/spec lane shape; use `task`
  or the issue-specific skill instead.

## Hard Policy

- In planning mode, do not patch Slate v2 implementation code. Planning mode may
  edit only planning, research, issue-ledger, and PR-reference artifacts it
  explicitly owns.
- In execution mode, Slate Plan may edit `.tmp/slate-v2` implementation, tests,
  examples, package files, build config, and related reference docs only when
  the latest user message explicitly accepts the ready plan or asks this skill
  to execute that named plan.
- User phrases like "go", "rewrite", "feel free to build", "fix it", or
  "execute" do not override planning mode when the plan is not yet
  user-review-ready. Convert them into plan decisions and proof rows. Once the
  plan is ready and the user explicitly accepts it, the same phrases can start
  execution mode.
- Do not mark the goal complete because the review pass is tired.
- Score is not completion. A passing score with any pending pass, issue sync,
  reference sync, verification gate, named next owner, or runnable next action
  keeps the goal active.
- The active goal is the lane status. The plan is the evidence ledger.
- Never write contradictory closeout state. If the plan says
  `slate_plan_lane_status: pending`, `final_handoff_status: pending`, a non-`none`
  `next_pass`, or a runnable `next_action`, the goal must remain active.
- If the user asks to run only one pass, close only the current pass in the plan
  and leave the goal active with the next pass named.
- Goal completion is legal only in the closure/final-gates pass, after the
  active plan proves every earlier pass-state row is complete or explicitly
  skipped with evidence.
- Do not use `blocked` when another research, review, or plan-hardening move is
  runnable, unless the user explicitly stops execution or tells you to mark the
  lane blocked.
- Treat pasted review findings as context. The latest user request is the task.
- Keep Slate v2 unopinionated. Plate owns opinionated product APIs.
- A breaking or paradigm change needs an adoption story. "Cleaner architecture"
  alone is not a justification.
- Prefer inline example logic when it is only used once. Do not invent local
  helpers like `isAtStartOfX`, `getActiveX`, or `applyX` just to make a plan
  look tidy. Extract a helper only when the same logic is reused, the inline
  block is genuinely distracting, or the helper is the proposed public/internal
  API being reviewed.
- Example DX matters: a Slate example should show the actual API shape at the
  call site first. Helper extraction is a readability tool, not a default
  architecture move.
- Intent, outcome, scope, non-goals, and decision boundaries must be explicit
  before the plan can score as ready.
- Major decisions need a decision brief: principles, top drivers, viable
  options, rejected alternatives, and why the chosen option wins.
- Plate/slate-yjs migration means architecture backbone, not support for their
  current public APIs. Do not require current-version Plate adapters,
  `editor.api` / `editor.tf` compatibility, or current slate-yjs integration
  fixtures from raw Slate.
- Use current Plate/slate-yjs source only to understand migration pressure.
  Required proof is substrate-level: `state` / `tx` extension namespaces,
  schema/spec policy, deterministic operations/snapshots/commits, commit
  metadata, and local-only target semantics.
- If a change touches extension, plugin, collaboration, operation, or data-model
  surfaces, a raw-Slate answer alone is insufficient.
- Do not let a polished plan self-certify. Scores, verdicts, and keep/drop
  decisions need cited evidence.
- Workspace verification is part of evidence. `plate-2` commands prove only
  planning, ledgers, and completion-state artifacts. Any Slate v2 source,
  runtime, browser, package, public API, or issue-fix claim must be verified
  from the live `.tmp/slate-v2` workspace with the relevant `.tmp/slate-v2` command.
- Do not count `bun run test`, typecheck, lint, Playwright, or package filters
  run in `plate-2` as Slate v2 verification. They may be recorded only as
  plan-artifact checks.
- If execution mode touched `.tmp/slate-v2`, Slate Plan closure must require the
  applicable `.tmp/slate-v2` verification command set.
  A failing relevant `.tmp/slate-v2` command keeps the plan or execution review
  `pending` unless the failure is proven unrelated with a cited command,
  failing scope, and owner.

## Required Artifacts

- Plan file under `docs/plans/`.
- Create the plan from the Slate Plan goal template:

  ```bash
  node .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs \
    --template slate-plan \
    --title "<short Slate Plan title>"
  ```

  The reusable project template is `docs/plans/templates/slate-plan.md`.
  Runtime plans still go directly under `docs/plans/`; do not use `docs/goals`.
  After creating the static plan, edit the generated file and fill the lane
  objective, pass schedule details, closure threshold, verification surface,
  constraints, boundaries, and blocked condition there.

- Active goal for planning mode: one Slate Plan planning lane uses one
  `create_goal` objective. The goal content must name the desired closed plan
  state, the full pass schedule, the one-pass-per-activation policy, required
  proof gates, user-review-ready closeout, and blocked condition. Do not split
  the planning lane into multiple goals.
- Active goal for execution mode: after explicit user acceptance, start a new
  goal for the accepted plan path and implementation target. It must name the
  exact plan, execution queue, `.tmp/slate-v2` verification gates,
  issue/reference sync, loading `.agents/skills/autoreview/SKILL.md` when
  implementation changes are non-trivial and uncommitted, and closeout
  conditions. For dirty local work, the autoreview skill's target is
  `--mode local`; do not use `--uncommitted`.
- Research updates under `docs/research/` when the evidence lane is stale or
  incomplete.
- Issue-ledger accounting in the active plan: fixed issue claims, related issue
  classifications, cluster coverage, and explicit non-claim decisions grounded
  in `docs/slate-issues`.
- ClawSweeper related-issue pass in the active plan whenever the plan changes
  Slate v2 public API, runtime behavior, browser behavior, examples, issue
  claims, or PR narrative. Run it once per related surface, not after every v2
  edit. Re-run only when the touched issue surface changes materially.
- Issue discovery is ledger/cache-first. Reuse existing ClawSweeper output in
  `docs/slate-v2/ledgers/fork-issue-dossier.md`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`, and generated live rows
  before any live GitHub read. Do not run broad `gh issue list`,
  `gh search issues`, or unscoped live GitHub discovery from Slate Plan just
  to refresh known corpus counts or already-classified surfaces.
- Live issue corpus input:
  `docs/slate-issues/gitcrawl-live-open-ledger.md` is generated live gitcrawl
  data only. Read it for current open rows and gitcrawl cluster IDs; do not add
  manual classifications there.
- Current manual issue sync updates in
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`: update current issue
  classifications whenever a plan or implementation slice claims, improves,
  reviews, or intentionally excludes an issue or cluster. If the file does not
  exist yet, create it before recording current live sync state.
- Frozen corpus context in `docs/slate-issues/open-issues-ledger.md`: use it as
  the `682`-issue historical classification seed, not as current live sync
  truth.
- Fork issue dossier updates in
  `docs/slate-v2/ledgers/fork-issue-dossier.md`: append one self-contained
  section per reviewed related issue, using ClawSweeper's Fork Issue Dossier
  Mode. This replaces upstream GitHub issue comments for the fork.
- Issue coverage ledger updates in
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`: every fixed issue must
  appear as `Fixes #....: <description>`, and every related but not-fixed issue
  must be categorized in the related issue matrix.
- PR reference sync in `docs/slate-v2/references/pr-description.md`: keep exact
  fixed issue claims and counts, accepted current API shape, proof references,
  not-claimed release gates, and a link to the full issue coverage ledger.
- Slate maintainer objection ledger in the active plan, with ecosystem answers
  when triggered. If it grows too large, split it to
  `docs/plans/<same-slug>-objection-ledger.md` and link it from the plan.
- Plan deltas from review in the active plan: what changed, what was dropped,
  what was strengthened, and what stayed unchanged with reasons.
- Intent/boundary record in the active plan: intent, outcome, in-scope,
  non-goals, decision boundaries, and unresolved user-decision points.
- Decision brief in the active plan: principles, decision drivers, viable
  options, invalidated alternatives, consequences, and follow-ups.
- Ecosystem strategy synthesis in the active plan whenever Lexical,
  ProseMirror, Tiptap, React, Plate, slate-yjs, or another reference system is
  used as evidence. This is not a citations list; it must state the mechanism
  Slate should steal, reject, or deliberately diverge from.
- Applicable implementation-skill review notes in the active plan: Vercel
  React, performance-oracle, and tdd, plus shadcn/react-useeffect when relevant,
  each marked `applied` or `skipped` with a concrete reason.
- Allowed edit scope in planning mode: `docs/plans/**`, `docs/research/**`,
  `docs/slate-issues/**`, `docs/slate-v2/ledgers/**`, and
  `docs/slate-v2/references/**`.
- Allowed edit scope in execution mode: the accepted plan's named `.tmp/slate-v2`
  implementation, test, example, package, build, config, and reference-doc
  owners, plus the active plan ledger.

## Goal Setup

Before creating or resuming a Slate Plan:

- Use `get_goal` first. If no matching goal exists, call `create_goal` once for
  the whole Slate Plan lane.
- Do not call `create_goal` when `get_goal` returns any active goal. Repeated
  goal creation fails in a thread. Continue under a matching goal, or resolve a
  mismatched active goal before creating a new one.
- The goal objective must include the pass schedule and say that each activation
  completes only the next incomplete pass.
- The goal objective must include constraints, scope, verification details, and
  the closure condition when they materially change what completion means.
- Create the lane plan with `--template slate-plan` so the goal plan starts
  with Slate Plan's required plan-shape sections, pass table, scorecard,
  issue accounting, workspace gate, objection ledger, and final handoff rows.
- Do not create separate per-pass goals. Passes are rows inside the active plan and
  active goal, not separate thread goals.
- If an active goal belongs to a different lane, resolve that goal honestly
  before starting a new Slate Plan goal. If the tool does not allow that
  transition, report the mismatch and ask for the smallest user decision.
- If no goal tool is available, record degraded control state in the active plan
  and stop before starting autonomous pass work unless the user explicitly
  accepts the degraded workflow.
- Do not start planning pass work until the lane goal is active, already
  matching, or the missing-goal path is explicitly resolved.
- Do not start execution mode under the planning goal. After user acceptance,
  complete or reuse only an execution-shaped goal that names the accepted plan
  and proof gates.

Good goal:

```txt
Slate Plan closes the callback-memoization API plan for user review:
complete the scheduled passes one activation at a time, record evidence-backed
score deltas, issue/reference sync, objection handling, verification gates, and
  the final user-review handoff; keep the goal active until closure/final gates
  prove no planning pass remains runnable.
```

Good execution goal:

```txt
Slate Plan executes docs/plans/<accepted-plan>.md against `.tmp/slate-v2`,
complete only when every accepted execution queue row is implemented or
explicitly deferred with evidence, focused and broad `.tmp/slate-v2` gates pass
or have recorded owners, issue/reference sync is current, the autoreview skill
has been loaded and its dirty-local target has no accepted/actionable findings
for non-trivial uncommitted implementation changes or is marked N/A for
planning-only work, and the plan's final execution closeout rows are closed.
```

Bad goal:

```txt
Run Slate Plan passes 1 through 12.
```

Default plan path:

```txt
docs/plans/YYYY-MM-DD-slate-v2-absolute-architecture-review-plan.md
```

Reuse an active plan when the prompt names one, or when the active goal and plan
both point at the same surface and the latest user request is clearly resuming
that lane.

## Read First

1. Latest user request.
2. Current goal state, if a goal tool exists.
3. Active plan under `docs/plans/` if present.
4. `docs/research/README.md`, `docs/research/index.md`, and
   `docs/research/log.md`.
5. `docs/slate-issues/gitcrawl-live-open-ledger.md`,
   `docs/slate-issues/gitcrawl-v2-sync-ledger.md` when it exists,
   `docs/slate-issues/open-issues-ledger.md`,
   `docs/slate-issues/gitcrawl-clusters.md`,
   `docs/slate-issues/issue-clusters.md`,
   `docs/slate-issues/test-candidate-map/`,
   `docs/slate-issues/benchmark-candidate-map.md`,
   `docs/slate-issues/package-impact-matrix.md`, and
   `docs/slate-issues/requirements-from-issues.md`.
6. `docs/slate-v2/ledgers/issue-coverage-matrix.md`,
   `docs/slate-v2/ledgers/fork-issue-dossier.md`, and
   `docs/slate-v2/references/pr-description.md`.
7. Relevant compiled research pages for Lexical, ProseMirror, Tiptap, Slate,
   React 19.2, node/render DX, and browser proof.
8. Live `.tmp/slate-v2` API surfaces touched by the review.

Read when relevant:

- Intent/boundary pressure when intent, scope, non-goals, or decision
  boundaries are unclear. Record the answer directly in this Slate Plan.
- Steelman pressure when major decisions need maintainer/user objection rows.
  Record the strongest fair objection, tradeoff tension, and adoption answer in
  this Slate Plan.
- High-risk deliberate pressure when a proposal changes public API, data model,
  collaboration, runtime, browser behavior, migration, release gates, or package
  boundaries. Record the pre-mortem and expanded proof plan in this Slate Plan.
- [vercel-react-best-practices](.agents/skills/vercel-react-best-practices/SKILL.md)
  when React rendering, subscriptions, external stores, bundle shape, browser
  event listeners, or runtime performance are in scope.
- [performance-oracle](.agents/skills/performance-oracle/SKILL.md) when hot
  paths, algorithms, memory, browser/editor runtime, scalability, or measured
  performance risk is in scope.
- [performance](.agents/skills/performance/SKILL.md)
  when a performance lane needs GitHub-scale cohorting, repeated-unit budgets,
  interaction-level INP/p95/p99 rows, memory tagging, degradation policy, or
  production dashboard/RUM proof beyond generic React and algorithmic advice.
- [tdd](.agents/skills/tdd/SKILL.md) when the plan changes behavior, fixes a
  regression class, or needs test-first acceptance criteria.

Use `research-wiki` when the compiled layer is stale, contradictory, or missing
coverage for the current question. For framework evidence, inspect local
official clones under `..` or normalized `../raw` before external docs.

If the review depends on current `.tmp/slate-v2` behavior, cite live source files
or tests. If it depends on React 19.2, Lexical, ProseMirror, Tiptap, or Slate
legacy behavior, cite the compiled research page or local source read used for
that claim.

## Live Source Grounding

Current Slate v2 source wins over every plan, research note, legacy Slate memory,
and previously generated handoff.

Before any pass, score, ledger row, migration answer, docs/example answer,
proof row, implementation phase, final handoff, or user-facing explanation that
relies on what currently exists:

1. Re-read the live `.tmp/slate-v2` source, example, test, or generated contract
   that owns the shape.
2. State the exact current owner: file, test, route, generated contract, or
   explicit gap.
3. Quote or summarize the current shape only if it exists on disk in the current
   checkout.
4. Attach a file/line pointer in the plan or handoff.
5. If the live source already matches the proposed target, write
   `already done in live source` and move the decision to docs/tests/cleanup
   only.
6. If no live current shape exists, write `decision: ...`, `target shape: ...`,
   or `gap: ...` instead of inventing a current state.

Stale docs and closed plans are not current API evidence. They can explain why
a decision exists, but they cannot prove what `.tmp/slate-v2` exposes today.

For render/API examples, grep the exact symbols first. Examples:

- `rg -n "RenderVoidProps|renderVoid|renderElement" .tmp/slate-v2/packages/slate-react .tmp/slate-v2/site`
- `rg -n "EditorExtension|commands\\?|setup\\(|extend\\(" .tmp/slate-v2/packages/slate/src`
- `rg -n "useElementSelected|useNodeSelector|useEditorState" .tmp/slate-v2/packages/slate-react/src`

Do not translate from old Slate by memory. If the current code says void
renderers already receive content-only props, do not describe a migration from
`attributes` / `children` void renderers. If the current code exposes
`commands?: EditorExtensionCommand[]`, do not describe a fake command-object
map.

This applies to every related step, not only final before/after summaries. A
maintainer objection, proof matrix row, migration answer, docs answer,
implementation phase, or final chat answer can be wrong in the same way if it
uses a stale "before". Re-ground those steps before writing them.

## Verification Workspace Gate

Slate v2 verification runs in `.tmp/slate-v2`, not in this planning repo.

Rules:

1. Before scoring, closing, or reviewing an implementation slice that changes or
   claims `.tmp/slate-v2` behavior, run the relevant command `.tmp/slate-v2` dir.
2. Record the exact command, cwd, result, and failure scope in the active plan.
3. Broad Slate v2 closure after an execution pass needs the broadest
   feasible `.tmp/slate-v2` gate for the touched surface. If `bun run test` is
   the project-level release gate and it fails, closure stays `pending` until
   the failure is fixed, isolated as unrelated, or explicitly moved to a
   recorded owner.
4. Focused gates are acceptable during intermediate passes, but the plan must
   name the remaining broad `.tmp/slate-v2` gate before calling the implementation
   release-ready.
5. If tooling, time, browser availability, or device access prevents a required
   `.tmp/slate-v2` gate, record `verification gap: <command>` and keep status
   `pending` or `blocked` according to whether more autonomous work remains.

Common command ownership examples:

- Core package changes: run the relevant `bun --filter slate ...` test/typecheck
  from `.tmp/slate-v2`, then the broader `.tmp/slate-v2` gate named by the package.
- React/runtime/browser changes: run focused `slate-react` tests and matching
  Playwright rows from `.tmp/slate-v2`; do not use `plate-2` tests as proof.
- Public API/export changes: run public-surface contracts from `.tmp/slate-v2`.
- Issue-fix claims: run the exact proof route from `.tmp/slate-v2` and keep issue
  claims conservative until it passes.
- Planning-only docs/ledger changes in `plate-2`: run the relevant source sync
  and targeted text checks; no Slate v2 test claim may be made from that alone.

## Goal And Plan State

The active goal is the durable lane state. The plan is the durable evidence
state.

At activation:

1. Call `get_goal`.
2. If the active goal already matches the Slate Plan lane, continue under it.
3. If an active goal exists but does not match, resolve that mismatch before
   doing mutable Ralplan work.
4. If no goal exists, call `create_goal` with the lane objective, full
   pass schedule, one-pass-per-activation rule, verification constraints, and
   closure condition.
5. Resolve the target plan path from the latest user request or create the
   default plan path.
6. Read the active plan and pass-state ledger to find the first runnable pass.
7. Run exactly the current pass, then update the plan.

Allowed `current_pass_status` values:

- `pending`
- `in_progress`
- `complete`
- `revise`
- `blocked`
- `skipped`

Single-pass completion is invalid by default:

- one activation may complete at most one scheduled review pass
- a newly created or newly activated review plan keeps the goal active
- a one-pass-only user instruction keeps the goal active after that pass
  unless `next_pass` is `none`
- only the closure pass may complete the goal
- the closure pass is valid only after earlier pass-state rows are already
  recorded as complete in the active plan before the current activation starts
- pass rows written earlier in the same assistant turn do not make the closure
  pass eligible
- if the current activation creates, rewrites, or materially rescopes the plan,
  record the next pass and keep the goal active
- there is no single-pass bypass; user phrases like `full`, `all passes`,
  `continue until done`, or `give me the Done Handoff` do not permit completing
  the goal in the same activation that created, rewrote, or rescoped the plan
- if no separate goal continuation/resume occurred between passes, it is still
  the same activation

Before calling `update_goal(status: complete)`, prove in the plan:

- every scheduled pass row is `complete` or intentionally `skipped` with a
  concrete reason and evidence
- no pass row is `pending`, `in_progress`, `revise`, or `blocked` with a
  runnable next move
- `current_pass` is the closure/final-gates pass
- `current_pass_status` is `complete`
- `next_pass` is `none`
- `next_action` is `none`
- `slate_plan_lane_status`, if present, is `complete`, `done`, or `closed`
- `final_handoff_status`, if present, is `complete`, `done`, or `closed`
- every completion threshold row below passes
- `final_handoff_status` is `complete`
- the final chat response includes the exhaustive Done Handoff bullet list

If any assertion fails, keep the goal active and name the earliest runnable
`next_pass`.

## Confidence Score

Score every review pass from `0.00` to `1.00`.

Weights:

| Dimension                                                | Weight |
| -------------------------------------------------------- | -----: |
| React 19.2 runtime performance                           |   0.20 |
| Slate-close unopinionated DX                             |   0.20 |
| Plate and slate-yjs migration-backbone shape             |   0.15 |
| Regression-proof testing strategy                        |   0.20 |
| Research evidence completeness                           |   0.15 |
| shadcn-style composability and hook/component minimalism |   0.10 |

Score evidence rules:

- Every dimension score must cite concrete evidence: plan section, source file,
  test/browser contract, research page, or ledger row.
- A dimension without cited evidence cannot score above `0.80`.
- Research evidence cannot score above `0.85` without current citations for the
  external systems or local repos the review relies on.
- Regression-proof testing cannot score above `0.80` without named replayable
  browser/unit/stress contracts.
- Migration-backbone shape cannot score above `0.85` if applicable plugin or
  collab substrate answers are missing. Do not lower the score because raw
  Slate lacks current-version Plate/slate-yjs adapters; that is not the target.
- Any dimension affected by an unresolved intent, scope, non-goal, or decision
  boundary gap cannot score above `0.85`.
- A major decision with no viable-options comparison cannot score above `0.85`.
- A major decision with only one surviving option cannot score above `0.85`
  unless the invalidated alternatives are named and fairly rejected.

Completion threshold:

All rows are conjunctive. Passing score is necessary but never sufficient.

- total score `>= 0.92`
- no dimension below `0.85`
- no unplanned P0/P1 issue
- every dimension score has cited evidence
- no unresolved contradiction in the research layer
- ecosystem strategy synthesis complete for every external system used as
  evidence; plans that only say "analyze Lexical/ProseMirror/Tiptap" or cite
  files without a concrete Slate strategy stay `pending`
- issue-ledger pass complete: every planned fix maps to fixed issue claims or
  explicit related/non-fix classifications
- ClawSweeper related-issue pass complete for the current plan surface, or
  explicitly skipped with a concrete reason such as `docs-only typo`, `pure
internal refactor with no issue-facing behavior`, or `already covered by
completed pass <name/date>`
- live issue corpus sync complete for the current slice: generated live rows
  are read from `docs/slate-issues/gitcrawl-live-open-ledger.md`, and touched
  issue classifications are updated in
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- fork issue dossier sync complete for every reviewed related issue in
  `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md` updated when the plan changes
  issue claims, accepted API shape, proof status, release gates, examples, or
  maintainer-facing narrative
- no missing acceptance criteria for implementation
- no public API surface left in "maybe" language
- intent, outcome, in-scope, non-goals, and decision boundaries are explicit
- every major decision has principles, top drivers, viable options, rejected
  alternatives, consequences, and follow-ups
- high-risk deliberate mode is complete when triggered
- every applicable Vercel React, performance-oracle, tdd, shadcn, and
  react-useeffect review is applied or explicitly skipped with a reason
- every major breaking/paradigm change has an accepted objection-ledger row
- extension/plugin/collaboration/data-model changes have migration-backbone
  answers when applicable
- no objection-ledger row is `unresolved`, `revise`, or `drop` without a
  corresponding plan response
- pass schedule is complete
- pass-state ledger proves earlier passes completed before closure
- plan deltas from review are recorded
- verification workspace gate is satisfied: every Slate v2 source, behavior,
  package, browser, or issue-fix claim has a recorded `.tmp/slate-v2` command and
  result, and no relevant failing `.tmp/slate-v2` command is left without a fix,
  unrelated-failure proof, or explicit owner
- autoreview closeout is satisfied for execution work: non-trivial uncommitted
  implementation changes load `.agents/skills/autoreview/SKILL.md` and follow
  its dirty-local target selection until no accepted/actionable findings remain,
  or the plan records why the lane is planning-only or otherwise has no local
  implementation patch to review
- final user-review handoff gate complete: the active plan contains the final
  handoff outline, and the final chat response lists every accepted plan
  item/decision with before/after shape when applicable

If any gate fails, status stays `pending`.

## Plan Shape

The plan must include:

1. Current verdict.
2. Intent/boundary record.
3. Decision brief.
4. Confidence scorecard with evidence references.
5. Source-backed architecture north star.
6. Ecosystem strategy synthesis:
   - reference system and file/source used;
   - observed mechanism;
   - problem it avoids;
   - Slate target mechanism;
   - what to steal;
   - what to reject;
   - explicit `agree`, `partial`, `tension`, `diverge`, or `gap` verdict.
7. Public API target.
8. Internal runtime target.
9. Hook/component/render DX target.
10. Plate migration-backbone target.
11. slate-yjs migration-backbone target.
12. Full issue-ledger accounting:
    - ClawSweeper related-issue pass status, scope, trigger, and dossier output;
    - fixed issues with exact `Fixes #....: <description>` wording;
    - related but not fixed issues with category and reason;
    - cluster coverage and remaining cluster backlog;
    - generated live gitcrawl row read status and manual v2 sync ledger status
      for every touched issue and cluster;
    - fork issue dossier sync status for every reviewed issue section;
    - PR-description update status for issue claims, API shape, proof status,
      and release gates.
13. Legacy regression proof matrix.
14. Browser stress / parity strategy.
15. Applicable implementation-skill review matrix.
16. High-risk deliberate-mode pre-mortem and proof plan when triggered.
17. Hard cuts and rejected alternatives.
18. Slate maintainer objection ledger with ecosystem answers when triggered.
19. Pass schedule and pass-state ledger.
20. Plan deltas from review.
21. Open questions and what would change the decision.
22. Implementation phases with owners.
23. Fast driver gates.
24. Final user-review handoff outline.
25. Final completion gates.

Fast driver gates must include the cwd. For any gate that proves Slate v2
behavior, the cwd is `.tmp/slate-v2`. For planning-only gates, the cwd is
`plate-2`.

The `docs/plans/templates/slate-plan.md` template should seed these as
concrete headings, tables, and placeholders. Fill the generated plan sections;
do not leave the required shape implicit in this rule.

## Pass Schedule

Run the review as passes, not one giant essay:

Before starting any pass, set or verify the lane goal. The goal should contain
the full pass schedule and say that each activation completes the next
incomplete pass only. Do not create separate per-pass goals.

1. Current-state read and initial score.
2. Related issue discovery pass: run ClawSweeper once for the plan's touched
   issue surface when existing ledgers do not already cover that surface. Read
   current generated/manual ledgers first, then reuse prior ClawSweeper dossier
   and matrix rows when they match. Use live GitHub only for exact issue refs
   whose current thread state affects a new fixed/improved/duplicate/stale
   decision. Do not run broad live GitHub issue lists or searches for surfaces
   already classified by ClawSweeper. Update the active plan and
   `docs/slate-v2/ledgers/fork-issue-dossier.md` only when the pass changes
   issue classifications or claim text. Do not rerun ClawSweeper on later v2
   edits unless the issue-facing surface changes.
3. Issue-ledger pass: scan the full `docs/slate-issues` ledger, cluster map,
   test candidate map, benchmark candidate map, package impact matrix, and
   requirements file for issues the plan can fix, partially cover, or must
   classify as related/non-fix. Reuse the ClawSweeper pass output instead of
   re-triaging the same issues.
4. Intent/boundary and decision-brief pass; write the boundary record directly
   when it is not already explicit.
5. Research, ecosystem strategy synthesis, and live-source refresh.
6. Performance, DX, unopinionated-core, migration, regression, research, and
   simplicity pressure passes.
7. Slate maintainer objection ledger with steelman pressure for major decisions.
8. High-risk deliberate-mode pass when triggered.
9. Ecosystem maintainer pass when triggered.
10. Revision pass that answers objections and updates the plan.
11. Issue sync accounting pass: read generated live rows from
    `docs/slate-issues/gitcrawl-live-open-ledger.md`; write current manual
    classifications to `docs/slate-issues/gitcrawl-v2-sync-ledger.md`; then
    update
    `docs/slate-issues/gitcrawl-clusters.md`,
    `docs/slate-v2/ledgers/fork-issue-dossier.md`,
    `docs/slate-v2/ledgers/issue-coverage-matrix.md`, and
    `docs/slate-v2/references/pr-description.md` for every fixed, improved,
    related, and non-fix classification produced by the plan.
12. Closure score and final gates.

The closure score and final gates are their own pass. Do not fold closure into
the previous pass. The closure pass may start only when every earlier
pass-state row was already `complete` or intentionally `skipped` with evidence
before this activation began. Rows completed in the same assistant turn are
current-pass work, not prior closure eligibility.

After each pass, update the active plan with pass status, evidence, changes,
and next owner. Keep the active goal open while any pass or revision remains
runnable.

Pass-state ledger rows must include:

- pass name
- status: `pending`, `in_progress`, or `complete`
- evidence added
- plan delta
- open issues
- next owner

Do not mark multiple major passes complete in one activation. Finish the current
pass, record the next pass, keep the goal active, and let the next activation
run the next pass.

If the user explicitly asks for the `Done Handoff` before the closure pass is
eligible, do not invent one. Record the current pass result, write a pending
handoff that names the next pass, and leave the goal active.

## Intent Boundary Gate

Before treating a plan as ready, record:

- intent: why the user wants this change
- desired outcome: what state should exist after implementation
- in-scope behavior
- non-goals
- decision boundaries: what the plan may decide without asking the user again
- unresolved user-decision points

Gather repo facts before asking the user about internals. If one user answer is
needed, ask exactly one high-leverage boundary question, not a questionnaire.

Pressure-test weak answers with one of:

1. concrete example, counterexample, or evidence signal
2. hidden assumption or dependency
3. explicit tradeoff, rejected boundary, or deferred scope
4. root-cause reframing when the request describes only symptoms

Do not score ready while non-goals or decision boundaries are vague.

## Decision Brief

For every major public API, runtime, render contract, hook, event, migration,
operation, data-model, or browser-proof decision, record:

- principles: three to five rules the decision must satisfy
- top drivers: the three forces that most affect the decision
- viable options: at least two, with bounded pros and cons
- chosen option
- rejected alternatives
- consequences
- follow-ups

If only one option is viable, say which alternatives were considered and why
they are invalid. "No alternative" is not a reason; it is usually a missed pass.

## Issue Ledger Pass

The goal of Slate v2 is to resolve or materially improve the most relevant
issues from the full `docs/slate-issues` ledger. Every Slate Plan must prove
how the proposed change relates to that ledger.

Run ClawSweeper as the related-issue discovery owner for this pass when the
plan touches issue-facing Slate v2 behavior. This is a bounded pass, not a tax
on every implementation edit. Its job is to find and classify the related issue
set once, append fork-local issue sections, and define the issue accounting that
later implementation slices reuse.

Ledger/cache discipline:

- Start from existing durable outputs, not live GitHub:
  `docs/slate-issues/gitcrawl-live-open-ledger.md`,
  `docs/slate-issues/gitcrawl-v2-sync-ledger.md`,
  `docs/slate-v2/ledgers/fork-issue-dossier.md`,
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`, and
  `docs/slate-v2/references/pr-description.md`.
- If those files already contain a completed ClawSweeper pass for the same
  surface, cite and reuse it. Record `already covered by completed pass
<name/date>` instead of rediscovering the same issues.
- Do not run broad `gh issue list`, `gh search issues`, or unscoped live GitHub
  discovery in Slate Plan. Broad corpus state belongs to generated gitcrawl
  ledgers and ClawSweeper refreshes.
- Use live GitHub only for a narrow issue ref when a new claim depends on
  current thread state, comments, duplicate links, stale/closed state, or
  maintainer wording not present in the ledgers.

Skip ClawSweeper only when the plan is provably unrelated to issue-facing
behavior, for example a typo, local wording cleanup, generated skill sync, or a
pure internal refactor with no public API/runtime/browser/example claim. Record
the skip reason in the active plan.

Read these files before scoring the plan ready:

- `docs/slate-issues/gitcrawl-live-open-ledger.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md` when it exists
- `docs/slate-issues/open-issues-ledger.md`
- `docs/slate-issues/gitcrawl-clusters.md`
- `docs/slate-issues/issue-clusters.md`
- `docs/slate-issues/test-candidate-map/`
- `docs/slate-issues/benchmark-candidate-map.md`
- `docs/slate-issues/package-impact-matrix.md`
- `docs/slate-issues/requirements-from-issues.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- any issue dossier file under `docs/slate-issues/open-issues-dossiers/` when a
  candidate issue needs exact thread context

For each plan, record:

- ClawSweeper pass: `applied` or `skipped`, trigger, related issue search
  terms/clusters, reviewed issue refs, and dossier sections written;
- fixed issues: exact issue numbers that the implementation is intended to
  close, using `Fixes #....: <description>`;
- materially improved issues: issue numbers where the plan reduces the pain but
  does not fully satisfy the original report;
- related but not fixed issues: issue numbers that live in the same cluster but
  should not be claimed as fixed;
- irrelevant issues reviewed: high-noise or same-keyword issues that are not
  part of the current fix;
- cluster coverage: which issue cluster this pass advances and which cluster
  backlog remains;
- live-ledger sync status: which current issue rows were read from
  `docs/slate-issues/gitcrawl-live-open-ledger.md`, and which manual sync rows
  changed in `docs/slate-issues/gitcrawl-v2-sync-ledger.md`;
- fork issue dossier sync status: which sections were added or refreshed in
  `docs/slate-v2/ledgers/fork-issue-dossier.md`;
- proof route: unit, browser, integration, benchmark, docs/example, or
  no-claim.

Classification rules:

- Use `Fixes #....` only when the current implementation and proof would justify
  GitHub auto-closing the issue.
- Use `Improves #....` only when the user-visible behavior is materially better
  but some stated issue requirement remains out of scope.
- Use `Related #....` when the issue shares the same cluster but this plan does
  not prove the exact reproduction.
- Use `Not claimed #....` when the issue looked tempting by keyword but the
  plan does not address it.
- Performance issues need benchmark proof, not only a unit or browser test.
- Browser/IME/mobile issues need browser or device proof matching the claim.
- Docs/support issues can be fixed by docs/examples only when the issue is
  actually categorized as docs/support noise.
- Do not use issue numbers as decoration. If the plan cannot explain why a
  number is fixed, improved, related, or not claimed, leave it out and keep the
  issue pass pending.

The active plan must include an issue matrix with at least:

| Issue | Cluster | Claim | Why | Proof route | V2 sync ledger | PR line |
| ----- | ------- | ----- | --- | ----------- | -------------- | ------- |

`V2 sync ledger` is the exact status change for the issue row in
`docs/slate-issues/gitcrawl-v2-sync-ledger.md`, using
`docs/slate-issues/gitcrawl-live-open-ledger.md` as generated live input.
`PR line` is the exact line to add to
`docs/slate-v2/ledgers/issue-coverage-matrix.md`, or `related matrix only` when
the issue must not be auto-closed. The PR description receives exact fixed issue
lines, count summaries, and any current API/proof/release-gate rows touched by
the plan.

The fork issue dossier receives the long form. Do not duplicate the full issue
section in the PR description.

## PR Reference And Issue Accounting

Read `docs/slate-issues/gitcrawl-live-open-ledger.md` first whenever a plan or
implementation slice touches a current issue or cluster. Then update
`docs/slate-issues/gitcrawl-v2-sync-ledger.md` for current manual sync state and
`docs/slate-v2/ledgers/issue-coverage-matrix.md` for PR-slice claims. Update
`docs/slate-v2/references/pr-description.md` whenever the slice changes exact
fixed issue claims, accepted public API shape, proof references, release gates,
examples, or maintainer-facing PR narrative.

This accounting is a durable-ledger read/update pass. Do not use broad live
GitHub commands to rebuild what the generated live ledger, manual sync ledger,
coverage matrix, and fork dossier already record. Live GitHub belongs only to
narrow issue-ref verification when the claim would otherwise be stale or
unsafe.

Rules:

- Generated live issue input lives in
  `docs/slate-issues/gitcrawl-live-open-ledger.md`; manual v2 sync status lives
  in `docs/slate-issues/gitcrawl-v2-sync-ledger.md`.
  Every touched current issue row must move from `not-started` to the right v2
  sync status in the manual sync ledger.
- Fixed issues go under the coverage ledger's fixed issue section as:
  `Fixes #....: <description>`.
- Improved-but-not-fixed issues go in the related matrix with claim `Improves`,
  not in the fixed issue list unless the issue's original repro is fully
  satisfied.
- Same-cluster or adjacent issues go in the related matrix with claim `Related`.
- Non-goal issues that were reviewed because they share keywords go in the
  related matrix with claim `Not claimed`.
- The PR reference is a maintainer-facing summary. Do not put the full matrix
  there.
- The PR reference is also the current PR-body source. API shape, proof rows,
  release gates, and example rows must be current there when a plan or execution
  execution slice changes them.
- Remove stale release-gate rows when the gate is closed. Replace them with the
  narrower remaining proof/doc owner when one still exists.
- The issue coverage ledger is the source of truth for matrix rows. Keep
  descriptions concrete and tied to proof, not architecture slogans.
- If no issue is fixed, say that explicitly in the plan and leave the fixed
  issue list unchanged.
- Every Slate Plan closeout must record one of:
  `pr-description updated: <sections>` or
  `pr-description unchanged: <reason>`. Missing this record keeps completion
  `pending`.

## Applicable Implementation Reviews

Before scoring above threshold, decide whether each review lens applies. Record
the decision in the active plan even when skipped.

Use this matrix:

| Lens                          | Applies when                                                                                                                                                                         | Must answer                                                                                                                                                                                   |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vercel-react-best-practices` | React rendering, external-store subscriptions, event listeners, bundle shape, browser runtime, or React 19.2 performance are in scope                                                | Are subscriptions narrow, global listeners deduped, transient values kept out of render, expensive work deferred, and React used as projection rather than engine?                            |
| `performance-oracle`          | Hot paths, algorithms, large documents, memory lifetime, browser/editor runtime loops, operation replay, or scalability are in scope                                                 | Is complexity bounded? Are allocations, dirty-id sets, DOM repair, selection import/export, and replay paths controlled at 10x, 100x, and 1000x scale?                                        |
| `performance`                 | Large repeated editor surfaces, interaction latency, production perf claims, virtualization/shell/staging choices, p95/p99 risk, or memory/DOM/component-count pressure are in scope | Are cohorts segmented, repeated-unit budgets named, interaction-level INP/p95/p99 rows tracked, memory tags defined, degradation contracts explicit, and Datadog/RUM dashboard gaps recorded? |
| `tdd`                         | Behavior changes, bug fixes, public interface changes, regression classes, or executable acceptance criteria are in scope                                                            | Is there a public-interface red-green-refactor slice or generated browser contract that proves behavior rather than implementation details?                                                   |
| `build-web-apps:shadcn`       | UI/editor chrome, examples, menus, popovers, command palettes, inputs, forms, overlays, styling, or component composition are in scope                                               | Are UI surfaces composable, minimal-prop, accessible, and not product-opinion leakage into Slate core?                                                                                        |
| `react-useeffect`             | Effects, derived state, reset-on-prop, subscriptions, browser APIs, external systems, or parent notifications are in scope                                                           | Is the effect external synchronization? Can it be render calculation, event handler, keyed reset, `useMemo`, or `useSyncExternalStore` instead?                                               |

For each applicable lens, record:

- applicability: `applied` or `skipped`
- reason
- findings
- plan delta or explicit no-change defense
- proof pointer: plan section, source file, rule family, contract row, or test
  family

Do not turn these lenses into generic busywork. If the plan is pure API law with
no UI, React, effect, or performance-sensitive surface, skip the irrelevant
lenses with one sentence and keep moving.

## Research Decision

Use the research layer before inventing new architecture or API law.

Use `research-wiki` when:

- compiled research is stale, contradictory, or thin
- raw evidence is missing for Slate, Lexical, ProseMirror, Tiptap, React, Plate,
  or slate-yjs pressure
- the decision changes public API, runtime boundaries, browser behavior,
  operation semantics, collaboration substrate, or migration backbone
- silence from a reference system would materially weaken the plan

Do not skip research and jump from intuition into plan law unless the request is
tiny and the evidence is already explicit in live source or tests.

Do not call research "full" if one likely corpus stayed silent. Silence is a
gap, not agreement.

## Ecosystem Strategy Synthesis Gate

External editor research must end in a Slate decision, not a bibliography.

When Lexical, ProseMirror, Tiptap, React, Plate, slate-yjs, or another reference
system is relevant, record this table in the active plan before scoring the
research dimension above `0.85`:

| System | Source | Mechanism | Avoids | Steal | Reject | Slate target | Verdict |
| ------ | ------ | --------- | ------ | ----- | ------ | ------------ | ------- |

Rules:

- `Source` must be a local source file, test, official doc, or compiled research
  page. A system name alone is not evidence.
- `Mechanism` must describe how the system works, not what it calls the API.
- `Avoids` must name the failure mode the mechanism prevents.
- `Steal` must be a concrete Slate mechanism or proof tactic.
- `Reject` must name the part that does not fit Slate's model.
- `Slate target` must become a plan decision, target shape, proof row, or hard
  cut. If no target follows, the research pass failed.
- `Verdict` is one of `agree`, `partial`, `tension`, `diverge`, or `gap`.

For normalization, paste, large insert, operation replay, or hot runtime paths,
this gate must explicitly compare:

- Lexical-style dirty keyed queues, node transforms, local text normalization,
  and update batching;
- ProseMirror-style schema/content fitting, Slice replacement, and transaction
  construction instead of post-hoc broad normalization;
- Tiptap-style command and extension DX over the ProseMirror engine.

Default conclusion to challenge, not blindly accept:

```txt
Slate v2 should use Lexical-style dirty runtime buckets for normal editing and
ProseMirror-style bulk replace/fitting for large paste or fragment insert, with
Tiptap-style extension hooks for app paste rules.
```

If the plan rejects that hybrid, it must explain why the current Slate v2 source
or benchmark evidence makes another architecture better. "Keep researching" is
not a sufficient answer when local source evidence is available.

## Evidence Ladder

Use:

1. live source, executable tests, browser contracts, official docs, or compiled
   research with citations
2. compatible but indirect evidence
3. honest gap

When recording evidence, use:

- `agree`
- `partial`
- `gap`
- `tension`
- `diverge`

Never mark an architecture or API decision `locked` because it feels standard.

Live source/test evidence outranks compiled research when describing the current
state. If source and research disagree, record `stale research` and update the
plan from source.

## High-Risk Deliberate Mode

Trigger this mode when a proposal changes:

- public API
- core data model
- operation, snapshot, commit, or normalization behavior
- extension/plugin substrate
- collaboration behavior
- selection, focus, IME, DOM repair, or browser-runtime behavior
- React runtime subscription strategy
- render contracts for voids, inline voids, editable islands, text, leaves, or
  decorations
- release gate or generated regression contract

When triggered, add to the active plan:

- pre-mortem: three realistic failure scenarios
- expanded proof plan: unit, browser, parity, stress, migration, and docs/example
  proof as applicable
- blast-radius note: packages, examples, docs, tests, and downstream consumers
- rollback or hard-cut answer: why the plan is still worth doing

High-risk mode is not a separate workflow. It is one stricter pass inside this
skill.

## Slate Maintainer Objection Ledger

Simulate a skeptical Slate maintainer and a serious downstream Slate user
reviewing the plan. The goal is to prevent "they changed things for no reason."

For every major breaking or paradigm change, record:

- Change: exact API, runtime, or test contract being changed.
- Who feels pain: raw Slate user, Plate maintainer, slate-yjs maintainer, plugin
  author, app author, test author, or browser-runtime maintainer.
- Likely objection: the strongest fair complaint, written in the user's
  language.
- Steelman antithesis: the best argument for not making the change.
- Tradeoff tension: what the chosen option makes worse or more expensive.
- Why this is not change for change's sake: concrete payoff, not vibes.
- Evidence: repo fact, browser regression class, benchmark concern, external
  research, or legacy limitation.
- Rejected alternative: closest Slate-compatible option and why it is weaker.
- Migration answer: how a Slate user gets from old shape to new shape without
  feeling tricked.
- Docs / example answer: what public explanation or example proves the change.
- Regression proof: slate-browser, unit, integration, stress, or parity coverage
  required.
- Ecosystem answers, when triggered: Plate/plugin author answer and
  slate-yjs/collab maintainer answer. These are migration-backbone answers, not
  current-version support promises.
- Verdict: `keep`, `revise`, `drop`, or `unresolved`.

Ledger rows are mandatory for changes like:

- read/update transaction lifecycle
- replacing broad `editor.*` mutation surfaces with scoped state/tx access
- moving helpers into `editor.state`, `editor.tx`, or equivalent namespaces
- target refs instead of renderer-local `actions`
- runtime-owned void/atom shells
- removing `children`/spacer responsibility from app void renderers
- `onChange`/commit callback naming and semantics
- `onKeyDown` command contract and removal or renaming of `onKeyCommand`
- hook renames such as `useSlateStatic`
- schema/predicate/spec replacements for `isInline`, `isVoid`, `markableVoid`,
  and selectable checks
- generated browser parity and stress-test contracts as release gates
- deleting compatibility aliases before publish

Rules:

- No breaking/paradigm change may score above `0.85` in DX or migration unless
  it has a ledger row with a convincing answer.
- A ledger row is accepted only when its verdict is `keep` and every required
  field is concrete: evidence, steelman antithesis, tradeoff tension, rejected
  alternative, migration answer, docs/example answer, regression proof, and
  ecosystem answers when triggered.
- A row is not accepted if a required field is missing, says `TBD`, says only
  "cleaner architecture", or lacks proof that a real user problem is solved.
- If the best answer is only "cleaner architecture", the verdict is `revise` or
  `drop`.
- If an ecosystem-triggering change has a weak migration-backbone answer for
  plugin or collab architecture, the verdict is `revise` or `unresolved`.
- `unresolved`, `revise`, or `drop` rows must feed back into the plan before
  completion can be `done`.
- Reuse prior ledger rows when rerunning this skill, but revalidate them against
  the latest plan.

## Ecosystem Maintainer Pass

Do not create separate full ledgers by default. Trigger this pass only when the
proposal changes extension, plugin, collaboration, operation, identity,
normalization, snapshot, or data-model behavior.

For each triggered ledger row, add two short answers:

- Plate/plugin maintainer: can a product layer migrate to this backbone without
  wrapping every core call, losing composition, or becoming a compatibility
  junk drawer?
- slate-yjs/collab maintainer: do operations, identity, snapshots,
  normalization, remote apply, and conflict behavior stay deterministic?

For core API/data-model changes, also name:

- exact affected extension points
- plugin migration-backbone surface
- collab contract affected
- proof required before closure

The pass exists to catch ecosystem breakage, not to veto every core cleanup. If
the change is raw-Slate-only, say why this pass does not apply and move on.

## Plan Deltas From Review

Every review pass must either change the plan or explicitly defend no change.

Record:

- added decisions
- revised decisions
- dropped decisions
- strengthened acceptance criteria
- new tests/proof rows
- verification commands with cwd, especially any `.tmp/slate-v2` focused or broad
  gate used to support a claim
- unresolved items moved to the next pass
- no-change decisions with the evidence that made change unnecessary

If pressure passes produce no plan delta and no explicit no-change defense, the
review is a rubber stamp and completion stays `pending`.

## Pressure Passes

Before raising the score above threshold, run these passes and record the result
in the plan:

- Issue-ledger pass: scan `docs/slate-issues` for fixed, improved, related, and
  not-claimed issues; update the plan's issue matrix, issue coverage ledger,
  open issue ledger, and PR reference. Do not score regression-proof testing
  above `0.85` if the plan has no issue mapping for a behavior change.
- Intent/boundary pass: prove intent, outcome, scope, non-goals, and decision
  boundaries are explicit.
- Decision-brief pass: prove principles, drivers, options, rejected
  alternatives, consequences, and follow-ups are recorded.
- Performance pass: prove the shape avoids global editor subscriptions on hot
  paths. Use `vercel-react-best-practices` for React/runtime projection
  decisions and `performance-oracle` for hot-path, algorithmic, memory, browser
  runtime, or scalability claims when applicable. Use
  `performance` when the plan needs cohort segmentation,
  repeated-unit budgets, interaction-level INP/p95/p99 rows, memory tagging,
  degradation contracts, or Datadog/RUM dashboard proof.
- DX pass: prove the shape is close enough to Slate terminology without copying
  bad legacy footguns.
- Unopinionated-core pass: prove the shape does not turn Slate v2 into a Plate
  replacement.
- Migration pass: prove Plate and slate-yjs have a believable backbone route,
  not current-version adapter support.
- Regression pass: prove bugs are caught by generated browser contracts, not
  example-by-example patching. Use `tdd` expectations for behavior slices that
  should be introduced or fixed test-first.
- Verification workspace pass: prove all Slate v2 behavior/source/test claims
  were checked in `.tmp/slate-v2`, not `plate-2`. If a relevant `.tmp/slate-v2`
  command fails, keep status `pending` and record the failing command, scope,
  and next owner.
- Research pass: prove Lexical, ProseMirror, and Tiptap were used as evidence,
  not decoration. The pass is incomplete until the ecosystem strategy synthesis
  table names the concrete Slate mechanism to steal, reject, or diverge from.
  For normalization, paste, large insert, operation replay, or hot runtime
  paths, explicitly test the hybrid thesis: Lexical-style dirty runtime buckets
  for normal editing plus ProseMirror-style bulk replace/fitting for large
  paste/fragment insert, with Tiptap-style extension hooks for app paste rules.
- Simplicity pass: remove overbuilt props, aliases, shims, and speculative API
  layers.
- Slate maintainer pass: challenge every breaking/paradigm change as if
  reviewing a Slate PR; record objections and answers in the ledger.
- Steelman pass: record the best antithesis and real tradeoff tension for each
  major decision.
- High-risk deliberate pass: when triggered, add the pre-mortem and expanded
  proof plan before closure.
- Ecosystem maintainer pass: only when triggered, add plugin and collab
  migration-backbone answers to the same ledger row.

## User Review And Execution Mode

When the planning score is below threshold, any required planning pass remains
open, or any planning completion gate has a runnable next move:

1. Update the plan with the current score, evidence, rejected tactics, and next
   owner.
2. Keep the active goal open.
3. Continue the next review/refinement slice through the active goal.

When the planning lane reaches the final gates, close the planning goal and stop
for user review. The final planning response must tell the user to review the
plan and invoke `slate-plan` again with the accepted plan path to start
execution.

Do not execute Slate v2 changes in the same activation that creates, rewrites,
or closes the planning pass. Execution mode is a separate activation after user
acceptance. On that second invocation:

1. Read the accepted plan and latest user acceptance.
2. Call `get_goal`; create or continue an execution-shaped goal, not the old
   planning goal.
3. Set the current owner from the accepted plan's execution queue.
4. Execute one meaningful implementation slice.
5. Record commands, evidence, plan deltas, issue/reference sync, review status,
   and next owner in the plan.
6. For non-trivial uncommitted implementation changes, load
   `.agents/skills/autoreview/SKILL.md` and follow its dirty-local target
   selection. Verify any accepted/actionable findings against source, fix valid
   findings, rerun focused proof, and rerun autoreview until clean.
7. Keep the execution goal active while any accepted queue row, verification
   gate, reference sync, autoreview finding, or risk owner remains runnable.

## Done Handoff

This is a mandatory closeout gate, not an optional summary. If the final answer
would omit this handoff, keep completion `pending`.

When setting completion to `done`, the final chat response must include a
concise but exhaustive bullet list of every accepted plan item and decision so
the user can review without opening the full plan.

Group bullets by surface when useful:

- public API
- intent / decision brief
- React/runtime
- applicable Vercel React / performance-oracle / tdd review
- hooks and render contracts
- events and callbacks
- schema/predicate behavior
- migration-backbone decisions
- high-risk deliberate-mode pre-mortem when triggered
- browser/regression proof
- fixed/improved/related issue accounting
- hard cuts and rejected alternatives
- implementation phases and gates

Each bullet should use concise grammar and include:

- decision name or surface
- before -> after shape when the plan changes an existing shape, with a live
  source pointer for the before
- status: `add`, `keep`, `cut`, `rename`, `revise`, or `gate`
- proof pointer when short enough: evidence row, ledger row, test/proof family,
  or plan section
- issue pointer when applicable: `Fixes #....`, `Improves #....`,
  `Related #....`, or `Not claimed #....`

Current-state / before-after rules:

- Any claim about the current implementation must have a live source/test/docs
  pointer or be marked `gap`.
- `before` must be copied from live source/tests/docs in the current checkout.
- `after` must be either an accepted target shape or `already done`.
- If a previous plan or research page claims an old shape but live source does
  not, do not use it in any step; record `stale claim`.
- If a decision has no current source-backed before shape, write `decision: ...`
  or `target shape: ...` instead of inventing one.

Do not list only highlights. If the plan accepts twenty decisions, the handoff
lists twenty bullets. Keep each bullet short; group them instead of omitting
items.

Before calling `update_goal(status: complete)`, update the plan with:

```md
final_handoff_status: complete
final_handoff: emitted in final chat response
```

## Final Response

When the plan is still pending, say what score remains and what the next owner
is.

When planning reaches `done`, use this shape:

```md
Slate Plan is ready for user review: [docs/plans/...](docs/plans/...)

Decisions:

- Public API: ...
- React/runtime: ...
- Hooks/render: ...
- Events/callbacks: ...
- Tests/proof: ...
```

Those bullets are examples of grouping, not a five-item limit. Do not paste the
whole plan into chat. Do paste the exhaustive decision bullets.

After the bullets, add:

```md
Review the plan. To execute it, invoke `slate-plan` again with the accepted
plan path.
```

When execution reaches `done`, say what was implemented, what proof ran, what
issue/reference sync changed, and whether autoreview is clean.
