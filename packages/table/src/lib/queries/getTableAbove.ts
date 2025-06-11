import type { EditorAboveOptions, SlateEditor } from 'platejs';

import { KEYS } from 'platejs';

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
