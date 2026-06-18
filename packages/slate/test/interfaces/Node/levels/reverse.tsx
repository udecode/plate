/** @jsx jsx  */
import { NodeApi } from '@platejs/slate';

export const input = (
  <editor>
    <element>
      <text />
    </element>
  </editor>
);
export const test = (value) =>
  Array.from(NodeApi.levels(value, [0, 0], { reverse: true }));
export const output = [
  [NodeApi.get(input, [0, 0]), [0, 0]],
  [NodeApi.get(input, [0]), [0]],
  [input, []],
];
