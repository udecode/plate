import type { EditorAboveOptions, SlateEditor } from '@udecode/plate';

import { BaseTablePlugin } from '../BaseTablePlugin';

export const getTableAbove = (
  editor: SlateEditor,
  options?: EditorAboveOptions
) =>
  editor.api.block({
    above: true,
    match: {
      type: editor.getType(BaseTablePlugin),
    },
    ...options,
  });
