import type { PlateEditor } from '../../editor/PlateEditor';

import { getCurrentRuntimeTransforms } from '../../../internal/currentRuntimeBridge';
import { withLegacyTransformOverride } from '../../../internal/plugin/withLegacyTransformOverride';
import { createPlateEditor } from '../../../react/editor/withPlate';
import { createPlatePlugin } from '../../plugin/createPlatePlugin';

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

  it('allows overriding current runtime transforms', () => {
    const fn2 = mock();
    editor = createPlateEditor({
      plugins: [
        withLegacyTransformOverride(
          createPlatePlugin({
            key: 'reactText',
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
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    const mockDataTransfer = {
      getData: (format: string) => (format === 'text/plain' ? 'test' : ''),
    } as DataTransfer;

    editor.update(() => {
      getCurrentRuntimeTransforms(editor).insertData(mockDataTransfer);
    });

    expect(fn2).toHaveBeenCalledTimes(1);
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
