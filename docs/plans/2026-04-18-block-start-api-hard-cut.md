# BlockStart API Hard Cut

## Goal

Remove the leaky `blockStart` rule contract where custom rules have to manually
thread `range` and other base match data through `resolveMatch`. Core should
provide the base block-start match payload by default and merge custom match
extras on top.

## Phases

- [in_progress] Inspect current core input-rule types/runtime and related learnings.
- [pending] Add or adjust core tests to lock merged block-start match behavior.
- [pending] Implement the hard cut in core.
- [pending] Simplify affected rules in list and basic-nodes to use the new API.
- [pending] Verify with targeted tests, build, typecheck, and lint.
- [pending] Document the learning if the API cut exposes a reusable rule.

## Findings

- `blockStart` already had a base match shape in core: `{ range, text }`.
- The leaky part was `resolveMatch`, which replaced that base payload instead of
  contributing extras on top.
- That forced custom rules to manually preserve `range`, which is why list and
  blockquote rules accumulated pointless `resolveMatch: ({ range }) => ({ range
  })` boilerplate.
- The durable API cut is: `resolveMatch` returns extras, core merges them with
  the base block-start match before `apply`.

## Progress

- Loaded `hard-cut`, `north-star`, `major-task`, `learnings-researcher`,
  `planning-with-files`, `testing`, `tdd`, and `task`.
- Framed this as a core API fix, not another local rule patch.
- Added a core regression proving custom block-start extras merge with the base
  match payload.
- Hard-cut the API in core types and runtime.
- Simplified modern and classic list rules plus blockquote rules to stop
  threading `range` manually.
- Added the API learning in
  `docs/solutions/best-practices/block-start-resolve-match-should-return-extras-while-core-provides-base-match.md`.

## Errors

- None yet.
