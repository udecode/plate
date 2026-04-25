---
title: Input rule context should provide lazy snapshot getters
date: 2026-04-13
category: best-practices
module: core
problem_type: best_practice
component: tooling
symptoms:
  - Input rule `resolve()` implementations kept repeating the same block-start
    prelude across packages.
  - Rules that only needed one cheap lookup still had to spell out multiple
    `editor.api.range`, `editor.api.string`, `editor.api.before`, or
    `editor.api.block` calls by hand.
  - Trying to keep the runtime registry fully generic over payload types pushed
    TypeScript into variance fights.
root_cause: inadequate_documentation
resolution_type: code_change
severity: medium
tags: [input-rules, api-design, performance, typing, plate]
---

# Input rule context should provide lazy snapshot getters

## Problem

Package-owned input rules were repeating the same `resolve()` setup over and
over: check collapsed selection, read text from block start, inspect adjacent
characters, then do the real semantic match.

That duplication was noisy, and it also made the runtime API worse than it had
to be.

## Symptoms

- Blockquote, heading, code fence, list, and block math rules all repeated the
  same block-start lookup pattern.
- Link paste autolink needed text-before-selection, but had to reimplement that
  locally.
- A naive “just put every derived value on the context up front” design would
  pay for lookups that many rules never use.
- A naive “keep the runtime registry precisely generic over every rule payload”
  design broke down once heterogenous rules had to live in one container.

## What Didn't Work

- Leaving every rule to hand-roll the same selection and block-start prelude.
- Reintroducing a `createInputRule` DSL just to hide repeated lookup code.
- Making the shared runtime own feature semantics like link, math, or list
  matching.
- Pretending the stored rule registry could stay strongly generic over every
  payload shape without widening at the runtime boundary.

## Solution

Extend the shared input-rule context with lazy cached getters computed from the
input-event snapshot:

```ts
type SelectionInputRuleContext<TEditor extends SlateEditor = SlateEditor> = {
  editor: TEditor;
  isCollapsed: boolean;
  getBlockEntry: () => NodeEntry | undefined;
  getBlockStartRange: () => TRange | undefined;
  getBlockStartText: () => string | undefined;
  getTextBeforeSelection: () => string;
  getCharBefore: () => string | undefined;
  getCharAfter: () => string | undefined;
};
```

The runtime creates those lazily and caches the result for the current input
event. That keeps the fast path cheap while still cutting repeated rule code.

Then rules use the context instead of rebuilding the same lookup chain:

```ts
resolve: ({ getBlockStartText, isCollapsed, text }) => {
  if (text !== ' ' || !isCollapsed) return;

  return getBlockStartText() === '>' ? true : undefined;
}
```

For the runtime registry, keep authoring typed through `defineInputRule(...)`,
but widen the stored container shape to target-specific runtime rules. The
container only needs to know:

- which input lane the rule belongs to
- how to call `resolve`
- how to call `apply`
- what trigger or MIME gate applies

It does not need to preserve the exact payload generic at storage time.

## Why This Works

Lazy getters solve the right problem.

- Rules that do not need block-start or character lookups pay nothing for them.
- Rules that do need them stop repeating the same `editor.api.*` ceremony.
- The getter values stay tied to the input-event snapshot instead of drifting
  with later editor mutations.
- Package semantics stay package-owned. Core only provides shared input-state
  access, not feature-specific matching logic.

The widened runtime registry also solves the right typing problem.

- Rule authors still get typed `resolve` and `apply` through `defineInputRule`.
- The runtime can store heterogenous rules without lying about exact payload
  compatibility.
- TypeScript stops fighting the registry boundary where the payload generic is
  irrelevant anyway.

## Prevention

- If multiple rules repeat the same block-start or adjacent-character lookup,
  put the lookup on the shared input-rule context as a lazy cached getter.
- Keep getter semantics snapshot-based for the current input event, not live and
  mutable after `apply()` starts editing the document.
- Do not build a second rule-authoring DSL just to hide repeated lookups.
- Keep package-specific semantics in package-local helpers. Core should expose
  shared editor-state access, not link/math/list behavior.
- At the runtime storage boundary, widen rule shapes intentionally instead of
  forcing the heterogenous registry to preserve exact payload generics.

## Related Issues

- [autoformat-insert-input-rules-should-resolve-once-and-pass-payload.md](./autoformat-insert-input-rules-should-resolve-once-and-pass-payload.md)
