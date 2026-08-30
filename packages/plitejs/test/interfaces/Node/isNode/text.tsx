/** @jsx jsx */

import { NodeApi } from 'plitejs';

export const input = {
  text: '',
};
export const test = (value) => NodeApi.isNode(value);
export const output = true;
