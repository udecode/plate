/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'focus', distance: 7 });
};
export const input = (
  <editor>
    <block>
      one <focus />
      two <anchor />
      three
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one two <anchor />
      thr
      <focus />
      ee
    </block>
  </editor>
);
