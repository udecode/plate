import {
  type PlateEditor,
  type TNodeEntry,
  getPluginOptions,
} from '@udecode/plate-common';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
  TablePluginOptions,
} from '../types';

import { ELEMENT_TABLE } from '../TablePlugin';
import { getCellIndices } from './getCellIndices';

export const getCellPath = (
  editor: PlateEditor,
  tableEntry: TNodeEntry<TTableElement>,
  curRowIndex: number,
  curColIndex: number
) => {
  const { _cellIndices: cellIndices } = getPluginOptions<TablePluginOptions>(
    editor,
    ELEMENT_TABLE
  );
  const [tableNode, tablePath] = tableEntry;

  const rowElem = tableNode.children[curRowIndex] as TTableRowElement;
  const foundColIndex = rowElem.children.findIndex((c) => {
    const cE = c as TTableCellElement;
    const { col: colIndex } = getCellIndices(cellIndices!, cE)!;

    return colIndex === curColIndex;
  });

  return tablePath.concat([curRowIndex, foundColIndex]);
};
