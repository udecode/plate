/** @jsx jsx */

import { PathApi } from '@platejs/slate';

export const input = [0, 0];
export const test = (path) => PathApi.hasPrevious(path);
export const output = false;
