/** @jsx jsx */

import { OperationApi } from '@platejs/slate';

export const input = {
  type: 'set_selection',
  properties: {},
  newProperties: {},
};
export const test = (value) => OperationApi.isOperation(value);
export const output = true;
