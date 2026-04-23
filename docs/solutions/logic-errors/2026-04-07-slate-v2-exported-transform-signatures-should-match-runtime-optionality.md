---
date: 2026-04-07
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 exported transform signatures should match runtime optionality
tags:
  - slate-v2
  - transforms
  - typescript
  - api
severity: medium
---

# Slate v2 exported transform signatures should match runtime optionality

## What happened

The runtime and docs had already moved `delete(...)`, `wrapNodes(...)`,
`unwrapNodes(...)`, and `liftNodes(...)` to optional `at` / optional options.

But the exported `Transforms` TypeScript surface still typed some of those
options as required.

That is exactly how a core surface looks “done” in code review while still
lying to consumers and agents.

## What fixed it

The exported `TransformsApi` signatures were aligned with the actual runtime:

- `delete(options?)`
- `liftNodes(options?)`
- `wrapNodes(..., options?)`
- `unwrapNodes(options?)`

## Reusable rule

For Slate v2 public API freeze work:

- exported TS signatures must match the callable runtime surface exactly
- docs/runtime parity is not enough if the types still lie

If the type layer says “required” while the runtime says “optional”, the API is
not frozen. It is inconsistent.
