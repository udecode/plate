import {
  findNode,
  getNodeEntry,
  isElement,
  PlateEditor,
  setNodes,
  SetNodesOptions,
} from '@udecode/plate-common';
import { Path } from 'slate';
import { BorderStyle, TTableCellElement } from '../types';
import { getCellTypes } from '../utils/index';

export const setBorderSize = (
  editor: PlateEditor,
  size: number,
  {
    at,
    border = 'all',
  }: {
    at?: Path;
    border?: 'all' | 'top' | 'bottom' | 'left' | 'right';
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

    // TODO: extract helper
    const findCellAbove = () => {
      // If the current cell is in the first row, there is no cell above it
      if (rowIndex === 0) return;

      const cellAbovePath = [
        ...Path.parent(Path.parent(cellPath)),
        rowIndex - 1,
        cellIndex,
      ];
      return getNodeEntry<TTableCellElement>(editor, cellAbovePath);
    };

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

    const cellAboveEntry = findCellAbove();
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

    const prevCellPath = Path.previous(cellPath);
    const prevCellNode = getNodeEntry<TTableCellElement>(
      editor,
      prevCellPath
    )?.[0];
    if (!prevCellNode) return;

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
};
