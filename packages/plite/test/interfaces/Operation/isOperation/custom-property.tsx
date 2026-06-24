/** @jsx jsx */

import { OperationApi } from '@platejs/plite';

export const input = {
  type: 'set_node',
  path: [0],
  properties: {},
  newProperties: {},
  custom: true,
};
export const test = (value) => OperationApi.isOperation(value);
export const output = true;
