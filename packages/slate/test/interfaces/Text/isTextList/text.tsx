/** @jsx jsx */

import { TextApi } from '@platejs/slate';

export const input = {
  text: '',
};
export const test = (value) => TextApi.isTextList(value);
export const output = false;
