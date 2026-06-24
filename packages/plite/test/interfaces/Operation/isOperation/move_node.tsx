/** @jsx jsx */

import { OperationApi } from '@platejs/plite';

export const input = {
  type: 'move_node',
  path: [0],
  newPath: [1],
};
export const test = (value) => OperationApi.isOperation(value);
export const output = true;
