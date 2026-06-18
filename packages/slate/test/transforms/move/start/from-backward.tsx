/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'start', distance: 7 });
};
export const input = (
  <editor>
    <block>
      one <focus />
      two t<anchor />
      hree
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one two t<anchor />
      hr
      <focus />
      ee
    </block>
  </editor>
);
