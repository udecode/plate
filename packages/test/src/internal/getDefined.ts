export const getDefined = <T>(value: T | null | undefined): T => {
  if (value === null || value === undefined) {
    throw new Error('Expected value to be defined.');
  }

  return value;
};
