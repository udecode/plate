/** @jsx jsx */

import { LocationApi, type Point } from '@platejs/plite';

export const input: Point & { custom: string } = {
  path: [0, 1],
  offset: 2,
  custom: 'value',
};
export const test = (value: typeof input) => LocationApi.isRange(value);
export const output = false;
