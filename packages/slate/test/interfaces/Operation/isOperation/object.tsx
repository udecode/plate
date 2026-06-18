/** @jsx jsx */

import { OperationApi } from '@platejs/slate';

export const input = {};
export const test = (value) => OperationApi.isOperation(value);
export const output = false;
