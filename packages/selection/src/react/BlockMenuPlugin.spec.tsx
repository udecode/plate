import { KEYS } from 'platejs';
import { createPlateEditor, createTPlatePlugin } from 'platejs/react';

import type { BlockSelectionConfig } from './BlockSelectionPlugin';

import {
  BLOCK_CONTEXT_MENU_ID,
  type BlockMenuConfig,
  BlockMenuPlugin,
} from './BlockMenuPlugin';

const BlockSelectionApiFixture = createTPlatePlugin<BlockSelectionConfig>({
  key: KEYS.blockSelection,
  options: {
    selectedIds: new Set<string>(),
  },
}).extendApi<Partial<BlockSelectionConfig['api']['blockSelection']>>(
  ({ setOption }) => ({
    set: (id) => {
      setOption('selectedIds', new Set(Array.isArray(id) ? id : [id]));
    },
  })
);

describe('BlockMenuPlugin', () => {
  it('exposes option-state api on the Plite runtime route', () => {
    const editor = createPlateEditor({
      plugins: [BlockSelectionApiFixture, BlockMenuPlugin],
      runtime: 'plite',
    });
    const api = editor.api as BlockMenuConfig['api'];

    api.blockMenu.show('block-a', { x: 12, y: 34 });

    expect(editor.getOptions(BlockMenuPlugin)).toMatchObject({
      openId: 'block-a',
      position: { x: 12, y: 34 },
    });

    api.blockMenu.hide();

    expect(editor.getOptions(BlockMenuPlugin)).toMatchObject({
      openId: null,
      position: { x: -10_000, y: -10_000 },
    });

    api.blockMenu.showContextMenu('block-b', { x: 56, y: 78 });

    expect(editor.getOptions(BlockMenuPlugin)).toMatchObject({
      openId: BLOCK_CONTEXT_MENU_ID,
      position: { x: 56, y: 78 },
    });
    expect(
      [
        ...(editor.getOptions<BlockSelectionConfig['options']>(
          BlockSelectionApiFixture
        ).selectedIds ?? new Set<string>()),
      ].sort()
    ).toEqual(['block-b']);
  });
});
