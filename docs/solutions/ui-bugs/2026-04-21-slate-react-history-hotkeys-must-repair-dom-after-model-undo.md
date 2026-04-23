---
title: Slate React history hotkeys must repair DOM after model undo
date: 2026-04-21
category: ui-bugs
module: slate-v2 slate-react
problem_type: ui_bug
component: tooling
symptoms:
  - Cmd+Z on the richtext example updated the Slate model but left inserted text visible in the editor DOM
  - handle-only undo tests passed while the real keyboard history path was broken
  - static Playwright needed rebuilt package output before it reflected slate-react source fixes
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-v2, slate-react, history, undo, redo, dom-repair, richtext]
---

# Slate React history hotkeys must repair DOM after model undo

## Problem

Keyboard undo and redo in `slate-react` can mutate the Slate model while leaving browser-owned text DOM stale. This breaks the real editing experience even when model-level history and handle-only tests look green.

## Symptoms

- `/examples/richtext` accepted typed text, but Cmd+Z left the text visible.
- The browser handle `undo()` path passed because it already forced a render after model history changes.
- A connected local Chrome 146 repro showed `Editor.string(editor, [])` no longer contained the inserted text after Cmd+Z, while `editor.textContent` still did.

## What Didn't Work

- Treating a browser-handle undo proof as enough coverage. That path is not the same as a user pressing Cmd+Z.
- Trusting bundled Playwright Chromium alone. It did not expose the same stale-DOM behavior as the connected local Chrome.
- Rerunning static Playwright without rebuilding `slate-react`; the site can consume stale package output.

## Solution

Force a view repair after every history mutation reached from keyboard or native history events:

```ts
if (Hotkeys.isUndo(nativeEvent)) {
  event.preventDefault()
  const maybeHistoryEditor: any = editor

  if (typeof maybeHistoryEditor.undo === 'function') {
    maybeHistoryEditor.undo()
    forceRender()
  }

  return
}
```

The same repair belongs on redo and native `historyUndo` / `historyRedo` events. Keep the test on the user path: browser text insertion, keyboard undo, then assert both model text and visible DOM text remove the inserted token.

## Why This Works

The native/direct DOM text lane can leave React with no urgent render to perform after history changes. Undo correctly mutates the Slate model, but the DOM still contains browser-inserted text until `slate-react` explicitly reconciles the view.

Forcing render after history undo/redo makes the real hotkey path match the already-safe browser-handle path.

## Prevention

- Test history through real keyboard hotkeys, not only editor handles.
- Assert both `Editor.string(editor, [])` and visible editor DOM after direct/native DOM input.
- Rebuild touched packages before static Playwright runs when site examples consume package output.
- Use connected-browser verification for browser-version-specific editing bugs; bundled Playwright can miss real Chrome behavior.

## Related Issues

- [Slate public single-op writes should use `Editor.apply(...)` and keep `onChange` behind subscribers](../developer-experience/2026-04-19-slate-public-single-op-writes-should-use-editor-apply-and-keep-onchange-behind-subscribers.md)
- [Slate React focus tests need Vitest with jsdom 20, not Happy DOM or jsdom 26](../test-failures/2026-04-17-slate-react-focus-tests-need-vitest-jsdom-20-not-happy-dom-or-jsdom-26.md)
