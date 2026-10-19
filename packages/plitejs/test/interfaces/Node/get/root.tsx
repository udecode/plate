/** @jsx jsx  */

import { NodeApi } from 'plitejs';

export const input = (
  <editor>
    <element>
      <text />
    </element>
  </editor>
);
export const test = (value) => NodeApi.get(value, []);
export const output = input;
