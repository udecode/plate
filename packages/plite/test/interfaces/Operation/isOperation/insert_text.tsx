/** @jsx jsx */

import { OperationApi } from '@platejs/plite';

export const input = {
  type: 'insert_text',
  path: [0],
  offset: 0,
  text: 'string',
};
export const test = (value) => OperationApi.isOperation(value);
export const output = true;
