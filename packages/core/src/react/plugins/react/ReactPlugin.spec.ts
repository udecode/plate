import type { LegacyEditorMethods } from '@udecode/slate';

import type { PlateEditor } from '../../editor/PlateEditor';

import { createPlateEditor } from '../../../react/editor/withPlate';
import { createPlatePlugin } from '../../plugin/createPlatePlugin';

describe('ReactPlugin', () => {
  let editor: PlateEditor;

  beforeEach(() => {
    editor = createPlateEditor();
    editor.api.isFocused = jest.fn();
    editor.tf.focus = jest.fn();

    // Reset mocks
    (editor.api.isFocused as jest.Mock).mockReset();
    (editor.tf.focus as jest.Mock).mockReset();
  });

  it('both legacy and new api should be overriddable', () => {
    const fn = jest.fn();
    const fn2 = jest.fn();
    editor = createPlateEditor({
      plugins: [
        createPlatePlugin({
          key: 'reactText',
          extendEditor: ({ editor }) => {
            const e = editor as typeof editor & LegacyEditorMethods;
            const { insertData } = e;

            e.insertData = (data: any) => {
              fn();

              return insertData(data);
            };

            return editor;
          },
        }).extendEditorTransforms(({ tf: { insertData } }) => ({
          insertData: (data: any) => {
            fn2();

            return insertData(data);
          },
        })),
      ],
    });

    const mockDataTransfer = {
      getData: (format: string) => (format === 'text/plain' ? 'test' : ''),
    } as DataTransfer;

    (editor as typeof editor & LegacyEditorMethods).insertData(
      mockDataTransfer
    );
    editor.tf.insertData(mockDataTransfer);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn2).toHaveBeenCalledTimes(2);
  });

  it('should override reset method', () => {
    (editor.api.isFocused as jest.Mock).mockReturnValue(true);

    editor.tf.reset();

    expect(editor.tf.focus).toHaveBeenCalledWith({ edge: 'startEditor' });
  });

  it('should not focus editor if it was not focused before reset', () => {
    (editor.api.isFocused as jest.Mock).mockReturnValue(false);

    editor.tf.reset();

    expect(editor.tf.focus).not.toHaveBeenCalled();
  });
});
