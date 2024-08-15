import {
  type GetAboveNodeOptions,
  type PlateEditor,
  getBlockAbove,
  getPluginType,
} from '@udecode/plate-common';

import { TablePlugin } from '../TablePlugin';

export const getTableAbove = <E extends PlateEditor>(
  editor: E,
  options?: GetAboveNodeOptions<E>
) =>
  getBlockAbove(editor, {
    match: {
      type: editor.getType(TablePlugin),
    },
    ...options,
  });
