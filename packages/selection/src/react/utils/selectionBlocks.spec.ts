import { createBaseEditor, createBasePlugin } from '@platejs/core';

import { TestElementPropertiesPlugin } from '../../__tests__/testPlugins';
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
    it('selects blocks introduced by the last canonical change', () => {
      const editor = createBaseEditor({
        plugins: [BlockSelectionPlugin],
        initialValue: [{ children: [{ text: 'one' }], id: 'p1', type: 'p' }],
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

    it('does not select existing blocks changed by the last commit', () => {
      const editor = createBaseEditor({
        plugins: [BlockSelectionPlugin, TestElementPropertiesPlugin],
        initialValue: [{ children: [{ text: 'one' }], id: 'p1', type: 'p' }],
      });

      editor.update.nodes.set({ variant: 'lead' }, { at: [0] });

      selectInsertedBlocks(editor);

      expect(
        editor.plugin(BlockSelectionPlugin).getOption('selectedIds')
      ).toEqual(new Set());
    });
  });

  describe('pasteSelectedBlocks', () => {
    it('inserts a spacer block after the last non-empty selected block and pastes clipboard data', () => {
      const editor = createBaseEditor({
        plugins: [BlockSelectionPlugin],
        initialValue: [{ children: [{ text: 'one' }], id: 'p1', type: 'p' }],
      });
      const initialValue = editor.read.children();
      let commits = 0;
      const unsubscribe = editor.subscribeCommit(() => commits++);

      editor
        .plugin(BlockSelectionPlugin)
        .setOption('selectedIds', new Set(['p1']));
      const event = {
        clipboardData: createDataTransfer(),
      } as ClipboardEvent;

      pasteSelectedBlocks(editor, event);

      unsubscribe();

      expect(editor.read.children()[1]).toEqual({
        children: [{ text: 'pasted' }],
        type: 'p',
      });
      expect(commits).toBe(1);
      expect(editor.read.history.undos()).toHaveLength(1);

      editor.update.history.undo();

      expect(editor.read.children()).toEqual(initialValue);
      expect(editor.read.history.redos()).toHaveLength(1);
    });

    it('rolls back the spacer and block-selection side effect when clipboard insertion throws', () => {
      const throwingClipboardPlugin = createBasePlugin({
        key: 'throwing-clipboard',
      }).extendExtension({
        clipboard: {
          insertData() {
            throw new Error('clipboard failed');
          },
        },
      });
      const editor = createBaseEditor({
        plugins: [BlockSelectionPlugin, throwingClipboardPlugin],
        initialValue: [{ children: [{ text: 'one' }], id: 'p1', type: 'p' }],
      });
      const initialValue = editor.read.children();
      const selectedIds = new Set(['p1']);
      let commits = 0;
      const unsubscribe = editor.subscribeCommit(() => commits++);

      editor.plugin(BlockSelectionPlugin).setOption('selectedIds', selectedIds);
      const event = {
        clipboardData: createDataTransfer(),
      } as ClipboardEvent;

      expect(() => pasteSelectedBlocks(editor, event)).toThrow(
        'clipboard failed'
      );

      unsubscribe();

      expect(editor.read.children()).toEqual(initialValue);
      expect(commits).toBe(0);
      expect(editor.read.history.undos()).toHaveLength(0);
      expect(editor.plugin(BlockSelectionPlugin).getOption('selectedIds')).toBe(
        selectedIds
      );
    });
  });
});
