/** @jsx jsx */

import { ElementApi } from 'plitejs';

export const input = [
  {
    children: [],
    type: 'paragraph',
  },
  {
    type: 'set_node',
    path: [0],
    properties: {},
    newProperties: {},
  },
];
export const test = (value) => ElementApi.isElementList(value);
export const output = false;
