import type { GetAboveNodeOptions, SlateEditor } from '@udecode/plate-common';

import { BaseTablePlugin } from '../BaseTablePlugin';

export const getTableAbove = (
  editor: SlateEditor,
  options?: GetAboveNodeOptions
) =>
  editor.api.block({
    match: {
      type: editor.getType(BaseTablePlugin),
    },
    ...options,
  });
