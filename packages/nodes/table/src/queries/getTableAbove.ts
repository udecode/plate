import {
  getBlockAbove,
  getPluginType,
  PlateEditor,
  Value,
} from '@udecode/plate-core';
import { GetAboveNodeOptions } from '@udecode/plate-core/src/index';
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
