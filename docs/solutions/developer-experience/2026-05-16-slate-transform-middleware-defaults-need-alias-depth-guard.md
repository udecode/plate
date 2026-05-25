---
title: Slate transform middleware defaults need an alias depth guard
date: 2026-05-16
category: docs/solutions/developer-experience
module: slate-v2 transform middleware
problem_type: developer_experience
component: tooling
symptoms:
  - extension transform middleware covered only deleteBackward and insertText
  - wrapping every transform registry method risked double-firing alias transforms
  - widening internal casts weakened custom-value callback inference
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags:
  - slate-v2
  - transform-middleware
  - extension-api
  - hard-cut
  - type-contracts
---

# Slate transform middleware defaults need an alias depth guard

## Problem

Slate v2 needed `extension.transforms` to cover every public mutating transform
without turning internal implementation aliases into duplicate public hooks.
The dirty version is easy: wrap every transform and call the old implementation.
That is not enough.

## Symptoms

- `EditorTransformMiddlewareMap` accepted only `deleteBackward` and
  `insertText`.
- A registry-only wrapper would make defaults like `deleteBackward -> delete`
  run a second transform middleware hook during delegation.
- The first internal type fix widened `setNodes` middleware args to plain
  `Node`, which weakened custom-value inference for extension authors.

## What Didn't Work

- Adding more hand-written keys to `EditorTransformMiddlewareMap`. That keeps
  the same drift failure.
- Wrapping transform registry methods without a default-depth guard. Internal
  aliases then look like explicit user calls.
- Fixing internal generic errors by changing public middleware arg types. Public
  DX should stay precise; casts belong at erased internal runtime boundaries.

## Solution

Use three layers:

- A public key and args contract derived from the accepted transform surface.
- A keyed internal middleware command type, e.g. `transform:insertNode`.
- A default-depth guard around default execution.

The guard makes this distinction explicit:

```ts
Editor.deleteBackward(editor)
```

should invoke `transforms.deleteBackward`, and its default implementation may
call lower-level delete logic without also invoking `transforms.delete`.

Public type contracts should assert both directions:

```ts
type Missing = Exclude<EditorPublicTransformMiddlewareKey, Accepted>
type Extra = Exclude<Accepted, EditorPublicTransformMiddlewareKey>
type AssertNever<T extends never> = T
```

Runtime contracts should install middleware for every accepted key and call the
matching `Editor.*` transform. Keep specific `next(overrides)` tests for
high-pressure keys like `insertNode`, and keep double-`next()` rejection tested
once through the generic bridge.

## Why This Works

The public API stays Slate-close: extension authors write
`transforms.insertNode({ next, node, options })`, not command-string handlers.
The runtime still reuses ordered command storage and cleanup, but the no-handler
fast path preserves no-middleware behavior and command metadata.

The default-depth guard is the important bit. It lets internal implementations
compose through existing helpers without making those helper calls observable as
second public transform middleware invocations.

## Prevention

- Do not add one-off transform middleware keys; add key equality contracts.
- When a public wrapper defaults through another public-looking transform, add
  an alias-depth or private-helper boundary before shipping.
- Keep custom-value inference in public args; cast only inside runtime defaults.
- Run explicit contract files, package typecheck, and no-middleware transform
  contracts before marking a hard cut complete.

## Related Issues

- `docs/solutions/developer-experience/2026-04-09-slate-transform-namespaces-should-stay-thin-sugar-over-the-current-engine.md`
- `docs/solutions/developer-experience/2026-05-03-slate-public-root-hard-cuts-need-internal-imports-and-explicit-type-exports.md`
- `docs/solutions/developer-experience/2026-04-29-slate-v2-hard-cuts-must-run-explicit-contract-files.md`
