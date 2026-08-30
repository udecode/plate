/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'focus', reverse: true, distance: 6 });
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
      one <anchor />t<focus />
      wo three
    </block>
  </editor>
);
