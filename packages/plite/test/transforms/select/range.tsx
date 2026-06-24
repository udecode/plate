/** @jsx jsx */

import { jsx } from '../..';

jsx;

export const run = (editor) => {
  editor.selection.set({
    anchor: {
      path: [0, 0],
      offset: 0,
    },
    focus: {
      path: [0, 0],
      offset: 3,
    },
  });
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
