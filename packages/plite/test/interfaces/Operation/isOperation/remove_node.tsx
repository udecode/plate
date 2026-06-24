/** @jsx jsx */

import { OperationApi } from '@platejs/plite';

export const input = {
  type: 'remove_node',
  path: [0],
  node: {
    children: [],
  },
};
export const test = (value) => OperationApi.isOperation(value);
export const output = true;
