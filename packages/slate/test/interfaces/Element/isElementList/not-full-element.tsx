/** @jsx jsx */

import { ElementApi } from '@platejs/slate';

export const input = [
  {
    children: [],
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
