/** @jsx jsx */

import { PathApi } from '@platejs/plite';

export const input = [0, 1];
export const test = (path) => PathApi.hasPrevious(path);
export const output = true;
