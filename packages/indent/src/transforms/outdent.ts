import { PlateEditor, Value } from '@udecode/plate-common';

import { SetIndentOptions, setIndent } from './setIndent';

/**
 * Decrease the indentation of the selected blocks.
 */
export const outdent = <V extends Value>(
  editor: PlateEditor<V>,
  options?: SetIndentOptions<V>
) => {
  setIndent(editor, { offset: -1, ...options });
};
