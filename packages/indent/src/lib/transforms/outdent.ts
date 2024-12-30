import type { SlateEditor } from '@udecode/plate-common';

import { type SetIndentOptions, setIndent } from './setIndent';

/** Decrease the indentation of the selected blocks. */
export const outdent = (editor: SlateEditor, options?: SetIndentOptions) => {
  setIndent(editor, { offset: -1, ...options });
};
