import { SPEditor } from '@udecode/plate-core';
import { setIndent, SetIndentOptions } from './setIndent';

/**
 * Increase the indentation of the selected blocks.
 */
export const indent = (editor: SPEditor, options?: SetIndentOptions) => {
  setIndent(editor, { offset: 1, ...options });
};
