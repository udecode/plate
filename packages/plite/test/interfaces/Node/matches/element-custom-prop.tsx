/** @jsx jsx */

import { NodeApi } from '@platejs/plite';

export const input = {
  node: { children: [], type: 'bold' },
  props: { type: 'bold' },
};
export const test = ({ node, props }) =>
  NodeApi.matches(node, (candidate) =>
    'type' in candidate ? candidate.type === props.type : false
  );
export const output = true;
