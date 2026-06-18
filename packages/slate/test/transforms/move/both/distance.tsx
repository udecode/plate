/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ distance: 6 });
};
export const input = (
  <editor>
    <block>
      one <cursor />
      two three
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one two th
      <cursor />
      ree
    </block>
  </editor>
);
