/** @jsx jsx */

import { jsx } from '../..';

jsx;

export const run = (editor) => {
  editor.selection.setPoint({ offset: 0 });
};
export const input = (
  <editor>
    <block>
      f<anchor />
      oo
      <focus />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <cursor />
      foo
    </block>
  </editor>
);
