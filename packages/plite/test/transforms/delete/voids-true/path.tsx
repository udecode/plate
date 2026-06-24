/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block void>
      <text>one</text>
    </block>
  </editor>
);
export const run = (editor) => {
  editor.text.delete({ at: [0, 0], voids: true });
};
export const output = (
  <editor>
    <block void>
      <text />
    </block>
  </editor>
);
