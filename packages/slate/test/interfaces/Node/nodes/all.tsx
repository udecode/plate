/** @jsx jsx  */
import { NodeApi } from '@platejs/slate';

export const input = (
  <editor>
    <element>
      <text key="a" />
      <text key="b" />
    </element>
  </editor>
);
export const test = (value) => Array.from(NodeApi.nodes(value));
export const output = [
  [input, []],
  [
    <element>
      <text key="a" />
      <text key="b" />
    </element>,
    [0],
  ],
  [<text key="a" />, [0, 0]],
  [<text key="b" />, [0, 1]],
];
