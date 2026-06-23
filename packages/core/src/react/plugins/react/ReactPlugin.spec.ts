import type { PlateEditor } from '../../editor/PlateEditor';

import { getCurrentRuntimeTransforms } from '../../../internal/currentRuntimeBridge';
import { withLegacyTransformOverride } from '../../../internal/plugin/withLegacyTransformOverride';
import { createPlateEditor } from '../../../react/editor/withPlate';
import { createPlatePlugin } from '../../plugin/createPlatePlugin';

type CurrentRuntimeInsertDataEditor = PlateEditor & {
  insertData: ReturnType<typeof getCurrentRuntimeTransforms>['insertData'];
};

describe('ReactPlugin', () => {
  let editor: PlateEditor;

  beforeEach(() => {
    editor = createPlateEditor({ runtime: 'legacy' });
    const runtimeTransforms = getCurrentRuntimeTransforms(editor);
    editor.api.isFocused = mock();
    runtimeTransforms.focus = mock();

    // Reset mocks
    (editor.api.isFocused as ReturnType<typeof mock>).mockReset();
    (runtimeTransforms.focus as ReturnType<typeof mock>).mockReset();
  });

  it('allows overriding both legacy and new APIs', () => {
    const fn = mock();
    const fn2 = mock();
    editor = createPlateEditor({
      runtime: 'legacy',
      plugins: [
        withLegacyTransformOverride(
          createPlatePlugin({
            key: 'reactText',
            extendEditor: ({ editor }) => {
              const e = editor as CurrentRuntimeInsertDataEditor;
              const { insertData } = e;

              e.insertData = (data: any) => {
                fn();

                return insertData(data);
              };

              return editor;
            },
          }),
          ({ tf: { insertData } }) => ({
            tf: {
              insertData: (data: any) => {
                fn2();

                return insertData(data);
              },
            },
          })
        ),
      ],
    });

    const mockDataTransfer = {
      getData: (format: string) => (format === 'text/plain' ? 'test' : ''),
    } as DataTransfer;

    (editor as CurrentRuntimeInsertDataEditor).insertData(mockDataTransfer);
    getCurrentRuntimeTransforms(editor).insertData(mockDataTransfer);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn2).toHaveBeenCalledTimes(2);
  });

  it('override reset method', () => {
    (editor.api.isFocused as ReturnType<typeof mock>).mockReturnValue(true);

    getCurrentRuntimeTransforms(editor).reset();

    expect(getCurrentRuntimeTransforms(editor).focus).toHaveBeenCalledWith({
      edge: 'startEditor',
    });
  });

  it('does not focus editor if it was not focused before reset', () => {
    (editor.api.isFocused as ReturnType<typeof mock>).mockReturnValue(false);

    getCurrentRuntimeTransforms(editor).reset();

    expect(getCurrentRuntimeTransforms(editor).focus).not.toHaveBeenCalled();
  });
});
