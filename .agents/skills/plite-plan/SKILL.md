---
description: Plan or execute Plite architecture and public API changes for the raw editor substrate. Use for model/runtime, operations, React/DOM, history/collaboration, browser proof, and accepted Plite architecture plans.
argument-hint: '[--quick|--standard|--deep] <Plite architecture/API question | accepted plan path>'
disable-model-invocation: true
name: plite-plan
metadata:
  skiller:
    source: .agents/rules/plite-plan.mdc
---

# Plite Plan

Handle $ARGUMENTS.

Use Plite Plan for substrate architecture, adoption, execution, and proof after
the target public call shape is clear. Use `best-api` first when the unresolved
question is what the API should look like. Use Plate Plan for product plugins,
kits, registry, and opinionated workflows built on top.

## Modes

Choose one mode from the arguments. Default to `--standard`.

- `--quick`: inspect a named substrate boundary/adoption question and answer
  with a source-backed recommendation. Use `best-api review` instead when call
  shape is the decision. Do not create a goal or call the result
  execution-ready. Promote to standard when the decision spans multiple
  owners, public breaks, or uncertain browser/runtime behavior.
- `--standard`: create or continue one Plite Plan goal and plan. Run the three
  phases continuously in the current activation unless interrupted or blocked.
- `--deep`: use the standard workflow and add only the research, Benchmark
  evidence/packet, browser stress, or red-team work justified by the named risk. Do not add more
  lifecycle phases or generic editor comparison. Use `editor-audit` first when
  source-level comparison against one or more editor architectures is required.

A plan path does not by itself authorize implementation. Execution starts only
when the user explicitly accepts a ready plan and invokes `plite-plan` against
that exact path. Create a new one-shot execution goal for the accepted plan.

## Ownership

Read root `VISION.md` and `docs/vision/plite.md` for doctrine; do not duplicate
their full ownership tables in the plan.

`editor-audit` owns exhaustive external editor architecture comparison.
`best-api` owns the ideal public call surface. Plite Plan consumes those targets
and owns substrate law, Plate/collaboration adoption, execution slices, and
proof. `benchmark` owns measurement, causal diagnosis, and iterative
optimization; this plan consumes its evidence or requests a scoped packet. If a plan discovers a better call shape, run the `best-api` lens inside
the same plan and repair the target before continuing.

- Plite owns the editor model, operations, reads, updates, transactions,
  selection primitives, DOM/input/runtime substrate, history, replay,
  collaboration substrate, and browser proof infrastructure.
- Plate owns product plugins, feature workflows, kits, registry code,
  app-facing docs/examples, and opinionated UX.
- Keep Plite unopinionated. Do not solve a Plate product concern in substrate.
- Do not hide a missing Plite primitive behind Plate glue. Name the substrate
  gap and its Plate adoption pressure explicitly.

## Hard Policy

- Current checkout and Plate repo root commands are authoritative. Source every
  current API, export, docs, test, benchmark, and behavior claim from live
  owners.
- Use `best-api` for target-shape judgment. Treat breaking scope as adoption
  cost after the target is chosen; never turn compatibility into a permanent
  compromised hybrid. No public aliases, runtime shims, dual signatures, or
  docs for old names.
- A private bridge is exceptional. Name its owner, non-public proof, deletion
  trigger, and removal gate in the decision row.
- Planning edits only planning, research, vision, issue/provenance,
  behavior-law, benchmark-target, and reference artifacts it explicitly owns.
  Do not implement substrate source before accepted-plan execution.
- Keep the plan proportional. One plan is the default artifact. Add a machine-
  readable artifact only when it materially improves a large audit; do not
  mirror the same decisions across ledgers.
- Use worker skills only when their surface actually applies. Do not create a
  matrix of skills merely to record N/A rows.
- Follow root `AGENTS.md` and `docs/vision/plite.md` for package, browser,
  benchmark, docs, barrel, lint, and review commands instead of copying command
  tables into the plan.

## Standard And Deep Setup

Use `autogoal` with `docs/plans/templates/plite-plan.md`.

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template plite-plan \
  --title "<short Plite plan title>"
```

Use a short objective:

```txt
Close <Plite decision>; done when binary readiness gates pass; plan docs/plans/<path>.md.
```

Autogoal owns lifecycle, evidence integrity, blocking, and the final mechanical
check. Plite Plan owns substrate decisions, Plate/collaboration adoption,
execution slices, and Plite-specific proof.

## Read Order

1. Latest user request, current goal, and active plan when present.
2. Root `VISION.md`, `docs/vision/plite.md`, and the relevant common doctrine.
3. Named Plite source, tests, exports, docs, browser proof, and benchmarks.
4. Only the Plate or collaboration owners directly consuming or challenging
   the proposal.
5. The accepted `editor-audit` artifact when external architecture evidence
   produced the proposal. Reopen reference source only to refresh a stale,
   decision-critical claim.

Do not scan every Plite and Plate package by default. Expand owner by owner when
evidence requires it. External editor inventory and comparison belong to
`editor-audit`; do not rebuild that ledger here. Use `task` for a narrow
implementation bug with no architecture decision.

## Three Phases

### 1. Ground

- Capture outcome, scope, non-goals, and explicit user constraints.
- Read live source and current public teaching/proof surfaces.
- Name the document/runtime/DOM/React/history/collaboration/browser owners
  involved.
- Record baseline behavior or benchmark proof only when it affects the
  decision.

### 2. Decide

Use one concept-level decision ledger:

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

Verdicts: `keep`, `cut`, `rearchitect`, `rename`, `move`, `bridge`, `defer`, or
`gate`.

- Use one row per public concept or runtime responsibility, not one row per
  exported symbol.
- Put boundary, architectural value of the break, objection,
  rejected-alternative, migration, and bridge answers in the same row when they
  describe the same decision.
- A break row must name Plate/collaboration adoption, docs/example adoption,
  and proof.
- `defer` must name missing evidence and the next owner.
- Before locking any row, apply `best-api`'s maximum-value hard-cut gate to the
  concept and the owner above it. If a namespace, plugin, abstraction, layer, or
  package can disappear while an existing substrate authority preserves every
  hard law and independent current job, the verdict is `cut`. Do not plan around
  rejected machinery; compatibility and implementation cost only order
  adoption.
- Prefer direct substrate primitives and deep owners over wrappers and file
  churn.
- Rank worthwhile changes by long-term architectural value. Order execution
  slices separately by dependency; implementation order is not the value rank.

### 3. Prove And Hand Off

- Order implementation into vertical slices with owner, entry condition, exit
  condition, and focused proof.
- Name exact source audits and owner commands. Planning proof validates the
  decision; execution proof validates changed behavior, browser semantics, and
  performance claims.
- Prepare the final handoff in the plan, run `check-complete`, then emit the
  handoff in chat. Do not make pre-checker completion depend on a response that
  has not been sent yet.

## Conditional Work

Add only what the scope triggers:

- High-risk model, operation, runtime, normalization, selection, IME, DOM,
  React subscription, history, collaboration, browser, or generated-contract
  change: record three realistic failures, blast radius, rollback/hard-cut
  answer, and focused proof.
- External editor architecture: consume the accepted `editor-audit` evidence,
  material candidates, and owner routing. Refresh only stale claims that can
  change the plan.
- Issue or PR provenance: include only for issue-backed work or when the plan
  changes a public claim. Do not run ClawSweeper for ordinary architecture.
- Browser/device proof: include only for browser-owned claims and state the
  exact claim class. Raw Appium receipts block only an explicit physical-device,
  device-specific, or release-ready claim. Otherwise keep the raw-device runner
  fail-closed, record that physical receipts are deferred, and do not block an
  unrelated source or API handoff on unavailable hardware.
- Performance: consume a `benchmark` handoff when claiming performance or
  choosing a hot-path architecture. If the causal owner is not measured, route
  a scoped Benchmark packet first. Extremal proof must stay inside an
  end-to-end supported input domain; one helper does not earn permanent
  machinery for a limit adjacent owners cannot carry.
- Fast-path architecture: derive eligibility from evaluated material behavior,
  keep capability declarations with the owning runtime, fail closed for
  unknown behavior, and prove native/model parity without app-owned safety
  flags.
- Docs, behavior law, migration, release, or collaboration rows: include only
  when those owners change.

## Binary Readiness

A standard or deep plan is ready only when all are true:

- every current-state claim has live evidence;
- every touched responsibility has one owner;
- every decision row has a resolved verdict;
- every public break has adoption, docs/example, and proof answers;
- execution slices and focused verification are concrete;
- conditional risk/provenance/browser/benchmark/docs gates are resolved or
  explicitly inapplicable with a reason;
- no decision-changing question or runnable planning owner remains;
- `check-complete.mjs` passes after fresh verification evidence is recorded.

Do not use numeric confidence scores or weighted caps. Missing evidence is an
open gate, not a decimal.

## Accepted-Plan Execution

After explicit acceptance:

1. Read the accepted plan and current source; repair stale plan claims before
   implementation.
2. Create a new one-shot execution goal naming the plan and target owners.
3. Implement the vertical slices in order, using focused proof first.
4. Hard-cut rejected surfaces and sweep callers, exports, tests, docs, examples,
   browser proof, and benchmarks. Leave no compatibility path unless the
   accepted ledger contains a time-bounded private bridge.
5. Run the applicable root `AGENTS.md` gates and applicable review skills.
6. Update the plan with actual evidence and hand off the result.

## Handoff

For quick mode, give the recommendation, strongest evidence, rejected option,
and next owner.

For ready standard/deep plans, link the plan and concisely report:

- ownership and target API/runtime decisions;
- public breaks and Plate/collaboration adoption;
- browser, benchmark, docs, issue, or research decisions that actually apply;
- focused proof and unresolved execution risks;
- execution order and what needs user acceptance.

Stop after planning handoff. Never silently begin implementation.
