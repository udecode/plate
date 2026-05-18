---
description: Create or update domain-specific *-ralplan skills from a complete, self-contained, pass-gated planning/review skeleton.
argument-hint: '[domain-name] [domain goal, existing skill path, or source prompt]'
disable-model-invocation: true
name: ralplan-creator
metadata:
  skiller:
    source: .agents/rules/ralplan-creator.mdc
---

# Ralplan Creator

Handle $ARGUMENTS.

Use this to create reusable domain ralplan skills. A domain ralplan is a
planning/review gate that turns a broad recurring problem into an
execution-grade plan, scores confidence with cited evidence, runs pressure
passes, keeps the completion state `pending` until the plan is genuinely ready,
and hands execution to `ralph` only after the user reviews the accepted plan.

This creator must be strong enough to recreate a serious domain ralplan from
scratch. It should not depend on any existing domain ralplan being present.
Sibling `*-ralplan` files may be used for sync review when available, but the
template below is complete on its own.

## Use When

- Creating a new `<domain>-ralplan` skill.
- Reworking an existing domain ralplan to match the shared skeleton.
- Turning a repeated review prompt into a reusable pass-gated planning skill.
- The user wants a high-rigor planning gate before implementation.
- A project repeatedly discovers late architecture, DX, test, migration,
  research, quality, or rollout gaps.

## Do Not Use When

- The user asks to execute an already accepted plan.
- The task is a narrow bug fix or normal implementation slice.
- A generic `ralph` continuation prompt is enough.
- The target is just a one-off checklist, not a reusable planning skill.
- The domain has no recurring planning shape, evidence burden, or pressure-pass
  need.

## Hard Policy

- Keep this creator generic and reusable across projects.
- Put domain doctrine only in the generated domain ralplan, not in `ralph` and
  not in this creator.
- Do not require any particular sibling ralplan to exist.
- Do not create aliases for old skill names unless the user explicitly asks.
- Do not generate a domain ralplan that can mark `done` after only writing a
  polished essay.
- Do not generate a domain ralplan that can mark `done` from score alone. Score
  is one input; completion requires all required passes, output syncs,
  verification gates, and closure gates.
- Do not generate a domain ralplan that patches product/code changes. A
  `*-ralplan` is planning/review/spec/output only; execution belongs to `ralph`
  or another explicitly execution-named skill.
- User phrases like "go", "rewrite", "feel free to build", "fix it", or
  "execute" must not be treated as permission for a generated ralplan to edit
  implementation files. The generated ralplan must record the execution plan
  and hand off to `ralph`.
- A generated ralplan must have a user-review stop before implementation.
- A generated ralplan must include a completion-state contract, pass-state
  ledger, confidence score, objection ledger, and final handoff bullets.
- Domain-specific claims must be written as placeholders or instructions, not
  invented facts.
- Generated ralplans must forbid invented current-state and before/after
  shapes. Live source, tests, docs, generated artifacts, or reference material
  must prove the current shape before a plan may describe changing it.

## Required Inputs

Before writing a new ralplan, infer or record:

- skill name: `<domain>-ralplan`
- display name
- domain purpose
- recurring failure mode this ralplan prevents
- use cases
- non-use cases
- whether the lane is planning-only, spec-law, review-only, or
  execution-planning-only
- plan artifact path pattern
- completion state file pattern
- continuation prompt path
- required read-first sources
- optional read-when-relevant sources
- domain evidence sources
- confidence dimensions and weights
- goal setup rules
- score caps and threshold rules
- completion gates
- required plan sections
- pass schedule
- pass-state ledger fields
- intent/boundary requirements
- decision-brief requirements
- applicable implementation-review lenses
- research refresh rules
- evidence ladder
- high-risk trigger list
- objection-ledger personas
- objection-ledger required fields
- ecosystem/downstream maintainer triggers
- plan-delta requirements
- pressure passes
- Ralph bridge text
- done-handoff bullet groups
- final response shape
- sync review criteria

If one of these cannot be inferred from repo context, use a conservative
placeholder and mark it as a generation gap in the handoff. Ask the user only
when the missing answer changes the generated skill's purpose or safety model.

## Required Outputs

Create or update:

- `.agents/rules/<domain>-ralplan.mdc`
- `.agents/skills/<domain>-ralplan/SKILL.md`

The generated skill file must mirror the rule body and include front matter:

```yaml
---
description: <one-line triggerable description>
argument-hint: '[domain topic | plan path | review prompt]'
disable-model-invocation: true
name: <domain>-ralplan
metadata:
  skiller:
    source: .agents/rules/<domain>-ralplan.mdc
---
```

If the repo has a rule-to-skill sync generator, edit the rule source and run the
sync step. If not, keep rule and skill files manually synchronized in the same
change.

## Generated Ralplan Template

Use this template as the baseline for every generated domain ralplan. Replace
`<...>` placeholders with domain-specific content. Remove sections only with an
explicit reason recorded in the sync review.

````md
---
description: <Review or define DOMAIN plans against DOMAIN quality bars; write a scored plan and keep completion pending until every required pass and closure gate is complete.>
argument-hint: '[--quick|--standard|--deep] <DOMAIN planning/review prompt>'
disable-model-invocation: true
---

# <Domain> Ralplan

Handle $ARGUMENTS.

Use this for repeated "<DOMAIN recurring planning prompt>" requests where the
failure mode is <late-discovered gaps, incremental suggestions, weak evidence,
misaligned execution, or unreviewed breaking changes>.

This is a planning/review gate, not an implementation lane. It creates or
updates an execution-grade plan, scores it, and keeps the completion state
`pending` until every required pass, output-sync gate, verification gate, and
closure score gate is complete. Score is only one input. A high score never
permits `done` by itself; `done` means the full pass schedule is closed and the
plan is ready for user review before a later `ralph` run executes it.

## Use When

- <Primary domain planning/review use case.>
- <Architecture/API/spec/behavior/DX/research/test planning use case.>
- <Migration/rollout/ecosystem planning use case, when relevant.>
- <Regression-proofing or quality-gate planning use case.>
- The user says repeated review keeps producing more suggestions and wants a
  methodical plan-confidence gate.

## Do Not Use When

- The user asks to execute an already accepted plan.
- The user asks for a narrow bug fix without planning/spec work.
- The user asks for a normal code review of a diff.
- The plan already has a passing <Domain> Ralplan score, completed pass
  schedule, closed final gates, and the user says to build.
- <Domain-specific exclusion.>

## Hard Policy

- This is a planning/review gate. Do not patch implementation code, tests,
  examples, package files, build config, or product files from this skill.
- User phrases like "go", "rewrite", "feel free to build", "fix it", or
  "execute" do not override this editing boundary. Record execution steps and
  hand off to `ralph`.
- Allowed edits are only plan, research, spec, ledger, completion-state,
  continuation, and domain-output artifacts explicitly owned by this ralplan.
- Do not mark `done` because the review pass is tired.
- Score is not completion. A passing score with any pending pass, output sync,
  verification gate, named next owner, or runnable next action stays `pending`.
- The top-level completion status is the lane status, not the current pass
  status. Close a pass with `current_pass_status: complete`; do not use
  top-level `done` unless the whole lane is closed.
- Top-level `done` is legal only in the closure/final-gates pass, after the
  active plan proves every earlier pass-state row is complete or explicitly
  skipped with evidence.
- Do not use `blocked` when another research, review, or plan-hardening move is
  runnable, unless the user explicitly stops execution or tells you to mark the
  lane blocked.
- Treat pasted review findings as context. The latest user request is the task.
- A breaking, paradigm, ownership, or release-gate change needs an adoption
  story. "Cleaner architecture" alone is not a justification.
- Intent, outcome, scope, non-goals, and decision boundaries must be explicit
  before the plan can score as ready.
- Major decisions need a decision brief: principles, top drivers, viable
  options, rejected alternatives, and why the chosen option wins.
- Do not let a polished plan self-certify. Scores, verdicts, and keep/drop
  decisions need cited evidence.
- If the change touches <extension/plugin/collaboration/data/model/runtime/etc.>,
  a single local answer is insufficient; include downstream/ecosystem answers.
- Keep domain-specific product opinions out of lower-level/unopinionated layers
  unless the domain explicitly requires them.

## Required Artifacts

- Plan file under `<plan-directory>/`.
- Completion file: use the active runtime id, never an invented plan id. Resolve
  `<id>` from `COMPLETION_CHECK_ID`, `CODEX_THREAD_ID`, or
  `CODEX_SESSION_ID`. When the Stop hook provides `session_id` on stdin, treat
  that exact value as the runtime id because the hook maps it to
  `CODEX_THREAD_ID`. Write `.tmp/<id>/completion-check.md`. If no runtime id is
  available, stop and report the missing hook/session id instead of creating
  `.tmp/<plan-id>/completion-check.md`. Do not use the old shared root
  completion file.
- Continuation prompt: `.tmp/<id>/continue.md` beside the active completion file
  when further autonomous plan work remains.
- Research updates under `<research-directory>` when the evidence lane is stale,
  contradictory, or incomplete.
- Domain objection ledger in the active plan. If it grows too large, split it to
  `<plan-directory>/<same-slug>-objection-ledger.md` and link it from the plan.
- Plan deltas from review in the active plan: what changed, what was dropped,
  what was strengthened, and what stayed unchanged with reasons.
- Intent/boundary record in the active plan: intent, outcome, in-scope,
  non-goals, decision boundaries, and unresolved user-decision points.
- Decision brief in the active plan: principles, decision drivers, viable
  options, invalidated alternatives, consequences, and follow-ups.
- Applicable implementation-skill review notes in the active plan, each marked
  `applied` or `skipped` with a concrete reason.
- <Domain-specific output artifacts, if any.>

## Goal Setup

Before creating or resuming a <Domain> Ralplan:

- If a goal tool is available, use `set_goal()` unless the current goal already
  matches the desired end state.
- Create the goal around the desired end state, not the execution plan.
- Include constraints, scope, or verification details only when they materially
  change what `done` means.
- Use the goal or user-input tool to ask when the goal would otherwise be
  unclear.
- If no goal tool is available, ask the user to set the goal instead of
  silently skipping goal setup.
- Do not start the planning pass until the goal is set, verified as already
  matching, or the user explicitly resolves the missing-goal path.

Good goal:

```txt
<Domain> Ralplan proves the accepted target shape, output artifacts, and proof
gates are ready for user review and later Ralph execution.
```

Bad goal:

```txt
Run <Domain> Ralplan passes 1 through 9.
```

Default plan path:

```txt
<plan-directory>/YYYY-MM-DD-<domain>-ralplan-review-plan.md
```

Reuse an active plan when the prompt names one or the runtime-id completion file
already points at one.

## Read First

Always read only what is relevant, but start from these sources:

1. Latest user request.
2. Current goal state, if a goal tool exists.
3. Active completion file if present: `.tmp/<id>/completion-check.md`, where
   `<id>` is resolved from `COMPLETION_CHECK_ID`, `CODEX_THREAD_ID`,
   `CODEX_SESSION_ID`, or Stop-hook stdin `session_id`. Do not treat a
   plan-name folder as active unless that exact value came from the runtime id.
4. Active plan under `<plan-directory>/` if present.
5. <Domain overview/readme/source-of-truth docs.>
6. <Domain source files, examples, tests, or generated outputs.>
7. <Research index/log/docs, when present.>
8. <Known best-practice docs or local reference repos, when relevant.>

Read when relevant:

- [intent-boundary-pass](.agents/skills/intent-boundary-pass/SKILL.md) when
  intent, scope, non-goals, or decision boundaries are unclear.
- [steelman-pass](.agents/skills/steelman-pass/SKILL.md) when major decisions
  need maintainer/user objection rows.
- [high-risk-deliberate-pass](.agents/skills/high-risk-deliberate-pass/SKILL.md)
  when a proposal changes public API, data model, collaboration, runtime,
  browser behavior, migration, release gates, security, or package boundaries.
- [vercel-react-best-practices](.agents/skills/vercel-react-best-practices/SKILL.md)
  when React/Next rendering, subscriptions, external stores, event listeners,
  bundle shape, data fetching, or runtime performance are in scope.
- [react-useeffect](.agents/skills/react-useeffect/SKILL.md) when effects,
  derived state, reset-on-prop, subscriptions, browser APIs, external systems,
  data fetching, or state synchronization are in scope.
- [performance-oracle](.agents/skills/performance-oracle/SKILL.md) when hot
  paths, algorithms, memory, network, query, bundle, runtime loops, or
  scalability concerns are in scope.
- [tdd](.agents/skills/tdd/SKILL.md) when behavior changes, bug fixes, public
  interface changes, or regression classes need test-first acceptance criteria.
- <Domain-specific skill/source when relevant.>

Use `research-wiki` or the project's research workflow when the compiled layer
is stale, contradictory, or missing coverage. Prefer local official sources and
repo-local references before external docs.

If the review depends on current behavior, cite live source files, docs,
examples, tests, generated artifacts, browser contracts, or research pages used
for the claim.

## Current-State Grounding Template

Every generated ralplan must include a domain-specific version of this rule:

```
## Current-State Grounding

Current source of truth wins over old plans, old docs, generated handoffs, and
memory. Before any pass, score, ledger row, migration answer, docs/example
answer, proof row, implementation phase, final handoff, or user-facing
explanation that relies on what currently exists:

1. Re-read the live source, docs, tests, generated artifact, browser contract,
   or external reference that owns the shape.
2. State the exact current owner: file, test, route, generated artifact,
   benchmark, source URL, or explicit gap.
3. Quote or summarize the current shape only if it exists in that source.
4. Attach a file/line, test name, route, issue, artifact path, benchmark, or
   source URL.
5. If the current source already matches the proposed target, write
   `already done in live source` and move the decision to docs/tests/cleanup.
6. If there is no source-backed current shape, write `decision: ...`,
   `target shape: ...`, or `gap: ...` instead of inventing a current state.

Compiled research and previous plans can explain history, but they cannot prove
the current shape when live source is available.
```

Customize the examples for the domain. For code/API ralplans, include exact
`rg` probes for the symbols being discussed. For docs/protocol/product ralplans,
include exact doc, generated artifact, route, issue, or benchmark probes.

## Completion State

Set `.tmp/<id>/completion-check.md` to `pending` before starting or resuming
review, where `<id>` is the active runtime id from `COMPLETION_CHECK_ID`,
`CODEX_THREAD_ID`, `CODEX_SESSION_ID`, or Stop-hook stdin `session_id`.

If no runtime id is available, stop and report the missing hook/session id.
Do not create `.tmp/<plan-id>/completion-check.md` as a fallback for generated
ralplans. Store the matching continuation prompt in `.tmp/<id>/continue.md` and
record it as `continue_file`.

Use:

```md
status: pending
plan: <plan-directory>/YYYY-MM-DD-<domain>-ralplan-review-plan.md
completion_id: <id>
continue_file: .tmp/<id>/continue.md
current_pass: <pass-name>
current_pass_status: in_progress
current_pass_skill: .agents/skills/<pass-or-domain-skill>/SKILL.md
current_pass_owner: <owner>
current_pass_scope: <scope>
current_pass_trigger: <trigger>
next_pass: <next-pass>
next_action: <next-action>
```

Set `done` only when all completion gates pass. Set `blocked` only when no
autonomous progress is possible because evidence, tooling, access, or a user
decision is missing.

Single-pass completion is invalid by default:

- one activation may complete at most one scheduled review/spec pass
- a newly created or newly activated plan must stay `pending`
- only the closure pass may set `done`
- the closure pass is valid only after earlier pass-state rows are already
  recorded as complete in the active plan
- if the current activation creates, rewrites, or materially rescopes the plan,
  record the next pass and keep status `pending`
- ignore this only when the user explicitly asks for a single-pass review

Use the completion file as the lightweight current-pass state. Keep detailed
pass evidence in the active plan.

Allowed `current_pass_status` values:

- `pending`
- `in_progress`
- `complete`
- `revise`
- `blocked`
- `skipped`

Before writing `status: done`, prove in the plan and completion file:

- every scheduled pass row is `complete` or intentionally `skipped` with a
  concrete reason and evidence
- no pass row is `pending`, `in_progress`, `revise`, or `blocked` with a
  runnable next move
- `current_pass` is the closure/final-gates pass
- `current_pass_status` is `complete`
- `next_pass` is `none`
- `next_action` is `none`
- every completion threshold row below passes

If any assertion fails, write `status: pending`, name the earliest runnable
`next_pass`, and refresh `.tmp/<id>/continue.md`.

## Confidence Score

Score every review pass from `0.00` to `1.00`.

Weights:

| Dimension | Weight |
| --- | ---: |
| <Dimension 1: architecture/runtime/performance/authority/etc.> | <0.xx> |
| <Dimension 2: DX/API/product fit/etc.> | <0.xx> |
| <Dimension 3: migration/ecosystem/downstream shape/etc.> | <0.xx> |
| <Dimension 4: regression-proof testing/protocol/parity/etc.> | <0.xx> |
| <Dimension 5: research evidence completeness/freshness/etc.> | <0.xx> |
| <Dimension 6: simplicity/composability/maintainability/etc.> | <0.xx> |

Weights must total `1.00`.

Score evidence rules:

- Every dimension score must cite concrete evidence: plan section, source file,
  docs section, protocol/parity row, test/browser contract, research page,
  generated artifact, benchmark, or ledger row.
- A dimension without cited evidence cannot score above `0.80`.
- Research evidence cannot score above `0.85` without current citations for the
  external systems or local repos the review relies on.
- Regression-proof testing cannot score above `0.80` without named replayable
  unit/integration/browser/stress/protocol contracts.
- Migration/ecosystem shape cannot score above `0.85` if applicable downstream
  answers are missing.
- Implementation-review discipline cannot score above `0.80` when an applicable
  lens is missing.
- Implementation-review discipline cannot score above `0.85` when a lens is
  marked `applied` or `skipped` without findings, plan deltas, or a concrete
  skip reason.
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
- no unresolved contradiction in the research layer or source evidence
- no missing acceptance criteria for implementation
- no public behavior/API/surface left in "maybe" language
- intent, outcome, in-scope, non-goals, and decision boundaries are explicit
- every major decision has principles, top drivers, viable options, rejected
  alternatives, consequences, and follow-ups
- high-risk deliberate mode is complete when triggered
- every major behavior/paradigm/API/ownership/gate change has an accepted
  objection-ledger row
- downstream/ecosystem changes have ecosystem answers when applicable
- every applicable implementation-review lens is applied or explicitly skipped
  with a reason
- no objection-ledger row is `unresolved`, `revise`, or `drop` without a
  corresponding plan response
- pass schedule is complete
- pass-state ledger proves earlier passes completed before closure
- plan deltas from review are recorded
- final user-review handoff lists every accepted plan item/decision, with
  before/after shape when applicable

If any gate fails, status stays `pending`.

## Plan Shape

The plan must include:

1. Current verdict.
2. Intent/boundary record.
3. Decision brief.
4. Confidence scorecard with evidence references.
5. Source-backed domain north star.
6. Request classification and feature/surface family.
7. Current law/readiness/state assessment.
8. Research freshness decision.
9. Public behavior/API/contract target.
10. Internal architecture/runtime/ownership target.
11. Domain model/authority/permanent-home target when relevant.
12. Downstream/ecosystem/migration-backbone target when relevant.
13. Standards/spec/protocol/parity/docs/test/roadmap change map when relevant.
14. Applicable implementation-skill review matrix.
15. Browser/stress/parity/regression strategy when relevant.
16. High-risk deliberate-mode pre-mortem and proof plan when triggered.
17. Hard cuts and rejected alternatives.
18. Domain objection ledger with ecosystem answers when triggered.
19. Pass schedule and pass-state ledger.
20. Plan deltas from review.
21. Open questions and what would change the decision.
22. Implementation phases with owners.
23. Fast driver gates.
24. Final user-review handoff outline.
25. Final completion gates.

## Pass Schedule

Run the review as passes, not one giant essay:

1. Current-state read and initial score.
2. Intent/boundary and decision-brief pass; use `intent-boundary-pass` when the
   boundary record is not already explicit.
3. Research and live-source refresh.
4. Domain pressure passes: authority/model/performance/DX/migration/regression/
   research/simplicity/implementation-lens passes as applicable.
5. Domain maintainer objection ledger; use `steelman-pass` for major decisions.
6. High-risk deliberate-mode pass when triggered; use `high-risk-deliberate-pass`.
7. Ecosystem/downstream maintainer pass when triggered.
8. Revision pass that answers objections and updates the plan and domain output
   artifacts.
9. Closure score and final gates.

The closure score and final gates are their own pass. Do not fold closure into
the previous pass. The closure pass may start only when every earlier
pass-state row is already `complete` or intentionally `skipped` with evidence.

After each pass, update the active plan with pass status, evidence, changes,
and next owner. Keep the active completion file as `pending` while any pass or
revision remains runnable.

Pass-state ledger rows must include:

- pass name
- status: `pending`, `in_progress`, or `complete`
- evidence added
- plan delta
- domain output delta
- open issues
- next owner

Do not mark multiple major passes complete in one activation. Finish the current
pass, refresh the continuation prompt, keep status `pending`, and let the next
activation run the next pass.

## Domain Output Map

Define the output artifacts this ralplan owns. If the domain has no separate
output files beyond the plan, say so explicitly.

For each output artifact, record:

- purpose
- path pattern
- when to patch it
- when to leave it unchanged
- what evidence proves it is current
- how it relates to the plan

Common output categories:

- authority map
- readable law/spec
- protocol/scenario matrix
- parity/gate matrix
- reference audit or research synthesis
- implementation roadmap
- public API docs
- migration guide or adoption story
- test/stress/browser contract
- decision record

Do not leave a required layer implicit. If an output file stays unchanged,
record why.

## Intake Classification

Classify the request before editing:

1. Update to existing current behavior/API/law.
2. New interaction/surface class for an existing feature.
3. New current feature family or newly formalized current surface.
4. Deferred or future feature.
5. New authority / winner / ownership shift.
6. Architecture-only planning question.
7. Regression-proofing / parity / release-gate question.
8. Migration or downstream ecosystem question.
9. Documentation/spec/output reorganization question.

Classify the feature/surface family with domain-specific categories.

Classify the evidence state:

- evidence already sufficient
- research update needed
- architecture lane change
- pure law/spec/protocol update
- parity/proof update
- implementation roadmap update
- user decision needed

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

For every major behavior, authority, package-boundary, API, protocol, runtime,
render contract, migration, operation, data-model, release-gate, or proof
decision, record:

- principles: three to five rules the decision must satisfy
- top drivers: the three forces that most affect the decision
- viable options: at least two, with bounded pros and cons
- chosen option
- rejected alternatives
- consequences
- follow-ups

If only one option is viable, say which alternatives were considered and why
they are invalid. "No alternative" is not a reason; it is usually a missed pass.

## Applicable Implementation Reviews

Before scoring above threshold, decide whether each review lens applies. Record
the decision in the active plan even when skipped.

Use this matrix:

| Lens | Applies when | Must answer |
| --- | --- | --- |
| `build-web-apps:shadcn` | UI, editor chrome, components, menus, popovers, command palettes, inputs, forms, overlays, styling, or component composition are in scope | Are existing components used first? Are variants, semantic tokens, sizing/spacing, accessible labels/titles, composition patterns, and minimal props respected? |
| `vercel-react-best-practices` | React/Next rendering, external-store subscriptions, data fetching, server/client boundaries, bundle size, event listeners, or runtime performance are in scope | Are waterfalls avoided, bundles split sanely, global listeners deduped, subscriptions derived and narrow, expensive renders deferred, transient values kept in refs, and inline components avoided? |
| `react-useeffect` | Effects, derived state, reset-on-prop, state synchronization, subscriptions, browser APIs, external systems, data fetching, or parent notifications are in scope | Is the effect actually synchronizing with an external system? Can the behavior be render calculation, `useMemo`, keyed reset, event handler, framework fetch, or `useSyncExternalStore` instead? |
| `performance-oracle` | Hot paths, algorithms, large collections/documents, memory lifetime, network/database I/O, bundle cost, runtime loops, browser event paths, or scalability are in scope | Is complexity bounded? Are allocations, subscriptions, listeners, network calls, cache lifetimes, and scale behavior controlled at 10x, 100x, and 1000x? |
| `tdd` | Behavior additions, bug fixes, public interface changes, regression classes, or executable acceptance criteria are in scope | Is there a red-green-refactor slice through a public interface? Does the test verify behavior rather than implementation details? |

For each applicable lens, record:

- applicability: `applied` or `skipped`
- reason
- findings
- plan delta or explicit no-change defense
- proof pointer: plan section, source file, rule family, protocol row, test
  family, benchmark, or generated artifact

Do not turn these lenses into generic busywork. If the plan is pure law with no
UI, React, effect, performance, or behavior-test surface, skip irrelevant lenses
with one sentence and keep moving.

## Research Decision

Use the research layer before inventing new law or architecture.

Use the project research workflow when:

- the topic already exists in research but needs refresh
- compiled synthesis is contradictory or thin
- raw evidence is missing or stale
- the authority question spans multiple likely corpora
- the surface is authority-sensitive and silence would be dangerous
- a public API, runtime, browser, migration, ecosystem, or release-gate decision
  depends on external systems or current dependency behavior

Do not skip the research layer and jump from a raw source into law unless the
request is tiny and the evidence is already obvious.

Do not call research "full" if one likely corpus stayed silent. Silence is a
gap, not agreement.

## Evidence Ladder

Use:

1. explicit reference docs, live source, executable tests, browser contracts,
   benchmarks, generated artifacts, or compiled research with citations
2. compatible but indirect evidence
3. honest gap

When recording evidence, use:

- `agree`
- `partial`
- `gap`
- `tension`
- `diverge`

When describing the current state, live source/tests/generated artifacts outrank
compiled research and previous plans. If they disagree, record `stale research`
or `stale plan` and update the active plan from the live source.

Never mark behavior, architecture, or API `locked` because it feels standard.

## Domain Model / Ownership First

Before writing UX, API, or rollout law, lock the domain model and ownership
class when relevant.

Record:

- model class
- ownership home
- authority source
- lifecycle
- identity semantics
- mutation/update semantics
- read/query semantics
- rendering/projection semantics when relevant
- persistence/collaboration semantics when relevant
- compatibility/adoption boundary

Do not spec secondary UI, docs, or migration wording until the underlying model
and authority are explicit.

## Permanent-Home Test

For any new shared contract or cross-surface rule, answer:

1. What is the best permanent home if designed cleanly today?
2. Which home minimizes repeated local reimplementation?
3. Which home keeps package/module ownership coherent?
4. Which home gives the best performance characteristics?
5. Which home gives the best DX and API discoverability?
6. Which future consumers would reuse it?
7. Which home keeps optional/product-specific opinions out of lower layers?

Candidate homes should be domain-specific, but usually include:

- core/shared runtime
- existing shared package/module
- new shared package/module
- feature package/module
- app/render layer only
- docs/test contract only
- generated artifact only

If the answer differs from current file placement, the plan should say so.

## Required Edit Order

If the domain owns output artifacts, define an edit order. Use this generic
order unless the domain needs a stricter one:

1. Authority / standards / winner map.
2. Readable law / spec / public contract.
3. Protocol / scenario / API matrix.
4. Parity / release / gate matrix.
5. Roadmap / implementation queue.
6. Audit / research history.
7. Public docs / examples.
8. Tests / browser / stress contract.

Rules:

- If a file stays unchanged, record why.
- Do not update a gate without updating the law it depends on.
- Do not update roadmap without preserving the acceptance proof.
- Do not strand implementation debt only in a plan doc.
- Do not treat audit/history as current law.

## Current Vs Deferred Surface

For current features/current surfaces, update all affected layers:

- authority/source-of-truth
- readable law/public contract
- scenarios/protocol rows
- parity/gates when changed
- roadmap when implementation remains
- audit/research when evidence changed
- docs/examples when public API or behavior changed
- proof contracts when regression risk changed

For deferred or future surfaces, usually update:

- authority if a new lane is needed
- readable law if the contract must exist now
- scenarios as `deferred` or `specified`
- roadmap only when work should enter the queue

Do not pretend deferred behavior is release-gated current behavior.

## High-Risk Deliberate Mode

Trigger this mode when a proposal changes:

- public API
- core data/domain model
- operation, snapshot, commit, persistence, or normalization behavior
- extension/plugin/package substrate
- collaboration behavior
- selection, focus, IME, DOM repair, browser-runtime, or other platform-sensitive
  behavior
- React runtime subscription strategy
- render contracts
- security, auth, privacy, permissions, or destructive behavior
- release gate or generated regression contract
- migration/adoption path for existing users

When triggered, add to the active plan:

- pre-mortem: three realistic failure scenarios
- expanded proof plan: unit, integration, browser, parity, stress, migration,
  docs/example, benchmark, and observability proof as applicable
- blast-radius note: packages, examples, docs, tests, downstream consumers,
  generated artifacts, and release gates
- rollback or hard-cut answer: why the plan is still worth doing

High-risk mode is not a separate workflow. It is one stricter pass inside this
skill.

## Domain Objection Ledger

Simulate skeptical maintainers and serious downstream users reviewing the plan.
The goal is to prevent "they changed things for no reason."

For every major behavior, architecture, authority, API, package-boundary,
protocol, parity, migration, or release-gate change, record:

- Change: exact behavior/API/spec/test/runtime contract being changed.
- Who feels pain: maintainer, plugin/extension author, app author, downstream
  integrator, docs maintainer, test maintainer, package owner, design-system
  owner, release owner, migration owner, or runtime maintainer.
- Likely objection: strongest fair complaint in user language.
- Steelman antithesis: the best argument for not making the change.
- Tradeoff tension: what the chosen option makes worse or more expensive.
- Why this is not change for change's sake: concrete payoff, not vibes.
- Evidence: repo fact, research fact, protocol row, parity row, browser
  regression class, benchmark concern, ecosystem pressure, or reference
  limitation.
- Rejected alternative: closest compatible option and why it is weaker.
- Adoption answer: how a user or maintainer moves from old shape to new shape.
- Docs/example answer: what public explanation or example proves the change.
- Regression proof: unit, integration, browser, protocol, parity, stress,
  benchmark, or manual proof row.
- Ecosystem answers, when triggered.
- Verdict: `keep`, `revise`, `drop`, or `unresolved`.

Ledger rows are mandatory for changes like:

- new authority lane or winner shift
- family split
- data/model/identity change
- permanent-home decision
- core vs package vs app/render ownership change
- public API shape change
- event/callback/hook/render contract change
- runtime/subscription/performance strategy change
- effect, derived-state, or external-synchronization contract
- protocol/parity/release gate change
- roadmap order change
- hard cut of old docs/API behavior
- generated browser, stress, benchmark, or parity gate
- compatibility alias or shim decision

Rules:

- No major behavior/paradigm change may score above `0.85` in DX, authority,
  migration, or parity unless it has a ledger row with a convincing answer.
- A ledger row is accepted only when its verdict is `keep` and every required
  field is concrete: evidence, steelman antithesis, tradeoff tension, rejected
  alternative, adoption answer, docs/example answer, regression proof, and
  ecosystem answers when triggered.
- A row is not accepted if a required field is missing, says `TBD`, says only
  "cleaner", or lacks proof that a real user problem is solved.
- If the best answer is only "cleaner", the verdict is `revise` or `drop`.
- `unresolved`, `revise`, or `drop` rows must feed back into the plan before
  completion can be `done`.
- Reuse prior ledger rows when rerunning this skill, but revalidate them against
  the latest plan.

## Ecosystem Maintainer Pass

Do not create separate full ledgers by default. Trigger this pass only when the
proposal changes extension, plugin, package, rendering, collaboration,
operation, identity, normalization, snapshot, persistence, release, data-model,
or migration behavior.

For each triggered ledger row, add short answers for relevant personas:

- Extension/plugin maintainer: can packages expose this without wrapping every
  core call or creating a compatibility junk drawer?
- App author: can app code customize or opt out without bespoke wiring?
- Docs/test maintainer: can docs, examples, protocol rows, and proof gates stay
  coherent?
- Runtime/performance maintainer: does the hot path stay bounded and observable?
- Collaboration/data maintainer: do operations, identity, snapshots,
  normalization, remote apply, persistence, and conflict behavior stay
  deterministic?
- Migration/release maintainer: can the rollout be explained and verified
  without hidden compatibility debt?

For core API/data-model changes, also name:

- exact affected extension points
- package/plugin migration surface
- data/collab contract affected
- proof required before closure

The pass catches ecosystem breakage. It does not veto every cleanup.

## Plan Deltas From Review

Every review pass must either change the plan or explicitly defend no change.

Record:

- added decisions
- revised decisions
- dropped decisions
- strengthened acceptance criteria
- new tests/proof rows
- domain output file deltas
- unresolved items moved to the next pass
- no-change decisions with evidence

If pressure passes produce no plan delta and no explicit no-change defense, the
review is a rubber stamp and completion stays `pending`.

## Pressure Passes

Before raising the score above threshold, run these passes and record the result
in the plan:

- Intent/boundary pass: prove intent, outcome, scope, non-goals, and decision
  boundaries are explicit. Use `intent-boundary-pass` when this is not already
  done.
- Decision-brief pass: prove principles, drivers, options, rejected
  alternatives, consequences, and follow-ups are recorded.
- Research pass: prove compiled/current research was used as evidence, not
  decoration.
- Authority/model pass: prove source of truth, model, identity, and ownership
  are locked before secondary UX/API/docs law.
- Permanent-home pass: prove ownership belongs where the plan says it belongs.
- Performance pass: prove hot paths, subscriptions, algorithms, memory,
  network, bundle, runtime, and scalability claims are bounded. Use
  `vercel-react-best-practices` and `performance-oracle` when applicable.
- DX pass: prove the shape is discoverable, composable, and justified for
  target users.
- Unopinionated-core / layering pass: prove lower layers do not absorb
  product-only opinion unless the domain requires it.
- Migration/ecosystem pass: prove downstream consumers have a believable route,
  not a hand-wavy adapter promise.
- Regression pass: prove behavior is caught by generated contracts, unit tests,
  protocol rows, browser replay, stress tests, or parity gates, not
  example-by-example patching. Use `tdd` expectations where test-first behavior
  slices apply.
- Simplicity pass: remove overbuilt props, aliases, shims, speculative API
  layers, and compatibility debt before publish or rollout.
- Domain maintainer pass: challenge every major behavior/paradigm change as if
  reviewing a public PR; record objections and answers in the ledger.
- Steelman pass: record the best antithesis and real tradeoff tension for each
  major decision. Use `steelman-pass` for this.
- High-risk deliberate pass: when triggered, add the pre-mortem and expanded
  proof plan before closure. Use `high-risk-deliberate-pass` for this.
- Ecosystem pass: only when triggered, add downstream maintainer answers to the
  same ledger row.

## Ralph Bridge

When the score is below threshold, any required pass remains open, or any
completion gate has a runnable next move:

1. Update the plan with the current score, evidence, rejected tactics, and next
   owner.
2. Keep the active completion file as `pending`.
3. Use `ralph` to refresh the continuation prompt.
4. Scope-lock the continuation prompt to <Domain> Ralplan planning, research,
   review, and domain-output work only.
5. Continue the next review/refinement slice.

Do not execute implementation from this skill, and do not use `ralph` from this
skill as an immediate executor. This skill refreshes the continuation prompt
only. Execution starts after the user explicitly invokes `ralph` or another
execution skill.

## Done Handoff

When setting completion to `done`, the final chat response must include a
concise but exhaustive bullet list of every accepted plan item and decision so
the user can review without opening the full plan.

Group bullets by surface when useful:

- intent / decision brief
- authority / source of truth
- public API / behavior / contract
- internal runtime / ownership / model
- hooks/events/rendering/components when relevant
- implementation-review lens decisions
- migration/ecosystem decisions
- output artifacts and edit-order decisions
- research/evidence decisions
- high-risk deliberate-mode pre-mortem when triggered
- regression/browser/protocol/parity/stress proof
- hard cuts and rejected alternatives
- implementation phases and gates

Each bullet should include:

- decision name or surface
- before -> after shape when the plan changes an existing shape, with a source
  pointer for the before
- status: `add`, `keep`, `cut`, `rename`, `revise`, or `gate`
- proof pointer when short enough: evidence row, ledger row, test/proof family,
  spec section, source file, benchmark, or plan section

Current-state / before-after rules:

- Any claim about the current implementation must have a live source, test,
  docs, generated artifact, or authoritative reference pointer, or be marked
  `gap`.
- `before` must be copied from live source, tests, docs, generated artifacts, or
  authoritative reference material.
- `after` must be an accepted target shape or `already done`.
- If a previous plan or compiled research claims an old shape but live evidence
  does not, do not use it in any step; record `stale claim`.
- If a decision has no current source-backed before shape, write `decision: ...`
  or `target shape: ...` instead of inventing one.

Do not list only highlights. If the plan accepts twenty decisions, the handoff
lists twenty bullets. Keep each bullet short; group them instead of omitting
items.

## Final Response

When the plan is still pending, say what score remains and what the next owner
is.

When the plan reaches `done`, use this shape:

```md
<Domain> Ralplan is ready for user review: [<plan-path>](<plan-path>)

Decisions:
- Intent: ...
- Authority/model: ...
- Public contract: ...
- Runtime/ownership: ...
- Tests/proof: ...
```

Do not paste the whole plan into chat. Do paste the exhaustive decision bullets.
````

## Creator Workflow

1. Parse the requested domain name and normalize it to kebab case.
2. Determine the target files:
   - `.agents/rules/<domain>-ralplan.mdc`
   - `.agents/skills/<domain>-ralplan/SKILL.md`
3. Read any existing target files.
4. Read existing sibling `*-ralplan` files only if they exist in the current
   repo. Treat them as examples, not dependencies.
5. Fill the Required Inputs from user request, repo evidence, and sibling
   patterns when useful.
6. Create the generated ralplan from the full template above.
7. Add domain-specific sections only where the domain needs them.
8. Ensure confidence weights total `1.00`.
9. Ensure the generated ralplan includes Goal Setup with `set_goal()` when a
   goal tool exists.
10. Ensure completion gates include the shared threshold and domain-specific
   gates.
11. Ensure score is never sufficient for completion; `done` requires completed
    pass schedule, output syncs, verification gates, and closure gates.
12. Ensure the objection ledger includes the right personas and required fields.
13. Ensure the done handoff requires exhaustive decision bullets.
14. Ensure the generated ralplan forbids implementation edits and routes
    execution to `ralph` without executing from the ralplan itself.
15. Create or sync the matching `SKILL.md`.
16. Search for stale old-name references if this is a rename.
17. Run a sync review.
18. Run the project completion check if present.

## Sync Review

When creating or updating a domain ralplan, record a short sync review in the
handoff:

- target rule file
- target skill file
- whether skill body mirrors rule body
- shared skeleton sections present
- domain-specific sections added
- sections intentionally omitted with reason
- confidence dimensions and whether weights total `1.00`
- completion threshold and pass-gate summary
- goal setup rules included
- score-not-completion and closure-pass-only rules included
- objection-ledger personas
- implementation-review lenses included
- research/evidence rules included
- high-risk triggers included
- Ralph bridge included
- implementation edit boundary included
- final handoff bullets included
- stale old-name references removed

If sibling `*-ralplan` files exist, also record:

- shared mechanics kept in sync
- intentional domain differences
- scoring/gate differences and why
- missing shared mechanics, if any

The goal is maximum skeleton sync without forcing different domains into the
same doctrine.

## Quality Bar

A generated ralplan is not acceptable unless it can answer all of these:

- What exact recurring failure does this ralplan prevent?
- What files/artifacts does it write?
- Which implementation/product files are explicitly off-limits?
- What does it read first?
- How does it set or verify the goal around the desired end state?
- How does it keep completion `pending`?
- How does it prevent score-only `done`?
- What score dimensions are used?
- What caps prevent unsupported confidence?
- What threshold marks the plan ready?
- What plan sections are required?
- What pass schedule prevents one giant essay?
- What does the pass ledger record?
- What user intent/boundary fields are mandatory?
- What major decisions need option analysis?
- What research evidence is required?
- What high-risk changes trigger deliberate mode?
- Which maintainers/users object, and where are their objections recorded?
- What downstream/ecosystem surfaces must be answered?
- What implementation-review lenses can apply?
- How does it route execution to `ralph` without executing itself?
- What proof contracts prevent regressions?
- What plan deltas are recorded after every pass?
- How does `ralph` resume the next pass?
- What exhaustive handoff bullets does the user review?

## Output

Final response should include:

- created or updated ralplan files
- domain purpose
- confidence dimensions
- pass schedule summary
- domain-specific additions
- sync review result
- verification run
