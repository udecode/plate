/** @jsx jsx */

import { PathApi } from '@platejs/slate';

export const input = [0, 1];
export const test = (path) => PathApi.previous(path);
export const output = [0, 0];
