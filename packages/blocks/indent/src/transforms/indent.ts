import { PlateEditor } from '@udecode/plate-core';
import { setIndent, SetIndentOptions } from './setIndent';

/**
 * Increase the indentation of the selected blocks.
 */
export const indent = (editor: PlateEditor, options?: SetIndentOptions) => {
  setIndent(editor, { offset: 1, ...options });
};
