/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'anchor' });
};
export const input = (
  <editor>
    <block>
      one <anchor />
      two th
      <focus />
      ree
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one t<anchor />
      wo th
      <focus />
      ree
    </block>
  </editor>
);
