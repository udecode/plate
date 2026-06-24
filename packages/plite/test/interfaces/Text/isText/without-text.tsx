/** @jsx jsx */

import { TextApi } from '@platejs/plite';

export const input = {};
export const test = (value) => TextApi.isText(value);
export const output = false;
