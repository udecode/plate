/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'end', reverse: true, distance: 6 });
};
export const input = (
  <editor>
    <block>
      one <anchor />
      two
      <focus /> three
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      o<focus />
      ne <anchor />
      two three
    </block>
  </editor>
);
