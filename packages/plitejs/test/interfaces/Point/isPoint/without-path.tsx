/** @jsx jsx */

import { PointApi } from 'plitejs';

export const input = {
  offset: 0,
};
export const test = (value) => PointApi.isPoint(value);
export const output = false;
