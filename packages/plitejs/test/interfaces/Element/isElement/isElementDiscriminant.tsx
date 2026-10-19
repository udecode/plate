/** @jsx jsx */

import { ElementApi } from 'plitejs';

export const input = {
  children: [{ text: '' }],
  source: 'heading-large',
  type: 'paragraph',
};
export const test = (value) =>
  ElementApi.isElementType(value, 'heading-large', 'source');

export const output = true;
