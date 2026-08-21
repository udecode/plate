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
    <block>
      <text />
      <inline a>
        o<anchor />
        ne
      </inline>
      <text />
    </block>
    <block>
      <text />
      <inline b>
        tw
        <focus />o
      </inline>
      <text />
    </block>
  </editor>
);
export const output = cloneDeep(input);
