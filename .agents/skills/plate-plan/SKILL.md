---
description: 'Define or execute Plate v2 architecture/API plans aligned with Slate v2: minimal breaking changes, Slate/Plate boundary, runtime/API conflict removal, product DX, performance, proof gates, and migration roadmap.'
argument-hint: '[--quick|--standard|--deep] <Plate v2 architecture/API/boundary prompt | accepted plan path>'
disable-model-invocation: true
name: plate-plan
metadata:
  skiller:
    source: .agents/rules/plate-plan.mdc
---

# Plate Plan

Handle $ARGUMENTS.

Use this for Plate v2 "absolute best architecture/DX" planning where the bad
outcome is incremental compatibility sludge: old Plate APIs fighting new Slate
APIs, wrappers around wrappers, private runtime bridges leaking public, and
breaking changes made without a crisp payoff.

This is a two-phase lane skill.

Planning mode is the default. It creates or updates an execution-grade plan,
scores it, and keeps the active goal open until every required pass, boundary
row, API-conflict row, proof gate, objection row, and final handoff gate is
closed. A high score never closes the goal by itself.

Execution mode starts only after the user explicitly accepts a ready Plate Plan
and invokes `plate-plan` again against that accepted plan. Execution mode uses a
new execution-shaped goal. Do not implement a planning proposal under the
planning goal.

## Use When

- Defining Plate v2 public API, plugin API, runtime, package, docs, examples,
  registry, or migration architecture.
- Deciding the minimal breaking changes needed to stop Plate APIs conflicting
  with Slate APIs.
- Auditing or redesigning Plate runtime accessors, plugin command surfaces,
  transform namespaces, package bridges, legacy substrate imports, docs
  examples, and runtime/default-route bridges that may overlap with Slate.
- Reviewing whether a Plate feature belongs in Slate substrate, Plate product
  APIs, a private migration bridge, docs/examples, or deletion.
- Executing a user-accepted Plate Plan after a second explicit invocation names
  the accepted plan.
- The user asks for a harsh architecture call before continuing Plate package
  migration.

## Do Not Use When

- The user asks for one narrow bug fix with no architecture/API choice.
- The user asks for a normal diff review; use `autoreview`.
- The user asks for public GitHub issue/PR queue handling; use `maintainer`.
- The user asks for already-applied current-tree closure; use `autoclosure`.
- The work is pure Slate substrate design; use `slate-plan`.

## Hard Policy

- Requires `autogoal` as the lifecycle kernel and `--template plate-plan` as
  the plan shell.
- One scheduled pass per activation. Passes are rows in the active plan, not
  separate goals.
- Planning mode may edit only planning, research, behavior-law, migration,
  issue/provenance, and reference artifacts it explicitly owns.
- Execution mode may edit Plate implementation, tests, examples, docs, package
  files, build config, and generated references only after explicit acceptance
  of a ready plan.
- User phrases like "go", "rewrite", "fix it", or "execute" do not override
  planning mode while the plan is not ready for review.
- Never write contradictory closeout state. If any accepted pass, proof row, or
  handoff item is pending, the plan is pending.
- Treat pasted reviews as context. The latest user request is the task.
- Breaking changes are allowed when they produce the best long-term
  architecture, DX, performance, testability, and agent-maintainability.
- Minimal breaking change means the smallest public break set that achieves a
  clean target architecture. It does not mean preserving aliases, shims, or old
  names when those keep the conflict alive.
- No public compatibility aliases. No public runtime shims. No docs for old API
  names. Private temporary bridges are allowed only with an owner, deletion
  trigger, proof gate, and no public export.
- Slate API wins when a Plate API conflicts with the Slate substrate. Plate may
  keep a distinct product-level API only when the plan proves a separate user
  job, separate namespace, and no conceptual overlap.
- Do not let a polished plan self-certify. Scores, verdicts, and keep/drop
  decisions need live source evidence.
- Prefer inline implementation when used once. Extract helpers only when reuse,
  readability, proof ownership, or public/internal API shape justifies it.
- Docs describe the latest state only. Do not write migration/changelog prose
  into reference docs.
- If execution touches package exports or exported folders, require `pnpm brl`.
- Workspace proof must run from the Plate repo root and use the owner command
  for the changed package/app/docs surface.

## Plate V2 Doctrine

Plate v2 sits on top of Slate. Plate should become simpler because Slate owns
more of the substrate cleanly.

Default take:

- Slate owns raw editor substrate.
- Plate owns product composition.
- Plate must not fork Slate concepts under Plate names.
- Plate must not expose legacy Slate compatibility as a public beta promise.
- Plate can break public APIs when the break removes overlap, improves DX,
  improves performance, or makes behavior easier to test.
- Plate should keep product ergonomics. Do not make app authors manually wire
  low-level Slate primitives just to build common editor features.
- The target is not "closest to old Plate." The target is "best Plate on top of
  the new Slate."

## Slate / Plate Boundary

Use this ownership map before scoring any plan:

| Surface | Owner | Rule |
| --- | --- | --- |
| Document model, nodes, operations, ranges, selection primitives | Slate | Plate consumes and specializes; it does not redefine core shape. |
| `editor.read`, `editor.update`, transaction groups, operation replay | Slate | Plate product APIs may call them, but must not expose a competing core mutation layer. |
| React editor runtime, root locality, DOM projection, browser selection bridge | Slate | Plate composes runtime behavior through supported hooks and extension points. |
| Browser proof harness for editor behavior | Slate/browser proof infra | Plate uses it for product behavior proof; it does not turn proof helpers into app API. |
| Yjs/collaboration substrate | Slate/Yjs substrate first | Plate owns product collab UI and package ergonomics. |
| Product plugins, kits, UI, registry, docs, examples, templates | Plate | Opinionated editor features belong here. |
| Product commands and feature workflows | Plate | Names must be product-level and must not collide with Slate core namespaces. |
| App-level configuration and registry defaults | Plate | Keep it ergonomic; do not leak private runtime bridges. |

If a surface is mixed, split it. Do not keep a shared owner because migration is
awkward.

## API Conflict Law

Every Plate v2 API plan that touches runtime or plugins must include an API
conflict ledger discovered from live source. The ledger must cover every public
or exported Plate surface that can overlap with Slate-owned substrate:

- editor runtime accessors
- product command and transform namespaces
- plugin API and option extension points
- feature-package command surfaces
- Slate transaction/read/update interaction points
- runtime/default-route bridge APIs
- package exports and declarations
- docs/examples teaching public API
- legacy substrate imports or package bridges

Row verdicts:

- `hard-cut`: remove the public API and update callers.
- `rename`: keep the concept but move it to a distinct Plate product name.
- `move-to-slate`: delete the Plate owner and consume Slate.
- `move-to-plate-product`: keep as Plate product API with a non-conflicting
  namespace and clear user job.
- `private-bridge`: temporary internal scaffold, not public, with deletion gate.
- `defer`: only when the plan names the missing proof and next owner.

Source-discovered legacy accessors deserve special suspicion. They are useful
only if they remain clearly Plate product surfaces. If they read like alternate
Slate core APIs, cut or rename them.

Typed escape hatches may be transitional only if the plan proves why normal
typing cannot cover the caller yet. They cannot become the final Plate v2 story
without an explicit keep decision.

## Required Artifacts

- Plan file under `docs/plans/`, created from the Plate Plan template:

  ```bash
  node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
    --template plate-plan \
    --title "<short Plate Plan title>"
  ```

- Active planning goal: one short `create_goal` objective under 240 characters.
  Put the full pass schedule, threshold, proof gates, and blocker state in the
  plan file.
- Active execution goal after user acceptance: a new goal that names the
  accepted plan and implementation target.
- API conflict ledger in the active plan.
- Slate/Plate boundary map in the active plan.
- Minimal breaking-change matrix in the active plan.
- Public API target, private bridge target, and deletion gates in the active
  plan.
- Package/docs/examples/registry migration order in the active plan.
- Verification matrix with focused commands for every touched package or app.
- Objection ledger for every public API, package-boundary, runtime, or product
  behavior change.
- Applicable implementation-skill review notes: `architecture-cleanup`,
  `performance`, `tdd`, `docs-creator`, `react`, `react-useeffect`,
  `components`, `plate-ui`, and `autoreview`, each marked applied or skipped
  with a concrete reason.
- Editor-behavior outputs under `docs/editor-behavior/**` only when the plan
  changes current Plate behavior law, protocol rows, parity gates, or roadmap.

Allowed planning edit scope:

- `docs/plans/**`
- `docs/research/**`
- `docs/vision/**`
- `docs/editor-behavior/**` when behavior law changes
- `docs/slate-v2/**` references only when the plan relies on Slate migration
  evidence
- `.agents/rules/plate-plan.mdc` only when self-repairing the skill

Allowed execution edit scope:

- The accepted plan's named package, app, docs, tests, examples, build, config,
  and generated-reference owners.

## Goal Setup

Plate Plan requires `autogoal`.

- Template: `plate-plan`.
- Planning flow mode: agent-led plan hardening.
- Execution flow mode: one-shot execution after explicit acceptance.
- Goal handle: `<lane outcome>; done when <short threshold>; plan
  <docs/plans/path>`.
- One pass per activation.
- Autogoal owns goal conflict, completion, blocker semantics, and lifecycle.
- Plate Plan owns plan shape, pass table, scorecard, conflict ledger,
  boundary map, verification matrix, objection ledger, and final handoff.
- If the goal tool is unavailable, record degraded state in the plan and stop
  before autonomous pass work unless the user explicitly accepts that.

Good planning goal:

```txt
Close Plate v2 API conflict plan; done when Plate Plan gates pass; plan docs/plans/YYYY-MM-DD-plate-v2-api-conflicts.md.
```

Good execution goal:

```txt
Execute docs/plans/<accepted-plan>.md; done when Plate package gates pass; target packages/core.
```

Bad goal:

```txt
Review Plate APIs a bit.
```

## Read First

1. Latest user request.
2. Current goal state.
3. Active plan under `docs/plans/`, if present.
4. Root `VISION.md`.
5. Relevant `docs/vision/**` detail files.
6. `.agents/rules/slate-plan.mdc` when methodology drift is suspected.
7. Current Slate package APIs that Plate plans to consume:
   - `packages/slate/**`
   - `packages/slate-react/**`
   - `packages/slate-dom/**`
   - `packages/slate-history/**`
   - `packages/slate-yjs/**`
   - `packages/slate-layout/**`
8. Current Plate package source affected by the plan:
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
verification uses focused package/app commands.

Common command families:

| Surface | Preferred proof |
| --- | --- |
| package source/type changes | `pnpm turbo typecheck --filter=./packages/<pkg>` |
| package tests | `pnpm --filter <package-name> test` or owner script |
| package build/public declarations | `pnpm --filter <package-name> build` |
| exports/barrels | `pnpm brl` plus diff review |
| docs/content | `pnpm --filter www check:docs` and browser proof when route changed |
| Slate behavior used by Plate | focused `pnpm --filter slate test:slate-browser:chromium <file-or-grep>` |
| full Slate release/deletion claim | `pnpm check:slate` |
| broad Plate repo claim | the repo `check` command only when the plan explicitly needs it |

Do not run Playwright against `apps/www` by default. Browser editor behavior
proof belongs in the owned Slate/browser lane unless the accepted plan names a
Plate app route as the product behavior owner.

## Confidence Score

Score with evidence. Threshold: total score >= 0.92 and no dimension below
0.85.

| Dimension | Weight |
| --- | ---: |
| Slate/Plate boundary correctness | 0.20 |
| Plate API/DX quality | 0.20 |
| Runtime, performance, and testability | 0.20 |
| Minimal breaking-change strategy | 0.15 |
| Product/plugin/docs/examples coherence | 0.15 |
| Research, source evidence, and proof completeness | 0.10 |

Automatic caps:

- Any unresolved Slate/Plate owner overlap caps total at 0.84.
- Any public compatibility alias or shim without an accepted hard reason caps
  total at 0.80.
- Any API conflict ledger missing required rows caps total at 0.78.
- Any current-state claim without live source evidence caps the relevant
  dimension at 0.75.
- Any breaking API change without adoption answer, docs/example answer, and
  proof route caps DX at 0.80.
- Any execution plan without focused verification commands caps proof at 0.82.
- Any private bridge without deletion gate caps boundary at 0.82.
- Any final handoff that lists only highlights caps total at 0.85.

## Plan Shape

Every Plate Plan should contain:

1. Verdict and confidence score.
2. Intent, outcome, in-scope, non-goals, decision boundaries.
3. Decision brief: principles, drivers, viable options, rejected alternatives,
   chosen option, consequences.
4. Slate/Plate boundary map.
5. Current-source inventory.
6. API conflict ledger.
7. Minimal breaking-change matrix.
8. Public API target.
9. Private bridge and deletion-gate target.
10. Runtime/default-route target.
11. Plugin/feature package target.
12. Docs/examples/registry target.
13. Plate migration phases.
14. Proof matrix.
15. Research/ecosystem synthesis when used.
16. Applicable implementation-skill review matrix.
17. High-risk pre-mortem when triggered.
18. Objection ledger.
19. Hard cuts and rejected alternatives.
20. Pass schedule.
21. Plan deltas from review.
22. Open questions and decision-changing evidence.
23. Final handoff outline.
24. Completion gates.

## Pass Schedule

Run one scheduled pass per activation unless the user explicitly asks for a
full uninterrupted loop.

Required passes:

1. Current-state read and initial score.
2. Intent, scope, boundary, and non-goals.
3. Slate/Plate boundary audit.
4. API conflict inventory.
5. Minimal breaking-change strategy.
6. Runtime/performance/testability pass.
7. Docs/examples/registry pass.
8. Research/ecosystem/live-source pass when external evidence is used.
9. Objection and steelman pass.
10. High-risk deliberate pass when triggered.
11. Revision pass.
12. Verification and final handoff gate.

Each pass must either change the plan or explicitly defend no change with
evidence. A rubber-stamp pass does not count.

## Pressure Passes

Before scoring above threshold, record these pass results:

- Boundary pass: prove each surface has one owner.
- API conflict pass: prove every required conflict row has a verdict.
- DX pass: prove the target shape is easier for app authors and future agents.
- Minimal-break pass: prove the public break set is the smallest clean set.
- Hard-cut pass: remove aliases, shims, stale docs, and fake compatibility.
- Runtime pass: prove runtime/default-route choices do not fight Slate.
- Performance pass: prove hot-path and subscription choices are bounded.
- Testability pass: prove the plan improves proofability, not just aesthetics.
- Docs pass: prove latest-state docs and examples match the target API.
- Simplicity pass: delete, inline, or merge before extracting.
- Ecosystem pass: prove plugin authors, app authors, docs/test maintainers, and
  package owners have a coherent path.
- Plate maintainer pass: challenge the plan as if reviewing a public beta PR.

## High-Risk Deliberate Mode

Trigger this mode when a proposal changes:

- public API
- package boundary
- runtime/default route
- plugin or extension behavior
- data model
- collaboration semantics
- normalization
- selection, focus, IME, browser behavior
- docs/examples that teach public API
- release or generated contract

When triggered, add:

- three realistic failure scenarios
- blast-radius note
- focused proof plan
- rollback or hard-cut answer
- adoption/docs/example answer

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
That is not a plan. That is a vibe.

## Editor-Behavior Outputs

Plate Plan may update `docs/editor-behavior/**`, but only when the plan changes
current Plate behavior law, protocol rows, parity gates, or roadmap.

Do not route every Plate v2 API plan through markdown behavior law. That was
the stale shape. Editor-behavior docs are an output, not this skill's center.

## User Review And Execution Mode

When the score is below threshold, a required row remains open, or a proof gate
has a runnable next move:

1. Update the plan with score, evidence, deltas, and next owner.
2. Keep the active goal open.
3. Continue the next review/refinement slice.

When final gates pass, complete the planning goal and stop for user review.
Implementation starts only after a later explicit execution request invoking
Plate Plan against the accepted plan.

## Done Handoff

When setting completion to done, final chat must include a concise but complete
list of accepted decisions so the user can review without opening the whole
plan.

Group by surface:

- Slate/Plate boundary
- public API target
- API conflicts and verdicts
- breaking changes
- private bridges and deletion gates
- runtime/default-route target
- package/plugin target
- docs/examples/registry target
- proof gates
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
