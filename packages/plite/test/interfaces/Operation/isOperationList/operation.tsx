/** @jsx jsx */

import { OperationApi } from '@platejs/plite';

export const input = {
  type: 'set_node',
  path: [0],
  properties: {},
  newProperties: {},
};
export const test = (value) => OperationApi.isOperationList(value);
export const output = false;
