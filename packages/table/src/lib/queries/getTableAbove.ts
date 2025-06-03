import type { EditorAboveOptions, SlateEditor } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

export const getTableAbove = (
  editor: SlateEditor,
  options?: EditorAboveOptions
) =>
  editor.api.block({
    above: true,
    match: {
      type: editor.getType(KEYS.table),
    },
    ...options,
  });
