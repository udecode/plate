/** @jsx jsx */

import { jsx } from '../..';

jsx;

import { cloneDeep } from 'lodash';

export const run = (editor) => {
  editor.update(() => {
    editor.insertText('t');
  });
  editor.update(() => {
    editor.insertText('w');
  });
  editor.update(() => {
    editor.insertText('o');
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
