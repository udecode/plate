/** @jsx jsx */

import { TextApi } from '@platejs/slate';

export const input = {
  text: 'string',
};
export const test = (value) => TextApi.isText(value);
export const output = true;
