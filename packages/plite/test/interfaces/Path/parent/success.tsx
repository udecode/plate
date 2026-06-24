/** @jsx jsx */

import { PathApi } from '@platejs/plite';

export const input = [0, 1];
export const test = (path) => PathApi.parent(path);
export const output = [0];
