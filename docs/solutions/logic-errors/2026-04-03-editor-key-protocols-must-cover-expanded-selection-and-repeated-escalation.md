---
module: Editor Behavior
date: 2026-04-03
problem_type: logic_error
component: editor_transforms
symptoms:
  - "Heading `Enter` with selected text kept the trailing block as a heading instead of resetting to a paragraph."
  - "A second `selectAll` inside a table reselected the table instead of escalating to the whole document."
  - "Backspace at the start of a non-empty first code line unwrapped the code block."
  - "Reverse `Tab` over multiple selected nested quoted blocks only lifted the first block."
root_cause: logic_error
resolution_type: code_change
severity: medium
tags:
  - editor-behavior
  - selection
  - keyboard
  - blockquote
  - code-block
  - table
  - heading
  - protocol
---

# Editor key protocols must cover expanded selection and repeated escalation

## Problem

Several keyboard seams looked fine when tested with a single collapsed caret,
but broke once selection shape or repeated key ownership entered the picture.

The failures were different on the surface, but the bug pattern was the same:
the implementation only handled the first happy-path cursor state.

## Symptoms

- `Enter` inside selected heading text created another heading instead of a paragraph.
- `Backspace` at the start of a non-empty first code line exploded the code
  block into paragraphs.
- `Shift+Tab` over multiple selected nested quote blocks only lifted one block.
- `selectAll` inside a table stopped at the table forever instead of escalating
  on the second invocation.

## What Didn't Work

- Treating the protocol matrix as done once the collapsed-cursor cases were
  green.
- Assuming expanded selection uses the same code path as `deleteBackward` or
  `insertBreak` at a caret.
- Letting ownership helpers always claim the same structure again on repeated
  invocations.
- Testing only one selected block for multi-block structural commands.

## Solution

Make the key seams selection-aware and escalation-aware:

- let `splitReset` run for same-block expanded selections, not just collapsed
  cursors
- keep code-block `Backspace` local at the first non-empty line and merge empty
  inner lines locally
- lift every selected nested quoted block on reverse `Tab`, deepest paths first
- escalate table `selectAll` from cell -> table -> document instead of stopping
  at table selection forever

The important part was not one specific plugin. It was closing the protocol
blind spot across multiple owners.

## Why This Works

Keyboard behavior is not defined only by the key and the node type.

It is also defined by:

- selection shape
- boundary position
- repeated ownership steps

If tests cover only collapsed selections and single invocations, the protocol
looks complete while major real-world paths are still wrong.

## Prevention

- For every structural key seam, add at least:
  - collapsed caret coverage
  - same-block expanded selection coverage
  - multi-block selection coverage when the command is structural
  - repeated invocation coverage when the behavior is hierarchical
- Treat `deleteFragment` as the real seam for expanded `⌫` / `⌦` behavior. Do
  not pretend `deleteBackward` alone covers selection deletion.
- When a command is supposed to peel structure one level at a time, add a test
  that proves repeated invocations advance to the next owner instead of looping
  on the same owner.

## Verification

These checks passed:

```bash
bun test packages/core/src/lib/plugins/override/withBreakRules.spec.tsx packages/core/src/lib/plugins/override/withDeleteRules.spec.tsx packages/core/src/lib/plugins/override/withMergeRules.spec.tsx packages/code-block/src/lib/withCodeBlock.spec.tsx packages/table/src/lib/withTable.spec.tsx packages/indent/src/lib/withIndent.spec.tsx packages/list/src/lib/withList.spec.tsx
pnpm turbo build --filter=./packages/core --filter=./packages/basic-nodes --filter=./packages/code-block --filter=./packages/table --filter=./packages/indent --filter=./packages/list
pnpm turbo typecheck --filter=./packages/core --filter=./packages/basic-nodes --filter=./packages/code-block --filter=./packages/table --filter=./packages/indent --filter=./packages/list
pnpm lint:fix
```

## Related Issues

- `#4898`
- Related learning: [2026-04-02-markdown-container-keyboard-rules-must-lift-one-level](./2026-04-02-markdown-container-keyboard-rules-must-lift-one-level.md)
