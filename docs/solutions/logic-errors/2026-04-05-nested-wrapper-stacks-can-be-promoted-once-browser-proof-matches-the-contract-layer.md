---
date: 2026-04-05
problem_type: logic_error
component: documentation
root_cause: logic_error
title: Nested wrapper stacks can be promoted once browser proof matches the contract layer
tags:
  - slate-v2
  - wrapper-stack
  - browser-proof
  - list-item
  - quote
severity: medium
---

# Nested wrapper stacks can be promoted once browser proof matches the contract layer

## What happened

After top-level wrapper block units were green, nested wrapper stacks still sat
in an awkward place:

- the contract layer already had a coherent story
- but the browser layer had not yet proved the same shape end to end

Until that happens, the shape is still a probe, not a settled capability.

## What fixed it

The promotion bar was simple:

- add a real browser surface for the nested quote + list-item wrapper stack
- prove copy/paste round-trip through the public `slate-browser` harness
- make sure the browser result matches the existing contract-layer semantics

Once that was green, the shape could finally move from “interesting probe” to
“proved state”.

## Why this works

The contract layer is good for telling you whether the core story is coherent.

The browser layer is what tells you whether that story survives contact with the
actual DOM/runtime stack.

A wrapper-stack shape should only be promoted when both agree.

## Reusable rule

Do not promote a new shape just because the core tests are green.

Promote it only when:

- the contract layer is green
- the DOM boundary is green
- the browser proof is green

Until then, call it what it is: a probe.

## Related issues

- [2026-04-05-wrapper-block-units-with-inner-paragraphs-can-reuse-the-current-block-geometry-model-at-top-level.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-05-wrapper-block-units-with-inner-paragraphs-can-reuse-the-current-block-geometry-model-at-top-level.md)
- [2026-04-04-block-geometry-should-flatten-recursive-text-leaves-before-rebasing-richer-inline-shapes.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-block-geometry-should-flatten-recursive-text-leaves-before-rebasing-richer-inline-shapes.md)
