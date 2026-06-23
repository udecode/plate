import {
  type Element,
  ElementApi,
  type ElementEntry,
  type Location,
  PathApi,
} from '@platejs/plite';
import { type BasePlateEditor, KEYS } from 'platejs';

import type { TableConfig } from '../BaseTablePlugin';

import { getCellTypes } from '../../lib/utils';
import {
  type GetTableGridByRangeOptions,
  getTableGridByRange,
} from './getTableGridByRange';

type TableBlockOptions = NonNullable<
  Parameters<BasePlateEditor['api']['block']>[0]
>;

export type GetTableGridAboveOptions = Omit<TableBlockOptions, 'match'> &
  Pick<GetTableGridByRangeOptions, 'format'>;

const matchesCellType = (
  editor: BasePlateEditor,
  node: unknown
): node is Element =>
  ElementApi.isElement(node) && getCellTypes(editor).includes(node.type);

const getEdgeCellBlocks = (
  editor: BasePlateEditor,
  options: GetTableGridAboveOptions
) => {
  const at = (options.at ?? editor.selection) as Location | null;

  if (!at) return null;

  const edges =
    typeof editor.api.edges === 'function'
      ? editor.api.edges(at)
      : editor.read((state) => state.ranges.edges(at));

  if (!edges) return null;

  const [start, end] = edges;
  const startBlock =
    typeof editor.api.above === 'function'
      ? editor.api.above<Element>({
          ...options,
          at: start,
          match: (node) => matchesCellType(editor, node),
        })
      : editor.read((state) =>
          state.nodes.above<Element>({
            ...options,
            at: start,
            match: (node: unknown) => matchesCellType(editor, node),
          } as any)
        );

  if (!startBlock) return null;

  const endBlock =
    typeof editor.api.above === 'function'
      ? editor.api.above<Element>({
          ...options,
          at: end,
          match: (node) => matchesCellType(editor, node),
        })
      : editor.read((state) =>
          state.nodes.above<Element>({
            ...options,
            at: end,
            match: (node: unknown) => matchesCellType(editor, node),
          } as any)
        );

  if (!endBlock) return null;

  return [startBlock, endBlock] as const;
};

/** Get sub table above anchor and focus. Format: tables or cells. */
export const getTableGridAbove = (
  editor: BasePlateEditor,
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
