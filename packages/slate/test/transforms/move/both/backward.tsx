/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move();
};
export const input = (
  <editor>
    <block>
      one <focus />
      two th
      <anchor />
      ree
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one t<focus />
      wo thr
      <anchor />
      ee
    </block>
  </editor>
);
