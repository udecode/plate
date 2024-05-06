import {
  type GetAboveNodeOptions,
  type PlateEditor,
  type TElement,
  type TElementEntry,
  type Value,
  getEdgeBlocksAbove,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import { getCellTypes } from '../utils/getCellType';
import { getEmptyTableNode } from '../utils/getEmptyTableNode';
import {
  type GetTableGridByRangeOptions,
  getTableGridByRange,
} from './getTableGridByRange';

export type GetTableGridAboveOptions<V extends Value = Value> =
  GetAboveNodeOptions<V> & Pick<GetTableGridByRangeOptions, 'format'>;

/** Get sub table above anchor and focus. Format: tables or cells. */
export const getTableGridAbove = <V extends Value = Value>(
  editor: PlateEditor<V>,
  { format = 'table', ...options }: GetTableGridAboveOptions<V> = {}
): TElementEntry[] => {
  const edges = getEdgeBlocksAbove<TElement>(editor, {
    match: {
      type: getCellTypes(editor),
    },
    ...options,
  });

  if (edges) {
    const [start, end] = edges;

    if (!Path.equals(start[1], end[1])) {
      return getTableGridByRange(editor, {
        at: {
          anchor: {
            offset: 0,
            path: start[1],
          },
          focus: {
            offset: 0,
            path: end[1],
          },
        },
        format,
      });
    }
    if (format === 'table') {
      const table = getEmptyTableNode(editor, { rowCount: 1 });
      table.children[0].children = [start[0]];

      return [[table, start[1].slice(0, -2)]];
    }

    return [start];
  }

  return [];
};
