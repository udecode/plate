/** @jsx jsx */

import { ElementApi } from '@platejs/slate';

export const input = {
  text: '',
};
export const test = (value) => ElementApi.isElement(value);
export const output = false;
