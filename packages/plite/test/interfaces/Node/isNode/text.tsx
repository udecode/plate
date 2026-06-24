/** @jsx jsx */

import { NodeApi } from '@platejs/plite';

export const input = {
  text: '',
};
export const test = (value) => NodeApi.isNode(value);
export const output = true;
