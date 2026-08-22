import type { EditorStateView, Element, NodeEntry, Path } from '@platejs/plite';
import { ElementApi } from '@platejs/plite';

import type { TableCellElement } from '../BaseTablePlugin';
import { compileTableGrid, type TableGrid, type TableGridAnchor } from './grid';

export type TableContext = Readonly<{
  anchorAt: (row: number, col: number) => TableGridAnchor | null;
  anchorAtPath: (path: Path) => TableGridAnchor | undefined;
  anchorOf: (cell: TableCellElement) => TableGridAnchor | undefined;
  entryAt: (
    row: number,
    col: number
  ) => NodeEntry<TableCellElement> | undefined;
  grid: TableGrid;
  table: Element;
  tablePath: Path;
}>;

const createContext = (
  table: Element,
  tablePath: Path,
  grid: TableGrid
): TableContext => {
  const anchorAt = (row: number, col: number) => grid.slots[row]?.[col] ?? null;
  const relativeCellPath = (path: Path) => {
    if (path.length === 2) return path;
    if (path.length !== tablePath.length + 2) return undefined;
    if (!tablePath.every((index, offset) => path[offset] === index)) {
      return undefined;
    }

    return path.slice(tablePath.length);
  };

  return Object.freeze({
    anchorAt,
    anchorAtPath: (path: Path) => {
      const relativePath = relativeCellPath(path);

      return relativePath ? grid.byPath.get(relativePath.join(',')) : undefined;
    },
    anchorOf: (cell: TableCellElement) => {
      const direct = grid.byCell.get(cell);

      if (direct) return direct;

      return undefined;
    },
    entryAt: (row: number, col: number) => {
      const anchor = anchorAt(row, col);

      if (!anchor) return undefined;

      return [
        anchor.cell,
        tablePath.concat(anchor.path),
      ] as NodeEntry<TableCellElement>;
    },
    grid,
    table,
    tablePath,
  });
};

export const createDetachedTableContext = (
  table: Element,
  tablePath: Path = []
): TableContext => createContext(table, tablePath, compileTableGrid(table));

export const createTableContext = (
  state: Pick<EditorStateView, 'key' | 'nodes'>,
  tablePath: Path,
  root?: string
): TableContext | null => {
  const table = state.nodes.get(
    root ? { offset: 0, path: tablePath, root } : tablePath,
    { match: ElementApi.isElement }
  )?.[0];

  if (!table) return null;

  return createContext(
    table,
    tablePath,
    compileTableGrid(state, tablePath, root)
  );
};
