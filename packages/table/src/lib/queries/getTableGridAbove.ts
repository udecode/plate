import {
  type EditorAboveOptions,
  type ElementEntry,
  type SlateEditor,
  PathApi,
} from '@udecode/plate';

import type { TableConfig } from '../BaseTablePlugin';

import { getCellTypes } from '../../lib/utils';
import {
  type GetTableGridByRangeOptions,
  getTableGridByRange,
} from './getTableGridByRange';

export type GetTableGridAboveOptions = EditorAboveOptions &
  Pick<GetTableGridByRangeOptions, 'format'>;

/** Get sub table above anchor and focus. Format: tables or cells. */
export const getTableGridAbove = (
  editor: SlateEditor,
  { format = 'table', ...options }: GetTableGridAboveOptions = {}
): ElementEntry[] => {
  const { api } = editor.getPlugin<TableConfig>({ key: 'table' });

  const edges = editor.api.edgeBlocks({
    match: {
      type: getCellTypes(editor),
    },
    ...options,
  });

  if (edges) {
    const [start, end] = edges;

    if (!PathApi.equals(start[1], end[1])) {
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
