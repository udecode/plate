/** @jsx jsx */

import { ElementApi } from '@platejs/plite';

export const input = {
  children: [
    {
      children: [],
      type: 'paragraph',
    },
  ],
  type: 'blockquote',
};
export const test = (value) => ElementApi.isElement(value);
export const output = true;
