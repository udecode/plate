/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <text />
      <inline>one</inline>
      <text />
    </block>
  </editor>
);
export const run = (editor) => {
  editor.text.delete({ at: [0, 1] });
};
export const output = (
  <editor>
    <block>
      <text />
    </block>
  </editor>
);
