/** @jsx jsx */

import { cloneDeep } from 'lodash';

import { jsx } from '../..';

void jsx;

export const run = (editor) => {
  editor.update(() => {
    editor.insertBreak();
  });
};
export const input = (
  <editor>
    <block>
      <block>
        on
        <cursor />e
      </block>
      <block>two</block>
    </block>
  </editor>
);
export const output = cloneDeep(input);
