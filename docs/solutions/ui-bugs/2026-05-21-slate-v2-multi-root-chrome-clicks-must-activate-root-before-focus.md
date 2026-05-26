---
title: Slate v2 multi-root roots must stay natively editable for caret clicks
date: 2026-05-21
last_updated: 2026-05-21
category: docs/solutions/ui-bugs
module: Slate v2 multi-root examples
problem_type: ui_bug
component: testing_framework
symptoms:
  - "Clicking the visible Header editor label did not focus the header root."
  - "Clicking inside the inactive header text surface focused the element without putting the native selection in the header."
  - "Typing h/e/l/l/o after a header text-surface click could render olleh because the caret did not advance in the header root."
  - "Playwright passed when it clicked the editable directly, missing the human click path."
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, multi-root, focus, selection, playwright, contenteditable]
---

# Slate v2 multi-root roots must stay natively editable for caret clicks

## Problem

The multi-root document example made only the active root editable, and the
runtime accepted rootless selection points imported through a root-bound view.
Direct editable clicks passed in the test harness, but real clicks on inactive
root text could focus the header without durable header-root selection.

## Symptoms

- `#multi-root-header` became the active element, but `window.getSelection()`
  stayed outside the header after a text-surface click.
- Typing after that click could not land in the header.
- Sequential key presses could insert each character at the same original
  header offset, turning typed `hello` into rendered `olleh`.
- The existing Playwright row was green because it clicked `#multi-root-header`
  directly without asserting native selection ownership.

## What Didn't Work

- Relying on direct editable clicks. That does not cover the root chrome a user
  naturally clicks.
- Making inactive roots `readOnly`. That flips the DOM to
  `contenteditable=false`, so the browser cannot perform a native caret
  placement on the first click.
- Trusting focus alone. `document.activeElement` can be correct while the
  native selection still belongs to no editable root.
- Faking the regression with `insertText('olleh')`. That proves nothing; the
  test must send ordered `h`, `e`, `l`, `l`, `o` key presses and fail if the
  editor reverses them.

## Solution

Add a browser row that clicks the inactive header text surface, asserts the
native selection is inside the header, then proves typing lands in the header
only:

```ts
const box = await header.boundingBox()

await page.mouse.click(box.x + 230, box.y + 24)
await expect(header).toBeFocused()
await expect
  .poll(() =>
    page.evaluate(() => {
      const headerElement = document.getElementById('multi-root-header')
      const selection = window.getSelection()

      return Boolean(
        headerElement &&
          selection?.anchorNode &&
          headerElement.contains(selection.anchorNode)
      )
    })
  )
  .toBe(true)

await page.keyboard.insertText('Surface caret ')
await expect(header).toContainText('Surface caret ')
await expect(main).not.toContainText('Surface caret ')
```

Then keep all root editables natively editable. The active-root state can still
drive labels, `autoFocus`, and chrome-click handoff, but it must not turn the
inactive editor text surface into `contenteditable=false`:

```tsx
<Editable
  onMouseDown={activateRoot}
  readOnly={false}
/>
```

Chrome clicks still need a handoff because labels and badges are not caret
targets. The section capture path activates the root and focuses the editable at
the end only when the click target is outside the editable.

Also stamp rootless selection points when a root-bound view imports them. A
selection imported through the header view must be stored as a header selection,
otherwise header `insert_text` operations do not transform it and repeated keys
reuse the old offset:

```ts
const normalizeSelectionRoot = (selection: Selection, root: string) => {
  if (!selection) return selection

  const normalizePointRoot = (point: Point) => {
    const { root: _root, ...pointWithoutRoot } = point

    return root === 'main' ? pointWithoutRoot : { ...pointWithoutRoot, root }
  }

  return {
    anchor: normalizePointRoot(selection.anchor),
    focus: normalizePointRoot(selection.focus),
  }
}
```

Lock the browser example with ordered key presses, not direct text insertion:

```ts
await page.mouse.click(box.x + 230, box.y + 24)
await expect(header).toBeFocused()

for (const key of ['h', 'e', 'l', 'l', 'o']) {
  await header.press(key)
}

await expect(header).toContainText('hello')
await expect(header).not.toContainText('olleh')
```

## Why This Works

Content text needs native browser caret placement. If inactive roots render
read-only, the first click cannot create a DOM selection in that root, even if
React later focuses the element. Keeping each root contenteditable lets normal
text clicks set the caret, while root-local selection ownership keeps edits
scoped to the clicked root.

Stamping the root onto imported selection points makes `PointApi.transform`
compare the selection against later header-root operations correctly. After the
first `h`, the header selection advances to offset 1; the next key inserts after
`h` instead of back at offset 0.

## Prevention

- For multi-root examples, test direct text-surface clicks, visible root chrome
  clicks, and follow-up typing.
- A focus test should assert `document.activeElement`, native selection
  ownership, and follow-up typing ownership.
- For typing-order regressions, press keys in order and assert the forbidden
  reversed string is absent.
- Do not call a browser example done from locator clicks that skip the visual
  area a user actually clicks.

## Related Issues

- [Slate v2 integration-local editor stacking and project scope failures](../test-failures/2026-05-20-slate-v2-integration-local-editor-stacking-and-project-scope-failures.md)
- [Slate React state field setters must preserve external focus](./2026-05-20-slate-react-state-field-setters-must-preserve-external-focus.md)
- [Slate browser proof must separate model-owned handles, root selection, and usable focus](../logic-errors/2026-04-24-slate-browser-proof-must-separate-model-owned-handles-root-selection-and-usable-focus.md)
