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
  Array.from(NodeApi.texts(value, { from: [0, 1] }));
export const output = [[<text key="b" />, [0, 1]]];
