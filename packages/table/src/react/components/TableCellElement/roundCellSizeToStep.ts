/**
 * Rounds a cell size to the nearest step, or returns the size if the step is
 * not set.
 */
export const roundCellSizeToStep = (size: number, step?: number) => {
  return step ? Math.round(size / step) * step : size;
};
