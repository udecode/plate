import type {
  TTableElement,
  TTableRowElement,
  TableStoreSizeOverrides,
} from '../types';

export const getTableOverriddenRowSizes = (
  tableNode: TTableElement,
  rowSizeOverrides?: TableStoreSizeOverrides
): number[] => {
  const rowSizes = Array.from({ length: tableNode.children.length }).map(
    (_, index) =>
      rowSizeOverrides?.get?.(index) ??
      (tableNode.children?.[index] as TTableRowElement)?.size ??
      0
  );

  return rowSizes;
};
