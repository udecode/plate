/** @jsx jsx */

import { TextApi } from '@platejs/plite';

export const input = {
  text: '',
  custom: true,
};
export const test = (value) => TextApi.isText(value);
export const output = true;
