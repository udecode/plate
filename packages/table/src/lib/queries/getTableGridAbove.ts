import {
  type EditorAboveOptions,
  type Element,
  type ElementEntry,
  PathApi,
} from '@platejs/plite';
import type { BaseEditor } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { TableConfig } from '../BaseTablePlugin';

import { getCellTypes } from '../../lib/utils';
import {
  type GetTableGridByRangeOptions,
  getTableGridByRange,
} from './getTableGridByRange';

export type GetTableGridAboveOptions = EditorAboveOptions<Element> &
  Pick<GetTableGridByRangeOptions, 'format'>;

/** Get sub table above anchor and focus. Format: tables or cells. */
export const getTableGridAbove = (
  editor: BaseEditor,
  { format = 'table', ...options }: GetTableGridAboveOptions = {}
): ElementEntry[] => {
  const { api } = editor.getPlugin<TableConfig>({ key: KEYS.table });
  const at = options.at ?? editor.read.selection();

  if (!at) return [];

  const edges = editor.read.ranges.edges(at);

  if (edges) {
    const [startPoint, endPoint] = edges;
    const start = editor.read.nodes.above<Element>({
      ...options,
      at: startPoint,
      match: { type: getCellTypes(editor) },
    });
    const end = editor.read.nodes.above<Element>({
      ...options,
      at: endPoint,
      match: { type: getCellTypes(editor) },
    });

    if (!start || !end) return [];

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
      const table = api.table.createTable({ rowCount: 1 });
      table.children[0].children = [start[0]];

      return [[table, start[1].slice(0, -2)]];
    }

    return [start];
  }

  return [];
};
