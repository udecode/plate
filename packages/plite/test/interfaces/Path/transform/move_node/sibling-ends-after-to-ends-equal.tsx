/** @jsx jsx */

import { PathApi } from '@platejs/plite';

const path = [0, 1];
const op = {
  type: 'move_node',
  path: [0, 3],
  newPath: [0, 1],
};
export const test = () => PathApi.transform(path, op);
export const output = [0, 2];
