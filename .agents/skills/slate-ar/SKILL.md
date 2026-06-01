---
description: Wrap Codex Autoresearch for Slate v2 measured loops. Delegates generic packet/dashboard/finalization mechanics to codex-autoresearch while enforcing `.tmp/slate-v2`, Slate correctness routing, target registry context, and short operator modes.
argument-hint: '[continue | status | finalize preview | research <topic> | quality gap | measured Slate v2 target]'
disable-model-invocation: true
name: slate-ar
metadata:
  skiller:
    source: .agents/rules/slate-ar.mdc
---

# Slate AR

Handle $ARGUMENTS.

Use this as the Slate v2 wrapper around `codex-autoresearch:codex-autoresearch`.
It is not the perf lane. `slate-ar` owns Slate-specific defaults for any measured
Autoresearch loop: target cwd, session files, dashboard/status/finalization
entrypoints, correctness routing, and handoff boundaries.

Performance optimization lives in `slate-ar-perf`.

## Use When

- The user invokes `slate-ar`.
- The user invokes a wrapper shortcut: `slate-ar-status` or
  `slate-ar-finalize`.
- The user invokes a focused wrapper: `slate-ar-quality`, `slate-ar-gate`, or
  `slate-ar-recipe`.
- A Slate v2 task needs durable Autoresearch loop state, ASI logging,
  keep/discard decisions, dashboard visibility, quality-gap research, or
  packet/resume discipline.
- A correctness repair or architecture plan is looping and needs measured
  hypothesis tracking after the direct owner has provided proof surfaces.
- The user asks for Slate v2 Autoresearch status, continuation, dashboard,
  finalization preview, deep research, or quality-gap handling.

## Do Not Use When

- The bug is a direct correctness failure with no oracle. Use `slate-patch`.
- The output is an architecture/API proposal for user review. Use `slate-plan`.
- The request is specifically performance/max-speed/pagination/virtualization
  optimization. Use `slate-ar-perf`.
- The target is Plate product code instead of raw Slate v2.

## Relationship To Other Lanes

- `codex-autoresearch:codex-autoresearch`: owns generic setup, packets, logging,
  dashboard, deep research, quality-gap, drift, finalization, and CLI mechanics.
- `slate-ar`: wraps that engine for Slate v2 cwd, state, correctness routing,
  and operator modes.
- `slate-ar-quality`: runs deep-research / quality-gap loops for Slate v2
  API/DX/architecture/test coverage gaps.
- `slate-ar-gate`: repeats and logs existing test/typecheck/browser/editor
  behavior gates.
- `slate-ar-recipe`: chooses or previews Codex Autoresearch recipes.
- `slate-ar-perf`: adds Slate v2 performance target policy, benchmark registry,
  exactness gates, and fastest-safe stop rules.
- `slate-patch`: fixes correctness bugs and creates missing oracles.
- `slate-plan`: decides public architecture/API shape.

Do not duplicate Codex Autoresearch mechanics here. Load
`codex-autoresearch:codex-autoresearch` for command details, packet lifecycle,
dashboard operation, ASI syntax, quality-gap internals, stale-packet recovery,
or finalization rules.

## Slate Defaults

- Target cwd is `.tmp/slate-v2`.
- `plate-2` is the control plane for package shortcuts and target registry
  commands. It does not prove Slate v2 runtime behavior.
- Active loop truth lives in `.tmp/slate-v2/autoresearch.*` and
  `.tmp/slate-v2/autoresearch.research/**`.
- `benchmarks/targets/slate-v2.json` is supporting context for target-backed
  loops; perf-specific registry policy lives in `slate-ar-perf`.
- Slate correctness beats local metric movement. A packet that breaks editor
  behavior is `checks_failed` or `discard`, not `keep`.
- Do not run `slate-plan` pass schedules inside Autoresearch.

## Natural Modes

Interpret short user text before picking commands:

- `continue`, `resume`: continue the current Slate AR session only. Do not
  initialize a new target unless the session is missing or stale and the target
  is unambiguous.
- `status`, `dashboard`, `where are we`: read-only status mode. Use
  `slate-ar-status` behavior. Do not run packets or edit files.
- `finalize`, `finalize preview`, `review branches`: finalization mode. Use
  `slate-ar-finalize` behavior. Preview first.
- `research`, `quality gap`, `improve quality`, `find gaps`: use generic Codex
  Autoresearch deep-research / quality-gap flow through `slate-ar-quality`.
- `gate`, `proof`, `repeat`, `full editor behavior`, `navigation`, `typing`:
  route to `slate-ar-gate`.
- `recipe`, `recipes`, `what loop`, `setup recipe`: route to
  `slate-ar-recipe`.
- `fast`, `fastest`, `max perf`, `pagination`, `virtualization`, `benchmark`:
  route to `slate-ar-perf`.

If a mutating Slate AR loop is already running in another thread, default to
read-only status unless the user explicitly says this thread owns writes.

## Command Surface

Use the `slate-ar*` skills as the operator entrypoints. Do not invent package
scripts for Slate AR; Plate only exposes benchmark target scripts.

For exact shell execution, load `codex-autoresearch:codex-autoresearch` and use
its CLI fallback with `--cwd .tmp/slate-v2`. For target-backed setup from the
Plate control repo, use:

```bash
pnpm bench:targets:dry-run -- <target-id>
node tooling/scripts/bench-targets.mjs autoresearch-init <target-id>
```

## Start Or Resume

1. Identify the exact Slate v2 surface and whether this is generic AR,
   performance, correctness, or architecture work.
2. Route before editing:
   - correctness failure or missing oracle: `slate-patch`;
   - existing proof/gate repeatability: `slate-ar-gate`;
   - broad quality-gap research: `slate-ar-quality`;
   - recipe selection/setup-plan: `slate-ar-recipe`;
   - performance optimization: `slate-ar-perf`;
   - public API/runtime redesign: `slate-plan`;
   - measured loop, quality gap, status, or finalization: continue here.
3. Read existing `.tmp/slate-v2/autoresearch.*` session files when present.
4. Use generic Codex Autoresearch for onboarding, recommendation, doctor,
   dashboard, packet, log, stale-packet, segment, and finalization mechanics.
5. Keep Slate-specific routing in force after every packet:
   - `keep` only when the measured target improves and Slate correctness checks
     pass;
   - `checks_failed` or `discard` when native selection, input ordering, IME,
     copy, paste, undo, follow-up typing, focus, or browser behavior regresses;
   - `slate-patch` when correctness fails without an existing oracle;
   - `slate-plan` when the remaining win needs API/runtime redesign.

## Quality-Gap Research

Use generic Codex Autoresearch deep-research and quality-gap workflow. Slate
additions:

- keep sources under `.tmp/slate-v2/autoresearch.research/**`;
- turn accepted implementation gaps into Slate proof rows or target rows;
- route test/behavior suite gaps with an existing oracle to `slate-ar-gate`;
- route perf-specific gaps to `slate-ar-perf`;
- route correctness gaps without an oracle to `slate-patch`;
- route public API/DX architecture gaps to `slate-plan`.

`quality_gap=0` closes the current accepted checklist only. It does not prove
that no more Slate gaps exist.

## Finalization Mode

Use generic Codex Autoresearch finalization flow. Slate defaults:

- run Codex Autoresearch `finalize-preview --cwd .tmp/slate-v2` first;
- exclude `autoresearch.*`, `autoresearch.research/**`, dashboard exports, and
  finalization scratch files unless the user asks to review session artifacts;
- use Codex Autoresearch `finalize-current-tree --cwd .tmp/slate-v2` when the
  current tree is the review unit because kept commits were later corrected,
  bundled, or reverted;
- branch creation, cleanup, commit, push, and PR work require explicit user
  approval.

## Handoff

Report:

- active cwd and session;
- measured target or quality-gap slug;
- baseline/latest/best when available;
- kept/discarded/crashed/checks-failed packet counts;
- correctness checks used;
- dashboard URL, if served;
- next recommended packet, route, or blocker.
