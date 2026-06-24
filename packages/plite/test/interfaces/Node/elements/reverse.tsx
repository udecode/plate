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
  Array.from(NodeApi.elements(value, { reverse: true }));
export const output = [
  [
    <element>
      <text key="a" />
      <text key="b" />
    </element>,
    [0],
  ],
];
