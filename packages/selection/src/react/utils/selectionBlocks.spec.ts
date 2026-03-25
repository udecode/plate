import { createSlateEditor, type SlateEditor } from 'platejs';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { pasteSelectedBlocks } from './pasteSelectedBlocks';
import { selectInsertedBlocks } from './selectInsertedBlocks';

describe('selection block utils', () => {
  afterEach(() => {
    mock.restore();
  });

  describe('selectInsertedBlocks', () => {
    it('selects inserted block operations only', async () => {
      const editor = createSlateEditor({
        plugins: [BlockSelectionPlugin],
        value: [{ children: [{ text: 'one' }], id: 'p1', type: 'p' }],
      }) as SlateEditor;

      const platejs = await import('platejs');
      const setOption = mock();

      spyOn(platejs, 'getEditorPlugin').mockReturnValue({
        setOption,
      } as any);

      editor.operations = [
        {
          node: { children: [{ text: 'a' }], id: 'a', type: 'p' },
          path: [0],
          type: 'insert_node',
        },
        {
          node: { text: 'x' },
          offset: 0,
          path: [0, 0],
          type: 'insert_text',
        },
        {
          node: { children: [{ text: 'b' }], id: 'b', type: 'p' },
          path: [1],
          type: 'insert_node',
        },
      ] as any;

      selectInsertedBlocks(editor);

      expect(setOption).toHaveBeenCalledWith(
        'selectedIds',
        new Set(['a', 'b'])
      );
    });
  });

  describe('pasteSelectedBlocks', () => {
    it('inserts a spacer block after the last non-empty selected block and reselects inserted blocks', async () => {
      const editor = createSlateEditor({
        plugins: [BlockSelectionPlugin],
        value: [{ children: [{ text: 'one' }], id: 'p1', type: 'p' }],
      }) as SlateEditor;

      const selectedEntry = [
        { children: [{ text: 'one' }], id: 'p1', type: 'p' },
        [0],
      ] as const;

      const platejs = await import('platejs');
      const getEditorPluginSpy = spyOn(platejs, 'getEditorPlugin');
      const setOption = mock();

      const insertNodesSpy = spyOn(editor.tf, 'insertNodes').mockImplementation(
        (() => {}) as any
      );
      const insertDataSpy = spyOn(editor.tf, 'insertData').mockImplementation(
        (() => {}) as any
      );
      const createBlockSpy = spyOn(editor.api.create, 'block').mockReturnValue({
        children: [{ text: '' }],
        type: 'p',
      } as any);

      getEditorPluginSpy.mockReturnValue({
        api: {
          blockSelection: {
            getNodes: () => [selectedEntry],
          },
        },
        setOption,
      } as any);

      const event = {
        clipboardData: {} as DataTransfer,
      } as ClipboardEvent;

      pasteSelectedBlocks(editor, event);

      expect(createBlockSpy).toHaveBeenCalledWith({}, [1]);
      expect(insertNodesSpy).toHaveBeenCalledWith(
        { children: [{ text: '' }], type: 'p' },
        {
          at: [1],
          select: true,
        }
      );
      expect(insertDataSpy).toHaveBeenCalledWith(event.clipboardData);
      expect(setOption).toHaveBeenCalledWith('selectedIds', new Set());
    });
  });
});
