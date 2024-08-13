import type { PlateEditor } from '@udecode/plate-common';

import { type SetIndentOptions, setIndent } from './setIndent';

/** Increase the indentation of the selected blocks. */
export const indent = <E extends PlateEditor>(
  editor: E,
  options?: SetIndentOptions<E>
) => {
  setIndent(editor, { offset: 1, ...options });
};
