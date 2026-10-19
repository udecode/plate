/** @jsx jsx */

import { ElementApi } from 'plitejs';

export const input = {
  type: 'paragraph',
  children: [{ text: '' }],
};
export const test = (value) => ElementApi.isElementType(value, 'paragraph');

export const output = true;
