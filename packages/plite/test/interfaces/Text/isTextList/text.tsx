/** @jsx jsx */

import { TextApi } from '@platejs/plite';

export const input = {
  text: '',
};
export const test = (value) => TextApi.isTextList(value);
export const output = false;
