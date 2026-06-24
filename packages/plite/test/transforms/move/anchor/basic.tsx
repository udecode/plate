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
      tw
      <focus />o three
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one t<anchor />w<focus />o three
    </block>
  </editor>
);
