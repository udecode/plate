import { focusEditorEdge } from '@udecode/slate';

import type { PlateEditor } from '../../editor/PlateEditor';

import { createPlateEditor } from '../../../react/editor/withPlate';

// Mock the slate-react functions
jest.mock('@udecode/slate', () => ({
  ...jest.requireActual('@udecode/slate'),
  focusEditorEdge: jest.fn(),
}));

describe('ReactPlugin', () => {
  let editor: PlateEditor;

  beforeEach(() => {
    editor = createPlateEditor();
    editor.api.isFocused = jest.fn();

    // Reset mocks
    (editor.api.isFocused as jest.Mock).mockReset();
    (focusEditorEdge as jest.Mock).mockReset();
  });

  it('should override reset method', () => {
    (editor.api.isFocused as jest.Mock).mockReturnValue(true);

    editor.tf.reset();

    expect(focusEditorEdge).toHaveBeenCalledWith(editor, { edge: 'start' });
  });

  it('should not focus editor if it was not focused before reset', () => {
    (editor.api.isFocused as jest.Mock).mockReturnValue(false);

    editor.tf.reset();

    expect(focusEditorEdge).not.toHaveBeenCalled();
  });
});
