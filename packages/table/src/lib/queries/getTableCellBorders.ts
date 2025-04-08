import type { SlateEditor } from '@udecode/plate';

import type {
  BorderDirection,
  BorderStyle,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

import { type CellIndices, getCellIndices } from '../utils/getCellIndices';

export interface BorderStylesDefault {
  bottom: BorderStyle;
  right: BorderStyle;
  left?: BorderStyle;
  top?: BorderStyle;
}

export const getTableCellBorders = (
  editor: SlateEditor,
  {
    cellIndices,
    defaultBorder = {
      size: 1,
    },
    element,
  }: {
    element: TTableCellElement;
    cellIndices?: CellIndices;
    defaultBorder?: BorderStyle;
  }
): BorderStylesDefault => {
  const cellPath = editor.api.findPath(element)!;
  const [rowNode, rowPath] =
    editor.api.parent<TTableRowElement>(cellPath) ?? [];
  if (!rowNode || !rowPath) {
    return {
      bottom: defaultBorder,
      right: defaultBorder,
    };
  }
  const [tableNode] = editor.api.parent<TTableElement>(rowPath)!;

  const { col } = cellIndices ?? getCellIndices(editor, element);
  const isFirstCell = col === 0;
  const isFirstRow = tableNode.children?.[0] === rowNode;

  const getBorder = (dir: BorderDirection) => {
    const border = element.borders?.[dir];

    return {
      color: border?.color ?? defaultBorder.color,
      size: border?.size ?? defaultBorder.size,
      style: border?.style ?? defaultBorder.style,
    };
  };

  return {
    bottom: getBorder('bottom'),
    left: isFirstCell ? getBorder('left') : undefined,
    right: getBorder('right'),
    top: isFirstRow ? getBorder('top') : undefined,
  };
};
