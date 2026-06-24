/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'anchor', reverse: true, distance: 3 });
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
      o<anchor />
      ne tw
      <focus />o three
    </block>
  </editor>
);
