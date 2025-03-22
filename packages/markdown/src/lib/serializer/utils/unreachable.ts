export const unreachable = (_: never): never => {
  throw new Error('unreachable');
};