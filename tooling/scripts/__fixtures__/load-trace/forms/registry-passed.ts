const cache = require.cache;

export const forget = (id: string) => {
  delete cache[id];
};
