import type { PlateEditor } from '../../editor/PlateEditor';

import { createPlateEditor } from '../../../react/editor/withPlate';

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
