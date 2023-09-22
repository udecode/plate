import { TNodeEntry } from '@udecode/plate-common';

import { TTableCellElement, TTableElement, TTableRowElement } from '../types';

export const getCellPath = (
  tableEntry: TNodeEntry<TTableElement>,
  curCell: TTableCellElement,
  curRowIndex = curCell.rowIndex!,
  curColIndex = curCell.colIndex!
) => {
  const [tableNode, tablePath] = tableEntry;

  const rowElem = tableNode.children[curRowIndex] as TTableRowElement;
  const foundColIndex = rowElem.children.findIndex((c) => {
    const cE = c as TTableCellElement;
    return cE.colIndex === curColIndex;
  });
  return tablePath.concat([curRowIndex, foundColIndex]);
};
