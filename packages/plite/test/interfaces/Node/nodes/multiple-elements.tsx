/** @jsx jsx  */
import { NodeApi } from '@platejs/plite';

export const input = (
  <editor>
    <element>
      <text key="a" />
    </element>
    <element>
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
    </element>,
    [0],
  ],
  [<text key="a" />, [0, 0]],
  [
    <element>
      <text key="b" />
    </element>,
    [1],
  ],
  [<text key="b" />, [1, 0]],
];
