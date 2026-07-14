import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '@platejs/utils';

import { getColSpan } from '../queries';

export const getTableMergedColumnCount = (tableNode: TTableElement) => {
  const firstRow = tableNode.children[0] as TTableRowElement | undefined;

  return (
    (firstRow?.children as TTableCellElement[] | undefined)?.reduce(
      (count, cell) => count + getColSpan(cell),
      0
    ) ?? 0
  );
};
