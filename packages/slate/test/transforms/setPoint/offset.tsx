/** @jsx jsx */

import { jsx } from '../..';

jsx;

export const run = (editor) => {
  editor.selection.move();
  editor.selection.setPoint({ offset: 0 }, { edge: 'focus' });
};
export const input = (
  <editor>
    <block>
      f<cursor />
      oo
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <focus />
      fo
      <anchor />o
    </block>
  </editor>
);
