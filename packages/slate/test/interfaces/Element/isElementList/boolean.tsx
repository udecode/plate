/** @jsx jsx */

import { ElementApi } from '@platejs/slate';

export const input = true;
export const test = (value) => ElementApi.isElementList(value);
export const output = false;
