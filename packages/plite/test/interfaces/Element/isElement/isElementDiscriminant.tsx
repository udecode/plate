/** @jsx jsx */

import { ElementApi } from '@platejs/plite';

export const input = {
  children: [{ text: '' }],
  source: 'heading-large',
  type: 'paragraph',
};
export const test = (value) =>
  ElementApi.isElementType(value, 'heading-large', 'source');

export const output = true;
