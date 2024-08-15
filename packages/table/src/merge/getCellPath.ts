import type { PlateEditor, TNodeEntry } from '@udecode/plate-common';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

import { TablePlugin } from '../TablePlugin';
import { getCellIndices } from './getCellIndices';

export const getCellPath = (
  editor: PlateEditor,
  tableEntry: TNodeEntry<TTableElement>,
  curRowIndex: number,
  curColIndex: number
) => {
  const { _cellIndices: cellIndices } = editor.getOptions(TablePlugin);
  const [tableNode, tablePath] = tableEntry;

  const rowElem = tableNode.children[curRowIndex] as TTableRowElement;
  const foundColIndex = rowElem.children.findIndex((c) => {
    const cE = c as TTableCellElement;
    const { col: colIndex } = getCellIndices(cellIndices!, cE)!;

    return colIndex === curColIndex;
  });

  return tablePath.concat([curRowIndex, foundColIndex]);
};
