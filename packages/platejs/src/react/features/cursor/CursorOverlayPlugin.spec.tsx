import React from 'react';

import { property, type Range } from '../../../core';
import { createEditor, definePlatePlugin } from '../../core';
import { CursorOverlayPlugin } from './CursorOverlayPlugin';

const selection = {
  anchor: { offset: 0, path: [0, 0] },
  focus: { offset: 3, path: [0, 0] },
} satisfies Range;

const nextSelection = {
  anchor: { offset: 1, path: [0, 0] },
  focus: { offset: 4, path: [0, 0] },
} satisfies Range;

const nextSelectionRange = {
  anchor: selection.anchor,
  focus: { offset: 4, path: [0, 0] },
} satisfies Range;

const GeometryPlugin = definePlatePlugin('geometry', {
  schema: { mark: property.string() },
});

const createCursorOverlayEditor = () =>
  createEditor({
    plugins: [CursorOverlayPlugin, GeometryPlugin],
    initialValue: [{ children: [{ text: 'Hello' }], type: 'paragraph' }],
  });

const waitForDeferredCursorRefresh = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

const getCursorState = (editor: ReturnType<typeof createCursorOverlayEditor>) =>
  editor.plugin(CursorOverlayPlugin).store.get('cursors').selection;

describe('CursorOverlayPlugin', () => {
  it('mounts independently', () => {
    expect(() => createCursorOverlayEditor()).not.toThrow();
  });

  it('refreshes the stored selection cursor after direct selection changes', async () => {
    const editor = createCursorOverlayEditor();

    editor.plugin(CursorOverlayPlugin).api.addCursor('selection', {
      selection,
    });

    editor.update.selection.set(nextSelection);
    await waitForDeferredCursorRefresh();

    expect(getCursorState(editor)?.selection).toEqual(nextSelection);
  });

  it('refreshes the stored selection cursor after partial selection updates', async () => {
    const editor = createCursorOverlayEditor();

    editor.update.selection.set(selection);
    editor.plugin(CursorOverlayPlugin).api.addCursor('selection', {
      selection,
    });

    editor.update.selection.setPoint(
      { offset: 4, path: [0, 0] },
      { edge: 'focus' }
    );
    await waitForDeferredCursorRefresh();

    expect(getCursorState(editor)?.selection).toEqual(nextSelectionRange);
  });

  it('invalidates stored cursor geometry after document changes', async () => {
    const editor = createCursorOverlayEditor();

    editor.update.selection.set(selection);
    editor.plugin(CursorOverlayPlugin).api.addCursor('selection', {
      selection,
    });
    const previousSelection = getCursorState(editor)?.selection;

    editor.plugin(GeometryPlugin).update.set('10px');
    await waitForDeferredCursorRefresh();

    expect(getCursorState(editor)?.selection).toEqual(selection);
    expect(getCursorState(editor)?.selection).not.toBe(previousSelection);
  });

  it('does not restore a deferred selection cursor after removal', async () => {
    const editor = createCursorOverlayEditor();

    editor.update.selection.set(selection);
    editor.plugin(CursorOverlayPlugin).api.addCursor('selection', {
      selection,
    });
    editor.plugin(GeometryPlugin).update.set('10px');
    editor.plugin(CursorOverlayPlugin).api.removeCursor('selection');
    await waitForDeferredCursorRefresh();

    expect(getCursorState(editor)).toBeUndefined();
  });
});
