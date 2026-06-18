/** @jsx jsx  */
import { NodeApi } from '@platejs/slate';

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
export const test = (value) => Array.from(NodeApi.texts(value));
export const output = [
  [<text key="a" />, [0, 0]],
  [<text key="b" />, [1, 0]],
];
