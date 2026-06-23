import type { EditorUpdateTransaction, Path } from '@platejs/plite';
import type {
  BasePlateEditor,
  TTableCellBorder,
  TTableCellElement,
} from 'platejs';

import { ElementApi } from '@platejs/plite';

import type { BorderDirection } from '../types';

import { getLeftTableCell } from '../queries/getLeftTableCell';
import { getTopTableCell } from '../queries/getTopTableCell';
import { getCellTypes } from '../utils/index';

type TableSetNodesOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['set']>[1]
>;

const setTableCellBorders = (
  editor: BasePlateEditor,
  borders: TTableCellElement['borders'],
  options: TableSetNodesOptions
) => {
  editor.update((tx) => {
    tx.nodes.set({ borders } satisfies Partial<TTableCellElement>, options);
  });
};

export const setBorderSize = (
  editor: BasePlateEditor,
  size: number,
  {
    at,
    border = 'all',
  }: {
    at?: Path;
    border?: BorderDirection | 'all';
  } = {}
) => {
  const cellEntry = editor.api.node<TTableCellElement>({
    at,
    match: { type: getCellTypes(editor) },
  });

  if (!cellEntry) return;

  const [cellNode, cellPath] = cellEntry;

  const cellIndex = cellPath.at(-1);
  const rowIndex = cellPath.at(-2);

  // Default hidden border style
  const borderStyle: TTableCellBorder = {
    size,
  };

  const setNodesOptions: TableSetNodesOptions = {
    match: (n: unknown) =>
      ElementApi.isElement(n) && getCellTypes(editor).includes(n.type),
  };

  if (border === 'top') {
    const isFirstRow = rowIndex === 0;

    if (isFirstRow) {
      const newBorders: TTableCellElement['borders'] = {
        ...cellNode.borders,
        top: borderStyle,
      };

      setTableCellBorders(editor, newBorders, {
        at: cellPath,
        ...setNodesOptions,
      });

      return;
    }

    const cellAboveEntry = getTopTableCell(editor, { at: cellPath });

    if (!cellAboveEntry) return;

    const [cellAboveNode, cellAbovePath] = cellAboveEntry;

    const newBorders: TTableCellElement['borders'] = {
      ...cellAboveNode.borders,
      bottom: borderStyle,
    };

    // Update the bottom border of the cell above
    setTableCellBorders(editor, newBorders, {
      at: cellAbovePath,
      ...setNodesOptions,
    });
  } else if (border === 'bottom') {
    const newBorders: TTableCellElement['borders'] = {
      ...cellNode.borders,
      bottom: borderStyle,
    };

    // Update the bottom border of the current cell
    setTableCellBorders(editor, newBorders, {
      at: cellPath,
      ...setNodesOptions,
    });
  }
  if (border === 'left') {
    const isFirstCell = cellIndex === 0;

    if (isFirstCell) {
      const newBorders: TTableCellElement['borders'] = {
        ...cellNode.borders,
        left: borderStyle,
      };

      setTableCellBorders(editor, newBorders, {
        at: cellPath,
        ...setNodesOptions,
      });

      return;
    }

    const prevCellEntry = getLeftTableCell(editor, { at: cellPath });

    if (!prevCellEntry) return;

    const [prevCellNode, prevCellPath] = prevCellEntry;

    const newBorders: TTableCellElement['borders'] = {
      ...prevCellNode.borders,
      right: borderStyle,
    };

    // Update the bottom border of the cell above
    setTableCellBorders(editor, newBorders, {
      at: prevCellPath,
      ...setNodesOptions,
    });
  } else if (border === 'right') {
    const newBorders: TTableCellElement['borders'] = {
      ...cellNode.borders,
      right: borderStyle,
    };

    // Update the right border of the current cell
    setTableCellBorders(editor, newBorders, {
      at: cellPath,
      ...setNodesOptions,
    });
  }
  if (border === 'all') {
    setBorderSize(editor, size, { at, border: 'top' });
    setBorderSize(editor, size, { at, border: 'bottom' });
    setBorderSize(editor, size, { at, border: 'left' });
    setBorderSize(editor, size, { at, border: 'right' });
  }
};
