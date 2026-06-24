/** @jsx jsx */

import { ElementApi } from '@platejs/plite';

export const input = {
  element: { children: [] },
  props: {},
};
export const test = ({ element, props }) => ElementApi.matches(element, props);
export const output = true;
