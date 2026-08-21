/** @jsx jsx */

import { cloneDeep } from 'lodash';

import { jsx } from '../..';

void jsx;

const fragment = (
  <block type="d">
    <block>A</block>
    <block type="c">
      <block type="d">
        <block>B</block>
        <block>
          <block type="d">
            <block>C</block>
          </block>
        </block>
      </block>
      <block type="d">
        <block>D</block>
      </block>
    </block>
  </block>
);
export const run = (editor) => {
  editor.update((tx) => {
    tx.fragment.replace([fragment]);
  });
};
export const input = (
  <editor>
    <block type="d">
      <block>
        <text>
          <cursor />
        </text>
      </block>
    </block>
  </editor>
);
export const output = cloneDeep(input);
