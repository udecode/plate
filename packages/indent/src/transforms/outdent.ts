import type { PlateEditor, Value } from '@udecode/plate-common/server';

import { type SetIndentOptions, setIndent } from './setIndent';

/** Decrease the indentation of the selected blocks. */
export const outdent = <V extends Value>(
  editor: PlateEditor<V>,
  options?: SetIndentOptions<V>
) => {
  setIndent(editor, { offset: -1, ...options });
};
