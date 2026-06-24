/** @jsx jsx */

import { OperationApi } from '@platejs/plite';

export const input = {};
export const test = (value) => OperationApi.isOperation(value);
export const output = false;
