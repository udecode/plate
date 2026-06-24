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
export const test = (value) =>
  Array.from(NodeApi.texts(value, { reverse: true }));
export const output = [
  [<text key="b" />, [0, 1]],
  [<text key="a" />, [0, 0]],
];
