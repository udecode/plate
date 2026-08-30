/** @jsx jsx */

import { jsx } from '../..';

jsx;

export const run = (editor) => {
  editor.selection.clear();
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
    <block>one</block>
  </editor>
);
