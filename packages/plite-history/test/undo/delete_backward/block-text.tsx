/** @jsx jsx */

import { jsx } from '../..';

jsx;

import { cloneDeep } from 'lodash';

export const run = (editor) => {
  editor.update(() => {
    editor.delete({ reverse: true });
  });
};
export const input = (
  <editor>
    <block>
      wo
      <cursor />
      rd
    </block>
  </editor>
);
export const output = cloneDeep(input);
