/** @jsx jsx */

import { NodeApi } from '@platejs/slate';

export const input = true;
export const test = (value) => NodeApi.isNode(value);
export const output = false;
