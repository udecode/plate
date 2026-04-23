---
date: 2026-04-14
problem_type: logic_error
component: slate
root_cause: logic_error
title: Slate v2 delete selection normalization must distinguish inline spacers from inline targets
tags:
  - slate-v2
  - delete
  - selection
  - inline
  - transforms
severity: high
---

# Slate v2 delete selection normalization must distinguish inline spacers from inline targets

## What happened

`delete-text.ts` got the content recovery back to green, but the legacy delete
audit stayed red on a handful of caret rows.

The bad pattern was simple: one generic post-delete selection normalizer kept
trying to answer every inline-boundary case with the same rule.

That collapsed three different situations into one:

1. a non-collapsed range delete that should land in the next surviving inline
2. a collapsed point delete that should stay on the empty spacer text between
   inlines
3. a collapsed forward delete before an inline that should land inside the
   surviving inline

## What didn't work

- trusting stale point refs after content removal
- using one generic “jump to the next inline” rule for both range and point
  deletes
- fixing one legacy row at a time without rerunning the full delete audit

Those patches just moved the failure around:

- first the audit crashed on dead paths
- then the content was right but caret rows were wrong
- then a fix for one range row regressed collapsed point rows

## What fixed it

The fix was to split the post-delete selection rules by shape instead of
pretending there was one universal inline rule.

`delete-text.ts` now does three separate things:

1. resolves surviving points defensively after content removal instead of
   trusting dead refs
2. keeps the generic final-point normalizer conservative for collapsed
   point-delete paths
3. adds explicit helper rules for the two real special cases:
   - move a non-collapsed range delete into the next surviving inline only
     when the delete actually collapsed across an inline boundary
   - move a collapsed forward delete into the next inline only when the cursor
     is at the end of a real text node immediately before that inline

It also keeps the legacy-complex-script branch from overwriting the caret after
the Thai-character reinsertion path.

## Why this works

The surviving selection point is not just “the next inline-looking place”.

Inline delete rows care about whether the current point is:

- a real text leaf that still owns the cursor
- an empty spacer text node that should keep the cursor
- or a leading empty spacer that exists only because the surviving inline now
  owns the logical caret target

Those are different contracts. Once the code treats them separately, the
package suite and the full legacy transform audit stop fighting each other.

## Reusable rule

For Slate v2 delete normalization:

- do not use one generic inline-boundary caret hop for both range and point
  deletes
- after structural delete work, classify the surviving point first:
  text owner, spacer keeper, or inline target
- rerun the full legacy transform audit after any delete-selection refactor;
  local package tests alone are not enough

## Related issues

- [Slate v2 collapsed delete should reuse the before/after location seam](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-07-slate-v2-collapsed-delete-should-reuse-before-after-location-seam.md)
- [Slate direct-audit green does not mean mirrored if the harness shapes output](/Users/zbeyens/git/plate-2/docs/solutions/workflow-issues/2026-04-14-slate-direct-audit-green-does-not-mean-mirrored-if-harness-shapes-output.md)
