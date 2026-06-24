/** @jsx jsx  */

import { cloneDeep } from 'lodash';
import { NodeApi } from '@platejs/plite';

export const input = (
  <editor>
    <element>
      <text />
    </element>
  </editor>
);
export const test = (value) => NodeApi.ancestor(value, [0]);
export const output = cloneDeep(NodeApi.get(input, [0]));
