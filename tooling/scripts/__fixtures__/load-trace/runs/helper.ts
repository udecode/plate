import { readFileSync } from 'node:fs';

export const text = readFileSync(
  new URL('../data.json', import.meta.url),
  'utf8'
);
