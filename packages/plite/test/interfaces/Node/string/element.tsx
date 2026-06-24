/** @jsx jsx  */
import { NodeApi } from '@platejs/plite';

export const input = (
  <element>
    <text>one</text>
    <text>two</text>
  </element>
);
export const test = (value) => NodeApi.string(value, [1]);
export const output = 'onetwo';
