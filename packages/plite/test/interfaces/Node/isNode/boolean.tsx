/** @jsx jsx */

import { NodeApi } from '@platejs/plite';

export const input = true;
export const test = (value) => NodeApi.isNode(value);
export const output = false;
