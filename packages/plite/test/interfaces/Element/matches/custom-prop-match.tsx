/** @jsx jsx */

import { ElementApi } from '@platejs/plite';

export const input = {
  element: { children: [], type: 'bold' },
  props: { type: 'bold' },
};
export const test = ({ element, props }) => ElementApi.matches(element, props);
export const output = true;
