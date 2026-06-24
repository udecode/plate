---
title: Plite browser proof must separate model-owned handles, root selection, and usable focus
date: 2026-04-24
last_updated: 2026-04-24
category: docs/solutions/logic-errors
module: Plite browser editing
problem_type: logic_error
component: testing_framework
symptoms:
  - Model-owned browser-handle delete imported a stale DOM selection and left text undeleted.
  - Typing after focusing a checklist checkbox did not insert into the preserved Plite selection.
  - WebKit shadow-DOM rows timed out waiting for a document selection outside the editor root.
  - Focused Playwright proof stayed red until touched package dist output was rebuilt.
  - Keyboard proof selected text with the DOM, then the helper focus path reselected stale model state before pressing the shortcut.
  - ArrowLeft inside an editable-void input moved the input caret but still emitted a Plite move-selection command.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [plite, plite-browser, slate-react, selection, shadow-dom, playwright, browser-handle, keyboard]
---

# Plite browser proof must separate model-owned handles, root selection, and usable focus

## Problem

Batch 8 browser closure had a green-ish architecture but still failed across
checklist focus, large-document delete, mobile paste, and WebKit shadow DOM
rows. The failures looked unrelated until they were classified by ownership.

## Symptoms

- `bun test:integration-local` failed with `481 passed`, `7 failed`.
- Checklist rows typed after focusing a checkbox but the editor was not the
  usable keyboard target.
- Large-document direct-sync rows failed to delete backward after semantic
  model typing.
- Mobile rich paste over selected content left the follow-up caret/editability
  proof red.
- WebKit shadow-DOM rows waited on a selection that was not contained by the
  shadow editor.
- Focused Playwright reruns stayed red until `plite-browser` package `dist`
  was rebuilt.
- DOM-selected mark rows typed into the wrong word because `press()` focused
  the editor and restored the model selection before sending the shortcut.
- Internal-control ArrowLeft rows kept the input caret usable but still logged
  a Plite `move-selection` command, which made ownership traces lie.

## What Didn't Work

- Treating semantic browser-handle commands as DOM-import commands. Handles are
  test/proof transport for model-owned operations; importing stale DOM selection
  before the command defeats the proof.
- Checking only whether a DOM selection is contained by the editor root before
  typing. An app-owned checkbox can hold focus while an old editor selection is
  still contained.
- Focusing before every keyboard press. That destroys intentionally prepared
  DOM selections and turns native-keyboard proof back into model-handle proof.
- Treating internal-control keydown as a Plite movement command with an
  internal-control target owner. That preserves final behavior but corrupts the
  command trace contract.
- Waiting for any document selection in WebKit shadow DOM. A document selection
  range outside the shadow editor is not editor selection proof.
- Trusting focused Playwright rows immediately after source edits. The
  Playwright harness imports public package subpaths from built output.

## Solution

Make browser-handle model operations explicitly model-owned before implicit
selection-sensitive mutations:

```ts
setEditableModelSelectionPreference({
  inputController,
  preferModelSelection: true,
  selectionSource: 'model-owned',
})
```

Apply that before `runCommand(...)` reads live selection and before
`selectRange(...)` calls `Transforms.select(...)`.

In `plite-browser`, split selection containment from usable keyboard focus:

- if DOM selection is outside the editor root, focus the editor before typing
- if active focus is an app-owned control, also focus the editor before typing
- contenteditable descendants count as usable editor focus; buttons, checkboxes,
  and other internal controls do not
- `press()` must preserve an existing usable DOM selection and focus only when
  no root selection or usable keyboard focus exists

For shadow DOM, read selection through the editor root when possible:

- use `ShadowRoot.getSelection()` when the root exposes it
- fall back to document selection only as a fallback
- wait only for selections already contained by the editor root
- dispatch `selectionchange` on the shadow root when setting shadow selection

Before browser proof that imports `plite-browser/playwright`, rebuild the
touched package graph:

```sh
bunx turbo build --filter=./packages/plite-browser --filter=./packages/plite-dom --filter=./packages/plite-react --force
```

For internal controls, cut command classification at the owner boundary:

```ts
const internalTarget = isInteractiveInternalTarget(editor, event.target)
const command = internalTarget
  ? null
  : getEditableCommandFromKeyDown({ event, selection })
```

## Why This Works

The fixes preserve the ownership split.

Browser handles are semantic proof tools, so their commands should not import
browser DOM selection unless the row is explicitly testing DOM import. App-owned
controls can be inside the editor root without being valid text-input targets,
so keyboard helpers need a real focus check. Shadow DOM has different selection
visibility across engines, so WebKit proof has to avoid treating non-contained
document selection as editor state. Rebuilding package output makes Playwright
test the code that the site actually imports.

Keyboard proof needs the same ownership discipline. A helper that focuses
unconditionally can erase the user's DOM selection before the browser event.
An internal-control keydown can bubble through the editor root, but it should
not synthesize a Plite movement command; the trace should classify the target
as `internal-control` and leave selected-content mutation ownership alone.

## Prevention

- Classify browser failures by owner before patching:
  `plite-react` runtime, `plite-browser` harness, `plite-dom` bridge, core, or
  accepted platform limitation.
- Keep model-owned handle commands model-owned. Add an explicit DOM-import proof
  only when that is the contract being tested.
- Typing helpers must validate usable focus, not only selection containment.
- Keyboard helpers must not focus over an existing usable root selection.
- Internal-control keydown rows should assert both positive classification
  (`targetOwner: internal-control`, selection policy `none`) and absence of
  Plite movement commands.
- Shadow-DOM assertions must use root-aware selection and narrow fallbacks where
  a browser cannot expose a contained selection.
- Rebuild touched public package outputs before Playwright rows that import
  package subpaths from `dist`.

## Related Issues

- [Plite React model-owned insert must repair the DOM caret](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-22-slate-react-model-owned-insert-must-repair-dom-caret.md)
- [Plite browser nested selection proofs must pass handle keys and build the v2 dist the site actually runs](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-plite-browser-nested-selection-proofs-must-pass-handle-keys-and-build-the-v2-dist-the-site-actually-runs.md)
- [Workspace package subpath consumers may need a targeted build before Playwright](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-04-workspace-package-subpath-consumers-may-need-a-targeted-build-before-playwright.md)
- [Plite browser selectionchange proof must separate traceability from programmatic import](/Users/zbeyens/git/plate-2/docs/solutions/test-failures/2026-04-22-plite-browser-selectionchange-proof-must-separate-traceability-from-programmatic-import.md)
