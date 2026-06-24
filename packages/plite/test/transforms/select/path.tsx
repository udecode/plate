/** @jsx jsx */

import { jsx } from '../..';

jsx;

export const run = (editor) => {
  editor.selection.set([0, 0]);
};
export const input = (
  <editor>
    <block>
      <cursor />
      one
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <anchor />
      one
      <focus />
    </block>
  </editor>
);
