/** @jsx jsx */

import { PointApi } from '@platejs/plite';

export const input = {
  path: [0, 1],
  offset: 0,
  custom: 'value',
};
export const test = (value) => PointApi.isPoint(value);
export const output = true;
