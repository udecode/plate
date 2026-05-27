---
title: V2 HTML paste formatting should stay app-owned on explicit inline elements
date: 2026-04-06
category: docs/solutions/logic-errors
module: Slate v2 HTML paste surface
problem_type: logic_error
component: documentation
symptoms:
  - "The `paste-html` surface only preserved paragraphs and links, so `strong`, `em`, and `code` formatting disappeared on paste"
  - "The obvious expansion path tempted the runtime toward generic mark support instead of a narrower app-owned seam"
  - "The current `EditableBlocks` segment seam did not carry text-node mark metadata, so a runtime-mark implementation would have widened the wrong layer"
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags:
  - slate-v2
  - slate-react-v2
  - paste-html
  - html
  - inline-elements
  - phase-8
---

# V2 HTML paste formatting should stay app-owned on explicit inline elements

## Problem

The next honest Phase 8 expansion for `paste-html` was a small formatting set:
`strong`, `em`, and `code`.

The dangerous version of that work was obvious too:

- treat it as a reason to add generic mark support to the runtime
- widen `slate-dom`
- or pretend legacy rich HTML parity was already back

That would have spent proof budget in the wrong layer.

## Symptoms

- The browser proof for `paste-html` could paste a paragraph with a link, but
  `<strong>`, `<em>`, and `<code>` disappeared.
- The current `EditableBlocks` seam could render app-owned inline elements
  cleanly, but did not expose text-node mark metadata through `renderSegment`.
- The cleanest way to make the red test pass was not the same thing as the
  most durable package move.

## What Didn't Work

- Treating the problem as “`slate-react` needs general mark rendering now”.
  That would have widened the runtime seam for one example-level policy.
- Treating it as a `slate-dom` clipboard problem. The browser boundary was
  already fine; the missing piece was how the app wanted to represent the pasted
  formatting subset.
- Flattening link children back to plain text. That would have kept the old
  narrow paste lane and made richer inline descendants impossible inside links.

## Solution

Keep the behavior app-owned and explicit.

The `paste-html` surface now:

- deserializes `STRONG`, `EM`, and `CODE` into explicit inline element nodes
- keeps links as explicit inline elements too
- renders the whole subset through the example-layer inline renderer
- leaves core, DOM, and runtime package ownership unchanged

That means the supported HTML subset is now:

- paragraph
- link
- `strong`
- `em`
- `code`

The critical seam was:

```ts
case 'STRONG':
  return [createFormatNode('strong', children)]
case 'EM':
  return [createFormatNode('em', children)]
case 'CODE':
  return [createFormatNode('code', children)]
```

and the matching inline renderer:

```tsx
if (isFormatElement(element)) {
  const Tag = getFormatTag(element);

  return (
    <EditableElement as="span" isInline>
      <Tag>{children}</Tag>
    </EditableElement>
  );
}
```

## Why This Works

This preserves the real package boundary:

- app code decides which pasted HTML subset is worth supporting
- `slate-react` provides the runtime seam for app-owned rendering
- `slate-dom` stays the browser transport boundary
- `slate` stays out of formatting policy

The durable insight is that the current `EditableBlocks` seam is better at
app-owned inline **elements** than app-owned text **marks**.

That is because:

- the surface already knows how to preserve and render mixed inline structure
- the current `renderSegment` seam does not carry text-node mark metadata

So the honest move was not “teach the runtime generic marks for one example”.
It was “represent the explicit HTML formatting subset as explicit inline
elements”.

## Prevention

- When widening a v2 example surface, first ask whether the missing behavior is:
  - app-owned policy
  - runtime contract
  - DOM transport
  - core semantics
- If the answer is app-owned policy, prefer the current public seam before
  widening packages underneath it.
- For `paste-html`, add browser reds for supported tags before changing the
  parser or renderer.
- Do not claim “HTML paste support” broadly. Name the exact supported subset.

## Related Issues

- [2026-04-03-slate-v2-clipboard-boundary-proof-must-split-fragment-semantics-and-dom-transport.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-slate-v2-clipboard-boundary-proof-must-split-fragment-semantics-and-dom-transport.md)
- [2026-04-04-v2-editable-blocks-need-structure-preserving-dom-reconciliation-for-mixed-inline-editing.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-v2-editable-blocks-need-structure-preserving-dom-reconciliation-for-mixed-inline-editing.md)
