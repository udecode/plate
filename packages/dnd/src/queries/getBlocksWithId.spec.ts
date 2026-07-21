import { createPlateEditor } from '@platejs/core/react';

import { getBlocksWithId } from './getBlocksWithId';

describe('getBlocksWithId', () => {
  it('collects only block nodes with ids', () => {
    const editor = createPlateEditor();
    editor.update.nodes.insert(
      [
        { children: [{ text: '' }], id: 'a', type: 'p' },
        { children: [{ text: '' }], type: 'p' },
        { children: [{ text: '' }], id: 'b', type: 'p' },
      ],
      { at: [0] }
    );

    expect(
      getBlocksWithId(editor, { at: [] }).map(([node, path]) => [node.id, path])
    ).toEqual([
      ['a', [0]],
      ['b', [2]],
    ]);
  });
});
