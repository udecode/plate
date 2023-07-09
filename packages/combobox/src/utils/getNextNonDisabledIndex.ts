/**
 * Returns the next index in the list of an item that is not disabled.
 *
 * @param {number} moveAmount Number of positions to move. Negative to move backwards, positive forwards.
 * @param {number} baseIndex The initial position to move from.
 * @param {number} itemCount The total number of items.
 * @param {Function} getItemNodeFromIndex Used to check if item is disabled.
 * @param {boolean} circular Specify if navigation is circular. Default is true.
 * @returns {number} The new index. Returns baseIndex if item is not disabled. Returns next non-disabled item otherwise. If no non-disabled found it will return -1.
 */
export const getNextNonDisabledIndex = (
  moveAmount: number,
  baseIndex: number,
  itemCount: number,
  getItemNodeFromIndex: any,
  circular: boolean
): number => {
  const currentElementNode = getItemNodeFromIndex(baseIndex);
  if (!currentElementNode || !currentElementNode.hasAttribute('disabled')) {
    return baseIndex;
  }

  if (moveAmount > 0) {
    for (let index = baseIndex + 1; index < itemCount; index++) {
      if (!getItemNodeFromIndex(index).hasAttribute('disabled')) {
        return index;
      }
    }
  } else {
    for (let index = baseIndex - 1; index >= 0; index--) {
      if (!getItemNodeFromIndex(index).hasAttribute('disabled')) {
        return index;
      }
    }
  }

  if (circular) {
    return moveAmount > 0
      ? getNextNonDisabledIndex(1, 0, itemCount, getItemNodeFromIndex, false)
      : getNextNonDisabledIndex(
          -1,
          itemCount - 1,
          itemCount,
          getItemNodeFromIndex,
          false
        );
  }

  return -1;
};
