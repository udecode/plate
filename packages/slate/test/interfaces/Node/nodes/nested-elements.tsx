/** @jsx jsx  */
import { NodeApi } from '@platejs/slate';

export const input = (
  <editor>
    <element>
      <element>
        <text key="a" />
      </element>
    </element>
  </editor>
);
export const test = (value) => Array.from(NodeApi.nodes(value));
export const output = [
  [input, []],
  [
    <element>
      <element>
        <text key="a" />
      </element>
    </element>,
    [0],
  ],
  [
    <element>
      <text key="a" />
    </element>,
    [0, 0],
  ],
  [<text key="a" />, [0, 0, 0]],
];
