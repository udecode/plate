/** @jsx jsx */

import { PointApi } from '@platejs/slate';

export const input = true;
export const test = (value) => PointApi.isPoint(value);
export const output = false;
