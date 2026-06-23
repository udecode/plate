/** @jsx jsx */

import { ElementApi } from '@platejs/plite';

export const input = {
  type: 'paragraph',
  children: [{ text: '' }],
};
export const test = (value) => ElementApi.isElementType(value, 'paragraph');

export const output = true;
