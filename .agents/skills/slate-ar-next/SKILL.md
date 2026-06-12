---
description: Slate v2 Autoresearch daily driver. Reads current state, chooses the best next owner, and runs one safe next step without making the user pick quality/gate/perf/patch/finalize details.
argument-hint: '[optional surface or hint]'
disable-model-invocation: true
name: slate-ar-next
metadata:
  skiller:
    source: .agents/rules/slate-ar-next.mdc
---

# Slate AR Next

Handle $ARGUMENTS.

Use this as the default "do the next useful Slate v2 AR thing" command.
The user should not need to remember whether the next owner is status, gate,
patch, perf, quality, or finalize.

This is the daily driver, not a new lane. If the next step is clearly broad,
route to `slate-ar-perfect` instead of making the user assemble `fast`,
`stabilize`, `quality`, and `gate` by hand.

## Contract

Load `slate-ar` first and inspect read-only status before choosing any mutating
owner.

Default behavior:

1. run `slate-ar-status` behavior;
2. identify the strongest current blocker or opportunity;
3. choose exactly one next owner;
4. run one safe step only;
5. report metric/check result and the next recommended owner.

If the current state is too broad for one useful step and the user asked to
continue improving the surface, start or recommend `slate-ar-perfect <surface>`
instead of stopping at a menu of expert skills.

## Routing

- Safety blocker or dirty/finalization friction: report it unless the safe fix
  is obvious and local to AR scaffolding; ship/readiness friction routes to
  `slate-ar-ship`.
- Known correctness failure: `slate-patch`.
- Existing behavior proof needs repeatability: `slate-ar-gate`.
- Missing behavior oracle: `slate-patch` or `tdd`.
- Clear perf target: `slate-ar-perf`.
- Broad API/DX/architecture/test gap with unknown prior art or owner:
  `slate-research`.
- Accepted quality-gap checklist: `slate-ar-quality`.
- Broad surface improvement, mixed bugs/perf/testing/API, or "absolute best":
  `slate-ar-perfect <surface>`.
- Ambiguous loop shape: `slate-ar-recipe`.
- Review/readiness path: `slate-ar-ship`.

If the chosen path becomes multi-step, stop after the first meaningful packet or
fix unless the user asked for a durable loop. Do not create a goal by default.

Do create or continue a goal when the user asks to keep going until a measurable
state, parity, stability, or "perfect" surface is reached. In that case,
`slate-ar-next` should hand off to `slate-ar-perfect`, `slate-ar-fast`, or
`slate-ar-stabilize` with the inferred surface.

## Handoff

Report:

- active session and target;
- owner chosen and why;
- one step performed;
- metric/check result;
- next owner or blocker.
