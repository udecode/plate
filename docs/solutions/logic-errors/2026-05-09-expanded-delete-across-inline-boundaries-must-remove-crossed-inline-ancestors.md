---
title: Expanded delete across inline boundaries must remove crossed inline ancestors
date: 2026-05-09
category: docs/solutions/logic-errors
module: plite lexical harvest delete-text
problem_type: logic_error
component: testing_framework
symptoms:
  - A selection starting at inline link content and ending outside the link left an empty inline shell after delete.
  - A selection covering visible content from a leading inline link could resolve an invalid inline child point.
  - The first fix removed inline shells even when the selection was wholly inside an inline.
root_cause: logic_error
resolution_type: test_fix
severity: medium
tags: [plite, lexical-harvest, delete, inline, selection]
---

# Expanded delete across inline boundaries must remove crossed inline ancestors

## Problem

Lexical regression 1083 exposed an expanded-delete boundary that Plite did not
prove: deleting a range that starts at inline link content and continues outside
that inline should remove the inline element, not leave an empty shell.

## Symptoms

- A full selection whose visible content starts with a link could leave an
  invalid start point under the removed inline.
- A partial selection like `Say[link:Hello]World`, selecting `HelloWorld`, could
  delete text but leave an empty link plus empty trailing text.
- A broad fix broke existing fixtures where deletion happens wholly inside an
  inline and the empty inline shell is supposed to remain.

## What Didn't Work

- Treating every fully-selected inline as removable. That broke selections whose
  entire range lives inside the inline.
- Copying Lexical's exact browser toolbar setup. The portable invariant is
  delete behavior across inline boundaries, not link creation UI.

## Solution

Add package proof for both accepted rows in
`packages/plite/test/delete-contract.ts`:

- delete a full selection where the visible content starts with an inline link
- delete a partial expanded range that starts at an inline link and ends after it

Then make `delete-text.ts` collect fully-selected inline ancestors only when the
expanded range crosses outside that inline. That keeps legacy inside-inline
delete behavior intact while removing empty inline shells for boundary-crossing
deletes.

## Why This Works

Plite normalizes an empty spacer before leading inline content. The full
selection proof must include that spacer, while the partial proof starts inside
the link. In both accepted rows, the selected inline is not merely emptied; the
selection crosses out of it, so the inline element is part of the deleted
structure.

Selections wholly inside an inline are different. Those should delete inline
contents and preserve the inline shell, which the existing delete fixtures lock.

## Prevention

- When changing delete behavior around inlines, run the dedicated delete
  contract and the `transforms/delete` fixture suite.
- Split "selection inside inline" from "selection crosses inline boundary" in
  tests. They look similar but require opposite structural outcomes.
- Keep browser product setup out of the first proof unless the bug is genuinely
  browser transport.

## Related Issues

- [Lexical history harvest rows need stack-law contracts](../best-practices/2026-05-09-lexical-history-harvest-rows-need-stack-law-contracts.md)
