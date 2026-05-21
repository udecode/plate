---
title: Slate v2 multi-root chrome clicks must activate the root before focus
date: 2026-05-21
category: docs/solutions/ui-bugs
module: Slate v2 multi-root examples
problem_type: ui_bug
component: testing_framework
symptoms:
  - "Clicking the visible Header editor label did not focus the header root."
  - "The header root stayed contenteditable=false after a header chrome click."
  - "Playwright passed when it clicked the editable directly, missing the human click path."
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, multi-root, focus, playwright, contenteditable]
---

# Slate v2 multi-root chrome clicks must activate the root before focus

## Problem

The multi-root document example made only the active root editable. Direct
editable clicks passed, but clicking the visible header chrome did not activate
or focus the header, so the human path was broken.

## Symptoms

- `#multi-root-header` stayed inactive and `contenteditable="false"` after
  clicking the `Header editor` label.
- Typing after that click could not land in the header.
- The existing Playwright row was green because it clicked `#multi-root-header`
  directly instead of the visible root label/chrome.

## What Didn't Work

- Relying on direct editable clicks. That does not cover the root chrome a user
  naturally clicks.
- Trusting `autoFocus` during active-root changes. It is not a full substitute
  for owning the mouse-down path before browser focus runs.

## Solution

Add a browser row that clicks visible root chrome, asserts the header is focused,
then proves typing lands in the header only:

```ts
await page.getByText('Header editor').click()
await expect(header).toBeFocused()

await page.keyboard.insertText('Header chrome click ')
await expect(header).toContainText('Header chrome click ')
await expect(main).not.toContainText('Header chrome click ')
```

Then make the root section activate on mouse-down capture. Use `flushSync` so
the inactive root becomes editable before the browser continues focus handling.
If the click is on chrome instead of the editable, focus the editable and place
the caret at the end:

```tsx
const activateRoot = () => {
  if (activeRoot === rootKey) return

  flushSync(() => {
    setActiveRoot(rootKey)
  })
}

<section
  onMouseDownCapture={(event) => {
    activateRoot()

    const editorElement = document.getElementById(id)

    if (editorElement?.contains(event.target as globalThis.Node)) {
      return
    }

    event.preventDefault()
    requestAnimationFrame(focusRoot)
  }}
>
```

## Why This Works

Inactive roots intentionally render read-only, so their editable DOM may be
`contenteditable=false` at the start of a click. Activating the root during
capture updates that state before normal editable clicks continue. Chrome clicks
do not have a native caret target, so they need an explicit focus/caret handoff
to the root editable.

## Prevention

- For multi-root examples, test both direct editable clicks and visible root
  chrome clicks.
- A focus test should assert `document.activeElement`, `contenteditable`, and
  follow-up typing ownership.
- Do not call a browser example done from locator clicks that skip the visual
  area a user actually clicks.

## Related Issues

- [Slate v2 integration-local editor stacking and project scope failures](../test-failures/2026-05-20-slate-v2-integration-local-editor-stacking-and-project-scope-failures.md)
- [Slate React state field setters must preserve external focus](./2026-05-20-slate-react-state-field-setters-must-preserve-external-focus.md)
- [Slate browser proof must separate model-owned handles, root selection, and usable focus](../logic-errors/2026-04-24-slate-browser-proof-must-separate-model-owned-handles-root-selection-and-usable-focus.md)
