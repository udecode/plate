/** @jsx jsx */

import { LocationApi, type Range } from '@platejs/plite';

export const input: Range = {
  anchor: { path: [0, 1], offset: 2 },
  focus: { path: [3, 4], offset: 5 },
};
export const test = (value: typeof input) => LocationApi.isRange(value);
export const output = true;
