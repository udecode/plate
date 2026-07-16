export const unreachable = (value: unknown) => {
  console.warn(`Unreachable code: ${JSON.stringify(value)}`);
};
