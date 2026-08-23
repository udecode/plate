/** @jsx jsx */

import { ElementApi } from '@platejs/plite';

export const input = {
  children: [],
  type: 'paragraph',
};
export const test = (value) => ElementApi.isElement(value);
export const output = true;
