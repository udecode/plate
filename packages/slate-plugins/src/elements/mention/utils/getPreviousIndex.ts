/**
 * Get previous index from 0 to max.
 * If index is 0, get to max.
 */
export const getPreviousIndex = (i: number, max: number) =>
  i <= 0 ? max : i - 1;
