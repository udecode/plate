/** @jsx jsx */

import { TextApi } from 'plitejs';

export const input = {
  text: { text: '', bold: true },
  props: {},
};
export const test = ({ text, props }) => TextApi.matches(text, props);
export const output = true;
