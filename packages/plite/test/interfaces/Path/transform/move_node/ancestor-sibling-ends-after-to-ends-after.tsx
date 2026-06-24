/** @jsx jsx */

import { PathApi } from '@platejs/plite';

const path = [3, 3, 3];
const op = {
  type: 'move_node',
  path: [4],
  newPath: [2],
};
export const test = () => PathApi.transform(path, op);
export const output = [4, 3, 3];
