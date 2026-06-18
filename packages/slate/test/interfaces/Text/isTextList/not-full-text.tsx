/** @jsx jsx */

import { TextApi } from '@platejs/slate';

export const input = [
  {
    text: '',
  },
  {
    type: 'set_node',
    path: [0],
    properties: {},
    newProperties: {},
  },
];
export const test = (value) => TextApi.isTextList(value);
export const output = false;
