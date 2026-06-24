/** @jsx jsx */

import { RangeApi } from '@platejs/plite';

export const input = true;
export const test = (value) => RangeApi.isRange(value);
export const output = false;
