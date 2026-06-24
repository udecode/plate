/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ reverse: true, distance: 6 });
};
export const input = (
  <editor>
    <block>
      one two th
      <cursor />
      ree
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one <cursor />
      two three
    </block>
  </editor>
);
