---
module: Suggestion
date: 2026-04-08
problem_type: logic_error
component: tooling
symptoms:
  - "Backspace in suggestion mode did nothing when the previous node was a mention"
  - "Inline links were marked for removal, but mention-shaped inline voids were skipped"
  - "After the first fix, adjacent text nodes were also marked and the cursor landed too far left"
  - "Continuing to delete backward from the left edge of an inline void created a second suggestion card instead of extending the first one"
  - "Deleting an expanded selection across text, an inline void, and trailing text stopped at the inline void and collapsed the cursor to the wrong edge"
  - "Replacing an expanded selection across text, an inline void, and trailing text could loop forever in the browser"
  - "Backspace at the start of a paragraph marked the previous block as a generic remove suggestion instead of a remove line break"
  - "Backspace at the start of a paragraph after a solitary block void marked that void as a remove line break instead of a normal block removal"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - suggestion
  - mention
  - backspace
  - inline-void
  - deletebackward
  - regression
---

# Suggestion `deleteBackward` must mark inline voids

## Problem

In suggestion mode, pressing backspace after a mention first did nothing, and after the initial range fix it still behaved like a character delete instead of an inline-void delete.

That caused seven user-visible bugs around deletion suggestions: adjacent text could be marked for removal, the cursor could jump past an inline void's left edge, continued deletion could fork into a second suggestion card, expanded selections could stop at the inline void instead of consuming the whole selected range, replace-selection flows could loop forever, paragraph-boundary deletes could skip the red line-break suggestion shape entirely, and solitary block voids could be mislabeled as line breaks.

## Symptoms

- Backspace after a mention left the document unchanged in suggestion mode
- The new regression test in `withSuggestion.spec.tsx` failed because the mention node never received suggestion metadata
- An expanded selection like `before <anchor>text <mention> after<focus> text` left `text ` outside the remove suggestion and collapsed the cursor at the mention edge
- Typing a replacement character over that same expanded selection could hang because the forward delete loop kept selecting the same point beside the inline void

## What Didn't Work

- Treating `editor.api.string(range)` as the only signal for whether a delete range had meaningful content
- Reusing text-based delete assumptions for markable inline void elements

## Solution

Keep the empty-string early exit only for ranges that are both string-empty and inline-node-free.

```ts
const inlineRange = reverse
  ? { anchor: pointTarget, focus: pointCurrent }
  : { anchor: pointCurrent, focus: pointTarget };

const str = editor.api.string(inlineRange);
const hasInlineNode = editor.api.some({
  at: inlineRange,
  match: (n) => ElementApi.isElement(n) && editor.api.isInline(n),
});

if (str.length === 0 && !hasInlineNode) break;
```

Then special-case inline void deletion so it behaves like one semantic unit instead of a character loop:

```ts
const inlineVoidEntry = editor.api.void({
  at: pointNext,
  mode: 'highest',
});

if (inlineVoidEntry && editor.api.isInline(inlineVoidEntry[0])) {
  editor.tf.setNodes(
    {
      [getSuggestionKey(id)]: { createdAt, id, type: 'remove', userId },
      suggestion: true,
    },
    { at: inlineVoidEntry[1] }
  );

  const beforeInlineVoid = editor.api.before(pointNext);

  if (beforeInlineVoid) {
    editor.tf.select(beforeInlineVoid);
  }

  break;
}
```

For expanded selections, continue the delete loop after marking the inline void when the original target point is still outside that inline element.

When deleting backward, keep walking from the inline void's left edge:

```ts
const beforeInlineElement = editor.api.before(inlineEntry[1]);
const targetIsInsideInlineElement =
  PathApi.equals(inlineEntry[1], pointTarget.path) ||
  PathApi.isAncestor(inlineEntry[1], pointTarget.path);

if (beforeInlineElement) {
  editor.tf.select(beforeInlineElement);

  if (!targetIsInsideInlineElement) {
    continue;
  }
}

break;
```

When deleting forward, advance past the inline void instead of reselecting its left edge:

```ts
const afterInlineElement = editor.api.after(inlineEntry[1]);

if (afterInlineElement) {
  editor.tf.select(afterInlineElement);

  if (!PointApi.equals(afterInlineElement, pointTarget)) {
    continue;
  }
}
```

Also teach `findSuggestionProps` to reuse remove metadata from adjacent inline suggestion elements when there is no adjacent text suggestion:

```ts
const getInlineElementEntry = (point: Point) =>
  editor.api.above<TElement>({
    at: point,
    match: (node) =>
      ElementApi.isElement(node) &&
      editor.api.isInline(node) &&
      !!api.suggestion.nodeId(node),
  });
```

Use that fallback for `nextPoint` and `prevPoint` before generating a fresh suggestion id.

For paragraph-boundary deletes, keep the cross-block suggestion shape aligned with the existing merge semantics. Mergeable text blocks should still use the dedicated line-break suggestion, but solitary block voids should stay ordinary block removals:

```ts
const isPreviousBlockVoid =
  editor.api.isVoid(previousAboveNode[0]) &&
  !editor.api.isInline(previousAboveNode[0]);

editor.tf.setNodes(
  {
    [KEYS.suggestion]: {
      id,
      createdAt,
      type: 'remove',
      userId,
      ...(isPreviousBlockVoid ? {} : { isLineBreak: true }),
    },
  },
  { at: previousAboveNode[1] }
);
```

Add regression coverage with a mention-shaped inline void in:

- `packages/suggestion/src/lib/withSuggestion.spec.tsx`
- `packages/suggestion/src/lib/queries/findSuggestionProps.spec.ts`
- Keep one expanded-selection regression where the selection spans left text, the inline void, and right text
- Keep one replace-selection regression where `insertText(...)` runs over that same expanded inline-void range

## Why This Works

Mention nodes are inline voids, so the delete range around them can be semantically deletable even when its string representation is empty.

Links still passed before the fix because their inline text made `editor.api.string(range)` non-empty. Mentions failed because the same range contained an inline node but no string content.

By checking for inline nodes before bailing out, the delete path no longer skips string-empty inline voids like mentions.

By then treating the inline void as a single deletion target, the transform avoids a second loop iteration that would otherwise spill remove marks into neighboring text nodes. Selecting `editor.api.before(pointNext)` places the cursor exactly at the mention's left edge.

Expanded selection deletes need one extra rule: stopping after the inline void is only correct when the original delete target lives inside that inline element. When the original selection started farther left, the transform must keep walking after marking the inline void so the remaining selected text becomes part of the same remove suggestion and the cursor collapses back to the true selection start.

The same ownership rule applies in the forward direction. If the loop reselects the inline void's left edge while the real target is farther right, the next iteration finds the same inline void again and never makes progress. Advancing to `editor.api.after(inlineEntry[1])` breaks that cycle and lets replace-selection flows finish.

By reusing adjacent inline suggestion metadata in `findSuggestionProps`, the next backspace keeps extending the same remove suggestion instead of starting a new discussion card for the neighboring text.

By tagging only mergeable cross-block removes with `isLineBreak: true`, the existing `acceptSuggestion` and `rejectSuggestion` logic still takes the paragraph-merge path where it should. Block voids such as images or table-of-contents nodes stay ordinary block removals, so accepting them deletes the void instead of trying to merge through it.

## Verification

These checks passed:

```bash
bun test packages/suggestion/src/lib/withSuggestion.spec.tsx
bun test packages/suggestion/src/lib/queries/findSuggestionProps.spec.ts
bun test apps/www/src/registry/ui/block-discussion-index.spec.tsx
pnpm install
pnpm turbo build --filter=./packages/suggestion --filter=./apps/www
pnpm turbo typecheck --filter=./packages/suggestion --filter=./apps/www
pnpm lint:fix
```

## Prevention

- Do not use `editor.api.string(range)` as the only proxy for deletability when inline void or markable void nodes are involved
- When delete behavior differs between links and mentions, compare both the string content and the node shapes in the range
- When an inline void should delete as one semantic unit, stop the character loop after marking that node
- When an expanded selection crosses an inline void, only stop after marking that node if the original target point is inside the inline void subtree
- When an expanded forward delete crosses an inline void, advance the traversal point to the inline void's right edge before continuing
- If the cursor can continue deleting from the edge of an inline void, merge against adjacent inline suggestion elements before minting a new suggestion id
- If a delete crosses a paragraph boundary, use the dedicated line-break suggestion shape only for mergeable block boundaries, not for solitary block voids
- Keep at least one regression test for suggestion-mode deletion around an inline void element, including cursor placement and neighboring-text assertions

## Related Issues

- `docs/solutions/logic-errors/2026-04-05-reject-suggestion-must-clear-inline-element-metadata.md`
