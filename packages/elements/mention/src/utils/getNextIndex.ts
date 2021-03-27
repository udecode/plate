/**
 * Get next index from 0 to max.
 * If index is max, get to 0.
 */
export const getNextIndex = (i: number, max: number) => (i >= max ? 0 : i + 1);
