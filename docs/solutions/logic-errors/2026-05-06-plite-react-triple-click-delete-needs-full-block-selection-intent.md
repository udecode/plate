---
title: Plite React triple-click delete needs full-block selection intent
date: 2026-05-06
category: docs/solutions/logic-errors
module: Plite React
problem_type: logic_error
component: frontend_stimulus
symptoms:
  - Browser triple-click plus Backspace left an empty paragraph instead of removing the selected block.
  - The model-backed delete command lost the original expanded browser selection before mutation handling.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-react, selection, triple-click, backspace, browser-input]
---

# Plite React triple-click delete needs full-block selection intent

## Problem

Browser triple-click can produce a full-block or hanging full-block selection.
If Plite React collapses that into a generic `delete-fragment` command without
carrying the imported selection, Backspace can empty the block instead of
removing it.

## Symptoms

- In `/examples/richtext`, triple-click the first paragraph and press
  Backspace.
- The first paragraph becomes empty instead of disappearing.
- Typing after the delete targets the wrong remaining structure for the browser
  parity expectation.

## What Didn't Work

- A selection-import proof alone covered #3871, but it did not prove destructive
  edit behavior for #5847.
- Relying on the current runtime selection inside mutation handling was too
  fragile because the browser delete event can move or collapse the live DOM
  selection before the model-owned command runs.
- Running Playwright without rebuilding `plite-react` can exercise stale
  package `dist` output, so source changes appear ineffective.

## Solution

Carry the expanded selection on `delete-fragment` commands and let the mutation
controller recognize full-block browser ranges before falling back to normal
fragment deletion.

```ts
type EditableCommand =
  | {
      kind: 'delete-fragment'
      direction?: 'backward' | 'forward'
      selection?: Range | null
    }
```

The command handler checks whether the range starts at a block start and ends
at either that same block end or the next block start. That second shape is the
browser hanging range produced by triple-click.

```ts
if (applyFullBlockDeleteFragment(editor, command.selection)) {
  return true
}

editor.update((tx) => {
  tx.fragment.delete(
    command.direction ? { direction: command.direction } : undefined
  )
})
```

Lock it with browser proof, not only model tests:

```bash
bun --filter plite-react build
PLAYWRIGHT_RETRIES=0 bunx playwright test \
  playwright/integration/examples/richtext.test.ts \
  --project=chromium \
  --grep "selects the current block on browser triple click|removes the current block after browser triple click and Backspace"
```

## Why This Works

The destructive edit command now preserves the selection that justified the
command. The mutation layer can distinguish a browser full-block selection from
ordinary selected text and remove the selected block instead of deleting its
contents.

This keeps the policy in the React browser command layer. Core
`fragment.delete` does not need to guess whether an arbitrary expanded range
came from browser triple-click parity.

## Prevention

- For browser selection bugs, prove the follow-up destructive edit when the
  issue involves Backspace, Delete, Cut, or typing after selection.
- Keep the imported selection on model-owned commands that depend on event-time
  browser selection shape.
- Rebuild `plite-react` before Playwright rows that import package exports from
  built `dist`.
- Assert DOM caret after the destructive edit when the behavior continues with
  typing.

## Related Issues

- Plite #3871: triple-click should not leak selection into the following block.
- Plite #5847: triple-click plus Backspace should remove the selected block.
- [Plite React model-owned insert must repair the DOM caret](./2026-04-22-slate-react-model-owned-insert-must-repair-dom-caret.md)
- [Structured Enter and Backspace need editor owned keydown paths](./2026-04-12-structured-enter-and-backspace-need-editor-owned-keydown-paths.md)
