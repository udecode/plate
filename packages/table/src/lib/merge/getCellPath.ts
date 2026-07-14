import type { NodeEntry } from '@platejs/plite';
import type { BaseEditor } from '@platejs/core';
import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '@platejs/utils';

import { getCellIndices } from '../utils/getCellIndices';

export const getCellPath = (
  editor: BaseEditor,
  tableEntry: NodeEntry<TTableElement>,
  curRowIndex: number,
  curColIndex: number
) => {
  const [tableNode, tablePath] = tableEntry;

  const rowElem = tableNode.children[curRowIndex] as TTableRowElement;
  const foundColIndex = rowElem.children.findIndex((c) => {
    const cE = c as TTableCellElement;
    const { col: colIndex } = getCellIndices(editor, cE);

    return colIndex === curColIndex;
  });

  return tablePath.concat([curRowIndex, foundColIndex]);
};
