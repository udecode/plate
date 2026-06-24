/** @jsx jsx */

import { OperationApi } from '@platejs/plite';

export const input = { type: 'move_node', path: [0, 2, 1], newPath: [0, 3] };
export const test = (value) => OperationApi.inverse(value);
export const output = { type: 'move_node', path: [0, 3], newPath: [0, 2, 1] };
