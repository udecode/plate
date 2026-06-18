/** @jsx jsx */

import { TextApi } from '@platejs/slate';

export const input = {
  text: '',
};
export const test = (value) => TextApi.isText(value);
export const output = true;
