// Returns an array of cumulative sums of the colSizes.
export const getCellOffsets = (colSizes: number[]): number[] => {
  const offsets: number[] = [0];
  let prevOffset: number = 0;

  for (const current of colSizes) {
    const currentOffset = prevOffset + current;
    offsets.push(currentOffset);
    prevOffset = currentOffset;
  }

  return offsets;
};
