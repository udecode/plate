import {
  type GetAboveNodeOptions,
  type SlateEditor,
  getBlockAbove,
} from '@udecode/plate-common';

import { BaseTablePlugin } from '../BaseTablePlugin';

export const getTableAbove = (
  editor: SlateEditor,
  options?: GetAboveNodeOptions
) =>
  getBlockAbove(editor, {
    match: {
      type: editor.getType(BaseTablePlugin),
    },
    ...options,
  });
