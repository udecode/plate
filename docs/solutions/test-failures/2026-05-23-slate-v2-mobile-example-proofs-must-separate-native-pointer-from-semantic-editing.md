---
title: Slate v2 mobile example proofs must separate native pointer from semantic editing
date: 2026-05-23
category: docs/solutions/test-failures
module: Slate v2 slate-browser integration proof
problem_type: test_failure
component: testing_framework
symptoms:
  - Mobile document-state rows inserted text in the middle of wrapped content.
  - Multi-root rows typed into the previous root after clicking visible chrome.
  - Mobile clipboard setup failed or clicks were intercepted by nearby controls.
root_cause: wrong_api
resolution_type: test_fix
severity: high
tags: [slate-v2, slate-browser, mobile, multi-root, playwright, clipboard]
---

# Slate v2 mobile example proofs must separate native pointer from semantic editing

## Problem

Mobile Playwright rows reused desktop click and keyboard assumptions for
state-field and multi-root examples. That made good architecture look broken
because raw mobile clicks landed at browser-chosen caret positions or raced root
activation.

## Symptoms

- Clicking a title input before `keyboard.insertText(...)` appended before the
  last character instead of at the end.
- Clicking wrapped editor text inserted `p` inside `never` instead of after
  `nodes.`.
- Clicking `Header editor` set the active root, but immediate text insertion
  could still mutate `main`.
- Footer activation on mobile could be intercepted by disabled toolbar buttons
  or nearby editor surfaces.
- `navigator.clipboard.writeText(...)` was denied in the mobile project before
  clipboard permission parity was added.

## What Didn't Work

- Treating every mobile row as native keyboard proof. Playwright mobile viewport
  is still desktop automation with mobile emulation, not raw device text input.
- Waiting only on final text assertions. If root activation and text insertion
  race, the wrong root can receive valid text and the final assertion only shows
  the symptom.
- Using raw label clicks for rows that only need deterministic root-local
  editing. The native pointer contract belongs in its own row.

## Solution

Use deterministic editor intent for rows that prove model/history/root behavior,
and keep raw pointer proof isolated to the row that actually claims pointer
activation. For multi-root examples, create harnesses for each root instead of
reaching into browser-handle internals.

```ts
const bodyEditor = await openExample(page, 'multi-root-document', {
  surface: { scope: '#multi-root-main-surface' },
})
const headerEditor = bodyEditor.rootAt('#multi-root-header')

const focusRootByLabel = async (
  page: Page,
  label: string,
  editor: SlateBrowserEditorHarness
) => {
  await page.getByText(label).click({ force: true })
  await expect(editor.root).toBeFocused()
}

await focusRootByLabel(page, 'Header editor', headerEditor)
await headerEditor.selection.collapse({ path: [0, 0], offset: 27 })
await headerEditor.insertText('Draft ')
```

For input fields, explicitly place the input caret before appending:

```ts
await input.click()
await input.evaluate((element) => {
  element.setSelectionRange(element.value.length, element.value.length)
})
await page.keyboard.insertText(' typed')
```

For mobile root-local paste, use the Slate browser handle when the row is about
clipboard ingress behavior, and keep native clipboard transport to browser
projects that prove it honestly.

## Why This Works

The Slate browser handle goes through the editor runtime, selection authority,
history, and DOM repair path without relying on mobile viewport click geometry.
That keeps the assertions about root-local editing, history, and state fields
deterministic.

The raw pointer row still uses a real mouse click against the inactive root text
surface, so pointer activation remains covered instead of being silently
converted into a semantic helper.

## Prevention

- Name the transport being proved: native pointer, native clipboard, semantic
  selection handle, semantic text insertion, or raw device proof.
- Do not use mobile viewport `locator.click()` as a deterministic caret setup
  unless the row is specifically about pointer activation.
- Wait for root focus before sending native keyboard input after chrome clicks.
- Prefer Slate browser handles for mobile rows whose contract is editor state,
  root-local history, or clipboard ingress.
- Keep native mobile/device claims out of Playwright viewport tests unless a raw
  device lane proves them.

## Related Issues

- [Slate browser selectionchange proof must separate traceability from programmatic import](./2026-04-22-slate-browser-selectionchange-proof-must-separate-traceability-from-programmatic-import.md)
- [Slate React multi-root Editable DX needs package-owned root views](../developer-experience/2026-05-23-slate-react-multi-root-editable-dx-needs-package-owned-root-views.md)
