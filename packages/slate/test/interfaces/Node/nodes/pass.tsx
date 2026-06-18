/** @jsx jsx  */
import { NodeApi } from '@platejs/slate';

export const input = (
  <editor>
    <element>
      <element pass>
        <text key="a" />
      </element>
    </element>
  </editor>
);
export const test = (value) =>
  Array.from(NodeApi.nodes(value, { pass: ([n]) => !!n.pass }));
export const output = [
  [input, []],
  [
    <element>
      <element pass>
        <text key="a" />
      </element>
    </element>,
    [0],
  ],
  [
    <element pass>
      <text key="a" />
    </element>,
    [0, 0],
  ],
];
