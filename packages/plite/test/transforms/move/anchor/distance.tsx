/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'anchor', distance: 3 });
};
export const input = (
  <editor>
    <block>
      one <anchor />
      two thr
      <focus />
      ee
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one two
      <anchor /> thr
      <focus />
      ee
    </block>
  </editor>
);
