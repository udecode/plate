import { PlateEditor } from '@udecode/plate-core';
import { setIndent, SetIndentOptions } from './setIndent';

/**
 * Decrease the indentation of the selected blocks.
 */
export const outdent = (editor: PlateEditor, options?: SetIndentOptions) => {
  setIndent(editor, { offset: -1, ...options });
};
