import { TElement } from '@udecode/plate-core';
import { getTableColumnCount, TableNodeData } from '@udecode/plate-table';
import { useAtom } from 'jotai';
import { resizingColAtom } from '../table.atoms';

export const useTableColSizes = (
  tableNode: TElement<TableNodeData>
): number[] => {
  const [resizingCol] = useAtom(resizingColAtom);

  const colCount = getTableColumnCount(tableNode);

  const colSizes = tableNode.colSizes
    ? [...tableNode.colSizes]
    : Array(colCount);

  if (resizingCol) {
    colSizes[resizingCol.index ?? 0] = resizingCol.width;
  }

  return colSizes;
};
