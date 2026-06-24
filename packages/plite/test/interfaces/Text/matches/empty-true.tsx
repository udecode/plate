/** @jsx jsx */

import { TextApi } from '@platejs/plite';

export const input = {
  text: { text: '', bold: true },
  props: {},
};
export const test = ({ text, props }) => TextApi.matches(text, props);
export const output = true;
