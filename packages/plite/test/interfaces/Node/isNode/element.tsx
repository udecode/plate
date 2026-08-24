/** @jsx jsx */

import { NodeApi } from '@platejs/plite';

export const input = {
  children: [],
  type: 'paragraph',
};
export const test = (value) => NodeApi.isNode(value);
export const output = true;
