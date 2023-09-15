import { DEFAULT_MIN_COL_WIDTH } from '../createTablePlugin';
import { TableStoreSizeOverrides } from '../stores/index';

/**
 * Returns node.colSizes if it exists, applying overrides, otherwise returns a
 * colSizes with default widths. Since colSizes should always return valid widths
 * of the columns for table cells merging feature.
 */
export const getTableOverriddenColSizes = (
  colCount: number,
  minColumnWidth?: number,
  colSizes?: number[],
  colSizeOverrides?: TableStoreSizeOverrides
): number[] => {
  const newColSizes = (
    colSizes ?? (Array.from({ length: colCount }).fill(0) as number[])
  ).map((size, index) => {
    const overridden = colSizeOverrides?.get(index);
    if (overridden) return overridden;
    if (size > 0) return size;

    return minColumnWidth || DEFAULT_MIN_COL_WIDTH;
  });

  return newColSizes;
};
