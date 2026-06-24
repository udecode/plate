/** @jsx jsx */

import { TextApi } from '@platejs/plite';

export const input = [
  {
    children: [],
  },
];
export const test = (value) => TextApi.isTextList(value);
export const output = false;
