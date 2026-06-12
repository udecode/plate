---
description: Slate v2 broad improvement mini-skill. Uses Autogoal plus Slate AR routing to improve a named surface across quality, bugs, behavior proof, and perf without requiring the user to pick sub-skills.
argument-hint: '<surface: pagination | huge document | editor behavior | API/DX | etc.>'
disable-model-invocation: true
name: slate-ar-perfect
metadata:
  skiller:
    source: .agents/rules/slate-ar-perfect.mdc
---

# Slate AR Perfect

Handle $ARGUMENTS.

Use this when the user wants a Slate v2 surface made genuinely good, not one
isolated packet. This is the high-level loop for "perfect pagination",
"perfect huge document perf", "perfect editor behavior", and similar asks.

This is the main "absolute best architecture / DX / API / testing / perf"
workflow. The user should not need to manually call `slate-ar-fast` or
`slate-ar-stabilize` after `slate-ar-perfect`; those are internal or expert
override lanes.

## Contract

Use `autogoal` for durable work. The goal must name:

- the surface;
- measurable or auditable completion threshold;
- architecture/API/DX acceptance rows when relevant;
- behavior and perf gates;
- boundaries;
- blocked stop condition.

Keep the goal short. Put the real checklist in the goal plan.

## Routing

Start with `slate-ar-status`, then choose owners in this order:

1. `slate-research` for unknown current-state gaps, external prior art, OSS
   evidence, or source synthesis across API, DX, architecture, examples, tests,
   and perf surfaces;
2. `slate-ar-quality` for accepted quality-gap checklist execution;
3. `slate-plan` only when the remaining issue needs public API/runtime design;
4. `slate-patch` for known bugs or missing behavior oracles;
5. `slate-ar-gate` for existing editor behavior proof;
6. `slate-ar-perf` for benchmark-backed perf targets;
7. `slate-ar-gate` again for final broad no-regression proof.

Do not accept a perf win while native behavior regresses. Faster broken editor
behavior is not progress.

Perf waits for behavior stability unless the perf benchmark itself is the only
way to reproduce the behavior failure. If perf work exposes a correctness bug,
route to `slate-patch`, fix it, then resume the perf target.

## Completion

Stop when the surface has:

- accepted architecture/API/DX gaps implemented, routed to `slate-plan`, or
  consciously deferred with evidence;
- no known P0/P1 behavior regressions in scope;
- relevant behavior gates green or explicitly N/A with evidence;
- relevant perf targets promoted or plateaued with correctness green;
- final broad no-regression proof green when the surface touches editor
  behavior;
- goal plan completion check green.

Completion does not mean creating `autoresearch-review/*` branches. Stay on the
source branch, normally `v2`, and use `slate-ar-ship` readiness previews unless
the user explicitly asks for review branches.

## Handoff

Report:

- goal plan path;
- surface and completion threshold;
- packets/fixes/gates run;
- accepted deferrals;
- residual risks.
