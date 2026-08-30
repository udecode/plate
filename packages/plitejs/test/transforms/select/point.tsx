/** @jsx jsx */

import { jsx } from '../..';

jsx;

export const run = (editor) => {
  editor.selection.set({
    path: [0, 0],
    offset: 1,
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
      o<cursor />
      ne
    </block>
  </editor>
);
