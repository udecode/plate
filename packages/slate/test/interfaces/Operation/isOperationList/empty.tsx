/** @jsx jsx */

import { OperationApi } from '@platejs/slate';

export const input = [];
export const test = (value) => OperationApi.isOperationList(value);
export const output = true;
