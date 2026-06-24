---
description: 'Define or execute Plite architecture/API plans: raw editor substrate, React/runtime boundaries, browser proof, issue-ledger claims, research evidence, Plate/collab migration backbone, and public API hard cuts.'
argument-hint: '[--quick|--standard|--deep] <Plite architecture/API/boundary prompt | accepted plan path>'
disable-model-invocation: true
name: plite-plan
metadata:
  skiller:
    source: .agents/rules/plite-plan.mdc
---

# Plite Plan

Handle $ARGUMENTS.

Use this for Plite "absolute best architecture/DX" planning where the bad
outcome is incremental suggestions, stale pre-Plite claims, or compatibility
sludge. Plite Plan owns raw editor substrate decisions. Plate Plan owns product
composition decisions on top of Plite.

This is a two-phase lane skill.

Planning mode is the default. It creates or updates an execution-grade plan,
scores it, and keeps the active goal open until every required pass, evidence
row, proof gate, objection row, and final handoff gate is closed. A high score
never closes the goal by itself.

Execution mode starts only after the user explicitly accepts a ready Plite Plan
and invokes `plite-plan` again against that accepted plan. Execution mode uses a
new execution-shaped goal. Do not implement a planning proposal under the
planning goal.

## Use When

- Defining Plite public API, hooks, runtime boundaries, render contracts,
  operations, extension substrate, browser proof, package boundaries, or docs
  that teach Plite API.
- Deciding whether a behavior belongs in Plite substrate, Plate product APIs,
  browser proof infrastructure, docs/examples, or deletion.
- Reviewing if a Plite plan is the absolute best shape for:
  - React runtime performance and narrow subscriptions;
  - unopinionated editor-kernel DX;
  - Plate and collaboration migration backbone;
  - regression-proof browser behavior;
  - Lexical / ProseMirror / Tiptap / upstream editor evidence;
  - shadcn-style composability and minimal examples.
- Executing a user-accepted Plite Plan after a second explicit invocation names
  the accepted plan.

## Do Not Use When

- The user asks for one narrow bug fix or browser repro; use `slate-patch` until
  that worker is renamed, or the package owner.
- The user asks for Plate product/plugin/component/docs architecture; use
  `plate-plan`.
- The user asks for normal diff review; use `autoreview`.
- The user asks for public GitHub issue/PR/security queue work; use
  `maintainer`.
- The request has no architecture/API/spec lane shape; use `task`.

## Hard Policy

- Requires `autogoal` as the lifecycle kernel and `--template plite-plan` as
  the plan shell.
- One scheduled pass per activation unless the user explicitly asks for a full
  uninterrupted loop.
- Planning mode may edit only planning, research, issue/provenance, behavior
  law, and reference artifacts it explicitly owns.
- Execution mode may edit Plite implementation, tests, examples, docs, package
  files, build config, and generated references only after explicit acceptance
  of a ready plan.
- User phrases like "go", "rewrite", "fix it", or "execute" do not override
  planning mode while the plan is not ready for review.
- Treat pasted reviews as context. The latest user request is the task.
- Breaking changes are allowed when they produce the best long-term
  architecture, DX, performance, testability, and agent-maintainability.
- No public compatibility aliases. No public runtime shims. No docs for old API
  names. Private temporary bridges are allowed only with an owner, deletion
  trigger, proof gate, and no public export.
- Keep Plite unopinionated. Plate owns product APIs, feature kits, registry,
  templates, and opinionated UX.
- A breaking or paradigm change needs an adoption story. "Cleaner architecture"
  alone is not a reason.
- Prefer inline example logic when used once. Extract helpers only when reuse,
  readability, proof ownership, or public/internal API shape justifies it.
- Do not let a polished plan self-certify. Scores, verdicts, keep/drop
  decisions, and current-state claims need live source evidence.
- Workspace verification is part of evidence. Plite source, runtime, browser,
  package, public API, or issue-fix claims must be verified from the Plate repo
  root with the package/app command that owns the claim.

## Plite / Plate Boundary

Use this ownership map before scoring any plan:

| Surface | Owner | Rule |
| --- | --- | --- |
| Document model, nodes, operations, ranges, selection primitives | Plite | Plate consumes and specializes; it does not redefine core shape. |
| `editor.read`, `editor.update`, transaction groups, operation replay | Plite | Plate product APIs may call them, but must not expose a competing core mutation layer. |
| React editor runtime, root locality, DOM projection, browser selection bridge | Plite | Plate composes through supported hooks and extension points. |
| Browser proof harness for editor behavior | `@platejs/browser` | Plate uses it for product proof; app code should not depend on proof internals. |
| Yjs/collaboration substrate | Plite/collab substrate first | Plate owns product collab UI and package ergonomics. |
| Product plugins, kits, UI, registry, docs, examples, templates | Plate | Opinionated editor features belong here. |
| Product commands and feature workflows | Plate | Names must be product-level and must not collide with Plite core namespaces. |

If a surface is mixed, split it. Do not keep a shared owner because migration is
awkward.

## Required Artifacts

- Plan file under `docs/plans/`, created from the Plite Plan template:

  ```bash
  node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
    --template plite-plan \
    --title "<short Plite Plan title>"
  ```

- Active planning goal: one short `create_goal` objective under 240 characters.
  Put the full pass schedule, threshold, proof gates, and blocked state in the
  plan file.
- Active execution goal after user acceptance: a new goal that names the
  accepted plan and implementation target.
- Intent/boundary record in the active plan.
- Decision brief in the active plan.
- Plite/Plate boundary map in the active plan.
- Public API target, internal runtime target, hook/component/render target, and
  migration-backbone target in the active plan.
- Issue/provenance accounting when the plan changes user-visible behavior,
  browser behavior, public API, examples, issue claims, or PR narrative.
- Research/ecosystem synthesis when external systems influence the decision.
- Objection ledger for every public API, package-boundary, runtime, docs, or
  behavior change.
- Applicable implementation-skill review notes: `performance`, `tdd`,
  `react`, `react-useeffect`, `docs-creator`, `components`, `plate-ui` when
  relevant, each marked applied or skipped with reason.

Allowed planning edit scope:

- `docs/plans/**`
- `docs/research/**`
- `docs/vision/**`
- `docs/editor-behavior/**` when behavior law changes
- `docs/plite/**` references, ledgers, and research
- `.agents/rules/plite-plan.mdc` only when self-repairing this skill

Allowed execution edit scope:

- The accepted plan's named Plite package, app, docs, tests, examples, build,
  config, and generated-reference owners.

## Read First

1. Latest user request.
2. Current goal state.
3. Active plan under `docs/plans/`, if present.
4. Root `VISION.md`.
5. Relevant `docs/vision/**` detail files.
6. `.agents/rules/plate-plan.mdc` when boundary drift is suspected.
7. Current Plite package APIs touched by the plan:
   - `packages/plite/**`
   - `packages/plite-react/**`
   - `packages/plite-dom/**`
   - `packages/plite-history/**`
   - `packages/plite-yjs/**`
   - `packages/plite-layout/**`
   - `packages/browser/**`
8. Current Plate package source affected by migration pressure:
   - `packages/core/**`
   - `packages/plate/**`
   - feature packages under `packages/**`
   - `apps/www/**`
   - `content/docs/**`
9. Existing tests and examples for the affected packages.
10. Research or issue ledgers only when the plan relies on external evidence.

Do not treat old plans or chat as current-state proof. Re-read live source
before saying what currently exists.

## Live Source Grounding

Current checkout wins.

- Every "current API" claim needs a source pointer.
- Every "docs currently say" claim needs a docs pointer.
- Every "tests cover" claim needs a test name or file pointer.
- Every "package export" claim needs package/export evidence.
- Every "legacy dependency remains" claim needs import, package, or declaration
  evidence.

If live source contradicts a prior plan, mark the prior plan stale and update
the current plan. Do not preserve stale claims for continuity.

## Verification Workspace Gate

Plan verification uses source audits and template checks. Execution
verification uses focused package/app commands from the Plate repo root.

Common command families:

| Surface | Preferred proof |
| --- | --- |
| Plite package source/type changes | `pnpm turbo typecheck --filter=./packages/<pkg>` |
| Plite package tests | `pnpm --filter <package-name> test` or owner script |
| Package build/public declarations | `pnpm --filter <package-name> build` |
| Exports/barrels | `pnpm brl` plus diff review |
| Docs/content | `pnpm --filter www check:docs` and browser proof when route changed |
| Browser behavior | focused `pnpm --filter plite test:plite-browser:chromium <file-or-grep>` |
| Full Plite release claim | `pnpm check:plite` |

Do not run Playwright against `apps/www` by default. Browser editor behavior
proof belongs in the owned Plite/browser lane unless the accepted plan names a
Plate app route as the product behavior owner.

## Confidence Score

Score with evidence. Threshold: total score >= 0.92 and no dimension below
0.85.

| Dimension | Weight |
| --- | ---: |
| React/runtime performance | 0.20 |
| Plite API/DX quality | 0.20 |
| Plate/collab migration backbone | 0.15 |
| Regression-proof testing strategy | 0.20 |
| Research, source evidence, and proof completeness | 0.15 |
| shadcn-style composability and minimal examples | 0.10 |

Automatic caps:

- Any unresolved Plite/Plate owner overlap caps total at 0.84.
- Any public compatibility alias or shim without an accepted hard reason caps
  total at 0.80.
- Any current-state claim without live source evidence caps the relevant
  dimension at 0.75.
- Any breaking API change without adoption answer, docs/example answer, and
  proof route caps DX at 0.80.
- Any execution plan without focused verification commands caps proof at 0.82.
- Any final handoff that lists only highlights caps total at 0.85.

## Plan Shape

Every Plite Plan should contain:

1. Verdict and confidence score.
2. Intent, outcome, in-scope, non-goals, decision boundaries.
3. Decision brief: principles, drivers, viable options, rejected alternatives,
   chosen option, consequences.
4. Plite/Plate boundary map.
5. Current-source inventory.
6. Public API target.
7. Internal runtime target.
8. Hook/component/render DX target.
9. Plate/collab migration-backbone target.
10. Issue/provenance accounting when issue-facing.
11. Legacy regression proof matrix.
12. Browser stress / parity strategy.
13. Research/ecosystem synthesis when used.
14. Applicable implementation-skill review matrix.
15. High-risk pre-mortem when triggered.
16. Objection ledger.
17. Hard cuts and rejected alternatives.
18. Pass schedule.
19. Plan deltas from review.
20. Open questions and decision-changing evidence.
21. Implementation phases with owners.
22. Fast driver gates.
23. Final handoff outline.
24. Completion gates.

## Pass Schedule

Run one scheduled pass per activation unless the user explicitly asks for a
full uninterrupted loop.

Required passes:

1. Current-state read and initial score.
2. Intent, scope, boundary, and non-goals.
3. Plite/Plate boundary audit.
4. Public API and runtime inventory.
5. Minimal breaking-change strategy.
6. Runtime/performance/testability pass.
7. Docs/examples/browser-proof pass.
8. Research/ecosystem/live-source pass when external evidence is used.
9. Objection and steelman pass.
10. High-risk deliberate pass when triggered.
11. Revision pass.
12. Verification and final handoff gate.

Each pass must either change the plan or explicitly defend no change with
evidence. A rubber-stamp pass does not count.

## Research / Ecosystem Synthesis

External editor research must end in a Plite decision, not a bibliography.

When Lexical, ProseMirror, Tiptap, React, Plate, Yjs/collab, or upstream editor
is relevant, record this table in the active plan before scoring research above
0.85:

| System | Source | Mechanism | Avoids | Steal | Reject | Plite target | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |

For normalization, paste, large insert, operation replay, or hot runtime paths,
explicitly test the hybrid thesis:

- Lexical-style dirty runtime buckets for normal editing;
- ProseMirror-style bulk replace/fitting for large paste or fragment insert;
- Tiptap-style extension hooks for app paste rules.

Reject that hybrid only with live source or benchmark evidence.

## High-Risk Deliberate Mode

Trigger this mode when a proposal changes:

- public API
- package boundary
- core data model
- operation, snapshot, commit, or normalization behavior
- extension/plugin substrate
- collaboration semantics
- selection, focus, IME, DOM repair, or browser behavior
- React runtime subscription strategy
- render contracts for voids, inline voids, editable islands, text, leaves, or
  decorations
- docs/examples that teach public API
- release or generated contract

When triggered, add:

- three realistic failure scenarios;
- blast-radius note;
- focused proof plan;
- rollback or hard-cut answer;
- adoption/docs/example answer.

## Objection Ledger

Every major public API, package-boundary, runtime, docs, or behavior change
needs a ledger row:

- Change.
- Who feels pain.
- Likely objection.
- Steelman antithesis.
- Tradeoff tension.
- Why this is worth it.
- Evidence.
- Rejected alternative.
- Adoption answer.
- Docs/example answer.
- Regression proof.
- Verdict: `keep`, `revise`, `drop`, or `unresolved`.

Rows are not accepted if they say only "cleaner" or "better architecture."
That is a vibe, not a plan.

## User Review And Execution Mode

When the score is below threshold, a required row remains open, or a proof gate
has a runnable next move:

1. Update the plan with score, evidence, deltas, and next owner.
2. Keep the active goal open.
3. Continue the next review/refinement slice.

When final gates pass, complete the planning goal and stop for user review.
Implementation starts only after a later explicit execution request invoking
Plite Plan against the accepted plan.

## Done Handoff

When setting completion to done, final chat must include a concise but complete
list of accepted decisions so the user can review without opening the whole
plan.

Group by surface:

- Plite/Plate boundary
- public API target
- runtime/default-route target
- package/plugin target
- docs/examples/browser proof
- proof gates
- issue/provenance accounting
- rejected alternatives
- next execution owners
- needs user attention

Each bullet should include:

- decision name
- current -> target shape when changing live source
- status: `keep`, `cut`, `rename`, `move`, `bridge`, `defer`, or `gate`
- source/proof pointer when short enough

Do not list only highlights. If the plan accepts twenty decisions, list twenty
short bullets.

## Final Response

When the plan is still pending, say what score remains and the next owner.

When the plan is ready, say it is ready for user review, list the decisions,
and stop. Do not silently begin implementation.
