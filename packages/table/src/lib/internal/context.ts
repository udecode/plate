import type { EditorStateView, NodeEntry, Path } from '@platejs/plite';
import type { TTableCellElement, TTableElement } from '@platejs/utils';

import { compileTableGrid, type TableGrid, type TableGridAnchor } from './grid';

export type TableContext = Readonly<{
  anchorAt: (row: number, col: number) => TableGridAnchor | null;
  anchorAtPath: (path: Path) => TableGridAnchor | undefined;
  anchorOf: (cell: TTableCellElement) => TableGridAnchor | undefined;
  entryAt: (
    row: number,
    col: number
  ) => NodeEntry<TTableCellElement> | undefined;
  grid: TableGrid;
  table: TTableElement;
  tablePath: Path;
}>;

export const createDetachedTableContext = (
  table: TTableElement,
  tablePath: Path = []
): TableContext => {
  const grid = compileTableGrid(table);
  const anchorAt = (row: number, col: number) => grid.slots[row]?.[col] ?? null;
  const relativeCellPath = (path: Path) => {
    if (path.length === 2) return path;
    if (path.length !== tablePath.length + 2) return;
    if (!tablePath.every((index, offset) => path[offset] === index)) return;

    return path.slice(tablePath.length);
  };

  return Object.freeze({
    anchorAt,
    anchorAtPath: (path: Path) => {
      const relativePath = relativeCellPath(path);

      return relativePath ? grid.byPath.get(relativePath.join(',')) : undefined;
    },
    anchorOf: (cell: TTableCellElement) =>
      grid.byCell.get(cell) ?? (cell.id ? grid.byId.get(cell.id) : undefined),
    entryAt: (row: number, col: number) => {
      const anchor = anchorAt(row, col);

      if (!anchor) return;

      return [
        anchor.cell,
        tablePath.concat(anchor.path),
      ] as NodeEntry<TTableCellElement>;
    },
    grid,
    table,
    tablePath,
  });
};

export const createTableContext = (
  state: Pick<EditorStateView, 'nodes'>,
  tablePath: Path
): TableContext | null => {
  const table = state.nodes.get<TTableElement>(tablePath)?.[0];

  if (!table) return null;

  return createDetachedTableContext(table, tablePath);
};
