import type { NodeEntry, Path } from '@platejs/plite';
import type { BaseEditor } from '@platejs/core';
import type { TTableCellElement } from '@platejs/utils';

import type { BorderDirection } from '../types';

import { getLeftTableCell } from '../queries/getLeftTableCell';
import { getTopTableCell } from '../queries/getTopTableCell';
import { getCellTypes } from '../utils/index';

export type SetBorderSizeOptions = {
  at?: Path;
  border?: BorderDirection | 'all';
  size: number;
};

/** Apply cell border updates in one undoable editor transaction. */
export const setBorderSizes = (
  editor: BaseEditor,
  options: readonly SetBorderSizeOptions[]
) => {
  const updates = new Map<
    string,
    { borders: TTableCellElement['borders']; path: Path }
  >();
  const addBorder = (
    [node, path]: NodeEntry<TTableCellElement>,
    direction: BorderDirection,
    size: number
  ) => {
    const key = path.join(',');
    const current = updates.get(key);

    updates.set(key, {
      borders: {
        ...(current?.borders ?? node.borders),
        [direction]: { size },
      },
      path,
    });
  };

  options.forEach(({ at, border = 'all', size }) => {
    const cellEntry = editor.read.nodes.find<TTableCellElement>({
      at,
      match: { type: getCellTypes(editor) },
    });

    if (!cellEntry) return;

    const [, cellPath] = cellEntry;
    const cellIndex = cellPath.at(-1);
    const rowIndex = cellPath.at(-2);
    const addDirection = (direction: BorderDirection) => {
      if (direction === 'top') {
        if (rowIndex === 0) return addBorder(cellEntry, 'top', size);

        const cellAbove = getTopTableCell(editor, { at: cellPath });

        if (cellAbove) addBorder(cellAbove, 'bottom', size);
        return;
      }
      if (direction === 'left') {
        if (cellIndex === 0) return addBorder(cellEntry, 'left', size);

        const cellLeft = getLeftTableCell(editor, { at: cellPath });

        if (cellLeft) addBorder(cellLeft, 'right', size);
        return;
      }

      addBorder(cellEntry, direction, size);
    };

    (border === 'all'
      ? (['top', 'bottom', 'left', 'right'] as const)
      : [border]
    ).forEach(addDirection);
  });

  editor.update((tx) => {
    updates.forEach(({ borders, path }) => {
      tx.nodes.set<TTableCellElement>({ borders }, { at: path });
    });
  });
};

/** Apply one cell border size update. */
export const setBorderSize = (
  editor: BaseEditor,
  size: number,
  {
    at,
    border = 'all',
  }: {
    at?: Path;
    border?: BorderDirection | 'all';
  } = {}
) => setBorderSizes(editor, [{ at, border, size }]);
