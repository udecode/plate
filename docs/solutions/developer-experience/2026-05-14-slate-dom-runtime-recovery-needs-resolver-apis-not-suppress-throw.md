---
title: Slate DOM runtime recovery needs resolver APIs, not suppressThrow
date: 2026-05-14
category: docs/solutions/developer-experience
module: Slate v2 DOM and React runtime
problem_type: developer_experience
component: tooling
symptoms:
  - Slate React runtime paths used strict DOM projection APIs plus suppressThrow or catch blocks for recoverable browser gaps.
  - Example code had to catch toDOMRange or findPath even though unresolved DOM is a normal timing state.
  - Public API planning risked teaching try-style helpers instead of an editor-shaped nullable resolver contract.
root_cause: wrong_api
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-dom, slate-react, resolver-api, suppress-throw, dom-bridge]
---

# Slate DOM runtime recovery needs resolver APIs, not suppressThrow

## Problem

Slate needs two DOM bridge modes: strict APIs for direct invariant checks, and
nullable runtime APIs for browser/model projection gaps. Using `suppressThrow`
or local catches in runtime code makes normal browser timing look like exception
plumbing.

## Symptoms

- Runtime paths called `ReactEditor.toSlateRange(..., { suppressThrow: true })`
  for selection import and beforeinput reconciliation.
- Selection export and examples caught strict `toDOMRange` failures to avoid
  crashing during transient DOM gaps.
- A public `tryToDOMRange` style API looked tempting, but it would document the
  wrong mental model.

## What Didn't Work

- Keeping `suppressThrow` as the runtime contract hid errors but left the public
  API vague.
- Adding public `try*` aliases would have made the API look like users should
  catch exceptions for expected editor states.
- Replacing strict APIs with nullable returns would have weakened direct
  developer misuse checks.

## Solution

Keep strict helpers and add nullable resolver helpers:

```ts
editor.dom.toDOMRange(range) // strict, throws on invariant failure
editor.dom.resolveDOMRange(range) // runtime/app path, returns DOMRange | null
```

The implementation added resolver counterparts for DOM nodes, points, ranges,
paths, event ranges, Slate nodes, Slate points, Slate ranges, and range rects.
Runtime code then moved to the resolver API:

```ts
const range = ReactEditor.resolveSlateRange(editor, domSelection, {
  exactMatch: false,
})

if (!range) {
  return
}
```

Examples use the same pattern:

```ts
const rect = editor.dom.resolveRangeRect(target)

if (!rect) {
  return
}
```

Do not keep a deprecated `suppressThrow` shim. `resolve*` is the only nullable
path; strict `to*` and `find*` helpers keep throwing.

## Why This Works

`null` is the right public result for "not currently resolvable": Slate already
uses `Range | null` for absent selections, DOM APIs use null for unavailable
nodes/selections, and runtime code only needs a fail-closed branch.

Strict helpers still expose real misuse:

- detached Slate nodes passed to `toDOMNode`
- invalid direct projection calls
- missing editor provider/window invariants

Runtime helpers handle normal browser timing:

- unmounted DOM during React commits
- stale node maps
- empty or foreign DOM selections
- nested editor ownership boundaries
- example overlay positioning during transient target gaps

## Prevention

- Public app/runtime APIs should be named `resolve*` and return `T | null`.
- Do not add `try*` DOM bridge aliases.
- Do not make strict `to*` or `find*` helpers nullable.
- Remove `suppressThrow` instead of carrying a deprecated compatibility option.
- Lock the contract with tests that prove both halves:
  - strict helpers still throw
  - resolver helpers return `null`
  - no `try*` aliases appear on `editor.dom`
- For browser-sensitive runtime changes, pair package tests with a browser
  selection proof such as `bun test:slate-browser:selection`.

## Related Issues

- [Slate React runtime owner cuts need static inventories and browser proof](./2026-04-27-slate-react-runtime-owner-cuts-need-static-inventories-and-browser-proof.md)
- [Slate mentions portal positioning must fail closed on transient DOM range gaps](../ui-bugs/2026-04-23-slate-mentions-portal-positioning-must-fail-closed-on-transient-dom-range-gaps.md)
- [Slate React focus restore must fail closed on transient DOM point gaps](../logic-errors/2026-04-09-slate-react-focus-restore-must-fail-closed-on-transient-dom-point-gaps.md)
- [DOM selection bridges must stay cheap on selectionchange](../performance-issues/2026-05-08-dom-selection-bridges-must-stay-cheap-on-selectionchange.md)
