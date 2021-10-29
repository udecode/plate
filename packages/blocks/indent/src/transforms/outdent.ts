import { SPEditor } from '@udecode/plate-core';
import { setIndent, SetIndentOptions } from './setIndent';

/**
 * Decrease the indentation of the selected blocks.
 */
export const outdent = (editor: SPEditor, options?: SetIndentOptions) => {
  setIndent(editor, { offset: -1, ...options });
};
