/** @jsx jsx */

import { ElementApi } from 'plitejs';

export const input = {
  children: [],
  custom: 'value',
  type: 'paragraph',
};
export const test = (value) => ElementApi.isElement(value);
export const output = true;
