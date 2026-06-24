/** @jsx jsx */

import { NodeApi } from '@platejs/plite';

export const input = {};
export const test = (value) => NodeApi.isNode(value);
export const output = false;
