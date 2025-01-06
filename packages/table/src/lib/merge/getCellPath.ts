import type { NodeEntry, SlateEditor } from '@udecode/plate';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

import { getCellIndices } from '../utils/getCellIndices';

export const getCellPath = (
  editor: SlateEditor,
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
