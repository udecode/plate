/** @jsx jsx */

import { TextApi } from 'plitejs';

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.set({ someKey: true }, { match: TextApi.isText, split: true });
};
export const input = (
  <editor>
    <block>
      w<anchor />
      or
      <focus />d
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text>w</text>
      <text someKey>
        <anchor />
        or
        <focus />
      </text>
      <text>d</text>
    </block>
  </editor>
);
