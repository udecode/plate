/** @jsxRuntime classic */
/** @jsx jsx */

import { cloneDeep } from 'lodash';

import { jsx } from '../..';

void jsx;

export const run = (editor) => {
  editor.update(() => {
    editor.insertText('text');
  });
};
export const input = (
  <editor>
    <block>
      one
      <cursor />
    </block>
  </editor>
);
export const output = cloneDeep(input);
