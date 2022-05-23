import {
  GetAboveNodeOptions,
  getEdgeBlocksAbove,
  PlateEditor,
  TElement,
  Value,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { getCellTypes } from '../utils/getCellType';
import { getEmptyTableNode } from '../utils/getEmptyTableNode';
import {
  getSubTableByRange,
  GetSubTableByRangeOptions,
} from './getSubTableByRange';

export type GetSubTableAboveOptions<
  V extends Value = Value
> = GetAboveNodeOptions<V> & Pick<GetSubTableByRangeOptions, 'format'>;

/**
 * Get grid cells above a location
 */
export const getSubTableAbove = <V extends Value = Value>(
  editor: PlateEditor<V>,
  { format = 'table', ...options }: GetSubTableAboveOptions<V> = {}
) => {
  const edges = getEdgeBlocksAbove<TElement>(editor, {
    match: {
      type: getCellTypes(editor),
    },
    ...options,
  });

  if (edges) {
    const [start, end] = edges;
    
    if (!Path.equals(start[1], end[1])) {
      return getSubTableByRange(editor, {
        at: {
          anchor: {
            path: start[1],
            offset: 0,
          },
          focus: {
            path: end[1],
            offset: 0,
          },
        },
        format,
      });
    }

    if (format === 'table') {
      const table = getEmptyTableNode(editor, { rowCount: 1 });
      table.children[0].children = [start[0]];
      return table;
    }

    return [start[0]];
  }
};
