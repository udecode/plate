/** @jsx jsx */

import { ElementApi } from '@platejs/slate';

export const input = {
  children: [
    {
      children: [],
    },
  ],
};
export const test = (value) => ElementApi.isElement(value);
export const output = true;
