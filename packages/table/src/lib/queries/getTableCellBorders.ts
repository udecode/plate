import { type SlateEditor, getParentNode } from '@udecode/plate-common';

import type {
  BorderDirection,
  BorderStyle,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

import { getCellIndices } from '../utils/getCellIndices';

export interface BorderStylesDefault {
  bottom: Required<BorderStyle>;
  right: Required<BorderStyle>;
  left?: Required<BorderStyle>;
  top?: Required<BorderStyle>;
}

export const getTableCellBorders = (
  editor: SlateEditor,
  {
    defaultBorder = {
      color: 'rgb(209 213 219)',
      size: 1,
      style: 'solid',
    },
    element,
  }: {
    element: TTableCellElement;
    defaultBorder?: Required<BorderStyle>;
  }
): BorderStylesDefault => {
  const cellPath = editor.findPath(element)!;
  const [rowNode, rowPath] = getParentNode<TTableRowElement>(editor, cellPath)!;
  const [tableNode] = getParentNode<TTableElement>(editor, rowPath)!;

  const { col } = getCellIndices(editor, {
    cellNode: element,
    tableNode,
  });
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
