/** @jsx jsx */

import { ElementApi } from '@platejs/plite';

export const input = {
  type: 'heading-large',
  children: [{ text: '' }],
};
export const test = (value) =>
  ElementApi.isElementType(value, 'paragraph', 'source');

export const output = false;
