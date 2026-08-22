import { createPlateEditor } from '@platejs/core/react';
import type { NodeKey } from '@platejs/plite';

import { BLOCK_CONTEXT_MENU_ID, BlockMenuPlugin } from './BlockMenuPlugin';
import { BlockSelectionPlugin } from './BlockSelectionPlugin';

describe('BlockMenuPlugin', () => {
  const blockA = 'block-a' as NodeKey;
  const blockB = 'block-b' as NodeKey;

  it('opens a context menu without BlockSelectionPlugin', () => {
    const editor = createPlateEditor({
      plugins: [BlockMenuPlugin],
    });
    const { api } = editor.plugin(BlockMenuPlugin);

    expect(() => api.showContextMenu(blockA, { x: 12, y: 34 })).not.toThrow();
    expect(editor.plugin(BlockMenuPlugin).store.get()).toMatchObject({
      openKey: BLOCK_CONTEXT_MENU_ID,
      position: { x: 12, y: 34 },
    });
  });

  it('exposes option-state api on the Plite runtime route', () => {
    const editor = createPlateEditor({
      plugins: [BlockSelectionPlugin, BlockMenuPlugin],
    });
    const { api } = editor.plugin(BlockMenuPlugin);

    api.show(blockA, { x: 12, y: 34 });

    expect(editor.plugin(BlockMenuPlugin).store.get()).toMatchObject({
      openKey: blockA,
      position: { x: 12, y: 34 },
    });

    api.hide();

    expect(editor.plugin(BlockMenuPlugin).store.get()).toMatchObject({
      openKey: null,
      position: { x: -10_000, y: -10_000 },
    });

    api.showContextMenu(blockB, { x: 56, y: 78 });

    expect(editor.plugin(BlockMenuPlugin).store.get()).toMatchObject({
      openKey: BLOCK_CONTEXT_MENU_ID,
      position: { x: 56, y: 78 },
    });
    expect(
      [
        ...(editor.plugin(BlockSelectionPlugin).store.get().selectedKeys ??
          new Set<NodeKey>()),
      ].sort((left, right) => left.localeCompare(right))
    ).toEqual([blockB]);
  });
});
