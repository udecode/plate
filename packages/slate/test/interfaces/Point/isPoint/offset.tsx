/** @jsx jsx */

import { PointApi } from '@platejs/slate';

export const input = 42;
export const test = (value) => PointApi.isPoint(value);
export const output = false;
