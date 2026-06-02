---
description: Slate v2 behavior-stability mini-skill. Runs existing editor behavior gates, routes repeated failures to slate-patch, and keeps looping until the surface is stable or blocked.
argument-hint: '[optional behavior surface]'
disable-model-invocation: true
name: slate-ar-stabilize
metadata:
  skiller:
    source: .agents/rules/slate-ar-stabilize.mdc
---

# Slate AR Stabilize

Handle $ARGUMENTS.

Use this when the user wants editor behavior regressions gone: selection,
typing, copy/paste, IME, focus, undo/redo, navigation, browser route behavior,
or native interaction parity.

This is an expert override. The normal broad workflow is
`slate-ar-perfect <surface>`, which should stabilize behavior before perf.

## Contract

Use `autogoal` for broad stabilization requests. For one exact bug, route
directly to `slate-patch`.

If no behavior surface is named, infer the riskiest current behavior surface
from `slate-ar-status`, recent failing gates, and current changed code. If that
cannot be inferred, recommend one concrete gate command instead of asking the
user to choose among skills.

Start with `slate-ar-status`, then:

1. run the narrowest existing behavior gate through `slate-ar-gate`;
2. if the same valid gate fails twice, stop gating and fix with `slate-patch`;
3. if no oracle exists, create it with `slate-patch` or `tdd`;
4. rerun the focused gate after each fix;
5. broaden to the next relevant gate only after focused proof is green.

## Completion

Stop when:

- the named behavior gate is green repeatedly enough for the risk;
- known regressions in scope have focused tests;
- fixes are verified by focused commands;
- broad behavior proof is green when the touched surface justifies it.

Do not route to perf until stabilization is green.

## Handoff

Report failed signatures, fixes, gates run, repeat count, remaining skipped
behavior families, and next owner.
