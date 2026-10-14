# Excalidraw label undo

Status: executed, waiting on your commit
Page: https://claude.ai/artifact/EwjNXQEfgN2kZemLWSZqX2
Playbook: bug-fix

## Brief

### What will change?

Pressing Undo while an Excalidraw text label is open now keeps the undo. The label closes, the canvas shows the restored drawing, and Redo still works. The docs drop the "close the label first" warning.

### What could go wrong?

The fix closes the label by pressing Escape in Excalidraw's own text box, because Excalidraw offers no close call. An Excalidraw upgrade that renames that box would bring the bug back, and the new test would not notice.

## Teach

The Excalidraw block keeps its drawing in the document. A small sync hook copies document changes into the canvas and saves canvas edits back. When you edit a text label, Excalidraw opens its own text box over the canvas and writes that box's text into the label when the box closes.

Before this fix, Undo with a label open went wrong in one gesture. The undo ran and the canvas redrew the old text. Then the editor took focus back, the text box closed, and Excalidraw wrote the newer text back, which the hook saved as a fresh change. The undo was lost, and so was Redo.

Now the hook watches document changes. When one arrives while a label is open, it closes the label first. That stale write then lands before the canvas redraws, and the hook redraws the document instead of saving it.

## Demo

1. Open http://localhost:3519/blocks/excalidraw-demo with the `www-drive` server running. Pick the text tool, click the canvas, type hello and press Escape.
2. Press Enter to open the label, select its text and type world.
3. Press Cmd+Z while the label is still open. The label closes and the canvas shows hello. Before the fix it showed world, and the stored text was world.
   ![before](artifacts/excalidraw-label-undo/repro-after-undo.png) ![after](artifacts/excalidraw-label-undo/fixed-after-undo-1280-light.jpg)
4. Click an empty spot on the canvas and press Cmd+Shift+Z. The canvas shows world again.

## Main changes

- `useExcalidrawSync` subscribes to editor commits. When the document changes while a text label is open, it dispatches Escape to the label's textarea inside its own element, so Excalidraw's write-back lands before the projection and `onChange` re-projects the document instead of saving.
- The hook's own save now runs under `applying`, so that listener ignores the commit the label's typing makes.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Open label on undo | The label closes and the canvas shows the undone drawing | Keep the label open with the restored text, which Excalidraw cannot do without its internals | keep label open | big |
| Canvas undo button after a document undo | Left as it is: it stays enabled with a step that changes nothing | Clear it after every projection in a follow-up | clear canvas undo | small |
| Release note | No changeset, since no released version has this hook | Amend the unreleased Excalidraw changeset | add release note | detail |

## Close

`packages/platejs/src/excalidraw/react/useExcalidrawSync.ts` closes an open label on a document change and guards its own save. `useExcalidrawSync.spec.tsx` gains two cases and renders through `EditorElement`, like the registry element. The "Open text label" row and its Chinese sentence are gone from the Excalidraw docs, and the registry output is regenerated. Nothing is committed, so the owner commits.

The reversal comes first. The documented limit was not exact. The browser showed the undo lost in the same gesture, before anyone closed the label by hand, because Plite's history focus blurs the label.

The proof and its limits:
- Reproduced before the fix on `/blocks/excalidraw-demo`: stored text hello, then world again in the same Cmd+Z (`artifacts/excalidraw-label-undo/repro-before.md`).
- The new undo case fails at HEAD with stored text world, 6 pass 1 fail, and passes with the fix, 7 pass (`spec-red-head-a2.log`, `spec-green-a4.log`). Both new conditions are mutation-caught (`mutate/`).
- The fake label in the spec stands in for Excalidraw. It proves the hook's side, not Excalidraw's textarea, so the browser replays carry that part: the final bytes at 1280 light and, after a server restart, 1280 dark, with one hello commit on undo, no commit on the later Escape, and Redo restoring world.
- The browser replay ran three times on fixed bytes, once on the final bytes per theme; the unit spec ran five times warm. A five-run browser repeat did not run.
- Consumer checks pass: the www Excalidraw browser spec, the excalidraw-react partition, typecheck with errors equal to HEAD, lint.
- The hand drive covers 9 of 9 cells (`hand-drive-check-a2.log`).

Of 13 items, 12 are done, 0 partial, 1 skipped (the changeset, since no released version has the hook), 0 blocked and 0 open.

Open work:
- The canvas Undo button stays enabled after a document undo or redo, with a step that changes nothing; seen without a label too, so it predates this fix. owner: zbeyens. stop: a decision to clear canvas history after every projection, tracked here and on the canvas subject when its owner folds this.
- The canvas review plan's Open work item for this defect and its subject file belong to another session's uncommitted work, so this run did not edit them. Its stop condition is now met. owner: zbeyens. stop: the canvas review's owner closes that item.
