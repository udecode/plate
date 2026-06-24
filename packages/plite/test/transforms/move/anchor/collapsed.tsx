/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.selection.move({ edge: 'anchor' });
};
export const input = (
  <editor>
    <block>
      one two t<cursor />
      hree
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one two t<focus />h<anchor />
      ree
    </block>
  </editor>
);
