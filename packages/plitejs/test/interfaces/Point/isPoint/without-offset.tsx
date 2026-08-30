/** @jsx jsx */

import { PointApi } from 'plitejs';

export const input = {
  path: [0, 1],
};
export const test = (value) => PointApi.isPoint(value);
export const output = false;
