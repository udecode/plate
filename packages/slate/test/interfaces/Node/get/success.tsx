/** @jsx jsx  */
import { NodeApi } from '@platejs/slate';

export const input = (
  <editor>
    <element>
      <text />
    </element>
  </editor>
);
export const test = (value) => NodeApi.get(value, [0]);
export const output = (
  <element>
    <text />
  </element>
);
