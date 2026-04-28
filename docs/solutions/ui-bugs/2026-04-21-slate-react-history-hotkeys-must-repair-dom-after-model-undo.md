---
title: Slate React history hotkeys must repair DOM after model undo
date: 2026-04-21
last_updated: 2026-04-27
category: ui-bugs
module: slate-v2 slate-react
problem_type: ui_bug
component: tooling
symptoms:
  - Cmd+Z on the richtext example updated the Slate model but left inserted text visible in the editor DOM
  - handle-only undo tests passed while the real keyboard history path was broken
  - static Playwright needed rebuilt package output before it reflected slate-react source fixes
  - generated mobile paste-normalize-undo stress could duplicate text or crash React during DOM removal when undo replay used the wrong history path
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

Route keyboard and native history events through Slate-owned history, then force
a view repair only when the history batch is not already handled by direct DOM
text sync:

```ts
if (Hotkeys.isUndo(nativeEvent)) {
  event.preventDefault()

  if (
    applyModelOwnedHistoryIntent({
      direction: 'undo',
      editor,
    }) &&
    shouldForceRenderAfterModelOwnedHistory(editor)
  ) {
    forceRender()
  }

  return
}
```

Use the same policy for redo and native `historyUndo` / `historyRedo` events.
The render decision should be based on the last committed operations:

```ts
export const shouldForceRenderAfterModelOwnedHistory = (editor: Editor) => {
  const commit = Editor.getLastCommit(editor)

  return (
    !commit ||
    commit.operations.some(
      (operation) =>
        operation.type !== 'insert_text' &&
        operation.type !== 'remove_text' &&
        operation.type !== 'set_selection'
    )
  )
}
```

Mounted editor text and block renderers can opt out of rerendering after synced
text-only commits, but generic selector hooks must still report model text
updates to app code.

## Why This Works

The native/direct DOM text lane can leave React with no urgent render to perform
after history changes. Undo correctly mutates the Slate model, but the DOM can
still contain browser-inserted text until `slate-react` explicitly reconciles
the view.

Non-text history batches still need that explicit repair. Text-only history
batches are different: direct DOM text sync already owns the visible text. A
broad React render there can race the browser-owned DOM and produce duplicate
text or node-removal crashes during mobile replay.

## Prevention

- Test history through real keyboard hotkeys, not only editor handles.
- Assert both `Editor.string(editor, [])` and visible editor DOM after direct/native DOM input.
- Rebuild touched packages before static Playwright runs when site examples consume package output.
- Use connected-browser verification for browser-version-specific editing bugs; bundled Playwright can miss real Chrome behavior.
- Keep generated paste/normalize/undo browser contracts replaying Slate-owned
  history, not browser-native contenteditable undo.
- Do not make generic runtime selectors stale to optimize mounted editor
  internals. Put the synced-text skip on the internal render subscribers that
  need it.

## Related Issues

- [Slate public single-op writes should use `Editor.apply(...)` and keep `onChange` behind subscribers](../developer-experience/2026-04-19-slate-public-single-op-writes-should-use-editor-apply-and-keep-onchange-behind-subscribers.md)
- [Slate React focus tests need Vitest with jsdom 20, not Happy DOM or jsdom 26](../test-failures/2026-04-17-slate-react-focus-tests-need-vitest-jsdom-20-not-happy-dom-or-jsdom-26.md)
