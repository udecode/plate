import React from 'react';

import { render } from '@testing-library/react';

import { createPlateEditor, Plate, PlateContent } from '@platejs/core/react';
import type { TextSelection } from '@platejs/plite';

import { CursorOverlayPlugin } from './CursorOverlayPlugin';

const selection = {
  kind: 'text',
  anchor: { offset: 0, path: [0, 0] },
  focus: { offset: 3, path: [0, 0] },
} satisfies TextSelection;

const nextSelection = {
  kind: 'text',
  anchor: { offset: 1, path: [0, 0] },
  focus: { offset: 4, path: [0, 0] },
} satisfies TextSelection;

const nextSelectionRange = {
  kind: 'text',
  anchor: selection.anchor,
  focus: { offset: 4, path: [0, 0] },
} satisfies TextSelection;

const createCursorOverlayEditor = () =>
  createPlateEditor({
    plugins: [CursorOverlayPlugin],
    initialValue: [{ children: [{ text: 'Hello' }], type: 'paragraph' }],
  });

const waitForDeferredCursorRefresh = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

describe('CursorOverlayPlugin', () => {
  it('mounts without BlockSelectionPlugin', () => {
    const editor = createCursorOverlayEditor();

    expect(() =>
      render(
        <Plate editor={editor}>
          <PlateContent />
        </Plate>
      )
    ).not.toThrow();
  });

  it('refreshes the stored selection cursor after direct selection changes', async () => {
    const editor = createCursorOverlayEditor();

    editor.plugin(CursorOverlayPlugin).api.addCursor('selection', {
      selection,
    });

    editor.update.selection.set(nextSelection);
    await waitForDeferredCursorRefresh();

    expect(
      editor.plugin(CursorOverlayPlugin).store.get('cursors').selection
        ?.selection
    ).toEqual(nextSelection);
  });

  it('refreshes the stored selection cursor after partial selection updates', async () => {
    const editor = createCursorOverlayEditor();

    editor.update.selection.set(selection);
    editor.plugin(CursorOverlayPlugin).api.addCursor('selection', {
      selection,
    });

    editor.update.selection.setRange({
      focus: { offset: 4, path: [0, 0] },
    });
    await waitForDeferredCursorRefresh();

    expect(
      editor.plugin(CursorOverlayPlugin).store.get('cursors').selection
        ?.selection
    ).toEqual(nextSelectionRange);
  });
});
