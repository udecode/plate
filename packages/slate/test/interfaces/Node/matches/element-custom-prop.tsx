/** @jsx jsx */

import { NodeApi } from '@platejs/slate';

export const input = {
  node: { children: [], type: 'bold' },
  props: { type: 'bold' },
};
export const test = ({ node, props }) => NodeApi.matches(node, props);
export const output = true;
