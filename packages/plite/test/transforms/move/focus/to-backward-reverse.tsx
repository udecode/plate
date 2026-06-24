/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'focus', reverse: true, distance: 10 });
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
      o<focus />
      ne <anchor />
      two three
    </block>
  </editor>
);
