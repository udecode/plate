/** @jsx jsx  */
import { NodeApi } from '@platejs/slate';

export const input = (
  <editor>
    <element>
      <text />
    </element>
  </editor>
);
export const test = (value) => Array.from(NodeApi.ancestors(value, [0, 0]));
export const output = [
  [input, []],
  [NodeApi.get(input, [0]), [0]],
];
