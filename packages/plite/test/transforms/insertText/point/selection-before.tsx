/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <text>
        w<anchor />
        or
        <focus />d
      </text>
    </block>
  </editor>
);
export const run = (editor) => {
  editor.text.insert('x', { at: { path: [0, 0], offset: 0 } });
};
export const output = (
  <editor>
    <block>
      xw
      <anchor />
      or
      <focus />d
    </block>
  </editor>
);
