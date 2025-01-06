import type { SlateEditor } from '@udecode/plate';

import { type SetIndentOptions, setIndent } from './setIndent';

/** Increase the indentation of the selected blocks. */
export const indent = (editor: SlateEditor, options?: SetIndentOptions) => {
  setIndent(editor, { offset: 1, ...options });
};
