import type { ValueOf } from '@udecode/plate-common';

import {
  type GetAboveNodeOptions,
  type PlateEditor,
  getBlockAbove,
  getPluginType,
} from '@udecode/plate-common/server';

import { ELEMENT_TABLE } from '../TablePlugin';

export const getTableAbove = <E extends PlateEditor>(
  editor: E,
  options?: GetAboveNodeOptions<ValueOf<E>>
) =>
  getBlockAbove(editor, {
    match: {
      type: getPluginType(editor, ELEMENT_TABLE),
    },
    ...options,
  });
