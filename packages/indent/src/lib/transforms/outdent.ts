import type { BasePlateEditor } from 'platejs';

import { type SetIndentOptions, setIndent } from './setIndent';

/** Decrease the indentation of the selected blocks. */
export const outdent = (
  editor: BasePlateEditor,
  options?: SetIndentOptions
) => {
  setIndent(editor, { offset: -1, ...options });
};
