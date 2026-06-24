/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { TextApi } from '@platejs/plite';

export const run = (editor) => {
  editor.nodes.set({ someKey: null }, { match: TextApi.isText, split: true });
};
export const input = (
  <editor>
    <block>
      <text someKey>
        w<anchor />
        or
        <focus />d
      </text>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text someKey>w</text>
      <text>
        <anchor />
        or
        <focus />
      </text>
      <text someKey>d</text>
    </block>
  </editor>
);
