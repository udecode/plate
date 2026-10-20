import { createRequire } from 'node:module';

export const evict = (id: string) => {
  delete createRequire(import.meta.url).cache[id];
};
