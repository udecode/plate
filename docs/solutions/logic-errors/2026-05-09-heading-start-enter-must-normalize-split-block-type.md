---
title: Heading start Enter must normalize the split block type
date: 2026-05-09
last_updated: 2026-05-18
category: docs/solutions/logic-errors
module: Slate v2 markdown shortcuts
problem_type: logic_error
component: testing_framework
symptoms:
  - Lexical TextEntry expects Enter at the start of a heading to create a paragraph before the heading.
  - Slate markdown-shortcuts split the heading but kept the empty split block as a heading.
  - The browser proof found no paragraph before the heading.
root_cause: logic_error
resolution_type: code_fix
severity: medium
tags: [slate-v2, lexical-harvest, markdown-shortcuts, heading, enter]
---

# Heading start Enter must normalize the split block type

## Problem

Lexical's `TextEntry.spec.mjs` has a useful row: create a heading, move to the
start of it, press Enter, and get a paragraph before the heading.

Slate v2's markdown-shortcuts example created the heading correctly, but native
Enter at the heading start inherited the heading type for the empty split block.

## Symptoms

- The focused browser proof expected one `p` before the `h1`.
- The red run found zero paragraphs.
- The heading text survived, so the failure was block type normalization after a
  start split, not markdown heading creation.

## Solution

Handle heading-start Enter in the markdown-shortcuts extension transform, not
in the React keydown handler:

```ts
const markdownShortcuts = () =>
  defineEditorExtension<CustomEditor>()({
    name: 'markdown-shortcuts',
    transforms: {
      insertBreak({ editor, next }) {
        const selection = editor.read(state => state.selection.get())

        if (selection && RangeApi.isCollapsed(selection)) {
          const blockEntry = editor.read(state =>
            state.nodes.above({
              at: selection,
              match: node => NodeApi.isElement(node) && state.nodes.isBlock(node),
            })
          )

          if (blockEntry) {
            const [block, blockPath] = blockEntry

            if (
              NodeApi.isElement(block) &&
              HEADING_TYPES.has(block.type as CustomElementType)
            ) {
              const start = editor.read(state => state.points.start(blockPath))

              if (PointApi.equals(selection.anchor, start)) {
                const result = next()

                editor.update(tx => {
                  tx.nodes.set(
                    { type: 'paragraph' },
                    {
                      at: blockPath,
                      match: node =>
                        NodeApi.isElement(node) && tx.nodes.isBlock(node),
                    }
                  )
                })

                return result
              }
            }
          }
        }

        return next()
      },
    },
  })
```

The transform only applies to collapsed selections at the start of a heading. It
delegates to the normal `insertBreak` default, then changes the split empty
heading at the original block path into a paragraph.

## Why This Works

The original heading content should stay a heading. The new empty block before
it should represent user intent: opening a normal paragraph before the heading.

Normalizing only the start-split block avoids changing middle-split or end-split
heading behavior. Keeping this under `transforms.insertBreak` also preserves the
same behavior for keyboard input, native input, programmatic transform calls,
and tests.

## Prevention

- For markdown/block shortcut rows, test start, middle, and end Enter behavior
  separately.
- When splitting a semantic block at offset `0`, assert the type of the empty
  block, not just text content.
- If behavior maps to a Slate transform name, put it in extension
  `transforms`, not raw `Editable onKeyDown`.
- Keep product markdown parser behavior separate from raw block split behavior.

## Related Issues

- [Slate transform middleware defaults need an alias depth guard](../developer-experience/2026-05-16-slate-transform-middleware-defaults-need-alias-depth-guard.md)
