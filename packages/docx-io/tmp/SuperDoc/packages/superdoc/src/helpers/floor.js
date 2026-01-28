export const floor = (val, precision) => {
  const multiplier = 10 ** (precision || 0);
  return Math.floor(val * multiplier) / multiplier;
};
