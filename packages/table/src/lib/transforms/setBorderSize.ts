import type {
  Path,
  SetNodesOptions,
  SlateEditor,
  TTableCellBorder,
  TTableCellElement,
} from 'platejs';

import { ElementApi } from 'platejs';

import type { BorderDirection } from '../types';

import { getLeftTableCell } from '../queries/getLeftTableCell';
import { getTopTableCell } from '../queries/getTopTableCell';
import { getCellTypes } from '../utils/index';

export const setBorderSize = (
  editor: SlateEditor,
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

  const setNodesOptions: SetNodesOptions = {
    match: (n) =>
      ElementApi.isElement(n) && getCellTypes(editor).includes(n.type),
  };

  if (border === 'top') {
    const isFirstRow = rowIndex === 0;

    if (isFirstRow) {
      const newBorders: TTableCellElement['borders'] = {
        ...cellNode.borders,
        top: borderStyle,
      };

      editor.tf.setNodes<TTableCellElement>(
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
    editor.tf.setNodes<TTableCellElement>(
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
    editor.tf.setNodes<TTableCellElement>(
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

      editor.tf.setNodes<TTableCellElement>(
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
    editor.tf.setNodes<TTableCellElement>(
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
    editor.tf.setNodes<TTableCellElement>(
      { borders: newBorders },
      {
        at: cellPath,
        ...setNodesOptions,
      }
    );
  }
  if (border === 'all') {
    editor.tf.withoutNormalizing(() => {
      setBorderSize(editor, size, { at, border: 'top' });
      setBorderSize(editor, size, { at, border: 'bottom' });
      setBorderSize(editor, size, { at, border: 'left' });
      setBorderSize(editor, size, { at, border: 'right' });
    });
  }
};
