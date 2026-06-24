/** @jsx jsx */

import { TextApi } from '@platejs/plite';

export const input = true;
export const test = (value) => TextApi.isText(value);
export const output = false;
