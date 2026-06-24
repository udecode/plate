/** @jsx jsx */

import { OperationApi } from '@platejs/plite';

export const input = {
  type: 'split_node',
  path: [0],
  position: 0,
  properties: {},
};
export const test = (value) => OperationApi.isOperation(value);
export const output = true;
