/** @jsx jsx */

import { TextApi } from '@platejs/slate';

export const input = {
  text: { text: '', bold: true, italic: true },
  props: { underline: true },
};
export const test = ({ text, props }) => TextApi.matches(text, props);
export const output = false;
