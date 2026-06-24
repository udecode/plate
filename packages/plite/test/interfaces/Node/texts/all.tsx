/** @jsx jsx  */
import { NodeApi } from '@platejs/plite';

export const input = (
  <editor>
    <element>
      <text key="a" />
      <text key="b" />
    </element>
  </editor>
);
export const test = (value) => Array.from(NodeApi.texts(value));
export const output = [
  [<text key="a" />, [0, 0]],
  [<text key="b" />, [0, 1]],
];
