import {
  type GetAboveNodeOptions,
  type SlateEditor,
  type TEditor,
  type TElement,
  type TElementEntry,
  getEdgeBlocksAbove,
} from '@udecode/plate-common';
import { Path } from 'slate';

import type { TableConfig } from '../BaseTablePlugin';

import { getCellTypes } from '../../lib/utils';
import {
  type GetTableGridByRangeOptions,
  getTableGridByRange,
} from './getTableGridByRange';

export type GetTableGridAboveOptions<E extends TEditor = TEditor> =
  GetAboveNodeOptions<E> & Pick<GetTableGridByRangeOptions, 'format'>;

/** Get sub table above anchor and focus. Format: tables or cells. */
export const getTableGridAbove = <E extends SlateEditor>(
  editor: E,
  { format = 'table', ...options }: GetTableGridAboveOptions<E> = {}
): TElementEntry[] => {
  const { api } = editor.getPlugin<TableConfig>({ key: 'table' });

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
      const table = api.create.table({ rowCount: 1 });
      table.children[0].children = [start[0]];

      return [[table, start[1].slice(0, -2)]];
    }

    return [start];
  }

  return [];
};
