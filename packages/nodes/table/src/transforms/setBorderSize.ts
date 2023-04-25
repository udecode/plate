import {
  findNode,
  isElement,
  PlateEditor,
  setNodes,
  SetNodesOptions,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path } from 'slate';
import { getLeftTableCell } from '../queries/getLeftTableCell';
import { getTopTableCell } from '../queries/getTopTableCell';
import { BorderDirection, BorderStyle, TTableCellElement } from '../types';
import { getCellTypes } from '../utils/index';

export const setBorderSize = <V extends Value>(
  editor: PlateEditor<V>,
  size: number,
  {
    at,
    border = 'all',
  }: {
    at?: Path;
    border?: 'all' | BorderDirection;
  } = {}
) => {
  const cellEntry = findNode<TTableCellElement>(editor, {
    at,
    match: { type: getCellTypes(editor) },
  });
  if (!cellEntry) return;

  const [cellNode, cellPath] = cellEntry;

  const cellIndex = cellPath[cellPath.length - 1];
  const rowIndex = cellPath[cellPath.length - 2];

  // Default hidden border style
  const borderStyle: BorderStyle = {
    size,
  };

  const setNodesOptions: SetNodesOptions = {
    match: (n) => isElement(n) && getCellTypes(editor).includes(n.type),
  };

  if (border === 'top') {
    const isFirstRow = rowIndex === 0;

    if (isFirstRow) {
      const newBorders: TTableCellElement['borders'] = {
        ...cellNode.borders,
        top: borderStyle,
      };

      setNodes<TTableCellElement>(
        editor,
        { borders: newBorders },
        {
          at: cellPath,
          ...setNodesOptions,
        }
      );
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
    setNodes<TTableCellElement>(
      editor,
      { borders: newBorders },
      {
        at: cellAbovePath,
        ...setNodesOptions,
      }
    );
  } else if (border === 'bottom') {
    const newBorders: TTableCellElement['borders'] = {
      ...cellNode.borders,
      bottom: borderStyle,
    };

    // Update the bottom border of the current cell
    setNodes<TTableCellElement>(
      editor,
      { borders: newBorders },
      {
        at: cellPath,
        ...setNodesOptions,
      }
    );
  }

  if (border === 'left') {
    const isFirstCell = cellIndex === 0;

    if (isFirstCell) {
      const newBorders: TTableCellElement['borders'] = {
        ...cellNode.borders,
        left: borderStyle,
      };

      setNodes<TTableCellElement>(
        editor,
        { borders: newBorders },
        {
          at: cellPath,
          ...setNodesOptions,
        }
      );
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
    setNodes<TTableCellElement>(
      editor,
      { borders: newBorders },
      {
        at: prevCellPath,
        ...setNodesOptions,
      }
    );
  } else if (border === 'right') {
    const newBorders: TTableCellElement['borders'] = {
      ...cellNode.borders,
      right: borderStyle,
    };

    // Update the right border of the current cell
    setNodes<TTableCellElement>(
      editor,
      { borders: newBorders },
      {
        at: cellPath,
        ...setNodesOptions,
      }
    );
  }

  if (border === 'all') {
    withoutNormalizing(editor, () => {
      setBorderSize(editor, size, { at, border: 'top' });
      setBorderSize(editor, size, { at, border: 'bottom' });
      setBorderSize(editor, size, { at, border: 'left' });
      setBorderSize(editor, size, { at, border: 'right' });
    });
  }
};
