import { createPlateEditor } from '@platejs/core/react';

import { CursorOverlayPlugin } from './CursorOverlayPlugin';

const selection = {
  anchor: { offset: 0, path: [0, 0] },
  focus: { offset: 3, path: [0, 0] },
};

const nextSelection = {
  anchor: { offset: 1, path: [0, 0] },
  focus: { offset: 4, path: [0, 0] },
};

const nextSelectionRange = {
  anchor: selection.anchor,
  focus: { offset: 4, path: [0, 0] },
};

const createCursorOverlayEditor = () =>
  createPlateEditor({
    plugins: [CursorOverlayPlugin],
    value: [{ children: [{ text: 'Hello' }], type: 'p' }],
  });

const waitForDeferredCursorRefresh = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

describe('CursorOverlayPlugin', () => {
  it('refreshes the stored selection cursor after direct selection changes', async () => {
    const editor = createCursorOverlayEditor();

    editor
      .plugin(CursorOverlayPlugin)
      .api.cursorOverlay.addCursor('selection', {
        selection,
      });

    editor.update.selection.set(nextSelection);
    await waitForDeferredCursorRefresh();

    expect(
      editor.plugin(CursorOverlayPlugin).getOption('cursors').selection
        ?.selection
    ).toEqual(nextSelection);
  });

  it('refreshes the stored selection cursor after partial selection updates', async () => {
    const editor = createCursorOverlayEditor();

    editor.update.selection.set(selection);
    editor
      .plugin(CursorOverlayPlugin)
      .api.cursorOverlay.addCursor('selection', {
        selection,
      });

    editor.update.selection.setRange({
      focus: { offset: 4, path: [0, 0] },
    });
    await waitForDeferredCursorRefresh();

    expect(
      editor.plugin(CursorOverlayPlugin).getOption('cursors').selection
        ?.selection
    ).toEqual(nextSelectionRange);
  });
});
