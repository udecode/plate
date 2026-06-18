/** @jsx jsx */

import { LocationApi, type Span } from '@platejs/slate';

export const input: Span = [
  [0, 1],
  [2, 3],
];
export const test = (value: typeof input) => LocationApi.isSpan(value);
export const output = true;
