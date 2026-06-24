/** @jsx jsx  */
import { NodeApi } from '@platejs/plite';

export const input = (
  <editor>
    <element>
      <text />
    </element>
  </editor>
);
export const test = (value) => NodeApi.leaf(value, [0, 0]);
export const output = <text />;
