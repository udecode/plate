import {
  GetAboveNodeOptions,
  PlateEditor,
  Value,
  getBlockAbove,
  getPluginType,
} from '@udecode/plate-common';

import { ELEMENT_TABLE } from '../createTablePlugin';

export const getTableAbove = <V extends Value = Value>(
  editor: PlateEditor<V>,
  options?: GetAboveNodeOptions<V>
) =>
  getBlockAbove(editor, {
    match: {
      type: getPluginType(editor, ELEMENT_TABLE),
    },
    ...options,
  });
