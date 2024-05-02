import {
  getPluginOptions,
  PlateEditor,
  TNodeEntry,
  Value,
} from '@udecode/plate-common/server';

import { ELEMENT_TABLE } from '../createTablePlugin';
import {
  TablePlugin,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';
import { getCellIndices } from './getCellIndices';

export const getCellPath = <V extends Value>(
  editor: PlateEditor<V>,
  tableEntry: TNodeEntry<TTableElement>,
  curRowIndex: number,
  curColIndex: number
) => {
  const { _cellIndices: cellIndices } = getPluginOptions<TablePlugin, V>(
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
