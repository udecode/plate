import type { SlateEditor, TNodeEntry } from '@udecode/plate-common';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

import { BaseTablePlugin } from '../BaseTablePlugin';
import { getCellIndices } from './getCellIndices';

export const getCellPath = (
  editor: SlateEditor,
  tableEntry: TNodeEntry<TTableElement>,
  curRowIndex: number,
  curColIndex: number
) => {
  const { _cellIndices: cellIndices } = editor.getOptions(BaseTablePlugin);
  const [tableNode, tablePath] = tableEntry;

  const rowElem = tableNode.children[curRowIndex] as TTableRowElement;
  const foundColIndex = rowElem.children.findIndex((c) => {
    const cE = c as TTableCellElement;
    const { col: colIndex } = getCellIndices(cellIndices!, cE)!;

    return colIndex === curColIndex;
  });

  return tablePath.concat([curRowIndex, foundColIndex]);
};
