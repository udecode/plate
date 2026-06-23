/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'focus' });
};
export const input = (
  <editor>
    <block>
      one <anchor />
      tw
      <focus />o three
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one <anchor />
      two
      <focus /> three
    </block>
  </editor>
);
