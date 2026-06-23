/** @jsx jsx */

import { PathApi } from '@platejs/plite';

export const input = [2, 4, 'b'];
export const test = (value: typeof input) => PathApi.isPath(value);
export const output = false;
