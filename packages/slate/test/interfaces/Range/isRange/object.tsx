/** @jsx jsx */

import { RangeApi } from '@platejs/slate';

export const input = {};
export const test = (value) => RangeApi.isRange(value);
export const output = false;
