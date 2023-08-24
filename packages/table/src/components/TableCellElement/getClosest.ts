export const getClosest = (target: number, offsets: number[]) => {
  const closest = offsets.reduce(
    (acc, current, index) => {
      return Math.abs(current - target) < Math.abs(acc.value - target)
        ? { value: current, index }
        : acc;
    },
    {
      value: 0,
      index: 0,
    }
  );
  return closest.index;
};
