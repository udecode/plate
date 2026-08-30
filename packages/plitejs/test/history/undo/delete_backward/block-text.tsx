/** @jsxRuntime classic */
/** @jsx jsx */

import { cloneDeep } from 'lodash';

import { jsx } from '../..';

void jsx;

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
