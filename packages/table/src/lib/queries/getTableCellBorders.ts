import type { BaseEditor } from '@platejs/core';
import type {
  TTableCellBorder,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '@platejs/utils';

import { KEYS } from '@platejs/utils';

import type { BorderDirection } from '../types';

import { type CellIndices, getCellIndices } from '../utils/getCellIndices';

export type BorderStylesDefault = {
  bottom: TTableCellBorder;
  right: TTableCellBorder;
  left?: TTableCellBorder;
  top?: TTableCellBorder;
};

export const getTableCellBorders = (
  editor: BaseEditor,
  {
    cellIndices,
    defaultBorder = {
      size: 1,
    },
    element,
  }: {
    element: TTableCellElement;
    cellIndices?: CellIndices;
    defaultBorder?: TTableCellBorder;
  }
): BorderStylesDefault => {
  const cellPath = editor.read.nodes.path(element);

  if (!cellPath) {
    return {
      bottom: defaultBorder,
      right: defaultBorder,
    };
  }

  const [rowNode, rowPath] =
    editor.read.nodes.parent<TTableRowElement>(cellPath) ?? [];
  if (!rowNode || !rowPath) {
    return {
      bottom: defaultBorder,
      right: defaultBorder,
    };
  }
  const [tableNode] = editor.read.nodes.parent<TTableElement>(rowPath) ?? [];
  const tableType = editor.getType(KEYS.table);

  if (!tableNode || tableNode.type !== tableType) {
    return {
      bottom: defaultBorder,
      right: defaultBorder,
    };
  }

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
