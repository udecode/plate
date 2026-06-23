/** @jsx jsx */

import { PathApi } from '@platejs/plite';

export const input = [0, 1, 2];
export const test = (path) => PathApi.ancestors(path);
export const output = [[], [0], [0, 1]];
