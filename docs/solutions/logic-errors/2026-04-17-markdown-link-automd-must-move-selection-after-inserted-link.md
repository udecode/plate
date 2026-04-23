---
module: Link
date: 2026-04-17
problem_type: logic_error
component: editor_transforms
symptoms:
  - "Typing `)` to finish `[link](http://google.com` in `/blocks/link-demo` left the caret before the inserted link"
  - "The link node was created correctly, but continued typing happened in the leading empty text node"
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - link
  - automd
  - selection
  - input-rules
---

# Markdown link automd must move selection after inserted link

## Problem

Markdown link completion inserted the right link node but left selection in the
wrong place.

The visible repro was `/blocks/link-demo`: finish the link with `)` and the
caret stays before the link instead of after it.

## Root cause

`LinkRules.markdown` inserted the link at the matched range, but unlike bare
URL autolink it never ran the shared post-insert selection handoff.

So the transform stopped after `upsertLink(...)`, leaving the collapsed
selection in the leading empty text node.

## Solution

Make markdown link completion use the same post-insert selection move as the
other autolink flows:

```ts
const inserted = upsertLink(context.editor, {
  insertNodesOptions: {
    at: match.range,
    select: true,
  },
  skipValidation: true,
  text: match.text,
  url: match.url,
});

if (inserted) {
  moveSelectionAfterLink(context.editor);
  return true;
}
```

File:

- [LinkRules.ts](packages/link/src/lib/LinkRules.ts)

## Why This Works

`moveSelectionAfterLink(...)` already knew how to place the caret in the text
node after a completed link.

The markdown rule simply never called it. Once it does, markdown-link completion
matches the expected editing flow:

- insert link node
- move selection after link
- keep typing normally

## Prevention

- When two insertion paths create the same node shape, compare their selection
  handoff too, not just the inserted structure.
- For autoformat-like transforms, add one test for the final caret position.

## Verification

```bash
bun test packages/link/src/lib/internal/inputRules.spec.tsx
bun test packages/link/src/lib/withLink.spec.tsx
bun test ./apps/www/src/__tests__/package-integration/link/link-automd.slow.tsx
bun test ./apps/www/src/__tests__/package-integration/playground/playground-rules.slow.tsx
```

Browser proof:

- `http://localhost:3001/blocks/link-demo`
- reset to a paragraph containing `[link](http://google.com`
- type `)`
- selection lands at `[0, 2]`, offset `0`, after the inserted link
