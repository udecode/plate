/** @jsx jsx */

import { OperationApi } from '@platejs/plite';

export const input = true;
export const test = (value) => OperationApi.isOperation(value);
export const output = false;
