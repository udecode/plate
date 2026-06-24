/** @jsx jsx */

import { OperationApi } from '@platejs/plite';

export const input = {
  path: [0],
  properties: {},
  newProperties: {},
};
export const test = (value) => OperationApi.isOperation(value);
export const output = false;
