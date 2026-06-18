/** @jsx jsx */

import { PathApi } from '@platejs/slate';

export const input = true;
export const test = (path) => PathApi.isPath(path);
export const output = false;
