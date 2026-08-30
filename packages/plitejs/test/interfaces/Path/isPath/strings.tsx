/** @jsx jsx */

import { PathApi } from 'plitejs';

export const input = ['a', 'b'];
export const test = (path) => PathApi.isPath(path);
export const output = false;
