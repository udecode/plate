import { createPlateEditor, createPlatePlugin } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import { BLOCK_CONTEXT_MENU_ID, BlockMenuPlugin } from './BlockMenuPlugin';

const BlockSelectionApiFixture = createPlatePlugin({
  key: KEYS.blockSelection,
  initialState: {
    selectedIds: new Set<string>(),
  },
});

describe('BlockMenuPlugin', () => {
  it('opens a context menu without BlockSelectionPlugin', () => {
    const editor = createPlateEditor({
      plugins: [BlockMenuPlugin],
    });
    const api = editor.plugin(BlockMenuPlugin).api;

    expect(() =>
      api.showContextMenu('block-a', { x: 12, y: 34 })
    ).not.toThrow();
    expect(editor.plugin(BlockMenuPlugin).store.get()).toMatchObject({
      openId: BLOCK_CONTEXT_MENU_ID,
      position: { x: 12, y: 34 },
    });
  });

  it('exposes option-state api on the Plite runtime route', () => {
    const editor = createPlateEditor({
      plugins: [BlockSelectionApiFixture, BlockMenuPlugin],
    });
    const api = editor.plugin(BlockMenuPlugin).api;

    api.show('block-a', { x: 12, y: 34 });

    expect(editor.plugin(BlockMenuPlugin).store.get()).toMatchObject({
      openId: 'block-a',
      position: { x: 12, y: 34 },
    });

    api.hide();

    expect(editor.plugin(BlockMenuPlugin).store.get()).toMatchObject({
      openId: null,
      position: { x: -10_000, y: -10_000 },
    });

    api.showContextMenu('block-b', { x: 56, y: 78 });

    expect(editor.plugin(BlockMenuPlugin).store.get()).toMatchObject({
      openId: BLOCK_CONTEXT_MENU_ID,
      position: { x: 56, y: 78 },
    });
    expect(
      [
        ...(editor.plugin(BlockSelectionApiFixture).store.get().selectedIds ??
          new Set<string>()),
      ].sort()
    ).toEqual(['block-b']);
  });
});
