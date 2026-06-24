import { createBasePlateEditor, type BasePlateEditor } from 'platejs';

import { BlockSelectionPlugin } from '../BlockSelectionPlugin';
import { pasteSelectedBlocks } from './pasteSelectedBlocks';
import { selectInsertedBlocks } from './selectInsertedBlocks';

describe('selection block utils', () => {
  afterEach(() => {
    mock.restore();
  });

  describe('selectInsertedBlocks', () => {
    it('selects inserted block operations only', async () => {
      const editor = createBasePlateEditor({
        plugins: [BlockSelectionPlugin],
        value: [{ children: [{ text: 'one' }], id: 'p1', type: 'p' }],
      }) as BasePlateEditor;

      const platejs = await import('platejs');
      const setOption = mock();

      spyOn(platejs, 'getEditorPlugin').mockReturnValue({
        setOption,
      } as any);

      Object.defineProperty(editor, 'operations', {
        configurable: true,
        value: [
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
        ],
      });

      selectInsertedBlocks(editor);

      expect(setOption).toHaveBeenCalledWith(
        'selectedIds',
        new Set(['a', 'b'])
      );
    });
  });

  describe('pasteSelectedBlocks', () => {
    it('inserts a spacer block after the last non-empty selected block and reselects inserted blocks', async () => {
      const editor = createBasePlateEditor({
        plugins: [BlockSelectionPlugin],
        value: [{ children: [{ text: 'one' }], id: 'p1', type: 'p' }],
      }) as BasePlateEditor;

      const selectedEntry = [
        { children: [{ text: 'one' }], id: 'p1', type: 'p' },
        [0],
      ] as const;

      const platejs = await import('platejs');
      const getEditorPluginSpy = spyOn(platejs, 'getEditorPlugin');
      const setOption = mock();

      const insertNodes = mock();
      const setSelection = mock();
      const insertData = mock();
      const targetPoint = { offset: 0, path: [1, 0] };

      editor.update = mock((fn) =>
        fn({
          nodes: { insert: insertNodes },
          selection: { set: setSelection },
        } as any)
      ) as any;
      (editor.api as any).clipboard = { insertData };
      editor.api.end = mock(() => targetPoint) as any;
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

      expect(insertNodes).toHaveBeenCalledWith(
        { children: [{ text: '' }], type: 'p' },
        { at: [1] }
      );
      expect(setSelection).toHaveBeenCalledWith(targetPoint);
      expect(insertData).toHaveBeenCalledWith(event.clipboardData);
      expect(setOption).toHaveBeenCalledWith('selectedIds', new Set());
    });
  });
});
