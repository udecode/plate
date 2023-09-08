import {
  GetAboveNodeOptions,
  getEdgeBlocksAbove,
  PlateEditor,
  TElement,
  TElementEntry,
  Value,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { getCellTypes } from '../utils/getCellType';
import { getEmptyTableNode } from '../utils/getEmptyTableNode';
import {
  FormatType,
  getTableGridByRange,
  GetTableGridByRangeOptions,
  GetTableGridReturnType,
} from './getTableGridByRange';

export type GetTableGridAboveOptions<
  T extends FormatType,
  V extends Value = Value,
> = GetAboveNodeOptions<V> & Pick<GetTableGridByRangeOptions<T>, 'format'>;

/**
 * Get sub table above anchor and focus.
 * Format: tables or cells.
 */
export const getTableGridAbove = <
  T extends FormatType,
  V extends Value = Value,
>(
  editor: PlateEditor<V>,
  { format, ...options }: GetTableGridAboveOptions<T, V>
): GetTableGridReturnType<T> => {
  const formatType = (format as string) || 'table';
  const edges = getEdgeBlocksAbove<TElement>(editor, {
    match: {
      type: getCellTypes(editor),
    },
    ...options,
  });

  if (edges) {
    const [start, end] = edges;

    if (!Path.equals(start[1], end[1])) {
      const entryResult = getTableGridByRange(editor, {
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

      return entryResult;
    }

    const table = getEmptyTableNode(editor, { rowCount: 1 });
    table.children[0].children = [start[0]];
    if (formatType === 'table') {
      return [[table, start[1].slice(0, -2)]] as GetTableGridReturnType<T>;
    }

    if (formatType === 'cell') {
      return [start] as GetTableGridReturnType<T>;
    }

    console.log('return all', start, table);

    return {
      tableEntries: [[table, start[1].slice(0, -2)]],
      cellEntries: [start],
    } as GetTableGridReturnType<T>;
  }
  return [] as TElementEntry[] as GetTableGridReturnType<T>;
};
