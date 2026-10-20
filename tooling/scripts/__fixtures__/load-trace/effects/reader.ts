import { readFileSync } from 'node:fs';

export const readData = () =>
  readFileSync(new URL('../data.json', import.meta.url), 'utf8');
