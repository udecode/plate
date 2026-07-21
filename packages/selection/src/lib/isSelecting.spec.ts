import { createBaseEditor } from '@platejs/core';

import { BlockSelectionPlugin } from '../react/BlockSelectionPlugin';
import { isSelecting } from './isSelecting';

describe('isSelecting', () => {
  it('returns true when the editor selection is expanded', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      value: [{ children: [{ text: 'a' }], id: 'block1', type: 'p' }],
    });

    expect(isSelecting(editor)).toBe(true);
  });

  it('returns true when block selection says some blocks are being selected', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      value: [{ children: [{ text: 'a' }], id: 'block1', type: 'p' }],
    });

    editor
      .plugin(BlockSelectionPlugin)
      .setOption('selectedIds', new Set(['block1']));

    expect(isSelecting(editor)).toBe(true);
  });

  it('returns false when neither selection state is active', () => {
    const editor = createBaseEditor({
      plugins: [BlockSelectionPlugin],
      value: [{ children: [{ text: 'a' }], id: 'block1', type: 'p' }],
    });

    expect(isSelecting(editor)).toBe(false);
  });
});
