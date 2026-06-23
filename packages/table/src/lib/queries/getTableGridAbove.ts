import {
  type Element,
  ElementApi,
  type ElementEntry,
  type Location,
  PathApi,
} from '@platejs/slate';
import { type SlateEditor, KEYS } from 'platejs';

import type { TableConfig } from '../BaseTablePlugin';

import { getCellTypes } from '../../lib/utils';
import {
  type GetTableGridByRangeOptions,
  getTableGridByRange,
} from './getTableGridByRange';

type TableBlockOptions = NonNullable<
  Parameters<SlateEditor['api']['block']>[0]
>;

export type GetTableGridAboveOptions = Omit<TableBlockOptions, 'match'> &
  Pick<GetTableGridByRangeOptions, 'format'>;

const matchesCellType = (editor: SlateEditor, node: unknown): node is Element =>
  ElementApi.isElement(node) && getCellTypes(editor).includes(node.type);

const getEdgeCellBlocks = (
  editor: SlateEditor,
  options: GetTableGridAboveOptions
) => {
  const at = (options.at ?? editor.selection) as Location | null;

  if (!at) return null;

  const edges = editor.api.edges(at);

  if (!edges) return null;

  const [start, end] = edges;
  const startBlock = editor.api.above<Element>({
    ...options,
    at: start,
    match: (node) => matchesCellType(editor, node),
  });

  if (!startBlock) return null;

  const endBlock = editor.api.above<Element>({
    ...options,
    at: end,
    match: (node) => matchesCellType(editor, node),
  });

  if (!endBlock) return null;

  return [startBlock, endBlock] as const;
};

/** Get sub table above anchor and focus. Format: tables or cells. */
export const getTableGridAbove = (
  editor: SlateEditor,
  { format = 'table', ...options }: GetTableGridAboveOptions = {}
): ElementEntry[] => {
  const { api } = editor.getPlugin<TableConfig>({ key: KEYS.table });

  const edges = getEdgeCellBlocks(editor, options);

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
