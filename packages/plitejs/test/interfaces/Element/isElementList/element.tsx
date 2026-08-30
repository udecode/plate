/** @jsx jsx */

import { ElementApi } from 'plitejs';

export const input = {
  children: [],
  type: 'paragraph',
};
export const test = (value) => ElementApi.isElementList(value);
export const output = false;
