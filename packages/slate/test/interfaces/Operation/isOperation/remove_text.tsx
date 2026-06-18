/** @jsx jsx */

import { OperationApi } from '@platejs/slate';

export const input = {
  type: 'remove_text',
  path: [0],
  offset: 0,
  text: 'string',
};
export const test = (value) => OperationApi.isOperation(value);
export const output = true;
