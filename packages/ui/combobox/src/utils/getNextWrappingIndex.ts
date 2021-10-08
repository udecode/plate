import { getNextNonDisabledIndex } from './getNextNonDisabledIndex';

/**
 * Returns the new index in the list, in a circular way. If next value is out of bonds from the total,
 * it will wrap to either 0 or itemCount - 1.
 *
 * @param {number} moveAmount Number of positions to move. Negative to move backwards, positive forwards.
 * @param {number} baseIndex The initial position to move from.
 * @param {number} itemCount The total number of items.
 * @param {Function} getItemNodeFromIndex Used to check if item is disabled.
 * @param {boolean} circular Specify if navigation is circular. Default is true.
 * @returns {number} The new index after the move.
 */
export const getNextWrappingIndex = (
  moveAmount: number,
  baseIndex: number,
  itemCount: number,
  getItemNodeFromIndex: any,
  circular = true
) => {
  if (itemCount === 0) {
    return -1;
  }

  const itemsLastIndex = itemCount - 1;

  // noinspection SuspiciousTypeOfGuard
  if (
    typeof baseIndex !== 'number' ||
    baseIndex < 0 ||
    baseIndex >= itemCount
  ) {
    baseIndex = moveAmount > 0 ? -1 : itemsLastIndex + 1;
  }

  let newIndex = baseIndex + moveAmount;

  if (newIndex < 0) {
    newIndex = circular ? itemsLastIndex : 0;
  } else if (newIndex > itemsLastIndex) {
    newIndex = circular ? 0 : itemsLastIndex;
  }

  const nonDisabledNewIndex = getNextNonDisabledIndex(
    moveAmount,
    newIndex,
    itemCount,
    getItemNodeFromIndex,
    circular
  );

  if (nonDisabledNewIndex === -1) {
    return baseIndex >= itemCount ? -1 : baseIndex;
  }

  return nonDisabledNewIndex;
};
