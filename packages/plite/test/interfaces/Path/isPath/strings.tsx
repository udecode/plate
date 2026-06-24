/** @jsx jsx */

import { PathApi } from '@platejs/plite';

export const input = ['a', 'b'];
export const test = (path) => PathApi.isPath(path);
export const output = false;
