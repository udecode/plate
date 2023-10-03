/**
 * Returns the index of the value in the array that is closest to the target.
 */
export const getClosest = (target: number, offsets: number[]) => {
  let closestValue = offsets[0];
  let closestIndex = 0;

  for (let i = 1; i < offsets.length; i++) {
    if (Math.abs(offsets[i] - target) < Math.abs(closestValue - target)) {
      closestValue = offsets[i];
      closestIndex = i;
    }
  }

  return closestIndex;
};
