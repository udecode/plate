/** @jsx jsx */

import { PointApi } from '@platejs/plite';

export const input = [0, 1];
export const test = (value) => PointApi.isPoint(value);
export const output = false;
