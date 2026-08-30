/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete({ at: [0, 0] });
};
export const input = (
  <editor>
    <block>
      <text>one</text>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
    </block>
  </editor>
);
