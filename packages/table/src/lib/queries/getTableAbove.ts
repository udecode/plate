import {
  type GetAboveNodeOptions,
  type SlateEditor,
  getBlockAbove,
} from '@udecode/plate-common';

import { BaseTablePlugin } from '../BaseTablePlugin';

export const getTableAbove = <E extends SlateEditor>(
  editor: E,
  options?: GetAboveNodeOptions<E>
) =>
  getBlockAbove(editor, {
    match: {
      type: editor.getType(BaseTablePlugin),
    },
    ...options,
  });
