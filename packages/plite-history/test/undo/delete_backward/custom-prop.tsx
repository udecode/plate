/** @jsx jsx */

import { cloneDeep } from 'lodash';

import { jsx } from '../..';

void jsx;

export const run = (editor) => {
  editor.update(() => {
    editor.delete();
  });
};
export const input = (
  <editor>
    <block a>
      o<anchor />
      ne
    </block>
    <block b>
      tw
      <focus />o
    </block>
  </editor>
);
export const output = cloneDeep(input);
