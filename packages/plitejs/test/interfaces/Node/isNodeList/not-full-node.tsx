/** @jsx jsx */

import { NodeApi } from 'plitejs';

export const input = [
  {
    children: [],
    selection: null,
    type: 'paragraph',
  },
  'a string',
];
export const test = (value) => NodeApi.isNodeList(value);
export const output = false;
