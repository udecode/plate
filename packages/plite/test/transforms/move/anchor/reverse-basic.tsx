/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'anchor', reverse: true });
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
      one
      <anchor /> tw
      <focus />o three
    </block>
  </editor>
);
