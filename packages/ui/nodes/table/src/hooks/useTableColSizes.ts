import { getTableColumnCount, TTableElement } from '@udecode/plate-table';
import { useTableStore } from '../table.atoms';

export const useTableColSizes = (tableNode: TTableElement): number[] => {
  const resizingCol = useTableStore().get.resizingCol();

  const colCount = getTableColumnCount(tableNode);

  const colSizes = tableNode.colSizes
    ? [...tableNode.colSizes]
    : Array(colCount);

  if (resizingCol) {
    colSizes[resizingCol.index ?? 0] = resizingCol.width;
  }

  return colSizes;
};
