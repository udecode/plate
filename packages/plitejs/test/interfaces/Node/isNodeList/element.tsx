/** @jsx jsx */

import { NodeApi } from 'plitejs';

export const input = {
  children: [],
  type: 'paragraph',
};
export const test = (value) => NodeApi.isNodeList(value);
export const output = false;
