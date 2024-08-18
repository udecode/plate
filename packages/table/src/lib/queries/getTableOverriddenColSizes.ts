import type { TableStoreSizeOverrides } from '../../react/stores/index';
import type { TTableElement } from '../types';

import { getTableColumnCount } from './index';

/**
 * Returns node.colSizes if it exists, applying overrides, otherwise returns a
 * 0-filled array.
 */
export const getTableOverriddenColSizes = (
  tableNode: TTableElement,
  colSizeOverrides?: TableStoreSizeOverrides
): number[] => {
  const colCount = getTableColumnCount(tableNode);

  const colSizes = (
    tableNode.colSizes
      ? [...tableNode.colSizes]
      : (Array.from({ length: colCount }).fill(0) as number[])
  ).map((size, index) => colSizeOverrides?.get?.(index) ?? size);

  return colSizes;
};
