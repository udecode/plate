import {
  type GetAboveNodeOptions,
  type PlateEditor,
  getBlockAbove,
  getPluginType,
} from '@udecode/plate-common';

import { ELEMENT_TABLE } from '../TablePlugin';

export const getTableAbove = <E extends PlateEditor>(
  editor: E,
  options?: GetAboveNodeOptions<E>
) =>
  getBlockAbove(editor, {
    match: {
      type: getPluginType(editor, ELEMENT_TABLE),
    },
    ...options,
  });
