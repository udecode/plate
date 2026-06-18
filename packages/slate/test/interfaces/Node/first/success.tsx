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
export const test = (value) => NodeApi.first(value, [0]);
export const output = [<text key="a" />, [0, 0]];
