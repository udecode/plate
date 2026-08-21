/** @jsx jsx  */

import { NodeApi } from '@platejs/plite';
import { cloneDeep } from 'lodash';

export const input = (
  <editor>
    <element>
      <text />
    </element>
  </editor>
);
export const test = (value) => NodeApi.ancestor(value, [0]);
export const output = cloneDeep(NodeApi.get(input, [0]));
