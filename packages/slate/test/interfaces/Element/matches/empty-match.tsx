/** @jsx jsx */

import { ElementApi } from '@platejs/slate';

export const input = {
  element: { children: [] },
  props: {},
};
export const test = ({ element, props }) => ElementApi.matches(element, props);
export const output = true;
