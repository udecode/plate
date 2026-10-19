# Uploaded image selection and deletion regression

Status: Complete

## Outcome

Uploaded images in the playground regain the keyboard-selectable media
contract: a physical click selects the image owner, paints its selected state,
and Backspace or Delete removes that owner.

## Scope

- Reproduce the supplied Chrome interaction against the deployed playground
  upload path.
- Repair the shared selection owner that lets native draggable descendants
  bypass keyboard-selectable node selection.
- Preserve drag initiation and editable caption selection.
- Prove the generic keyboard-selectable contract and the uploaded-image browser
  path.

## Acceptance

- A physical `pointerdown > mousedown > click` on an uploaded image produces a
  `NodeSelection` for the image path and no visible native caret beside it.
- The image selected ring is visible.
- Backspace removes the selected uploaded image.
- Native image drag initiation still works and clicking editable caption text
  keeps a text selection.
- Focused Plite React, Plate DnD and Chromium checks pass on final source.

## Resolution

The draggable image was excluded from the keyboard-selectable mousedown path,
and the root interaction controller then converted the same pointer gesture
into a text coordinate beside the image. Draggable keyboard-selectable targets
now enter the structural selection path while leaving the native mousedown
unprevented, and root coordinate placement does not compete for that target.

## Evidence

- `keyboard-selectable-selection.test.tsx`: 10 tests pass with a draggable
  noneditable asset, including Backspace and Delete behavior.
- Chromium replay on `/blocks/playground` proves the R2-backed upload, physical
  pointer event sequence, live `NodeSelection`, empty native selection,
  selected ring, editable caption selection, native `dragstart`, and Backspace
  deletion.
- Focused Chromium upload and DnD suites: 4 tests pass.
- Plite React partition typecheck and focused Ultracite checks pass.
