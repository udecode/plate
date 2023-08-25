export const getCellOffsets = (colSizes: number[]) => {
  const { offsets } = colSizes.reduce(
    (acc, current) => {
      const currentOffset = acc.prevOffset + current;
      acc.offsets.push(currentOffset);
      acc.prevOffset = currentOffset;
      return acc;
    },
    {
      offsets: [0],
      prevOffset: 0,
    }
  );
  return offsets;
};
