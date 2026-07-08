import { createBaseEditor } from '@platejs/core';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { pasteSelectedBlocks } from './pasteSelectedBlocks';
import { selectInsertedBlocks } from './selectInsertedBlocks';

const createDataTransfer = () =>
  ({
    getData: mock((type: string) => (type === 'text/plain' ? 'pasted' : '')),
    setData: mock(),
  }) as unknown as DataTransfer;

describe('selection block utils', () => {
  afterEach(() => {
    mock.restore();
  });

  describe('selectInsertedBlocks', () => {
    it('selects inserted block operations only', () => {
      const editor = createBaseEditor({
        plugins: [BlockSelectionPlugin],
        value: [{ children: [{ text: 'one' }], id: 'p1', type: 'p' }],
      });

      editor.update.nodes.insert(
        [
          { children: [{ text: 'a' }], id: 'a', type: 'p' },
          { children: [{ text: 'b' }], id: 'b', type: 'p' },
        ],
        { at: [1] }
      );

      selectInsertedBlocks(editor);

      expect(
        editor.plugin(BlockSelectionPlugin).getOption('selectedIds')
      ).toEqual(new Set(['a', 'b']));
    });
  });

  describe('pasteSelectedBlocks', () => {
    it('inserts a spacer block after the last non-empty selected block and pastes clipboard data', () => {
      const editor = createBaseEditor({
        plugins: [BlockSelectionPlugin],
        value: [{ children: [{ text: 'one' }], id: 'p1', type: 'p' }],
      });

      editor
        .plugin(BlockSelectionPlugin)
        .setOption('selectedIds', new Set(['p1']));
      const event = {
        clipboardData: createDataTransfer(),
      } as ClipboardEvent;

      pasteSelectedBlocks(editor, event);

      expect(editor.read.children()[1]).toEqual({
        children: [{ text: 'pasted' }],
        type: 'p',
      });
    });
  });
});
