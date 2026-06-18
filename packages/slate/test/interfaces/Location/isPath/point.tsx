/** @jsx jsx */

import { LocationApi, type Point } from '@platejs/slate';

export const input: Point = { path: [0, 1], offset: 2 };
export const test = (value: typeof input) => LocationApi.isPath(value);
export const output = false;
