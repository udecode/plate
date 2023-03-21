/**
 * Computes the size a sibling column should be to preserve the combined size
 * of both columns.
 */
export const getTableColSizeForSibling = (
  ownInitialSize: number,
  siblingInitialSize: number,
  ownSize: number
): number => {
  const totalSize = ownInitialSize + siblingInitialSize;
  return totalSize - ownSize;
};
