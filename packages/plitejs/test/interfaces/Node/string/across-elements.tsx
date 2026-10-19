/** @jsx jsx  */
import { NodeApi } from 'plitejs';

export const input = (
  <editor>
    <element>
      <text>one</text>
      <text>two</text>
    </element>
    <element>
      <text>three</text>
      <text>four</text>
    </element>
  </editor>
);
export const test = (value) => NodeApi.string(value);
export const output = 'onetwothreefour';
