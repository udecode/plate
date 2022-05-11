import {
  ELEMENT_TABLE,
  getTableColumnCount,
  TTableElement,
} from '@udecode/plate-table';
import { useAtom } from 'jotai';
import { resizingColAtom } from '../table.atoms';

export const useTableColSizes = (tableNode: TTableElement): number[] => {
  const [resizingCol] = useAtom(resizingColAtom, ELEMENT_TABLE);

  const colCount = getTableColumnCount(tableNode);

  const colSizes = tableNode.colSizes
    ? [...tableNode.colSizes]
    : Array(colCount);

  if (resizingCol) {
    colSizes[resizingCol.index ?? 0] = resizingCol.width;
  }

  return colSizes;
};
