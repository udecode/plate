/** @jsx jsx */

import { ElementApi } from '@platejs/slate';

export const input = {
  source: 'heading-large',
  children: [{ text: '' }],
};
export const test = (value) =>
  ElementApi.isElementType(value, 'heading-large', 'source');

export const output = true;
